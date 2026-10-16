import React, { useCallback, useMemo } from 'react';
import { Input } from '@/components/input/input';
import { useChartDB } from '@/hooks/use-chartdb';
import {
    SidePanelEmptyState,
    SidePanelEmptyStateViewport,
    sidePanelEmptyStateIcon,
} from '@/components/side-panel-empty-state/side-panel-empty-state';
import { SidePanelFilterEmptyState } from '@/components/side-panel-empty-state/side-panel-filter-empty-state';
import { useTranslation } from 'react-i18next';
import { SidePanelAddButton } from '@/components/side-panel/side-panel-add-button';
import { CustomTypeList } from './custom-type-list/custom-type-list';

export interface CustomTypesSectionProps {}

export const CustomTypesSection: React.FC<CustomTypesSectionProps> = () => {
    const { t } = useTranslation();
    const { customTypes, createCustomType, readonly } = useChartDB();
    const [filterText, setFilterText] = React.useState('');
    const filterInputRef = React.useRef<HTMLInputElement>(null);

    const filteredCustomTypes = useMemo(() => {
        return customTypes.filter(
            (type) =>
                !filterText?.trim?.() ||
                type.name.toLowerCase().includes(filterText.toLowerCase())
        );
    }, [customTypes, filterText]);

    const handleClearFilter = useCallback(() => {
        setFilterText('');
    }, []);

    const handleCreateCustomType = useCallback(async () => {
        await createCustomType();
    }, [createCustomType]);

    return (
        <section
            className="flex flex-1 flex-col overflow-hidden px-2"
            data-vaul-no-drag
        >
            <div className="flex items-center justify-between gap-4 py-1">
                <div className="flex-1">
                    <Input
                        ref={filterInputRef}
                        type="text"
                        placeholder={t(
                            'side_panel.custom_types_section.filter'
                        )}
                        className="h-8 w-full focus-visible:ring-0"
                        value={filterText}
                        onChange={(e) => setFilterText(e.target.value)}
                    />
                </div>
                {!readonly ? (
                    <SidePanelAddButton
                        label={t('side_panel.custom_types_section.new_type')}
                        onClick={handleCreateCustomType}
                    />
                ) : null}
            </div>
            <SidePanelEmptyStateViewport>
                {customTypes.length === 0 ? (
                    <SidePanelEmptyState
                        icon={sidePanelEmptyStateIcon}
                        title={t(
                            'side_panel.custom_types_section.empty_state.title'
                        )}
                        description={t(
                            'side_panel.custom_types_section.empty_state.description'
                        )}
                        secondaryAction={
                            !readonly
                                ? {
                                      label: t(
                                          'side_panel.custom_types_section.new_type'
                                      ),
                                      onClick: handleCreateCustomType,
                                  }
                                : undefined
                        }
                    />
                ) : filterText && filteredCustomTypes.length === 0 ? (
                    <SidePanelFilterEmptyState
                        title={t('side_panel.custom_types_section.no_results')}
                        clearLabel={t('side_panel.custom_types_section.clear')}
                        onClearFilter={handleClearFilter}
                    />
                ) : (
                    <CustomTypeList customTypes={filteredCustomTypes} />
                )}
            </SidePanelEmptyStateViewport>
        </section>
    );
};
