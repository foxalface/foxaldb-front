import type { ChartDBEvent } from '@/context/chartdb-context/chartdb-context';
import type { EventEmitter } from 'ahooks/lib/useEventEmitter';

export interface TablePositionUpdate {
    id: string;
    x: number;
    y: number;
}

const isValidTableId = (id: string): boolean => id.length > 0;

const isFinitePosition = (value: number): boolean => Number.isFinite(value);

export const emitTablePositionSync = (
    events: EventEmitter<ChartDBEvent>,
    updates: readonly TablePositionUpdate[]
): void => {
    const dedupedUpdates = new Map<string, TablePositionUpdate>();

    for (const update of updates) {
        if (!isValidTableId(update.id)) {
            continue;
        }

        if (!isFinitePosition(update.x) || !isFinitePosition(update.y)) {
            continue;
        }

        dedupedUpdates.set(update.id, {
            id: update.id,
            x: update.x,
            y: update.y,
        });
    }

    for (const update of dedupedUpdates.values()) {
        events.emit({
            action: 'update_table',
            data: {
                id: update.id,
                table: {
                    x: update.x,
                    y: update.y,
                },
            },
        });
    }
};
