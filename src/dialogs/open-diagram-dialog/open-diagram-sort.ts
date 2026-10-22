import {
    DEFAULT_OPEN_DIAGRAM_SORT,
    type OpenDiagramRow,
    type OpenDiagramSortColumn,
    type OpenDiagramSortDirection,
    type OpenDiagramSortState,
} from './open-diagram-list-types';

const compareStrings = (left: string, right: string): number =>
    left.localeCompare(right, undefined, { sensitivity: 'base' });

const compareNumbers = (left: number, right: number): number => left - right;

const compareDates = (left: Date, right: Date): number =>
    left.getTime() - right.getTime();

export const toggleOpenDiagramSort = (
    current: OpenDiagramSortState,
    column: OpenDiagramSortColumn
): OpenDiagramSortState => {
    if (current.column === column) {
        return {
            column,
            direction: current.direction === 'asc' ? 'desc' : 'asc',
        };
    }

    return {
        column,
        direction: column === 'name' || column === 'database' ? 'asc' : 'desc',
    };
};

export const sortOpenDiagramRows = (
    rows: OpenDiagramRow[],
    sort: OpenDiagramSortState = DEFAULT_OPEN_DIAGRAM_SORT
): OpenDiagramRow[] => {
    const directionMultiplier = sort.direction === 'asc' ? 1 : -1;

    return [...rows].sort((left, right) => {
        let comparison = 0;

        switch (sort.column) {
            case 'database':
                comparison = compareStrings(
                    String(left.databaseType),
                    String(right.databaseType)
                );
                break;
            case 'name':
                comparison = compareStrings(left.name, right.name);
                break;
            case 'createdAt':
                comparison = compareDates(left.createdAt, right.createdAt);
                break;
            case 'updatedAt':
                comparison = compareDates(left.updatedAt, right.updatedAt);
                break;
            case 'tablesCount':
                comparison = compareNumbers(
                    left.tablesCount,
                    right.tablesCount
                );
                break;
            default:
                comparison = 0;
        }

        if (comparison !== 0) {
            return comparison * directionMultiplier;
        }

        return compareStrings(left.id, right.id);
    });
};

export const isSortableOpenDiagramColumn = (
    column: OpenDiagramSortColumn
): boolean =>
    (
        [
            'database',
            'name',
            'createdAt',
            'updatedAt',
            'tablesCount',
        ] as OpenDiagramSortColumn[]
    ).includes(column);

export const sortDirectionForColumn = (
    sort: OpenDiagramSortState,
    column: OpenDiagramSortColumn
): OpenDiagramSortDirection | undefined =>
    sort.column === column ? sort.direction : undefined;
