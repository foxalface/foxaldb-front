import React from 'react';
import { BaseEdge, getSmoothStepPath, type EdgeProps } from '@xyflow/react';
import type { BenchmarkRelationshipEdge } from '../scenarios/generate-benchmark-scenario';

export const BenchmarkRelationshipEdgeComponent: React.FC<
    EdgeProps<BenchmarkRelationshipEdge>
> = React.memo(({ id, sourceX, sourceY, targetX, targetY, selected, data }) => {
    const visualDemo = Boolean(data?.visualDemo);
    const throughHero = Boolean(data?.throughHero);
    const [path] = getSmoothStepPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
        borderRadius: 8,
    });

    return (
        <BaseEdge
            id={id}
            path={path}
            style={{
                stroke: selected
                    ? '#db2777'
                    : visualDemo
                      ? 'rgba(255,255,255,0.85)'
                      : '#64748b',
                strokeWidth: selected
                    ? 2.5
                    : throughHero
                      ? 3
                      : visualDemo
                        ? 2.25
                        : 1.75,
            }}
        />
    );
});

BenchmarkRelationshipEdgeComponent.displayName = 'BenchmarkRelationshipEdge';
