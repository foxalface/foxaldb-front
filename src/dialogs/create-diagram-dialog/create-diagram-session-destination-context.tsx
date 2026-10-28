/* eslint-disable react-refresh/only-export-components -- provider exports hooks for create session destination */
import React, {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { useAuth } from '@/hooks/use-auth';
import {
    defaultDiagramCreationDestination,
    type DiagramCreationDestination,
} from '@/lib/diagram/diagram-creation-destination';

export interface CreateDiagramSessionDestinationContextValue {
    isCreateSessionActive: boolean;
    destination: DiagramCreationDestination;
    setDestination: (destination: DiagramCreationDestination) => void;
}

const createDiagramSessionDestinationContext =
    createContext<CreateDiagramSessionDestinationContextValue | null>(null);

export const CreateDiagramSessionDestinationProvider: React.FC<
    React.PropsWithChildren<{ createDialogOpen: boolean }>
> = ({ createDialogOpen, children }) => {
    const { isAuthenticated } = useAuth();
    const isAuthenticatedRef = useRef(isAuthenticated);
    isAuthenticatedRef.current = isAuthenticated;

    const [destination, setDestination] =
        useState<DiagramCreationDestination>('device');
    const [sessionActive, setSessionActive] = useState(false);
    const sessionLatchedRef = useRef(false);

    useEffect(() => {
        if (!createDialogOpen) {
            sessionLatchedRef.current = false;
            setSessionActive(false);
            return;
        }

        if (sessionLatchedRef.current) {
            return;
        }

        sessionLatchedRef.current = true;
        setSessionActive(true);
        setDestination(
            defaultDiagramCreationDestination(isAuthenticatedRef.current)
        );
    }, [createDialogOpen]);

    const value = useMemo(
        (): CreateDiagramSessionDestinationContextValue => ({
            isCreateSessionActive:
                createDialogOpen && sessionActive && sessionLatchedRef.current,
            destination,
            setDestination,
        }),
        [createDialogOpen, sessionActive, destination]
    );

    return (
        <createDiagramSessionDestinationContext.Provider value={value}>
            {children}
        </createDiagramSessionDestinationContext.Provider>
    );
};

export const useCreateDiagramSessionDestination =
    (): CreateDiagramSessionDestinationContextValue | null =>
        useContext(createDiagramSessionDestinationContext);

export const useCreateDiagramSessionDestinationRequired =
    (): CreateDiagramSessionDestinationContextValue => {
        const value = useContext(createDiagramSessionDestinationContext);

        if (!value) {
            throw new Error(
                'CreateDiagramSessionDestinationProvider is required'
            );
        }

        return value;
    };

/**
 * Restore uses the parent create session destination when the create wizard is
 * open. Standalone restore keeps its own latched default.
 */
export const useCreateDiagramRestoreDestination = (
    restoreDialogOpen: boolean
): DiagramCreationDestination => {
    const shared = useCreateDiagramSessionDestination();
    const { isAuthenticated } = useAuth();
    const isAuthenticatedRef = useRef(isAuthenticated);
    isAuthenticatedRef.current = isAuthenticated;

    const sessionIsOpen = restoreDialogOpen === true;
    const [standaloneSessionOpen, setStandaloneSessionOpen] =
        useState(sessionIsOpen);
    const [standaloneDestination, setStandaloneDestination] =
        useState<DiagramCreationDestination>(() =>
            defaultDiagramCreationDestination(isAuthenticated)
        );

    if (shared?.isCreateSessionActive) {
        return shared.destination;
    }

    if (sessionIsOpen !== standaloneSessionOpen) {
        setStandaloneSessionOpen(sessionIsOpen);
        if (sessionIsOpen) {
            setStandaloneDestination(
                defaultDiagramCreationDestination(isAuthenticatedRef.current)
            );
        }
    }

    return standaloneDestination;
};
