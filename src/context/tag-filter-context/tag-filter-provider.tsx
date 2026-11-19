import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { useChartDB } from '@/hooks/use-chartdb';
import type { TagMatchMode } from '@/lib/domain/diagram-tag';
import { tagFilterContext } from './tag-filter-context';

const tagMatchModes: readonly TagMatchMode[] = ['any', 'all', 'none'];

const isTagMatchMode = (mode: string): mode is TagMatchMode =>
    tagMatchModes.some((candidate) => candidate === mode);

export const TagFilterProvider: React.FC<React.PropsWithChildren> = ({
    children,
}) => {
    const { diagramId, currentDiagram } = useChartDB();
    const tags = useMemo(
        () => currentDiagram.tags ?? [],
        [currentDiagram.tags]
    );
    const [selectedTagIds, setSelectedTagIds] = useState<readonly string[]>([]);
    const [matchMode, setMatchModeState] = useState<TagMatchMode>('any');
    const previousDiagramIdRef = useRef(diagramId);

    useEffect(() => {
        if (previousDiagramIdRef.current === diagramId) {
            return;
        }

        previousDiagramIdRef.current = diagramId;
        setSelectedTagIds([]);
        setMatchModeState('any');
    }, [diagramId]);

    useEffect(() => {
        const liveTagIds = new Set(tags.map((tag) => tag.id));

        setSelectedTagIds((current) => {
            const next = current.filter((tagId) => liveTagIds.has(tagId));

            if (next.length === current.length) {
                return current;
            }

            return next;
        });
    }, [tags]);

    const toggleTag = useCallback((tagId: string) => {
        setSelectedTagIds((current) =>
            current.includes(tagId)
                ? current.filter((id) => id !== tagId)
                : [...current, tagId]
        );
    }, []);

    const setMatchMode = useCallback((mode: TagMatchMode) => {
        if (!isTagMatchMode(mode)) {
            return;
        }

        setMatchModeState(mode);
    }, []);

    const clearTagFilter = useCallback(() => {
        setSelectedTagIds([]);
        setMatchModeState('any');
    }, []);

    const hasTagConstraint = selectedTagIds.length > 0;

    const value = useMemo(
        () => ({
            selectedTagIds,
            matchMode,
            hasTagConstraint,
            toggleTag,
            setMatchMode,
            clearTagFilter,
        }),
        [
            selectedTagIds,
            matchMode,
            hasTagConstraint,
            toggleTag,
            setMatchMode,
            clearTagFilter,
        ]
    );

    return (
        <tagFilterContext.Provider value={value}>
            {children}
        </tagFilterContext.Provider>
    );
};
