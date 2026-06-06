import type { LucideIcon } from 'lucide-react';
import {
    GitBranch,
    History,
    Link2,
    ListTree,
    Square,
    StickyNote,
    TableProperties,
} from 'lucide-react';

export const getActivityActionIcon = (action: string): LucideIcon => {
    switch (action) {
        case 'add_tables':
        case 'remove_tables':
            return TableProperties;
        case 'add_field':
        case 'remove_field':
        case 'update_field':
            return ListTree;
        case 'add_relationships':
        case 'remove_relationships':
        case 'update_relationship':
            return Link2;
        case 'add_notes':
        case 'remove_notes':
            return StickyNote;
        case 'add_areas':
        case 'remove_areas':
            return Square;
        case 'add_dependencies':
        case 'remove_dependencies':
            return GitBranch;
        default:
            return History;
    }
};
