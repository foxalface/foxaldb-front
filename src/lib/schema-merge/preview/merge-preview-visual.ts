import type { LucideIcon } from 'lucide-react';
import { ArrowRight, Minus, Pencil, Plus } from 'lucide-react';
import type { MergeChangeVisual } from './preview-types';
import { cn } from '@/lib/utils';

/** Shared semantic palette for Result list badges and canvas preview decorations. */
export const MERGE_CHANGE_VISUAL: Record<
    MergeChangeVisual,
    {
        readonly icon: LucideIcon;
        readonly textClassName: string;
        readonly tableRingClassName: string;
        readonly tableContainerClassName: string;
        readonly tableNameClassName: string;
        readonly fieldRowClassName: string;
        readonly fieldNameClassName: string;
        readonly edgeStrokeClassName: string;
        readonly edgeDashed: boolean;
        readonly cardinalityMarkerCircleClassName: string;
        readonly cardinalityMarkerTextClassName: string;
    }
> = {
    add: {
        icon: Plus,
        textClassName: 'text-emerald-800 dark:text-emerald-300',
        tableRingClassName:
            'ring-2 ring-offset-2 ring-offset-slate-50 dark:ring-offset-slate-900 ring-emerald-500 dark:ring-emerald-400',
        tableContainerClassName: 'border-emerald-500 dark:border-emerald-600',
        tableNameClassName:
            'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200',
        fieldRowClassName:
            'border-l-[3px] border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 dark:border-emerald-500',
        fieldNameClassName: 'text-emerald-900 dark:text-emerald-200',
        edgeStrokeClassName: '!stroke-emerald-500 dark:!stroke-emerald-400',
        edgeDashed: false,
        cardinalityMarkerCircleClassName:
            'fill-emerald-500 dark:fill-emerald-400 stroke-background stroke-[0.5]',
        cardinalityMarkerTextClassName: 'fill-muted',
    },
    modify: {
        icon: Pencil,
        textClassName: 'text-blue-800 dark:text-blue-300',
        tableRingClassName:
            'ring-2 ring-offset-2 ring-offset-slate-50 dark:ring-offset-slate-900 ring-sky-500 dark:ring-sky-400',
        tableContainerClassName: 'border-sky-500 dark:border-sky-600',
        tableNameClassName:
            'bg-sky-100 text-sky-900 dark:bg-sky-950 dark:text-sky-200',
        fieldRowClassName:
            'border-l-[3px] border-sky-500 bg-sky-50/80 dark:bg-sky-950/40 dark:border-sky-500',
        fieldNameClassName: 'text-sky-900 dark:text-sky-200',
        edgeStrokeClassName: '!stroke-sky-500 dark:!stroke-sky-400',
        edgeDashed: false,
        cardinalityMarkerCircleClassName:
            'fill-sky-500 dark:fill-sky-400 stroke-background stroke-[0.5]',
        cardinalityMarkerTextClassName: 'fill-muted',
    },
    rename: {
        icon: ArrowRight,
        textClassName: 'text-amber-800 dark:text-amber-300',
        tableRingClassName:
            'ring-2 ring-offset-2 ring-offset-slate-50 dark:ring-offset-slate-900 ring-amber-500 dark:ring-amber-400',
        tableContainerClassName: 'border-amber-500 dark:border-amber-600',
        tableNameClassName:
            'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200',
        fieldRowClassName:
            'border-l-[3px] border-amber-500 bg-amber-50/80 dark:bg-amber-950/40 dark:border-amber-500',
        fieldNameClassName: 'text-amber-900 dark:text-amber-200',
        edgeStrokeClassName: '!stroke-amber-500 dark:!stroke-amber-400',
        edgeDashed: false,
        cardinalityMarkerCircleClassName:
            'fill-amber-500 dark:fill-amber-400 stroke-background stroke-[0.5]',
        cardinalityMarkerTextClassName: 'fill-muted',
    },
    delete: {
        icon: Minus,
        textClassName: 'text-red-800 dark:text-red-300',
        tableRingClassName:
            'ring-2 ring-offset-2 ring-offset-slate-50 dark:ring-offset-slate-900 ring-red-500 dark:ring-red-400',
        tableContainerClassName: 'border-red-500 dark:border-red-600',
        tableNameClassName:
            'bg-red-100 text-red-900 line-through dark:bg-red-950 dark:text-red-200',
        fieldRowClassName:
            'border-l-[3px] border-red-500 bg-red-50/60 opacity-80 dark:bg-red-950/30 dark:border-red-500',
        fieldNameClassName: 'text-red-900 line-through dark:text-red-200',
        edgeStrokeClassName: '!stroke-red-500 dark:!stroke-red-400',
        edgeDashed: true,
        cardinalityMarkerCircleClassName:
            'fill-red-500 dark:fill-red-400 stroke-background stroke-[0.5]',
        cardinalityMarkerTextClassName: 'fill-muted',
    },
};

export const getMergePreviewTableClasses = (
    change: MergeChangeVisual | undefined
): {
    ring: string;
    border: string;
    container: string;
    name: string;
} => {
    if (!change) {
        return { ring: '', border: '', container: '', name: '' };
    }

    const visual = MERGE_CHANGE_VISUAL[change];
    return {
        ring: visual.tableRingClassName,
        border: visual.tableContainerClassName,
        container: change === 'delete' ? 'opacity-[0.88] saturate-[0.92]' : '',
        name: visual.tableNameClassName,
    };
};

export const getMergePreviewFieldClasses = (
    change: MergeChangeVisual | undefined
): { row: string; name: string } => {
    if (!change) {
        return { row: '', name: '' };
    }

    const visual = MERGE_CHANGE_VISUAL[change];
    return {
        row: visual.fieldRowClassName,
        name: visual.fieldNameClassName,
    };
};

/** Hover/focus emphasis layered on top of semantic change colors (M10.5). */
export const MERGE_PREVIEW_TABLE_FOCUS_RING =
    'ring-2 ring-primary/80 ring-offset-2 ring-offset-slate-50 dark:ring-offset-slate-900 shadow-md';

export const MERGE_PREVIEW_TABLE_DIM_CLASS = 'opacity-55 saturate-[0.85]';

export const MERGE_PREVIEW_FIELD_FOCUS_CLASS =
    'ring-1 ring-inset ring-primary/80 bg-primary/10 dark:bg-primary/15';

export const MERGE_PREVIEW_EDGE_FOCUS_CLASS =
    '!drop-shadow-[0_0_6px_rgba(59,130,246,0.45)]';

export const MERGE_PREVIEW_EDGE_DIM_CLASS = 'opacity-45';

export const MERGE_PREVIEW_EDGE_FOREGROUND_CLASS = 'drop-shadow-sm';

export const MERGE_PREVIEW_CARDINALITY_FOREGROUND_CLASS =
    '[&_circle]:stroke-[1px] [&_circle]:drop-shadow-sm';

export const getMergePreviewCardinalityMarkerClasses = (
    change: MergeChangeVisual
): { circle: string; text: string } => {
    const visual = MERGE_CHANGE_VISUAL[change];
    return {
        circle: visual.cardinalityMarkerCircleClassName,
        text: visual.cardinalityMarkerTextClassName,
    };
};

export const getMergePreviewRelationshipOverlayClasses = (
    change: MergeChangeVisual | undefined,
    foreground: boolean
): {
    edgeStroke: string;
    cardinalityForeground: string;
    indicatorClassName: string;
} => {
    if (!change) {
        return {
            edgeStroke: '',
            cardinalityForeground: '',
            indicatorClassName: '',
        };
    }

    const visual = MERGE_CHANGE_VISUAL[change];
    return {
        edgeStroke: visual.edgeStrokeClassName,
        cardinalityForeground: foreground
            ? MERGE_PREVIEW_CARDINALITY_FOREGROUND_CLASS
            : '',
        indicatorClassName: cn(
            visual.textClassName,
            foreground ? 'shadow-md ring-1 ring-background/80' : ''
        ),
    };
};

export const getMergePreviewEdgeClasses = (
    change: MergeChangeVisual | undefined,
    selected: boolean
): { stroke: string; dashed: boolean; opacity: number } => {
    if (!change) {
        return {
            stroke: selected ? '!stroke-pink-600' : '!stroke-slate-400',
            dashed: false,
            opacity: 1,
        };
    }

    const visual = MERGE_CHANGE_VISUAL[change];
    return {
        stroke: cn('!stroke-2', visual.edgeStrokeClassName),
        dashed: visual.edgeDashed,
        opacity: 1,
    };
};
