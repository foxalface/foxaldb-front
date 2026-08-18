import { describe, expect, it } from 'vitest';
import {
    FileMinus2,
    FileType2,
    Group,
    StickyNote,
    Table,
    Waypoints,
    Workflow,
} from 'lucide-react';
import {
    getActivityActionEntityType,
    getActivityActionIcon,
} from '../get-activity-action-icon';

describe('get-activity-action-icon', () => {
    it('maps activity actions to the same entity types used in the sidebar', () => {
        expect(getActivityActionEntityType('add_tables')).toBe('table');
        expect(getActivityActionEntityType('update_field')).toBe('field');
        expect(getActivityActionEntityType('add_relationships')).toBe(
            'relationship'
        );
        expect(getActivityActionEntityType('add_notes')).toBe('note');
        expect(getActivityActionEntityType('add_areas')).toBe('area');
        expect(getActivityActionEntityType('add_dependencies')).toBe(
            'dependency'
        );
        expect(getActivityActionEntityType('unknown_action')).toBe('diagram');
    });

    it('returns sidebar entity icons for each activity action', () => {
        expect(getActivityActionIcon('add_tables')).toBe(Table);
        expect(getActivityActionIcon('add_field')).toBe(FileType2);
        expect(getActivityActionIcon('add_relationships')).toBe(Workflow);
        expect(getActivityActionIcon('add_notes')).toBe(StickyNote);
        expect(getActivityActionIcon('add_areas')).toBe(Group);
        expect(getActivityActionIcon('add_dependencies')).toBe(FileMinus2);
        expect(getActivityActionIcon('unknown_action')).toBe(Waypoints);
    });
});
