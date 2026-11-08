import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Ellipsis, RotateCw, Trash2 } from 'lucide-react';
import { Button } from '@/components/button/button';
import { Label } from '@/components/label/label';
import { Separator } from '@/components/separator/separator';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/popover/popover';
import {
    Select,
    SelectContent,
    SelectTrigger,
    SelectValue,
} from '@/components/select/select';
import { useToast } from '@/components/toast/use-toast';
import { ApiError } from '@/lib/api/client';
import {
    resendDiagramInvitation,
    revokeDiagramInvitation,
    updateDiagramInvitationRole,
    type DiagramInvitationResource,
} from '@/lib/api/diagram-invitations';
import type { DiagramMemberRole } from '@/lib/api/diagram-members';
import { ShareMemberRoleSelectItems } from './share-member-role-select-items';

export interface ShareInvitationListProps {
    diagramId: string;
    invitations: DiagramInvitationResource[];
    invitationsStatus: 'idle' | 'loading' | 'error' | 'success';
    onInvitationsChange: (invitations: DiagramInvitationResource[]) => void;
}

export const ShareInvitationList: React.FC<ShareInvitationListProps> = ({
    diagramId,
    invitations,
    invitationsStatus,
    onInvitationsChange,
}) => {
    const { t, i18n } = useTranslation();
    const { toast } = useToast();
    const [busyId, setBusyId] = useState<number | null>(null);

    const formatExpiry = useCallback(
        (value: string) => {
            const date = new Date(value);
            if (Number.isNaN(date.getTime())) {
                return value;
            }

            return new Intl.DateTimeFormat(i18n?.language || 'en').format(date);
        },
        [i18n?.language]
    );

    const handleRoleChange = useCallback(
        async (
            invitation: DiagramInvitationResource,
            role: DiagramMemberRole
        ) => {
            if (invitation.role === role) {
                return;
            }

            setBusyId(invitation.id);
            try {
                const updated = await updateDiagramInvitationRole(
                    diagramId,
                    invitation.id,
                    role
                );
                onInvitationsChange(
                    invitations.map((item) =>
                        item.id === invitation.id ? updated : item
                    )
                );
            } catch {
                toast({
                    title: t('share_diagram_dialog.invitations.role_failed'),
                    variant: 'destructive',
                });
            } finally {
                setBusyId(null);
            }
        },
        [diagramId, invitations, onInvitationsChange, t, toast]
    );

    const handleResend = useCallback(
        async (invitationId: number) => {
            setBusyId(invitationId);
            try {
                const updated = await resendDiagramInvitation(
                    diagramId,
                    invitationId
                );
                onInvitationsChange(
                    invitations.map((item) =>
                        item.id === invitationId ? updated : item
                    )
                );
                toast({
                    title: t('share_diagram_dialog.invitations.renewed'),
                });
            } catch (error: unknown) {
                toast({
                    title:
                        error instanceof ApiError && error.status === 429
                            ? t(
                                  'share_diagram_dialog.invitations.resend_limited'
                              )
                            : t(
                                  'share_diagram_dialog.invitations.resend_failed'
                              ),
                    variant: 'destructive',
                });
            } finally {
                setBusyId(null);
            }
        },
        [diagramId, invitations, onInvitationsChange, t, toast]
    );

    const handleRevoke = useCallback(
        async (invitationId: number) => {
            setBusyId(invitationId);
            try {
                await revokeDiagramInvitation(diagramId, invitationId);
                onInvitationsChange(
                    invitations.filter((item) => item.id !== invitationId)
                );
            } catch {
                toast({
                    title: t('share_diagram_dialog.invitations.revoke_failed'),
                    variant: 'destructive',
                });
            } finally {
                setBusyId(null);
            }
        },
        [diagramId, invitations, onInvitationsChange, t, toast]
    );

    if (invitationsStatus === 'error') {
        return (
            <p className="px-2 pt-3 text-sm text-destructive">
                {t('share_diagram_dialog.invitations.load_failed')}
            </p>
        );
    }

    if (invitations.length === 0) {
        return null;
    }

    return (
        <div className="mt-3 flex flex-col gap-1">
            <p className="px-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t('share_diagram_dialog.invitations.heading')}
            </p>
            {invitations.map((invitation) => (
                <div
                    key={invitation.id}
                    className="flex items-center gap-3 rounded-md px-2 py-1.5"
                >
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm">{invitation.email}</p>
                        <p className="truncate text-xs text-muted-foreground">
                            {invitation.status === 'expired'
                                ? t('share_diagram_dialog.invitations.expired')
                                : t('share_diagram_dialog.invitations.pending')}
                            {' · '}
                            {t('share_diagram_dialog.invitations.expires', {
                                date: formatExpiry(invitation.expiresAt),
                            })}
                        </p>
                    </div>
                    <InvitationActions
                        invitation={invitation}
                        disabled={busyId === invitation.id}
                        onRoleChange={(role) => {
                            void handleRoleChange(invitation, role);
                        }}
                        onResend={() => {
                            void handleResend(invitation.id);
                        }}
                        onRevoke={() => {
                            void handleRevoke(invitation.id);
                        }}
                    />
                </div>
            ))}
        </div>
    );
};

interface InvitationActionsProps {
    invitation: DiagramInvitationResource;
    disabled: boolean;
    onRoleChange: (role: DiagramMemberRole) => void;
    onResend: () => void;
    onRevoke: () => void;
}

const InvitationActions: React.FC<InvitationActionsProps> = ({
    invitation,
    disabled,
    onRoleChange,
    onResend,
    onRevoke,
}) => {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="ghost"
                    disabled={disabled}
                    aria-label={t('share_diagram_dialog.invitations.heading')}
                    className="h-8 w-[32px] shrink-0 p-2"
                >
                    <Ellipsis className="size-3.5" aria-hidden="true" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-52" align="end">
                <div className="flex flex-col gap-2">
                    <div className="text-sm font-semibold">
                        {t('share_diagram_dialog.invitations.heading')}
                    </div>
                    <Separator orientation="horizontal" />
                    <div className="flex flex-col gap-2">
                        <Label className="text-subtitle">
                            {t('side_panel.share_section.member_actions.role')}
                        </Label>
                        <Select
                            value={invitation.role}
                            onValueChange={(value) => {
                                onRoleChange(value as DiagramMemberRole);
                            }}
                            disabled={disabled}
                        >
                            <SelectTrigger className="w-full bg-muted">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <ShareMemberRoleSelectItems />
                            </SelectContent>
                        </Select>
                    </div>
                    <Button
                        type="button"
                        variant={
                            invitation.status === 'expired'
                                ? 'default'
                                : 'outline'
                        }
                        disabled={disabled}
                        onClick={() => {
                            onResend();
                            setOpen(false);
                        }}
                    >
                        <RotateCw className="size-3.5" aria-hidden="true" />
                        {disabled
                            ? t('share_diagram_dialog.invitations.resending')
                            : t('share_diagram_dialog.invitations.resend')}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        className="!text-red-700"
                        disabled={disabled}
                        onClick={() => {
                            onRevoke();
                            setOpen(false);
                        }}
                    >
                        <Trash2
                            className="size-3.5 text-red-700"
                            aria-hidden="true"
                        />
                        {t('share_diagram_dialog.invitations.revoke')}
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
};
