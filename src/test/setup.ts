import '@testing-library/jest-dom';
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import { MotionGlobalConfig } from 'framer-motion';
import { createMemoryStorage } from './memory-storage';

expect.extend(matchers);

// happy-dom teardown can abort in-flight Motion animations (AbortError).
MotionGlobalConfig.skipAnimations = true;

// Stub browser storage globally for Vitest (happy-dom + Node 22+ localStorage quirk).
// Do not add per-test-file localStorage mocks — extend this setup instead.
const localStorage = createMemoryStorage();
// Stable workspace id so generateDiagramId() output is deterministic in tests.
localStorage.setItem('uuid', 'test-workspace');

vi.stubGlobal('localStorage', localStorage);
vi.stubGlobal('sessionStorage', createMemoryStorage());

afterEach(() => {
    cleanup();
});
