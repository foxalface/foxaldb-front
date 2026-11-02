import type { BenchmarkTableCount } from '../scenarios/generate-benchmark-nodes';
import type { LiquidGlassRenderMode } from '../types';
import type { LiquidGlassBenchmarkCanvasHandle } from './campaign-types';
import type { BenchmarkCampaignController } from './campaign-controller';
import { runProductionFullSegment } from './campaign-segments';

/** @deprecated Prefer runProductionFullSegment with BenchmarkCampaignController */
export async function runProductionMeasurementCampaign(options: {
    handle: LiquidGlassBenchmarkCanvasHandle;
    setRenderMode: (mode: LiquidGlassRenderMode) => void;
    setTableCount: (count: BenchmarkTableCount) => void;
    controller: BenchmarkCampaignController;
    settleMs?: number;
}): Promise<void> {
    await runProductionFullSegment({
        handle: options.handle,
        controller: options.controller,
        setRenderMode: options.setRenderMode,
        setTableCount: options.setTableCount,
        settleMs: options.settleMs,
    });
}
