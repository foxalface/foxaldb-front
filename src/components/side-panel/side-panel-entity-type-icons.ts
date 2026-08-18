import {
    FileMinus2,
    FileType2,
    Group,
    HelpCircle,
    StickyNote,
    Table,
    Waypoints,
    Workflow,
    type LucideIcon,
} from 'lucide-react';

export type SidePanelEntityType =
    | 'diagram'
    | 'table'
    | 'field'
    | 'relationship'
    | 'note'
    | 'area'
    | 'dependency';

export const SIDE_PANEL_ENTITY_TYPE_ICONS: Record<
    SidePanelEntityType,
    LucideIcon
> = {
    diagram: Waypoints,
    table: Table,
    field: FileType2,
    relationship: Workflow,
    note: StickyNote,
    area: Group,
    dependency: FileMinus2,
};

export const getSidePanelEntityTypeIcon = (
    entityType: SidePanelEntityType
): LucideIcon => SIDE_PANEL_ENTITY_TYPE_ICONS[entityType] ?? HelpCircle;

export const ACTIVITY_ENTITY_TYPES = [
    'diagram',
    'table',
    'field',
    'relationship',
    'note',
    'area',
    'dependency',
] as const satisfies readonly SidePanelEntityType[];

export type ActivityEntityType = (typeof ACTIVITY_ENTITY_TYPES)[number];

export const DEFAULT_SELECTED_ACTIVITY_ENTITY_TYPES: ActivityEntityType[] = [
    ...ACTIVITY_ENTITY_TYPES,
];
