import '@testing-library/jest-dom';
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import { createMemoryStorage } from './memory-storage';

expect.extend(matchers);

const localStorage = createMemoryStorage();
localStorage.setItem('uuid', 'test-workspace');

vi.stubGlobal('localStorage', localStorage);
vi.stubGlobal('sessionStorage', createMemoryStorage());

afterEach(() => {
    cleanup();
});
