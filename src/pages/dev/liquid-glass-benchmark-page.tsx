import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { formatAggregateRow } from '@/benchmarks/liquid-glass/perf/format-aggregate-row';
import { RENDER_MODES } from '@/benchmarks/liquid-glass/render-modes';
import {
    LiquidGlassBenchmarkCanvas,
    type LiquidGlassBenchmarkCanvasHandle,
} from '@/benchmarks/liquid-glass/components/liquid-glass-benchmark-canvas';
import { LiquidGlassVisualDemo } from '@/benchmarks/liquid-glass/components/liquid-glass-visual-demo';
import { LiquidGlassVisualCompare } from '@/benchmarks/liquid-glass/components/liquid-glass-visual-compare';
import {
    CAMPAIGN_QUERY_PARAM,
    CAMPAIGN_QUERY_VALUE,
    DEFAULT_CANVAS_INIT_TIMEOUT_MS,
    type BenchmarkCampaignProgress,
    type BenchmarkPageDiagnostics,
    type CampaignSegmentId,
    type ProductionCampaignPayload,
} from '@/benchmarks/liquid-glass/perf/campaign-types';
import {
    BenchmarkCampaignController,
    CampaignAbortError,
    waitForCanvasHandle,
} from '@/benchmarks/liquid-glass/perf/campaign-controller';
import {
    createInitialPageDiagnostics,
    parseAutorunQueryValue,
    publishPageDiagnostics,
} from '@/benchmarks/liquid-glass/perf/benchmark-mount-diagnostics';
import {
    runAnomalyPanProbeSegment,
    runFullSuiteAllModesSegment,
    runProductionFullSegment,
    runStatisticalMatrixSegment,
} from '@/benchmarks/liquid-glass/perf/campaign-segments';
import { BENCHMARK_TABLE_COUNTS } from '@/benchmarks/liquid-glass/scenarios/generate-benchmark-nodes';
import {
    enrichEnvironmentWithRefreshRate,
    buildBenchmarkEnvironmentInfo,
} from '@/benchmarks/liquid-glass/perf/environment-metrics';
import type {
    BenchmarkEnvironmentInfo,
    BenchmarkFieldDensity,
    BenchmarkRelationshipDensity,
    BenchmarkRunResult,
    BenchmarkScenarioProfile,
    LiquidGlassRenderMode,
    StatisticalAggregate,
} from '@/benchmarks/liquid-glass/types';
import type { BenchmarkTableCount } from '@/benchmarks/liquid-glass/scenarios/generate-benchmark-nodes';
import { Button } from '@/components/button/button';
import { Label } from '@/components/label/label';

function formatResultRow(result: BenchmarkRunResult): string {
    const m = result.frameMetrics;
    const s = result.scenario;
    return [
        s.mode,
        String(s.tableCount),
        s.phase,
        s.fieldDensity,
        s.relationshipDensity,
        s.overlapCluster ? 'overlap' : 'grid',
        `run${s.runIndex}`,
        m.fpsAverage.toFixed(1),
        m.frameTimeMsP95.toFixed(1),
        String(m.droppedFramesEstimate),
        String(result.longTasks.count),
        String(result.reactRenders.benchmarkNodeRenderCount),
        result.memoryAfter.usedJsHeapSizeMb?.toFixed(1) ?? 'n/a',
    ].join('\t');
}

function collectRunsFromPayload(
    payload: ProductionCampaignPayload
): BenchmarkRunResult[] {
    if (payload.partialResults.length > 0) {
        return payload.partialResults;
    }
    return [
        ...(payload.statisticalMatrix?.results ?? []),
        ...(payload.fullSuites20Tables ?? []),
        ...(payload.anomalyPan20Tables?.results ?? []),
    ];
}

function collectAggregatesFromPayload(
    payload: ProductionCampaignPayload
): StatisticalAggregate[] {
    if (payload.partialAggregates.length > 0) {
        return payload.partialAggregates;
    }
    return [
        ...(payload.statisticalMatrix?.aggregates ?? []),
        ...(payload.anomalyPan20Tables?.aggregates ?? []),
    ];
}

function formatProgressLine(progress: BenchmarkCampaignProgress): string {
    return [
        progress.status,
        progress.segment ?? '—',
        `step ${progress.currentStep}/${progress.totalSteps}`,
        progress.currentMode ?? '—',
        progress.currentScenario ?? '—',
        progress.message ?? '',
    ].join(' · ');
}

export const LiquidGlassBenchmarkPage: React.FC = () => {
    const [tableCount, setTableCount] = useState<BenchmarkTableCount>(20);
    const [renderMode, setRenderMode] =
        useState<LiquidGlassRenderMode>('classic');
    const [fieldDensity, setFieldDensity] =
        useState<BenchmarkFieldDensity>('medium');
    const [relationshipDensity, setRelationshipDensity] =
        useState<BenchmarkRelationshipDensity>('sparse');
    const [overlapCluster, setOverlapCluster] = useState(false);
    const [results, setResults] = useState<BenchmarkRunResult[]>([]);
    const [aggregates, setAggregates] = useState<StatisticalAggregate[]>([]);
    const [campaignMessage, setCampaignMessage] = useState<string | null>(null);
    const [autorunDiagnostic, setAutorunDiagnostic] = useState<string | null>(
        null
    );
    const [campaignProgressLine, setCampaignProgressLine] = useState<
        string | null
    >(null);
    const [campaignRunning, setCampaignRunning] = useState(false);
    const [pageDiagnostics, setPageDiagnostics] =
        useState<BenchmarkPageDiagnostics | null>(null);
    const [campaignExportReady, setCampaignExportReady] = useState(false);
    const canvasRef = useRef<LiquidGlassBenchmarkCanvasHandle>(null);
    const controllerRef = useRef(new BenchmarkCampaignController());
    const autorunStartedRef = useRef(false);
    const [env, setEnv] = useState<BenchmarkEnvironmentInfo>(() =>
        buildBenchmarkEnvironmentInfo()
    );

    useEffect(() => {
        void enrichEnvironmentWithRefreshRate(
            buildBenchmarkEnvironmentInfo()
        ).then(setEnv);
    }, []);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        publishPageDiagnostics(createInitialPageDiagnostics(params));
        setPageDiagnostics(window.__foxaldbBenchmarkPageDiagnostics ?? null);
        const autorun = parseAutorunQueryValue(params);
        if (autorun.raw !== null && !autorun.valid) {
            const message = `Unrecognized ${CAMPAIGN_QUERY_PARAM}="${autorun.raw}". Expected ${CAMPAIGN_QUERY_PARAM}=${CAMPAIGN_QUERY_VALUE}.`;
            setAutorunDiagnostic(message);
            window.__foxaldbBenchmarkCampaignError = message;
            publishPageDiagnostics({
                autorunValid: false,
                autorunParam: autorun.raw,
            });
        }
    }, []);

    useEffect(() => {
        if (!campaignRunning) {
            return undefined;
        }
        const intervalId = window.setInterval(() => {
            const progress = window.__foxaldbBenchmarkCampaignProgress;
            if (progress) {
                setCampaignProgressLine(formatProgressLine(progress));
            }
        }, 1000);
        return () => {
            window.clearInterval(intervalId);
        };
    }, [campaignRunning]);

    const profile: BenchmarkScenarioProfile = useMemo(
        () => ({
            tableCount,
            fieldDensity,
            relationshipDensity,
            overlapCluster,
        }),
        [fieldDensity, overlapCluster, relationshipDensity, tableCount]
    );

    const appendResults = useCallback((next: BenchmarkRunResult[]) => {
        setResults((prev) => [...prev, ...next]);
    }, []);

    const mergeAggregates = useCallback((next: StatisticalAggregate[]) => {
        setAggregates((prev) => {
            const keys = new Set(prev.map((row) => row.key));
            const merged = [...prev];
            for (const row of next) {
                if (!keys.has(row.key)) {
                    keys.add(row.key);
                    merged.push(row);
                }
            }
            return merged;
        });
    }, []);

    const applyPayloadToUi = useCallback(
        (payload: ProductionCampaignPayload | undefined) => {
            if (!payload) {
                return;
            }
            const runs = collectRunsFromPayload(payload);
            if (runs.length > 0) {
                setResults(runs);
            }
            const agg = collectAggregatesFromPayload(payload);
            if (agg.length > 0) {
                setAggregates(agg);
            }
        },
        []
    );

    const runCampaignSegment = useCallback(
        async (segment: CampaignSegmentId) => {
            const controller = controllerRef.current;
            if (controller.isRunning()) {
                setCampaignMessage('A campaign is already running.');
                return;
            }
            setCampaignRunning(true);
            setCampaignMessage(`Starting ${segment}…`);
            setCampaignProgressLine(null);
            try {
                const handle = await waitForCanvasHandle(
                    () => canvasRef.current,
                    {
                        timeoutMs: DEFAULT_CANVAS_INIT_TIMEOUT_MS,
                    }
                );
                const ctx = {
                    handle,
                    controller,
                    setRenderMode,
                    setTableCount,
                };
                switch (segment) {
                    case 'statistical-matrix':
                        await runStatisticalMatrixSegment(ctx);
                        break;
                    case 'full-suite-all-modes':
                        await runFullSuiteAllModesSegment(ctx);
                        break;
                    case 'anomaly-pan-probe':
                        await runAnomalyPanProbeSegment(ctx);
                        break;
                    case 'production-full':
                        await runProductionFullSegment(ctx);
                        break;
                    default: {
                        const _exhaustive: never = segment;
                        throw new Error(
                            `Unknown segment: ${String(_exhaustive)}`
                        );
                    }
                }
                const status = controller.getStatus();
                setCampaignMessage(`Campaign ${status}.`);
                applyPayloadToUi(window.__foxaldbBenchmarkCampaign);
            } catch (error) {
                if (error instanceof CampaignAbortError) {
                    setCampaignMessage('Campaign cancelled.');
                } else {
                    const message =
                        error instanceof Error ? error.message : String(error);
                    setCampaignMessage(`Campaign failed: ${message}`);
                }
                applyPayloadToUi(window.__foxaldbBenchmarkCampaign);
            } finally {
                setCampaignRunning(false);
                setCampaignExportReady(
                    Boolean(window.__foxaldbBenchmarkCampaign) ||
                        controller.getPartialResults().length > 0
                );
                const progress = window.__foxaldbBenchmarkCampaignProgress;
                if (progress) {
                    setCampaignProgressLine(formatProgressLine(progress));
                }
            }
        },
        [applyPayloadToUi]
    );

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const autorun = parseAutorunQueryValue(params);
        if (!autorun.valid || autorunStartedRef.current) {
            return undefined;
        }
        autorunStartedRef.current = true;
        const controller = controllerRef.current;
        void runCampaignSegment('production-full');
        return () => {
            controller.dispose();
        };
    }, [runCampaignSegment]);

    useEffect(() => {
        const controller = controllerRef.current;
        return () => {
            controller.dispose();
        };
    }, []);

    const onHarnessReady = useCallback(
        (state: {
            reactFlowInitialized: boolean;
            handleAvailable: boolean;
        }) => {
            publishPageDiagnostics({
                canvasReady: state.handleAvailable,
                canvasReadyAt: state.handleAvailable
                    ? new Date().toISOString()
                    : null,
                reactFlowInitialized: state.reactFlowInitialized,
            });
            setPageDiagnostics(
                window.__foxaldbBenchmarkPageDiagnostics ?? null
            );
        },
        []
    );

    const cancelCampaign = useCallback(() => {
        controllerRef.current.cancel();
    }, []);

    const downloadJson = useCallback(() => {
        const blob = new Blob(
            [
                JSON.stringify(
                    { environment: env, results, aggregates },
                    null,
                    2
                ),
            ],
            { type: 'application/json' }
        );
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `liquid-glass-benchmark-${Date.now()}.json`;
        anchor.click();
        URL.revokeObjectURL(url);
    }, [aggregates, env, results]);

    const downloadCampaignJson = useCallback(() => {
        const payload =
            window.__foxaldbBenchmarkCampaign ??
            controllerRef.current.buildPayload('statistical-matrix', {});
        const blob = new Blob([JSON.stringify(payload, null, 2)], {
            type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `liquid-glass-campaign-${payload.segment}-${Date.now()}.json`;
        anchor.click();
        URL.revokeObjectURL(url);
    }, []);

    const pageDiagnosticsSnapshot = pageDiagnostics;

    return (
        <div className="mx-auto flex max-w-6xl flex-col gap-6 p-6">
            <header className="space-y-2">
                <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
                    Liquid Glass benchmark (POC v2)
                </h1>
                <p className="text-sm text-muted-foreground">
                    Harness isolé — DOM proche des tables FoxalDB (bande
                    couleur, header, champs, handles), relations simplifiées,
                    sans ChartDB ni realtime. Route :{' '}
                    <code>/dev/benchmarks/liquid-glass</code> (disponible aussi
                    en build production pour mesures de référence).
                </p>
                {autorunDiagnostic ? (
                    <p
                        className="rounded-md border border-amber-500/50 bg-amber-500/10 p-3 text-sm text-amber-900 dark:text-amber-100"
                        data-benchmark-autorun-diagnostic
                    >
                        {autorunDiagnostic}
                    </p>
                ) : null}
                {campaignMessage ? (
                    <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                        {campaignMessage}
                    </p>
                ) : null}
                {campaignProgressLine ? (
                    <p className="font-mono text-xs text-muted-foreground">
                        {campaignProgressLine}
                    </p>
                ) : null}
            </header>

            <section className="space-y-3 rounded-lg border p-4">
                <h2 className="text-lg font-medium">Campaigns</h2>
                <p className="text-sm text-muted-foreground">
                    Short segments for automation. Autorun URL param:{' '}
                    <code>
                        ?{CAMPAIGN_QUERY_PARAM}={CAMPAIGN_QUERY_VALUE}
                    </code>{' '}
                    (full production campaign — long). Progress:{' '}
                    <code>window.__foxaldbBenchmarkCampaignProgress</code>.
                </p>
                <div className="flex flex-wrap gap-2">
                    <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        disabled={campaignRunning}
                        onClick={() => {
                            void runCampaignSegment('statistical-matrix');
                        }}
                    >
                        Statistical matrix
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        disabled={campaignRunning}
                        onClick={() => {
                            void runCampaignSegment('full-suite-all-modes');
                        }}
                    >
                        Full suite (all modes)
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        disabled={campaignRunning}
                        onClick={() => {
                            void runCampaignSegment('anomaly-pan-probe');
                        }}
                    >
                        Pan-only anomaly probe
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={campaignRunning}
                        onClick={() => {
                            void runCampaignSegment('production-full');
                        }}
                    >
                        Full production campaign
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        disabled={!campaignRunning}
                        onClick={cancelCampaign}
                    >
                        Cancel campaign
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        disabled={!campaignExportReady}
                        onClick={downloadCampaignJson}
                    >
                        Export campaign JSON
                    </Button>
                </div>
            </section>

            <section className="grid gap-4 rounded-lg border p-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                    <Label htmlFor="table-count">Table count</Label>
                    <select
                        id="table-count"
                        className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                        value={tableCount}
                        disabled={campaignRunning}
                        onChange={(event) =>
                            setTableCount(
                                Number(
                                    event.target.value
                                ) as BenchmarkTableCount
                            )
                        }
                    >
                        {BENCHMARK_TABLE_COUNTS.map((count) => (
                            <option key={count} value={count}>
                                {count} tables
                            </option>
                        ))}
                    </select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="render-mode">Render mode</Label>
                    <select
                        id="render-mode"
                        className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                        value={renderMode}
                        disabled={campaignRunning}
                        onChange={(event) =>
                            setRenderMode(
                                event.target.value as LiquidGlassRenderMode
                            )
                        }
                    >
                        {RENDER_MODES.map((mode) => (
                            <option key={mode} value={mode}>
                                {mode}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="field-density">Field density</Label>
                    <select
                        id="field-density"
                        className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                        value={fieldDensity}
                        disabled={campaignRunning}
                        onChange={(event) =>
                            setFieldDensity(
                                event.target.value as BenchmarkFieldDensity
                            )
                        }
                    >
                        <option value="light">light (6 fields)</option>
                        <option value="medium">medium (10 fields)</option>
                        <option value="heavy">heavy (14 fields)</option>
                    </select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="relationship-density">Relationships</Label>
                    <select
                        id="relationship-density"
                        className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                        value={relationshipDensity}
                        disabled={campaignRunning}
                        onChange={(event) =>
                            setRelationshipDensity(
                                event.target
                                    .value as BenchmarkRelationshipDensity
                            )
                        }
                    >
                        <option value="none">none</option>
                        <option value="sparse">sparse</option>
                        <option value="dense">dense</option>
                    </select>
                </div>
                <div className="flex items-end gap-2 pb-2">
                    <input
                        id="overlap-cluster"
                        type="checkbox"
                        checked={overlapCluster}
                        disabled={campaignRunning}
                        onChange={(event) =>
                            setOverlapCluster(event.target.checked)
                        }
                    />
                    <Label htmlFor="overlap-cluster">
                        Overlap cluster (8 tables)
                    </Label>
                </div>
            </section>

            <section className="space-y-3 rounded-lg border p-4">
                <h2 className="text-lg font-medium">
                    Visual transparency demo
                </h2>
                <p className="text-sm text-muted-foreground">
                    Switch <strong>Render mode</strong> above to compare{' '}
                    <code>classic</code> (opaque shell), <code>glass-css</code>{' '}
                    (backdrop blur through the vitre layer), and{' '}
                    <code>liquid-svg</code> (same vitre + SVG displacement on
                    the layer tint only — not true background refraction).
                    Overlapping tables and bright edges should show through the
                    glass; text stays on an unfilted layer.
                </p>
                <LiquidGlassVisualDemo renderMode={renderMode} />
                <ul className="list-inside list-disc space-y-1 text-xs text-muted-foreground">
                    <li>
                        <strong>Classic:</strong> solid <code>bg-slate-50</code>{' '}
                        shell — no see-through.
                    </li>
                    <li>
                        <strong>Glass-css:</strong> frosted vitre; grid,
                        gradient, and relationship strokes visible via{' '}
                        <code>backdrop-filter</code>.
                    </li>
                    <li>
                        <strong>Liquid-svg:</strong> adds subtle ripples on the
                        vitre tint; edges behind are blurred, not optically
                        bent.
                    </li>
                </ul>
            </section>

            <section
                className="space-y-3 rounded-lg border border-dashed border-amber-600/50 p-4"
                data-visual-compare-section
            >
                <h2 className="text-lg font-medium">
                    Visual compare (M-LG.2.1)
                </h2>
                <p className="text-sm text-muted-foreground">
                    Quatre panneaux isolés — hors campagne perf et hors surface{' '}
                    <code>data-benchmark-measurement-surface</code>. Procédure
                    humaine :{' '}
                    <code>src/benchmarks/liquid-glass/VISUAL_COMPARE.md</code>.
                    Ne pas utiliser <code>?autorun=</code> pour valider G1/G2.
                </p>
                <LiquidGlassVisualCompare />
            </section>

            <section className="space-y-2">
                <h2 className="text-lg font-medium">
                    Benchmark measurement canvas
                </h2>
                <p className="text-sm text-muted-foreground">
                    Neutral React Flow background — used for FPS / long-task
                    runs. Prior benchmark JSON is not comparable if this
                    surface&apos;s node styling changes.
                </p>
            </section>

            <LiquidGlassBenchmarkCanvas
                ref={canvasRef}
                key={`${fieldDensity}-${relationshipDensity}-${overlapCluster}`}
                profile={profile}
                renderMode={renderMode}
                onResults={appendResults}
                onAggregates={mergeAggregates}
                onHarnessReady={onHarnessReady}
                campaignLocked={campaignRunning}
            />

            <section className="space-y-3 rounded-lg border p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="text-lg font-medium">Raw runs</h2>
                    <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        disabled={results.length === 0}
                        onClick={downloadJson}
                    >
                        Download JSON
                    </Button>
                </div>
                <pre className="max-h-64 overflow-auto rounded-md bg-slate-950 p-3 text-xs text-slate-100">
                    {[
                        'mode\tcount\tphase\tfields\trels\tlayout\trun\tfps\tp95\tdrops\tlong\trenders\theap_mb',
                        ...results.map(formatResultRow),
                    ].join('\n') || 'Run benchmarks to collect metrics.'}
                </pre>
            </section>

            <section className="space-y-3 rounded-lg border p-4">
                <h2 className="text-lg font-medium">Statistical aggregates</h2>
                <pre className="max-h-48 overflow-auto rounded-md bg-slate-950 p-3 text-xs text-slate-100">
                    {[
                        'mode\tcount\tphase\truns\tmedian_fps\tfps_std\tmedian_p95\tp95_std',
                        ...aggregates.map(formatAggregateRow),
                    ].join('\n') ||
                        'Run “Statistical matrix” for median / dispersion (pan×3 + zoom×2 per mode/count).'}
                </pre>
            </section>

            <section className="rounded-lg border p-4 text-sm text-muted-foreground">
                <h2 className="mb-2 text-base font-medium text-foreground">
                    Environment
                </h2>
                <ul className="list-inside list-disc space-y-1">
                    <li>{env.userAgent}</li>
                    <li>
                        Screen {env.screenWidth}×{env.screenHeight}, viewport{' '}
                        {env.viewportWidth}×{env.viewportHeight}, DPR{' '}
                        {env.devicePixelRatio}
                    </li>
                    <li>
                        Refresh estimate (rAF):{' '}
                        {env.refreshRateHz != null
                            ? `${env.refreshRateHz} Hz`
                            : 'unknown'}
                    </li>
                    <li>
                        Build: {env.isProdBuild ? 'production' : 'development'}{' '}
                        (Vite)
                    </li>
                    <li>{env.note}</li>
                </ul>
                {pageDiagnosticsSnapshot ? (
                    <p className="mt-3 font-mono text-xs">
                        Mount diagnostics: canvasReady=
                        {String(pageDiagnosticsSnapshot.canvasReady)},
                        reactFlow=
                        {String(pageDiagnosticsSnapshot.reactFlowInitialized)},
                        autorun=
                        {pageDiagnosticsSnapshot.autorunParam ?? 'none'}
                    </p>
                ) : null}
            </section>
        </div>
    );
};

export default LiquidGlassBenchmarkPage;
