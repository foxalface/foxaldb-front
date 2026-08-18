import type { TFunction } from 'i18next';
import type { DiagramActivityResource } from '@/lib/api/diagram-activities';
import {
    ACTIVITY_ENTITY_TYPES,
    DEFAULT_SELECTED_ACTIVITY_ENTITY_TYPES,
    type ActivityEntityType,
} from '@/components/side-panel/side-panel-entity-type-icons';
import { getActivityActionEntityType } from './get-activity-action-icon';
import { formatActivityMessage } from './format-activity-message';

export interface FilterActivitiesOptions {
    filterText: string;
    selectedEntityTypes: ReadonlyArray<ActivityEntityType>;
}

export const isActivityEntityTypeFilterActive = (
    selectedEntityTypes: ReadonlyArray<ActivityEntityType>
): boolean => selectedEntityTypes.length !== ACTIVITY_ENTITY_TYPES.length;

export const matchesActivityEntityTypeFilter = (
    activity: DiagramActivityResource,
    selectedEntityTypes: ReadonlyArray<ActivityEntityType>
): boolean => {
    if (selectedEntityTypes.length === 0) {
        return false;
    }

    const entityType = getActivityActionEntityType(activity.action);

    return selectedEntityTypes.includes(entityType);
};

export const matchesActivityTextFilter = (
    activity: DiagramActivityResource,
    filterText: string,
    context: { t: TFunction; currentUserId?: number }
): boolean => {
    const normalizedFilter = filterText.trim().toLowerCase();

    if (normalizedFilter === '') {
        return true;
    }

    const message = formatActivityMessage(
        activity,
        context.t,
        context.currentUserId
    ).toLowerCase();
    const userName = activity.user?.fullName?.toLowerCase() ?? '';

    return (
        message.includes(normalizedFilter) ||
        userName.includes(normalizedFilter)
    );
};

export const matchesActivityFilter = (
    activity: DiagramActivityResource,
    options: FilterActivitiesOptions,
    context: { t: TFunction; currentUserId?: number }
): boolean =>
    matchesActivityEntityTypeFilter(activity, options.selectedEntityTypes) &&
    matchesActivityTextFilter(activity, options.filterText, context);

export const hasActiveActivitiesFilter = (
    options: FilterActivitiesOptions
): boolean =>
    options.filterText.trim().length > 0 ||
    isActivityEntityTypeFilterActive(options.selectedEntityTypes);

export const filterActivities = (
    activities: ReadonlyArray<DiagramActivityResource>,
    options: FilterActivitiesOptions,
    context: { t: TFunction; currentUserId?: number }
): DiagramActivityResource[] =>
    activities.filter((activity) =>
        matchesActivityFilter(activity, options, context)
    );

export { DEFAULT_SELECTED_ACTIVITY_ENTITY_TYPES };
