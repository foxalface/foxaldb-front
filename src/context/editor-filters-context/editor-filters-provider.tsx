import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { useChartDB } from '@/hooks/use-chartdb';
import type { TagMatchMode } from '@/lib/domain/diagram-tag';
import { listDiagramSchemaOptions } from '@/lib/domain/editor-filter-eligibility';
import { editorFiltersContext } from './editor-filters-context';

const tagMatchModes: readonly TagMatchMode[] = ['any', 'all', 'none'];

const isTagMatchMode = (mode: string): mode is TagMatchMode =>
    tagMatchModes.some((candidate) => candidate === mode);

const toggleId = (current: readonly string[], id: string): readonly string[] =>
    current.includes(id)
        ? current.filter((currentId) => currentId !== id)
        : [...current, id];

const pruneIds = (
    current: readonly string[],
    liveIds: ReadonlySet<string>
): readonly string[] => {
    const next = current.filter((id) => liveIds.has(id));

    return next.length === current.length ? current : next;
};

export const EditorFiltersProvider: React.FC<React.PropsWithChildren> = ({
    children,
}) => {
    const { diagramId, currentDiagram } = useChartDB();
    const tags = useMemo(
        () => currentDiagram.tags ?? [],
        [currentDiagram.tags]
    );
    const areas = useMemo(
        () => currentDiagram.areas ?? [],
        [currentDiagram.areas]
    );
    const tables = useMemo(
        () => currentDiagram.tables ?? [],
        [currentDiagram.tables]
    );
    const schemaOptions = useMemo(
        () => listDiagramSchemaOptions(tables, currentDiagram.databaseType),
        [tables, currentDiagram.databaseType]
    );
    const [selectedTagIds, setSelectedTagIds] = useState<readonly string[]>([]);
    const [tagMatchMode, setTagMatchModeState] = useState<TagMatchMode>('any');
    const [selectedAreaIds, setSelectedAreaIds] = useState<readonly string[]>(
        []
    );
    const [selectedSchemaIds, setSelectedSchemaIds] = useState<
        readonly string[]
    >([]);
    const previousDiagramIdRef = useRef(diagramId);

    useEffect(() => {
        if (previousDiagramIdRef.current === diagramId) {
            return;
        }

        previousDiagramIdRef.current = diagramId;
        setSelectedTagIds([]);
        setTagMatchModeState('any');
        setSelectedAreaIds([]);
        setSelectedSchemaIds([]);
    }, [diagramId]);

    useEffect(() => {
        const liveTagIds = new Set(tags.map((tag) => tag.id));
        setSelectedTagIds((current) => pruneIds(current, liveTagIds));
    }, [tags]);

    useEffect(() => {
        const liveAreaIds = new Set(areas.map((area) => area.id));
        setSelectedAreaIds((current) => pruneIds(current, liveAreaIds));
    }, [areas]);

    useEffect(() => {
        const liveSchemaIds = new Set(schemaOptions.map((schema) => schema.id));
        setSelectedSchemaIds((current) => pruneIds(current, liveSchemaIds));
    }, [schemaOptions]);

    const toggleTag = useCallback((tagId: string) => {
        setSelectedTagIds((current) => toggleId(current, tagId));
    }, []);

    const setTagMatchMode = useCallback((mode: TagMatchMode) => {
        if (!isTagMatchMode(mode)) {
            return;
        }

        setTagMatchModeState(mode);
    }, []);

    const clearTagFilter = useCallback(() => {
        setSelectedTagIds([]);
        setTagMatchModeState('any');
    }, []);

    const toggleArea = useCallback((areaId: string) => {
        setSelectedAreaIds((current) => toggleId(current, areaId));
    }, []);

    const clearAreaFilter = useCallback(() => {
        setSelectedAreaIds([]);
    }, []);

    const toggleSchema = useCallback((schemaId: string) => {
        setSelectedSchemaIds((current) => toggleId(current, schemaId));
    }, []);

    const clearSchemaFilter = useCallback(() => {
        setSelectedSchemaIds([]);
    }, []);

    const clearAllFilters = useCallback(() => {
        setSelectedTagIds([]);
        setTagMatchModeState('any');
        setSelectedAreaIds([]);
        setSelectedSchemaIds([]);
    }, []);

    const hasTagConstraint = selectedTagIds.length > 0;
    const hasAreaConstraint = selectedAreaIds.length > 0;
    const hasSchemaConstraint = selectedSchemaIds.length > 0;
    const hasAnyConstraint =
        hasTagConstraint || hasAreaConstraint || hasSchemaConstraint;

    const value = useMemo(
        () => ({
            selectedTagIds,
            tagMatchMode,
            selectedAreaIds,
            selectedSchemaIds,
            hasTagConstraint,
            hasAreaConstraint,
            hasSchemaConstraint,
            hasAnyConstraint,
            toggleTag,
            setTagMatchMode,
            clearTagFilter,
            toggleArea,
            clearAreaFilter,
            toggleSchema,
            clearSchemaFilter,
            clearAllFilters,
        }),
        [
            selectedTagIds,
            tagMatchMode,
            selectedAreaIds,
            selectedSchemaIds,
            hasTagConstraint,
            hasAreaConstraint,
            hasSchemaConstraint,
            hasAnyConstraint,
            toggleTag,
            setTagMatchMode,
            clearTagFilter,
            toggleArea,
            clearAreaFilter,
            toggleSchema,
            clearSchemaFilter,
            clearAllFilters,
        ]
    );

    return (
        <editorFiltersContext.Provider value={value}>
            {children}
        </editorFiltersContext.Provider>
    );
};
