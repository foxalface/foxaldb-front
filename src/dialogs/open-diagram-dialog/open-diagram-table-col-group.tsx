import React from 'react';
import { cn } from '@/lib/utils';
import {
    OPEN_DIAGRAM_COL_ACTIONS_CLASS,
    OPEN_DIAGRAM_COL_DATABASE_CLASS,
    OPEN_DIAGRAM_COL_DATE_CLASS,
    OPEN_DIAGRAM_COL_ROLE_CLASS,
    OPEN_DIAGRAM_COL_TABLES_CLASS,
} from './open-diagram-dialog-layout';

export interface OpenDiagramTableColGroupProps {
    showRoleColumn: boolean;
}

export const OpenDiagramTableColGroup: React.FC<
    OpenDiagramTableColGroupProps
> = ({ showRoleColumn }) => (
    <colgroup>
        <col className={OPEN_DIAGRAM_COL_DATABASE_CLASS} />
        <col />
        {showRoleColumn ? (
            <col className={OPEN_DIAGRAM_COL_ROLE_CLASS} />
        ) : null}
        <col
            className={cn(
                OPEN_DIAGRAM_COL_DATE_CLASS,
                'hidden sm:table-column'
            )}
        />
        <col className={OPEN_DIAGRAM_COL_DATE_CLASS} />
        <col className={OPEN_DIAGRAM_COL_TABLES_CLASS} />
        <col className={OPEN_DIAGRAM_COL_ACTIONS_CLASS} />
    </colgroup>
);
