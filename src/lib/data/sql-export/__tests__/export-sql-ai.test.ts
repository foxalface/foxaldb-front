import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DatabaseType } from '@/lib/domain/database-type';
import type { Diagram } from '@/lib/domain/diagram';
import type { DBTable } from '@/lib/domain/db-table';
import type { DBField } from '@/lib/domain/db-field';

const generateTextMock = vi.fn();
const streamTextMock = vi.fn();
const createOpenAIMock = vi.fn();

vi.mock('ai', () => ({
    generateText: (...args: unknown[]) => generateTextMock(...args),
    streamText: (...args: unknown[]) => streamTextMock(...args),
}));

vi.mock('@ai-sdk/openai', () => ({
    createOpenAI: (...args: unknown[]) => createOpenAIMock(...args),
}));

vi.mock('@/lib/env', () => ({
    OPENAI_API_KEY: 'test-openai-key',
    OPENAI_API_ENDPOINT: '',
    LLM_MODEL_NAME: '',
}));

vi.mock('../export-sql-cache', () => ({
    generateCacheKey: vi.fn(async () => 'test-cache-key'),
    getFromCache: vi.fn(() => null),
    setInCache: vi.fn(),
}));

import { exportSQL } from '../export-sql-script';
import { setInCache } from '../export-sql-cache';

describe('exportSQL AI SDK integration', () => {
    let idCounter = 0;
    const testId = () => `ai-test-id-${++idCounter}`;
    const testTime = Date.now();

    const createField = (overrides: Partial<DBField>): DBField =>
        ({
            id: testId(),
            name: 'id',
            type: { id: 'int', name: 'int' },
            primaryKey: true,
            nullable: false,
            unique: false,
            createdAt: testTime,
            ...overrides,
        }) as DBField;

    const createTable = (overrides: Partial<DBTable>): DBTable =>
        ({
            id: testId(),
            name: 'users',
            fields: [createField({})],
            indexes: [],
            createdAt: testTime,
            x: 0,
            y: 0,
            width: 200,
            ...overrides,
        }) as DBTable;

    const createDiagram = (overrides: Partial<Diagram>): Diagram =>
        ({
            id: testId(),
            name: 'diagram',
            databaseType: DatabaseType.GENERIC,
            tables: [createTable({})],
            relationships: [],
            createdAt: testTime,
            updatedAt: testTime,
            ...overrides,
        }) as Diagram;

    beforeEach(() => {
        vi.clearAllMocks();
        createOpenAIMock.mockReturnValue((modelName: string) => ({
            provider: 'openai',
            modelId: modelName,
        }));
    });

    it('skips LLM when source and target database types match', async () => {
        const diagram = createDiagram({
            databaseType: DatabaseType.MYSQL,
        });

        const result = await exportSQL(diagram, DatabaseType.MYSQL);

        expect(generateTextMock).not.toHaveBeenCalled();
        expect(streamTextMock).not.toHaveBeenCalled();
        expect(result).toContain('CREATE TABLE');
    });

    it('calls generateText for cross-dialect export without streaming', async () => {
        generateTextMock.mockResolvedValue({
            text: 'SELECT 1; -- converted',
        });

        const diagram = createDiagram();

        const result = await exportSQL(diagram, DatabaseType.MYSQL);

        expect(createOpenAIMock).toHaveBeenCalledWith({
            apiKey: 'test-openai-key',
        });
        expect(generateTextMock).toHaveBeenCalledTimes(1);
        expect(generateTextMock.mock.calls[0]?.[0]).toMatchObject({
            prompt: expect.stringContaining('MySQL'),
        });
        expect(result).toBe('SELECT 1; -- converted');
        expect(setInCache).toHaveBeenCalledWith(
            'test-cache-key',
            'SELECT 1; -- converted'
        );
    });

    it('streams partial output and returns final text when stream option is set', async () => {
        async function* textStream() {
            yield 'CREATE ';
            yield 'TABLE t;';
        }

        streamTextMock.mockResolvedValue({
            textStream: textStream(),
            text: Promise.resolve('CREATE TABLE t;'),
        });

        const onResultStream = vi.fn();
        const diagram = createDiagram();

        const result = await exportSQL(diagram, DatabaseType.POSTGRESQL, {
            stream: true,
            onResultStream,
        });

        expect(streamTextMock).toHaveBeenCalledTimes(1);
        expect(onResultStream).toHaveBeenCalledWith('CREATE ');
        expect(onResultStream).toHaveBeenCalledWith('TABLE t;');
        expect(result).toBe('CREATE TABLE t;');
    });
});
