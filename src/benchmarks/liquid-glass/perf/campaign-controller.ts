import type {
    BenchmarkCampaignProgress,
    CampaignSegmentId,
    CampaignTerminalStatus,
    ProductionCampaignPayload,
} from './campaign-types';
import {
    DEFAULT_CAMPAIGN_GLOBAL_TIMEOUT_MS,
    DEFAULT_CANVAS_INIT_TIMEOUT_MS,
    DEFAULT_CANVAS_POLL_INTERVAL_MS,
    DEFAULT_SCENARIO_TIMEOUT_MS,
} from './campaign-types';

export class CampaignAbortError extends Error {
    constructor(message = 'Campaign cancelled') {
        super(message);
        this.name = 'CampaignAbortError';
    }
}

export class CampaignTimeoutError extends Error {
    constructor(message = 'Campaign timed out') {
        super(message);
        this.name = 'CampaignTimeoutError';
    }
}

export class CanvasInitTimeoutError extends Error {
    constructor(message = 'Canvas ref not available before timeout') {
        super(message);
        this.name = 'CanvasInitTimeoutError';
    }
}

export interface CampaignControllerOptions {
    globalTimeoutMs?: number;
    canvasInitTimeoutMs?: number;
    canvasPollIntervalMs?: number;
}

export class BenchmarkCampaignController {
    private abortController: AbortController | null = null;

    private globalTimeoutId: ReturnType<typeof setTimeout> | null = null;

    private status: CampaignTerminalStatus = 'idle';

    private partialResults: ProductionCampaignPayload['partialResults'] = [];

    private partialAggregates: ProductionCampaignPayload['partialAggregates'] =
        [];

    private readonly globalTimeoutMs: number;

    constructor(options: CampaignControllerOptions = {}) {
        this.globalTimeoutMs =
            options.globalTimeoutMs ?? DEFAULT_CAMPAIGN_GLOBAL_TIMEOUT_MS;
    }

    getCanvasInitTimeoutMs(): number {
        return DEFAULT_CANVAS_INIT_TIMEOUT_MS;
    }

    getSignal(): AbortSignal | undefined {
        return this.abortController?.signal;
    }

    getStatus(): CampaignTerminalStatus {
        return this.status;
    }

    isRunning(): boolean {
        return this.status === 'running';
    }

    getPartialResults(): ProductionCampaignPayload['partialResults'] {
        return [...this.partialResults];
    }

    getPartialAggregates(): ProductionCampaignPayload['partialAggregates'] {
        return [...this.partialAggregates];
    }

    appendResults(results: ProductionCampaignPayload['partialResults']): void {
        this.partialResults = [...this.partialResults, ...results];
    }

    appendAggregates(
        aggregates: ProductionCampaignPayload['partialAggregates']
    ): void {
        this.partialAggregates = [...this.partialAggregates, ...aggregates];
    }

    cancel(): void {
        if (this.status !== 'running') {
            return;
        }
        this.abortController?.abort();
        this.finalize('cancelled', 'Campaign cancelled by user');
    }

    updateProgress(
        patch: Partial<
            Omit<BenchmarkCampaignProgress, 'status' | 'updatedAt'>
        > & { status?: CampaignTerminalStatus }
    ): void {
        const previous = window.__foxaldbBenchmarkCampaignProgress;
        const status = patch.status ?? previous?.status ?? this.status;
        window.__foxaldbBenchmarkCampaignProgress = {
            status,
            currentStep: patch.currentStep ?? previous?.currentStep ?? 0,
            totalSteps: patch.totalSteps ?? previous?.totalSteps ?? 0,
            currentMode: patch.currentMode ?? previous?.currentMode ?? null,
            currentScenario:
                patch.currentScenario ?? previous?.currentScenario ?? null,
            completedRuns: patch.completedRuns ?? previous?.completedRuns ?? 0,
            totalRuns: patch.totalRuns ?? previous?.totalRuns ?? 0,
            segment: patch.segment ?? previous?.segment ?? null,
            message: patch.message ?? previous?.message ?? null,
            updatedAt: new Date().toISOString(),
        };
    }

    begin(segment: CampaignSegmentId, totalSteps: number): void {
        if (this.status === 'running') {
            throw new Error('Campaign already running');
        }
        this.cleanupTimers();
        this.abortController = new AbortController();
        this.status = 'running';
        this.partialResults = [];
        this.partialAggregates = [];
        window.__foxaldbBenchmarkCampaignComplete = false;
        window.__foxaldbBenchmarkCampaignError = undefined;

        this.globalTimeoutId = setTimeout(() => {
            this.abortController?.abort();
            this.finalize(
                'timed_out',
                `Global campaign timeout (${this.globalTimeoutMs}ms)`
            );
        }, this.globalTimeoutMs);

        window.__foxaldbBenchmarkCancelCampaign = () => {
            this.cancel();
        };

        this.updateProgress({
            status: 'running',
            segment,
            currentStep: 0,
            totalSteps,
            completedRuns: 0,
            totalRuns: totalSteps,
            currentMode: null,
            currentScenario: null,
            message: `Starting ${segment}`,
        });
    }

    assertNotAborted(): void {
        if (this.status !== 'running') {
            throw new CampaignAbortError(
                this.status === 'cancelled'
                    ? 'Campaign cancelled'
                    : 'Campaign not running'
            );
        }
        const signal = this.abortController?.signal;
        if (signal?.aborted) {
            if (this.status === 'running') {
                this.finalize('cancelled', 'Campaign aborted');
            }
            throw new CampaignAbortError();
        }
    }

    finalize(
        terminalStatus: Exclude<CampaignTerminalStatus, 'idle' | 'running'>,
        errorMessage?: string
    ): void {
        this.cleanupTimers();
        this.status = terminalStatus;
        this.abortController = null;

        if (errorMessage) {
            window.__foxaldbBenchmarkCampaignError = errorMessage;
        }

        if (terminalStatus === 'completed') {
            window.__foxaldbBenchmarkCampaignComplete = true;
        } else {
            window.__foxaldbBenchmarkCampaignComplete = false;
        }

        this.updateProgress({
            status: terminalStatus,
            message: errorMessage ?? terminalStatus,
        });
    }

    buildPayload(
        segment: CampaignSegmentId,
        extra?: Partial<
            Omit<
                ProductionCampaignPayload,
                | 'recordedAt'
                | 'buildMode'
                | 'segment'
                | 'status'
                | 'partialResults'
                | 'partialAggregates'
            >
        >
    ): ProductionCampaignPayload {
        return {
            recordedAt: new Date().toISOString(),
            buildMode: import.meta.env.PROD ? 'production' : 'development',
            segment,
            status: this.status === 'idle' ? 'failed' : this.status,
            partialResults: this.getPartialResults(),
            partialAggregates: this.getPartialAggregates(),
            ...extra,
        };
    }

    cleanupTimers(): void {
        if (this.globalTimeoutId !== null) {
            clearTimeout(this.globalTimeoutId);
            this.globalTimeoutId = null;
        }
    }

    dispose(): void {
        this.cleanupTimers();
        this.abortController?.abort();
        this.abortController = null;
        if (window.__foxaldbBenchmarkCancelCampaign) {
            window.__foxaldbBenchmarkCancelCampaign = undefined;
        }
    }
}

export async function waitForCanvasHandle<T>(
    getHandle: () => T | null,
    options: {
        timeoutMs?: number;
        pollIntervalMs?: number;
        abortSignal?: AbortSignal;
    } = {}
): Promise<T> {
    const timeoutMs = options.timeoutMs ?? DEFAULT_CANVAS_INIT_TIMEOUT_MS;
    const pollIntervalMs =
        options.pollIntervalMs ?? DEFAULT_CANVAS_POLL_INTERVAL_MS;
    const start = performance.now();

    while (performance.now() - start < timeoutMs) {
        if (options.abortSignal?.aborted) {
            throw new CampaignAbortError();
        }
        const handle = getHandle();
        if (handle) {
            return handle;
        }
        await new Promise((resolve) => {
            window.setTimeout(resolve, pollIntervalMs);
        });
    }

    throw new CanvasInitTimeoutError();
}

export async function runWithScenarioTimeout<T>(
    promise: Promise<T>,
    options: {
        timeoutMs?: number;
        label?: string;
        abortSignal?: AbortSignal;
    } = {}
): Promise<T> {
    const timeoutMs = options.timeoutMs ?? DEFAULT_SCENARIO_TIMEOUT_MS;
    const label = options.label ?? 'scenario';

    return new Promise<T>((resolve, reject) => {
        const timeoutId = setTimeout(() => {
            reject(
                new CampaignTimeoutError(
                    `${label} timed out after ${timeoutMs}ms`
                )
            );
        }, timeoutMs);

        const onAbort = (): void => {
            clearTimeout(timeoutId);
            reject(new CampaignAbortError());
        };

        if (options.abortSignal?.aborted) {
            onAbort();
            return;
        }

        options.abortSignal?.addEventListener('abort', onAbort, { once: true });

        promise
            .then((value) => {
                clearTimeout(timeoutId);
                options.abortSignal?.removeEventListener('abort', onAbort);
                resolve(value);
            })
            .catch((error: unknown) => {
                clearTimeout(timeoutId);
                options.abortSignal?.removeEventListener('abort', onAbort);
                reject(error);
            });
    });
}
