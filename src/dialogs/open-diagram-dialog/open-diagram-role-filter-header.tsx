import { Button } from '@/components/button/button';
import { Checkbox } from '@/components/checkbox/checkbox';
import { DiagramRoleIcon } from '@/components/diagram-role-icon/diagram-role-icon';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/popover/popover';
import { TableHead } from '@/components/table/table';
import type { DiagramAccessRole } from '@/lib/api/diagrams';
import { cn } from '@/lib/utils';
import { ListFilter } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    isOpenDiagramRoleFilterActive,
    OPEN_DIAGRAM_ROLE_FILTER_ROLES,
    type OpenDiagramRoleFilterState,
} from './open-diagram-role-filter';
import { OPEN_DIAGRAM_COL_ROLE_CLASS } from './open-diagram-dialog-layout';

export interface OpenDiagramRoleFilterHeaderProps {
    roleFilter: OpenDiagramRoleFilterState;
    onRoleCheckedChange: (role: DiagramAccessRole, checked: boolean) => void;
}

export const OpenDiagramRoleFilterHeader: React.FC<
    OpenDiagramRoleFilterHeaderProps
> = ({ roleFilter, onRoleCheckedChange }) => {
    const { t } = useTranslation();
    const filterActive = isOpenDiagramRoleFilterActive(roleFilter);

    return (
        <TableHead
            className={cn(
                OPEN_DIAGRAM_COL_ROLE_CLASS,
                'p-0 text-center align-middle'
            )}
        >
            <div className="flex items-center justify-center gap-0.5 px-1">
                <span className="whitespace-nowrap text-xs font-medium text-muted-foreground">
                    {t('open_diagram_dialog.table_columns.role')}
                </span>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className={cn(
                                'size-7 shrink-0 text-muted-foreground hover:text-foreground',
                                filterActive && 'bg-muted/60 text-foreground'
                            )}
                            aria-label={t(
                                'open_diagram_dialog.role_filter.filter_button_aria'
                            )}
                            onClick={(event) => event.stopPropagation()}
                        >
                            <ListFilter className="size-3.5" aria-hidden />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent
                        align="center"
                        sideOffset={8}
                        className="z-[1100] w-auto min-w-44 p-2"
                        onOpenAutoFocus={(event) => event.preventDefault()}
                    >
                        <p className="mb-2 px-1 text-xs font-medium text-foreground">
                            {t('open_diagram_dialog.role_filter.popover_title')}
                        </p>
                        <ul className="flex flex-col gap-0.5">
                            {OPEN_DIAGRAM_ROLE_FILTER_ROLES.map((role) => (
                                <li key={role}>
                                    <label className="flex cursor-pointer items-center gap-2 rounded-sm px-1 py-1.5 hover:bg-muted/50">
                                        <Checkbox
                                            checked={roleFilter[role]}
                                            onCheckedChange={(checked) =>
                                                onRoleCheckedChange(
                                                    role,
                                                    checked === true
                                                )
                                            }
                                            onClick={(event) =>
                                                event.stopPropagation()
                                            }
                                        />
                                        <DiagramRoleIcon
                                            role={role}
                                            withTooltip={false}
                                        />
                                        <span className="text-sm">
                                            {t(`diagram_role.${role}`)}
                                        </span>
                                    </label>
                                </li>
                            ))}
                        </ul>
                    </PopoverContent>
                </Popover>
            </div>
        </TableHead>
    );
};
