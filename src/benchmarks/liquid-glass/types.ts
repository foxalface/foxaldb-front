export type LiquidGlassRenderMode = 'classic' | 'glass-css' | 'liquid-svg';

/** Visual compare panels (M-LG.2.1) — not used by performance campaign runners. */
export type VisualComparePanelId =
    | 'glass-css'
    | 'liquid-svg'
    | 'backdrop-chromium'
    | 'clone-sync-one-table';

export const VISUAL_COMPARE_PANEL_IDS: VisualComparePanelId[] = [
    'glass-css',
    'liquid-svg',
    'backdrop-chromium',
    'clone-sync-one-table',
];

export interface VisualComparePanelMeta {
    id: VisualComparePanelId;
    title: string;
    subtitle: string;
}

export type BenchmarkFieldDensity = 'light' | 'medium' | 'heavy';

export type BenchmarkRelationshipDensity = 'none' | 'sparse' | 'dense';

export type BenchmarkInteractionPhase =
    | 'idle'
    | 'pan'
    | 'zoom'
    | 'drag'
    | 'overlap'
    | 'modal';

export interface BenchmarkScenarioConfig {
    tableCount: 20 | 100 | 200 | 300;
    mode: LiquidGlassRenderMode;
    phase: BenchmarkInteractionPhase;
    durationMs: number;
    fieldDensity: BenchmarkFieldDensity;
    relationshipDensity: BenchmarkRelationshipDensity;
    overlapCluster: boolean;
    warmupMs: number;
    runIndex: number;
    buildMode: 'development' | 'production';
}

export interface FrameMetricsSample {
    frameTimeMs: number;
    timestamp: number;
}

export interface FrameMetricsSummary {
    sampleCount: number;
    durationMs: number;
    fpsAverage: number;
    frameTimeMsAverage: number;
    frameTimeMsP50: number;
    frameTimeMsP95: number;
    frameTimeMsMax: number;
    droppedFramesEstimate: number;
}

export interface LongTaskSummary {
    count: number;
    totalDurationMs: number;
    maxDurationMs: number;
}

export interface MemoryMetricsSnapshot {
    supported: boolean;
    usedJsHeapSizeMb: number | null;
    totalJsHeapSizeMb: number | null;
    jsHeapSizeLimitMb: number | null;
}

export interface ReactRenderSummary {
    benchmarkNodeRenderCount: number;
    profilerCommitCount: number;
    profilerActualDurationMsTotal: number;
}

export interface BenchmarkRunResult {
    scenario: BenchmarkScenarioConfig;
    frameMetrics: FrameMetricsSummary;
    longTasks: LongTaskSummary;
    memoryBefore: MemoryMetricsSnapshot;
    memoryAfter: MemoryMetricsSnapshot;
    reactRenders: ReactRenderSummary;
    userAgent: string;
    recordedAt: string;
}

export interface BenchmarkEnvironmentInfo {
    userAgent: string;
    platform: string;
    devicePixelRatio: number;
    hardwareConcurrency: number;
    screenWidth: number;
    screenHeight: number;
    viewportWidth: number;
    viewportHeight: number;
    refreshRateHz?: number | null;
    isDev: boolean;
    isProdBuild: boolean;
    note: string;
}

export interface StatisticalAggregate {
    key: string;
    runCount: number;
    medianFps: number;
    fpsStdDev: number;
    medianP95FrameMs: number;
    p95FrameMsStdDev: number;
    medianLongTasks: number;
    sample: BenchmarkScenarioConfig | undefined;
}

export interface BenchmarkScenarioProfile {
    tableCount: BenchmarkScenarioConfig['tableCount'];
    fieldDensity: BenchmarkFieldDensity;
    relationshipDensity: BenchmarkRelationshipDensity;
    overlapCluster: boolean;
}
