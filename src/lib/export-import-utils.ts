import { cloneDiagram } from './clone';
import type { Diagram } from './domain/diagram';
import { parseDiagramJsonContent } from './import/parse-diagram-json-content';

export const DIAGRAM_JSON_SCHEMA_VERSION = 1 as const;

export type DiagramJsonSchemaVersion = typeof DIAGRAM_JSON_SCHEMA_VERSION;

export const DIAGRAM_JSON_ROOT_ID = 'diagram' as const;

export const runningIdGenerator = (): (() => string) => {
    let id = 0;
    return () => (id++).toString();
};

export const cloneDiagramWithRunningIds = (
    diagram: Diagram
): { diagram: Diagram; idsMap: Map<string, string> } => {
    const { diagram: clonedDiagram, idsMap } = cloneDiagram(diagram, {
        generateId: runningIdGenerator(),
    });

    return { diagram: clonedDiagram, idsMap };
};

export const diagramToJSONOutput = (diagram: Diagram): string => {
    return JSON.stringify(
        {
            ...diagram,
            id: DIAGRAM_JSON_ROOT_ID,
            schemaVersion: DIAGRAM_JSON_SCHEMA_VERSION,
        },
        null,
        2
    );
};

export const diagramFromJSONInput = (json: string): Diagram => {
    const parsed = parseDiagramJsonContent(json);

    if (!parsed.ok) {
        throw new Error('Invalid diagram JSON');
    }

    return parsed.diagram;
};
