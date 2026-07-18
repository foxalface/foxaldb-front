import {
    claimEditingConflictExplanation,
    completeEditingConflictExplanationEpisode,
    releaseEditingConflictExplanation,
    type EditingConflictExplanationClaim,
    type EditingConflictExplanationClaimant,
} from '@/lib/realtime/editing-conflict-explanation';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Returns the Last Writer Wins secondary copy only when this hook
 * instance owns the first conflict episode of the browser tab.
 *
 * Consumes the session registry from an effect only — render is
 * side-effect free. Does not modify conflict detection or awareness.
 */
export const useEditingConflictExplanation = (
    hasVisibleConflict: boolean
): string => {
    const { t } = useTranslation();
    const [showExplanation, setShowExplanation] = useState(false);
    const claimantIdRef = useRef<
        EditingConflictExplanationClaimant | undefined
    >(undefined);
    let claimantId = claimantIdRef.current;
    if (claimantId === undefined) {
        claimantId = Symbol('editing-conflict-explanation-claimant');
        claimantIdRef.current = claimantId;
    }
    const claimRef = useRef<EditingConflictExplanationClaim | null>(null);

    useEffect(() => {
        if (!hasVisibleConflict) {
            completeEditingConflictExplanationEpisode(claimantId);
            setShowExplanation(false);
            return;
        }

        if (claimRef.current === null) {
            const claim = claimEditingConflictExplanation(claimantId);

            if (claim !== null) {
                claimRef.current = claim;
                setShowExplanation(true);
            }
        }

        return () => {
            if (claimRef.current !== null) {
                releaseEditingConflictExplanation(claimRef.current);
                claimRef.current = null;
            }
        };
    }, [hasVisibleConflict, claimantId]);

    if (!showExplanation) {
        return '';
    }

    return t('editing_conflict.last_writer_wins');
};
