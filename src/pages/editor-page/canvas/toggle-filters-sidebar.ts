import type { SidebarSection } from '@/context/layout-context/layout-context';

export const toggleFiltersSidebar = (
    toggleSidebarSection: (section: SidebarSection) => void
): void => {
    toggleSidebarSection('filters');
};
