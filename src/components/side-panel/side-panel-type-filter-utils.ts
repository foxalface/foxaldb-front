export const getTypeFilterCheckboxState = (
    selectedCount: number,
    totalCount: number
): boolean | 'indeterminate' => {
    if (selectedCount === 0) {
        return false;
    }

    if (selectedCount === totalCount) {
        return true;
    }

    return 'indeterminate';
};

export const getTypeFilterSelectionAfterHeaderToggle = <T>(
    selectedItems: ReadonlyArray<T>,
    allItems: ReadonlyArray<T>
): T[] => {
    if (selectedItems.length === allItems.length) {
        return [];
    }

    return [...allItems];
};
