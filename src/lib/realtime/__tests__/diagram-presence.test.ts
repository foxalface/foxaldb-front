import { describe, expect, it } from 'vitest';
import {
    createDiagramPresenceUser,
    parseDiagramPresenceMemberInfo,
    parseDiagramPresenceUser,
} from '../diagram-presence';

describe('parseDiagramPresenceUser', () => {
    it('parses first_name and last_name into structured identity', () => {
        expect(
            parseDiagramPresenceUser({
                id: 1,
                first_name: 'Jean-Pierre',
                last_name: "O'Connor",
            })
        ).toEqual({
            id: 1,
            firstName: 'Jean-Pierre',
            lastName: "O'Connor",
            fullName: "Jean-Pierre O'Connor",
            active: true,
        });
    });

    it('rejects legacy name-only payloads', () => {
        expect(parseDiagramPresenceUser({ id: 1, name: 'Alice' })).toBeNull();
    });

    it('preserves inactive state when active is false', () => {
        expect(
            parseDiagramPresenceUser({
                id: 2,
                first_name: 'Bob',
                last_name: 'Smith',
                active: false,
            })?.active
        ).toBe(false);
    });
});

describe('parseDiagramPresenceMemberInfo', () => {
    it('parses here/joining payloads from member info', () => {
        expect(
            parseDiagramPresenceMemberInfo({
                id: 3,
                info: {
                    id: 3,
                    first_name: 'Alice',
                    last_name: 'Martin',
                },
            })
        ).toEqual(createDiagramPresenceUser(3, 'Alice', 'Martin'));
    });
});
