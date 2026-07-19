import type Echo from 'laravel-echo';
import type { PresenceChannel } from 'laravel-echo';
import { getEcho } from './echo';
import {
    diagramPresenceChannelFull,
    diagramPrivateChannel,
    diagramPrivateChannelFull,
    userPrivateChannel,
    userPrivateChannelFull,
} from './channels';
import type { CursorAction } from './cursor-reducer';
import { CursorTransport } from './cursor-transport';
import type { CursorWhisperPayload } from './cursor-types';
import type { MovementAction } from './movement-reducer';
import { MovementTransport } from './movement-transport';
import type { MovementWhisperPayload } from './movement-types';
import type { SelectionAction } from './selection-reducer';
import { SelectionTransport } from './selection-transport';
import type { SelectionWhisperPayload } from './selection-types';
import type { EditingAction } from './editing-reducer';
import { EditingTransport } from './editing-transport';
import type { EditingWhisperPayload } from './editing-types';
import type { EventDispatcher } from './event-dispatcher';
import type { RealtimePingPayload } from './events';
import {
    parseDiagramPresenceMemberInfo,
    type DiagramPresenceUser,
} from './diagram-presence';

type PrivateChannel = ReturnType<Echo<'reverb'>['private']>;

export interface PresenceEventHandlers {
    onHere: (members: DiagramPresenceUser[]) => void;
    onJoining: (member: DiagramPresenceUser) => void;
    onLeaving: (member: DiagramPresenceUser) => void;
    onError: (error: unknown) => void;
}

export class ChannelManager {
    private userId: number | null = null;
    private currentDiagramId: string | null = null;
    private userChannel: PrivateChannel | null = null;
    private diagramPrivateChannel: PrivateChannel | null = null;
    private diagramPresenceChannel: PresenceChannel | null = null;
    private pingHandler: ((payload: RealtimePingPayload) => void) | null = null;
    private presenceHandlers: PresenceEventHandlers | null = null;
    private cursorTransport: CursorTransport | null = null;
    private selectionTransport: SelectionTransport | null = null;
    private movementTransport: MovementTransport | null = null;
    private editingTransport: EditingTransport | null = null;
    private isKnownPresenceUser: (userId: number) => boolean = () => false;
    private cursorOnAction: (action: CursorAction) => void = () => undefined;
    private selectionOnAction: (action: SelectionAction) => void = () =>
        undefined;
    private movementOnAction: (action: MovementAction) => void = () =>
        undefined;
    private editingOnAction: (action: EditingAction) => void = () => undefined;

    constructor(private readonly dispatcher: EventDispatcher) {}

    getCurrentDiagramId(): string | null {
        return this.currentDiagramId;
    }

    getDiagramPresenceChannel(): PresenceChannel | null {
        return this.diagramPresenceChannel;
    }

    getDiagramPrivateChannel(): PrivateChannel | null {
        return this.diagramPrivateChannel;
    }

    setPresenceHandlers(handlers: PresenceEventHandlers | null): void {
        this.presenceHandlers = handlers;
    }

    setCursorPresenceChecker(checker: (userId: number) => boolean): void {
        this.isKnownPresenceUser = checker;
    }

    setCursorOnAction(handler: (action: CursorAction) => void): void {
        this.cursorOnAction = handler;
    }

    setSelectionOnAction(handler: (action: SelectionAction) => void): void {
        this.selectionOnAction = handler;
    }

    setMovementOnAction(handler: (action: MovementAction) => void): void {
        this.movementOnAction = handler;
    }

    setEditingOnAction(handler: (action: EditingAction) => void): void {
        this.editingOnAction = handler;
    }

    sendMovement(payload: MovementWhisperPayload): void {
        this.ensureMovementTransport();
        this.movementTransport?.sendMovement(payload);
    }

    sendEditing(payload: EditingWhisperPayload): void {
        this.ensureEditingTransport();
        this.editingTransport?.sendEditing(payload);
    }

    sendSelection(payload: SelectionWhisperPayload): void {
        this.ensureSelectionTransport();
        this.selectionTransport?.sendSelection(payload);
    }

    sendCursor(payload: CursorWhisperPayload): void {
        this.ensureCursorTransport();
        this.cursorTransport?.sendCursor(payload);
    }

    joinUserChannel(userId: number): void {
        const echo = getEcho();
        if (echo === null) {
            return;
        }

        if (this.userId === userId && this.userChannel !== null) {
            return;
        }

        this.leaveUserChannel();
        this.userId = userId;

        try {
            this.userChannel = echo.private(userPrivateChannel(userId));
        } catch (error) {
            console.warn(
                `[Realtime] Failed to join ${userPrivateChannelFull(userId)}`,
                error
            );
            this.userId = null;
            this.userChannel = null;
        }
    }

    joinDiagram(diagramId: string): void {
        const echo = getEcho();
        if (echo === null) {
            return;
        }

        if (this.currentDiagramId === diagramId) {
            return;
        }

        this.leaveDiagramChannels();

        this.currentDiagramId = diagramId;

        try {
            this.diagramPrivateChannel = echo.private(
                diagramPrivateChannel(diagramId)
            );

            this.pingHandler = (payload: RealtimePingPayload) => {
                this.dispatcher.emit('Realtime.Ping', payload);
            };

            this.diagramPrivateChannel.listen(
                '.Realtime.Ping',
                this.pingHandler
            );

            const presenceChannel = echo.join(diagramPrivateChannel(diagramId));
            this.diagramPresenceChannel = presenceChannel;
            this.ensureCursorTransport();
            this.ensureSelectionTransport();
            this.ensureMovementTransport();
            this.ensureEditingTransport();

            presenceChannel
                .here((members: unknown[]) => {
                    const parsedMembers = Array.isArray(members)
                        ? members
                              .map(parseDiagramPresenceMemberInfo)
                              .filter(
                                  (member): member is DiagramPresenceUser =>
                                      member !== null
                              )
                        : [];

                    this.presenceHandlers?.onHere(parsedMembers);
                })
                .joining((member: unknown) => {
                    const parsedMember = parseDiagramPresenceMemberInfo(member);

                    if (parsedMember !== null) {
                        this.presenceHandlers?.onJoining(parsedMember);
                    }
                })
                .leaving((member: unknown) => {
                    const parsedMember = parseDiagramPresenceMemberInfo(member);

                    if (parsedMember !== null) {
                        this.presenceHandlers?.onLeaving(parsedMember);
                    }
                })
                .error((error: unknown) => {
                    console.warn(
                        `[Realtime] Presence channel error (diagram.${diagramId})`,
                        error
                    );
                    this.presenceHandlers?.onError(error);
                });
        } catch (error) {
            console.warn(
                `[Realtime] Failed to join diagram channels for ${diagramId}`,
                error
            );
            this.leaveDiagramChannels();
        }
    }

    leaveDiagram(): void {
        this.leaveDiagramChannels();
        this.currentDiagramId = null;
    }

    rejoinAll(): void {
        const userId = this.userId;
        const diagramId = this.currentDiagramId;

        this.leaveUserChannel();
        this.leaveDiagramChannels();
        this.currentDiagramId = null;

        if (userId !== null) {
            this.joinUserChannel(userId);
        }

        if (diagramId !== null) {
            this.joinDiagram(diagramId);
        }
    }

    clearAll(): void {
        this.leaveUserChannel();
        this.leaveDiagramChannels();
        this.currentDiagramId = null;
        this.userId = null;
    }

    private leaveUserChannel(): void {
        if (this.userId === null) {
            return;
        }

        const echo = getEcho();
        if (echo !== null) {
            try {
                echo.leaveChannel(userPrivateChannelFull(this.userId));
            } catch (error) {
                console.warn(
                    `[Realtime] Failed to leave ${userPrivateChannelFull(this.userId)}`,
                    error
                );
            }
        }

        this.userChannel = null;
        this.userId = null;
    }

    private leaveDiagramChannels(): void {
        const diagramId = this.currentDiagramId;
        const echo = getEcho();

        if (this.diagramPrivateChannel !== null && this.pingHandler !== null) {
            try {
                this.diagramPrivateChannel.stopListening(
                    '.Realtime.Ping',
                    this.pingHandler
                );
            } catch (error) {
                console.warn('[Realtime] Failed to stop ping listener', error);
            }
        }

        if (echo !== null && diagramId !== null) {
            try {
                echo.leaveChannel(diagramPrivateChannelFull(diagramId));
                echo.leaveChannel(diagramPresenceChannelFull(diagramId));
            } catch (error) {
                console.warn(
                    `[Realtime] Failed to leave diagram channels for ${diagramId}`,
                    error
                );
            }
        }

        this.clearCursorTransport();
        this.clearSelectionTransport();
        this.clearMovementTransport();
        this.clearEditingTransport();
        this.diagramPrivateChannel = null;
        this.diagramPresenceChannel = null;
        this.pingHandler = null;
    }

    private ensureCursorTransport(): void {
        if (this.userId === null || this.diagramPresenceChannel === null) {
            return;
        }

        if (this.cursorTransport !== null) {
            return;
        }

        this.cursorTransport = new CursorTransport({
            getPresenceChannel: () => this.getDiagramPresenceChannel(),
            selfUserId: this.userId,
            isKnownPresenceUser: (userId) => this.isKnownPresenceUser(userId),
            onAction: (action) => this.cursorOnAction(action),
        });
        this.cursorTransport.start();
    }

    private clearCursorTransport(): void {
        this.cursorTransport?.stop();
        this.cursorTransport = null;
    }

    private ensureSelectionTransport(): void {
        if (this.userId === null || this.diagramPresenceChannel === null) {
            return;
        }

        if (this.selectionTransport !== null) {
            return;
        }

        this.selectionTransport = new SelectionTransport({
            getPresenceChannel: () => this.getDiagramPresenceChannel(),
            selfUserId: this.userId,
            isKnownPresenceUser: (userId) => this.isKnownPresenceUser(userId),
            onAction: (action) => this.selectionOnAction(action),
        });
        this.selectionTransport.start();
    }

    private clearSelectionTransport(): void {
        this.selectionTransport?.stop();
        this.selectionTransport = null;
    }

    private ensureMovementTransport(): void {
        if (this.userId === null || this.diagramPresenceChannel === null) {
            return;
        }

        if (this.movementTransport !== null) {
            return;
        }

        this.movementTransport = new MovementTransport({
            getPresenceChannel: () => this.getDiagramPresenceChannel(),
            selfUserId: this.userId,
            isKnownPresenceUser: (userId) => this.isKnownPresenceUser(userId),
            onAction: (action) => this.movementOnAction(action),
        });
        this.movementTransport.start();
    }

    private clearMovementTransport(): void {
        this.movementTransport?.stop();
        this.movementTransport = null;
    }

    private ensureEditingTransport(): void {
        if (this.userId === null || this.diagramPresenceChannel === null) {
            return;
        }

        if (this.editingTransport !== null) {
            return;
        }

        this.editingTransport = new EditingTransport({
            getPresenceChannel: () => this.getDiagramPresenceChannel(),
            selfUserId: this.userId,
            isKnownPresenceUser: (userId) => this.isKnownPresenceUser(userId),
            onAction: (action) => this.editingOnAction(action),
        });
        this.editingTransport.start();
    }

    private clearEditingTransport(): void {
        this.editingTransport?.stop();
        this.editingTransport = null;
    }
}
