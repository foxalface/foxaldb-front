import React, { useContext, useLayoutEffect, useRef, useState } from 'react';
import type { NodeProps } from '@xyflow/react';
import { Handle, Position } from '@xyflow/react';
import { ChevronsLeftRight, KeyRound, Table2 } from 'lucide-react';
import { Label } from '@/components/label/label';
import { Button } from '@/components/button/button';
import { cn } from '@/lib/utils';
import { MIN_TABLE_SIZE } from '@/lib/domain/db-table';
import type { BenchmarkTableNodeType } from '../scenarios/generate-benchmark-scenario';
import { LIQUID_GLASS_FILTER_ID } from './benchmark-liquid-glass-svg-defs';
import { BACKDROP_LIQUID_COMPARE_FILTER_ID } from './benchmark-backdrop-liquid-svg-defs';
import { CloneSyncGlassLayer } from './clone-sync-glass-layer';
import {
    useVisualCompareSceneRef,
    VisualCompareRepaintKeyContext,
} from './visual-compare-context';
import { incrementBenchmarkNodeRenderCount } from '../perf/react-render-counters';

const shellClassByMode: Record<
    BenchmarkTableNodeType['data']['renderMode'],
    string
> = {
    classic:
        'border-2 bg-slate-50 shadow-sm dark:bg-slate-950 border-slate-500 dark:border-slate-700',
    'glass-css':
        'border-2 border-white/50 bg-transparent shadow-lg shadow-slate-900/10 dark:border-white/20',
    'liquid-svg':
        'border-2 border-white/45 bg-transparent shadow-lg shadow-slate-900/10 dark:border-white/18',
};

const TABLE_SHELL_RADIUS = 12;
const TABLE_COLOR_BAR_H = 8;
const TABLE_HEADER_H = 36;
const TABLE_ROW_H = 32;

function estimateTableShellHeight(fieldCount: number): number {
    return TABLE_COLOR_BAR_H + TABLE_HEADER_H + fieldCount * TABLE_ROW_H;
}

export const BenchmarkTableNode: React.FC<NodeProps<BenchmarkTableNodeType>> =
    React.memo(({ data, selected, dragging }) => {
        incrementBenchmarkNodeRenderCount();

        const {
            tableName,
            schemaName,
            fields,
            renderMode,
            tableColor,
            visualEvaluationMode = false,
            comparePanel,
            compareCloneSyncHero = false,
        } = data;

        const sceneRef = useVisualCompareSceneRef();
        const repaintKey = useContext(VisualCompareRepaintKeyContext);
        const lensRef = useRef<HTMLDivElement>(null);
        const [shellHeight, setShellHeight] = useState(() =>
            estimateTableShellHeight(fields.length)
        );

        useLayoutEffect(() => {
            const measured = lensRef.current?.offsetHeight;
            if (measured && measured > 0) {
                setShellHeight(measured);
            }
        }, [fields.length]);

        const isCompareBackdrop = comparePanel === 'backdrop-chromium';
        const isCompareLiquidSvg =
            comparePanel === 'liquid-svg' ||
            (renderMode === 'liquid-svg' && !comparePanel);
        const useCloneSyncHero =
            comparePanel === 'clone-sync-one-table' &&
            compareCloneSyncHero &&
            sceneRef != null;

        const isGlass =
            renderMode !== 'classic' ||
            comparePanel != null ||
            useCloneSyncHero;

        const liquidFilter = isCompareLiquidSvg
            ? `url(#${LIQUID_GLASS_FILTER_ID})`
            : undefined;

        const glassBackdropClass =
            renderMode === 'glass-css' || comparePanel === 'glass-css'
                ? cn(
                      'bg-white/18 backdrop-blur-xl backdrop-saturate-150 dark:bg-slate-950/28',
                      visualEvaluationMode && 'bg-white/22 dark:bg-slate-950/32'
                  )
                : isCompareLiquidSvg
                  ? cn(
                        'bg-white/14 backdrop-blur-[14px] backdrop-saturate-125 dark:bg-slate-950/26',
                        visualEvaluationMode &&
                            'bg-white/18 dark:bg-slate-950/30'
                    )
                  : comparePanel === 'clone-sync-one-table' &&
                      !compareCloneSyncHero
                    ? cn(
                          'bg-white/18 backdrop-blur-xl backdrop-saturate-150 dark:bg-slate-950/28',
                          visualEvaluationMode &&
                              'bg-white/22 dark:bg-slate-950/32'
                      )
                    : isCompareBackdrop
                      ? 'bg-white/12 dark:bg-slate-950/22'
                      : '';

        const backdropChromiumStyle: React.CSSProperties | undefined =
            isCompareBackdrop
                ? {
                      backdropFilter: `url(#${BACKDROP_LIQUID_COMPARE_FILTER_ID}) blur(12px) saturate(1.35)`,
                      WebkitBackdropFilter: `url(#${BACKDROP_LIQUID_COMPARE_FILTER_ID}) blur(12px) saturate(1.35)`,
                  }
                : undefined;

        const headerClass = isGlass
            ? 'bg-slate-200/20 dark:bg-slate-900/25 backdrop-blur-[2px]'
            : 'bg-slate-200 dark:bg-slate-900';

        const fieldRowClass = isGlass ? 'bg-transparent' : undefined;

        const tableContent = (
            <>
                <div
                    className="h-2 rounded-t-[6px]"
                    style={{ backgroundColor: tableColor }}
                />
                <div
                    className={cn(
                        'group flex h-9 items-center justify-between px-2',
                        headerClass
                    )}
                >
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                        <Table2 className="size-3.5 shrink-0 text-gray-600 dark:text-primary" />
                        <Label
                            className={cn(
                                'truncate px-2 py-0.5 text-sm font-bold',
                                isGlass &&
                                    'text-slate-900 dark:text-slate-50 [text-shadow:0_1px_2px_rgba(255,255,255,0.85)] dark:[text-shadow:0_1px_3px_rgba(0,0,0,0.65)]'
                            )}
                        >
                            {schemaName}.{tableName}
                        </Label>
                    </div>
                    <div className="flex shrink-0 items-center gap-0.5 opacity-80">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-6 p-0 text-slate-500"
                            tabIndex={-1}
                            aria-hidden
                        >
                            <ChevronsLeftRight className="size-3.5" />
                        </Button>
                    </div>
                </div>
                <ul
                    className={cn(
                        'divide-y',
                        isGlass
                            ? 'divide-slate-500/25 dark:divide-slate-300/15'
                            : 'divide-slate-200 dark:divide-slate-800'
                    )}
                >
                    {fields.map((field) => (
                        <li
                            key={field.id}
                            className={cn(
                                'relative flex h-8 items-center justify-between px-2 text-xs',
                                fieldRowClass
                            )}
                        >
                            <Handle
                                type="target"
                                position={Position.Left}
                                id={`left-${field.id}`}
                                className="!-left-1 !size-1.5 !opacity-0"
                            />
                            <Handle
                                type="source"
                                position={Position.Right}
                                id={`right-${field.id}`}
                                className="!-right-1 !size-1.5 !opacity-0"
                            />
                            <span
                                className={cn(
                                    'flex min-w-0 items-center gap-1 truncate font-medium text-slate-800 dark:text-slate-100',
                                    isGlass &&
                                        '[text-shadow:0_1px_2px_rgba(255,255,255,0.8)] dark:[text-shadow:0_1px_2px_rgba(0,0,0,0.55)]'
                                )}
                            >
                                {field.primaryKey ? (
                                    <KeyRound className="size-3 shrink-0 text-amber-600" />
                                ) : null}
                                {field.name}
                            </span>
                            <span className="ml-2 shrink-0 text-slate-600 dark:text-slate-300">
                                {field.typeLabel}
                                {field.nullable ? '?' : ''}
                            </span>
                        </li>
                    ))}
                </ul>
            </>
        );

        const shellInner = useCloneSyncHero ? (
            <CloneSyncGlassLayer
                sceneRef={sceneRef!}
                lensRef={lensRef}
                width={MIN_TABLE_SIZE}
                height={shellHeight}
                radius={TABLE_SHELL_RADIUS}
                depth={52}
                repaintKey={repaintKey}
                className="relative w-full border-2 border-white/45 shadow-lg shadow-slate-900/10"
            >
                {tableContent}
            </CloneSyncGlassLayer>
        ) : (
            <>
                {isGlass && !useCloneSyncHero ? (
                    <div
                        aria-hidden
                        className={cn(
                            'pointer-events-none absolute inset-0 rounded-lg',
                            glassBackdropClass
                        )}
                        style={{
                            filter: liquidFilter,
                            ...backdropChromiumStyle,
                        }}
                        data-benchmark-glass-layer
                        data-compare-backdrop-chromium={
                            isCompareBackdrop ? 'true' : undefined
                        }
                    />
                ) : null}
                {isCompareLiquidSvg ? (
                    <div
                        aria-hidden
                        className="pointer-events-none absolute inset-0 z-[1] opacity-25 mix-blend-soft-light"
                        style={{
                            background:
                                'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.55), transparent 55%)',
                        }}
                        data-benchmark-glass-highlight
                    />
                ) : null}
                <div
                    className="relative z-10 flex w-full flex-col"
                    data-benchmark-table-content
                >
                    {tableContent}
                </div>
            </>
        );

        return (
            <div
                className="flex flex-col"
                style={{ width: MIN_TABLE_SIZE }}
                data-benchmark-table-shell
                data-benchmark-render-mode={renderMode}
                data-compare-panel={comparePanel}
            >
                <Handle
                    type="target"
                    position={Position.Left}
                    id="bench-target"
                    className="!size-2 !border-slate-400 !bg-slate-200"
                />
                <Handle
                    type="source"
                    position={Position.Right}
                    id="bench-source"
                    className="!size-2 !border-slate-400 !bg-slate-200"
                />
                <div
                    ref={lensRef}
                    className={cn(
                        'relative flex w-full flex-col overflow-hidden rounded-lg transition-transform duration-300',
                        useCloneSyncHero
                            ? 'border-transparent bg-transparent shadow-none'
                            : shellClassByMode[renderMode],
                        visualEvaluationMode &&
                            isGlass &&
                            !useCloneSyncHero &&
                            'ring-1 ring-white/30',
                        selected
                            ? 'border-pink-600 ring-2 ring-pink-600 ring-offset-2'
                            : '',
                        dragging ? 'scale-[1.01]' : ''
                    )}
                >
                    {shellInner}
                </div>
            </div>
        );
    });

BenchmarkTableNode.displayName = 'BenchmarkTableNode';
