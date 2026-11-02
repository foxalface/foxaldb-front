import type { BenchmarkRunResult, StatisticalAggregate } from '../types';

export type CampaignTerminalStatus =
    | 'idle'
    | 'running'
    | 'completed'
    | 'failed'
    | 'cancelled'
    | 'timed_out';

export type CampaignSegmentId =
    | 'statistical-matrix'
    | 'full-suite-all-modes'
    | 'anomaly-pan-probe'
    | 'production-full';

export interface LiquidGlassBenchmarkCanvasHandle {
    runPanOnly: () => Promise<BenchmarkRunResult>;
    runFullSuite: () => Promise<BenchmarkRunResult[]>;
    runStatisticalMatrix: () => Promise<{
        results: BenchmarkRunResult[];
        aggregates: StatisticalAggregate[];
    }>;
}

export interface BenchmarkCampaignProgress {
    status: CampaignTerminalStatus;
    currentStep: number;
    totalSteps: number;
    currentMode: string | null;
    currentScenario: string | null;
    completedRuns: number;
    totalRuns: number;
    segment: CampaignSegmentId | null;
    message: string | null;
    updatedAt: string;
}

export interface ProductionCampaignPayload {
    recordedAt: string;
    buildMode: 'production' | 'development';
    segment: CampaignSegmentId;
    status: CampaignTerminalStatus;
    partialResults: BenchmarkRunResult[];
    partialAggregates: StatisticalAggregate[];
    statisticalMatrix?: {
        results: BenchmarkRunResult[];
        aggregates: StatisticalAggregate[];
    };
    fullSuites20Tables?: BenchmarkRunResult[];
    anomalyPan20Tables?: {
        results: BenchmarkRunResult[];
        aggregates: StatisticalAggregate[];
    };
}

export interface BenchmarkPageDiagnostics {
    pageMountedAt: string;
    route: string;
    buildMode: 'production' | 'development';
    searchParams: string;
    autorunParam: string | null;
    autorunValid: boolean;
    canvasReady: boolean;
    canvasReadyAt: string | null;
    reactFlowInitialized: boolean;
    bootstrapComplete: boolean;
}

declare global {
    interface Window {
        __foxaldbBenchmarkCampaign?: ProductionCampaignPayload;
        /** @deprecated use __foxaldbBenchmarkCampaignProgress.status === 'completed' */
        __foxaldbBenchmarkCampaignComplete?: boolean;
        __foxaldbBenchmarkCampaignError?: string;
        __foxaldbBenchmarkCampaignProgress?: BenchmarkCampaignProgress;
        __foxaldbBenchmarkPageDiagnostics?: BenchmarkPageDiagnostics;
        __foxaldbBenchmarkCancelCampaign?: () => void;
    }
}

export const CAMPAIGN_QUERY_PARAM = 'autorun';
export const CAMPAIGN_QUERY_VALUE = 'production-campaign';

export const DEFAULT_CANVAS_INIT_TIMEOUT_MS = 15_000;
export const DEFAULT_CAMPAIGN_GLOBAL_TIMEOUT_MS = 20 * 60 * 1000;
export const DEFAULT_SCENARIO_TIMEOUT_MS = 15 * 60 * 1000;
export const DEFAULT_CANVAS_POLL_INTERVAL_MS = 100;
