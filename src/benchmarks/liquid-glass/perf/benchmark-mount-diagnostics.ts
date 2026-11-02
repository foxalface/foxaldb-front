import type { BenchmarkPageDiagnostics } from './campaign-types';
import { CAMPAIGN_QUERY_PARAM, CAMPAIGN_QUERY_VALUE } from './campaign-types';

export function parseAutorunQueryValue(searchParams: URLSearchParams): {
    raw: string | null;
    valid: boolean;
    recognized: boolean;
} {
    const raw = searchParams.get(CAMPAIGN_QUERY_PARAM);
    if (raw === null) {
        return { raw: null, valid: false, recognized: false };
    }
    if (raw === CAMPAIGN_QUERY_VALUE) {
        return { raw, valid: true, recognized: true };
    }
    return { raw, valid: false, recognized: true };
}

export function createInitialPageDiagnostics(
    searchParams: URLSearchParams
): BenchmarkPageDiagnostics {
    const autorun = parseAutorunQueryValue(searchParams);
    return {
        pageMountedAt: new Date().toISOString(),
        route: window.location.pathname,
        buildMode: import.meta.env.PROD ? 'production' : 'development',
        searchParams: searchParams.toString(),
        autorunParam: autorun.raw,
        autorunValid: autorun.valid,
        canvasReady: false,
        canvasReadyAt: null,
        reactFlowInitialized: false,
        bootstrapComplete: true,
    };
}

export function publishPageDiagnostics(
    patch: Partial<BenchmarkPageDiagnostics>
): BenchmarkPageDiagnostics {
    const current = window.__foxaldbBenchmarkPageDiagnostics;
    const next: BenchmarkPageDiagnostics = {
        ...(current ?? createInitialPageDiagnostics(new URLSearchParams())),
        ...patch,
    };
    window.__foxaldbBenchmarkPageDiagnostics = next;
    return next;
}
