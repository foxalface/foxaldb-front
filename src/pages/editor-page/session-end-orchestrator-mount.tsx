import {
    useSessionEndOrchestrator,
    type SessionEndOrchestratorActions,
} from '@/hooks/use-session-end-orchestrator';

/**
 * Sole production mount for session-end diagram and navigation consequences.
 */
export const SessionEndOrchestratorMount = (
    props: SessionEndOrchestratorActions
): null => {
    useSessionEndOrchestrator(props);
    return null;
};
