import { describe, expect, it } from 'vitest';
import {
    REFERENTIAL_ACTION_NONE,
    fromOnDeleteSelectValue,
    fromOnUpdateSelectValue,
    toOnDeleteSelectValue,
    toOnUpdateSelectValue,
} from '../foreign-key-referential-action';

describe('foreign-key-referential-action', () => {
    it('maps onDelete actions to and from select values', () => {
        expect(toOnDeleteSelectValue(undefined)).toBe(REFERENTIAL_ACTION_NONE);
        expect(toOnDeleteSelectValue(null)).toBe(REFERENTIAL_ACTION_NONE);
        expect(toOnDeleteSelectValue('set_null')).toBe('set_null');

        expect(fromOnDeleteSelectValue(REFERENTIAL_ACTION_NONE)).toBeNull();
        expect(fromOnDeleteSelectValue('cascade')).toBe('cascade');
        expect(fromOnDeleteSelectValue('set_null')).toBe('set_null');
        expect(fromOnDeleteSelectValue('restrict')).toBe('restrict');
        expect(fromOnDeleteSelectValue('invalid')).toBeNull();
    });

    it('maps onUpdate actions to and from select values', () => {
        expect(toOnUpdateSelectValue(undefined)).toBe(REFERENTIAL_ACTION_NONE);
        expect(toOnUpdateSelectValue(null)).toBe(REFERENTIAL_ACTION_NONE);
        expect(toOnUpdateSelectValue('restrict')).toBe('restrict');

        expect(fromOnUpdateSelectValue(REFERENTIAL_ACTION_NONE)).toBeNull();
        expect(fromOnUpdateSelectValue('cascade')).toBe('cascade');
        expect(fromOnUpdateSelectValue('restrict')).toBe('restrict');
        expect(fromOnUpdateSelectValue('set_null')).toBeNull();
    });
});
