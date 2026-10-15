import { describe, expect, it } from 'vitest';
import type { DBField } from '@/lib/domain/db-field';
import type { DBTable } from '@/lib/domain/db-table';
import { calcTableHeight, MIN_TABLE_SIZE } from '@/lib/domain/db-table';
import {
    placementRectFromTable,
    PreviewTablePlacement,
    PREVIEW_PLACEMENT_COLUMN_GAP,
    PREVIEW_PLACEMENT_VERTICAL_GAP,
    rectanglesOverlap,
} from '../preview-placement';

const field = (id: string, name: string): DBField => ({
    id,
    name,
    type: { id: 'varchar', name: 'varchar' },
    primaryKey: false,
    unique: false,
    nullable: true,
    createdAt: 0,
});

const table = (
    id: string,
    name: string,
    options: {
        x?: number;
        y?: number;
        width?: number;
        fields?: DBField[];
        isView?: boolean;
    } = {}
): DBTable => ({
    id,
    name,
    schema: 'public',
    x: options.x ?? 0,
    y: options.y ?? 0,
    width: options.width ?? MIN_TABLE_SIZE,
    fields: options.fields ?? [],
    indexes: [],
    color: '#8eb7ff',
    isView: options.isView ?? false,
    createdAt: 0,
});

const assertNoOverlaps = (
    tables: readonly DBTable[],
    gap = PREVIEW_PLACEMENT_VERTICAL_GAP
): void => {
    const rects = tables.map(placementRectFromTable);

    for (let i = 0; i < rects.length; i += 1) {
        for (let j = i + 1; j < rects.length; j += 1) {
            expect(rectanglesOverlap(rects[i], rects[j], gap)).toBe(false);
        }
    }
};

describe('rectanglesOverlap', () => {
    it('detects overlap and separation', () => {
        const a = { x: 0, y: 0, width: 100, height: 50 };
        const b = { x: 50, y: 0, width: 100, height: 50 };
        const c = { x: 200, y: 0, width: 100, height: 50 };

        expect(rectanglesOverlap(a, b)).toBe(true);
        expect(rectanglesOverlap(a, c)).toBe(false);
    });
});

describe('PreviewTablePlacement', () => {
    it('places first table to the right of existing bounds', () => {
        const existing = [table('t1', 'users', { x: 100, y: 50, width: 280 })];
        const placement = new PreviewTablePlacement(existing);
        const incoming = table('new', 'invoices', {
            fields: [field('f1', 'id')],
        });

        const position = placement.placeNext(incoming);

        expect(position.x).toBe(100 + 280 + PREVIEW_PLACEMENT_COLUMN_GAP);
        expect(position.y).toBe(50);
    });

    it('stacks by estimated height plus vertical gap', () => {
        const placement = new PreviewTablePlacement([]);
        const short = table('a', 'a', { fields: [field('f1', 'id')] });
        const tall = table('b', 'b', {
            fields: Array.from({ length: 12 }, (_, index) =>
                field(`f${index}`, `c${index}`)
            ),
        });

        const first = placement.placeNext(short);
        const second = placement.placeNext(tall);

        expect(first).toEqual({ x: 0, y: 0 });
        expect(second.y).toBe(
            calcTableHeight(short) + PREVIEW_PLACEMENT_VERTICAL_GAP
        );
        expect(second.x).toBe(0);
    });

    it('wraps to a new column when column height is exceeded', () => {
        const existing = [
            table('t1', 'users', {
                x: 0,
                y: 0,
                width: 200,
                fields: Array.from({ length: 8 }, (_, index) =>
                    field(`e${index}`, `e${index}`)
                ),
            }),
        ];
        const placement = new PreviewTablePlacement(existing);

        const tall = (name: string) =>
            table(name, name, {
                fields: Array.from({ length: 14 }, (_, index) =>
                    field(`${name}-${index}`, `c${index}`)
                ),
            });

        const p1 = placement.placeNext(tall('one'));
        const p2 = placement.placeNext(tall('two'));
        const p3 = placement.placeNext(tall('three'));

        expect(p2.x).toBeGreaterThan(p1.x);
        expect(p3.x).toBeGreaterThan(p2.x);
    });

    it('respects custom table width for column advance', () => {
        const placement = new PreviewTablePlacement([]);
        const wide = table('w', 'wide', { width: 400, fields: [] });
        const next = table('n', 'next', { fields: [] });

        placement.placeNext(wide);
        const position = placement.placeNext(next);

        expect(position.x).toBe(0);
        expect(position.y).toBe(
            calcTableHeight(wide) + PREVIEW_PLACEMENT_VERTICAL_GAP
        );
    });

    it('treats views like tables for placement', () => {
        const placement = new PreviewTablePlacement([]);
        const view = table('v', 'active_users', {
            isView: true,
            fields: [field('f1', 'id'), field('f2', 'email')],
        });

        const position = placement.placeNext(view);
        expect(position).toEqual({ x: 0, y: 0 });
    });
});

describe('preview placement integration shapes', () => {
    it('matches real QA stack without vertical overlap', () => {
        const existing = [
            table('users', 'users', {
                x: 0,
                y: 0,
                fields: [field('u1', 'id')],
            }),
            table('teams', 'teams', {
                x: 300,
                y: 0,
                fields: [field('t1', 'id')],
            }),
            table('posts', 'posts', {
                x: 0,
                y: 200,
                fields: [field('p1', 'id')],
            }),
        ];

        const placement = new PreviewTablePlacement(existing);
        const additions = [
            table('invoice_items', 'invoice_items', {
                fields: Array.from({ length: 12 }, (_, i) =>
                    field(`ii${i}`, `line_${i}`)
                ),
            }),
            table('invoices', 'invoices', {
                fields: [
                    field('i1', 'id'),
                    field('i2', 'total'),
                    field('i3', 'issued_at'),
                ],
            }),
            table('profiles', 'profiles', {
                fields: Array.from({ length: 6 }, (_, i) =>
                    field(`pr${i}`, `attr_${i}`)
                ),
            }),
            table('user_directory', 'user_directory', {
                fields: Array.from({ length: 10 }, (_, i) =>
                    field(`ud${i}`, `meta_${i}`)
                ),
            }),
        ];

        const placed: DBTable[] = [...existing];
        const positions: { name: string; x: number; y: number }[] = [];

        for (const incoming of additions) {
            const { x, y } = placement.placeNext(incoming);
            placed.push({ ...incoming, x, y });
            positions.push({ name: incoming.name, x, y });
        }

        assertNoOverlaps(placed);

        const invoiceItems = placed.find((t) => t.name === 'invoice_items')!;
        const invoices = placed.find((t) => t.name === 'invoices')!;
        const profiles = placed.find((t) => t.name === 'profiles')!;
        const userDirectory = placed.find((t) => t.name === 'user_directory')!;

        const rInvoiceItems = placementRectFromTable(invoiceItems);
        const rInvoices = placementRectFromTable(invoices);
        const rProfiles = placementRectFromTable(profiles);
        const rUserDirectory = placementRectFromTable(userDirectory);

        expect(rectanglesOverlap(rInvoiceItems, rInvoices)).toBe(false);
        expect(rectanglesOverlap(rInvoices, rProfiles)).toBe(false);
        expect(rectanglesOverlap(rProfiles, rUserDirectory)).toBe(false);

        const rightmostExisting = Math.max(
            ...existing.map((t) => t.x + (t.width ?? MIN_TABLE_SIZE))
        );
        for (const added of additions) {
            const placedTable = placed.find((t) => t.name === added.name)!;
            expect(placedTable.x).toBeGreaterThanOrEqual(
                rightmostExisting + PREVIEW_PLACEMENT_COLUMN_GAP - 1
            );
        }
    });
});
