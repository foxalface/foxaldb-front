import type { LucideIcon } from 'lucide-react';
import {
    getSidePanelEntityTypeIcon,
    type SidePanelEntityType,
} from '@/components/side-panel/side-panel-entity-type-icons';

const ACTIVITY_ACTION_ENTITY_TYPES: Record<string, SidePanelEntityType> = {
    add_tables: 'table',
    remove_tables: 'table',
    add_field: 'field',
    remove_field: 'field',
    update_field: 'field',
    add_relationships: 'relationship',
    remove_relationships: 'relationship',
    update_relationship: 'relationship',
    add_notes: 'note',
    remove_notes: 'note',
    add_areas: 'area',
    remove_areas: 'area',
    add_dependencies: 'dependency',
    remove_dependencies: 'dependency',
};

export const getActivityActionEntityType = (
    action: string
): SidePanelEntityType => ACTIVITY_ACTION_ENTITY_TYPES[action] ?? 'diagram';

export const getActivityActionIcon = (action: string): LucideIcon =>
    getSidePanelEntityTypeIcon(getActivityActionEntityType(action));
