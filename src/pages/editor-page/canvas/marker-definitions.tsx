import React from 'react';
import { cn } from '@/lib/utils';
import type { Cardinality } from '@/lib/domain/db-relationship';
import { useLocalConfig } from '@/hooks/use-local-config';
import { getCardinalityMarkerId } from './canvas-utils';
import type { MergeChangeVisual } from '@/lib/schema-merge/preview/preview-types';
import { getMergePreviewCardinalityMarkerClasses } from '@/lib/schema-merge/preview/merge-preview-visual';

export const MarkerDefinitions: React.FC = () => {
    const { showCardinality } = useLocalConfig();
    const cardinalityOptions: Record<Cardinality, string> = {
        one: '1',
        many: 'N',
    };

    const sideOptions: ('left' | 'right')[] = ['left', 'right'];
    const selectionOptions: boolean[] = [true, false];
    const mergePreviewChanges: MergeChangeVisual[] = [
        'add',
        'modify',
        'rename',
        'delete',
    ];

    if (!showCardinality) {
        return null;
    }

    return (
        <svg className="marker-definitions absolute left-0 top-0 z-0 size-0">
            <defs>
                {Object.entries(cardinalityOptions).map(([cardinality, text]) =>
                    sideOptions.map((side) =>
                        selectionOptions.map((selected) => (
                            <marker
                                key={getCardinalityMarkerId({
                                    cardinality: cardinality as Cardinality,
                                    selected,
                                    side,
                                })}
                                id={getCardinalityMarkerId({
                                    cardinality: cardinality as Cardinality,
                                    selected,
                                    side,
                                })}
                                viewBox="0 0 16 16"
                                markerWidth="16"
                                markerHeight="16"
                                refX={side === 'left' ? '15' : '1'}
                                refY="8"
                            >
                                <circle
                                    cx="8"
                                    cy="8"
                                    r="5"
                                    className={cn([
                                        selected
                                            ? 'fill-pink-600'
                                            : 'fill-muted-foreground',
                                        'stroke-background',
                                        'stroke-[0.5]',
                                    ])}
                                />
                                <text
                                    x="7.9"
                                    y="8.4"
                                    fontSize="6"
                                    fontWeight="600"
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                    className="fill-muted"
                                >
                                    {text}
                                </text>
                            </marker>
                        ))
                    )
                )}
                {mergePreviewChanges.flatMap((change) =>
                    Object.entries(cardinalityOptions).flatMap(
                        ([cardinality, text]) =>
                            sideOptions.map((side) => {
                                const markerClasses =
                                    getMergePreviewCardinalityMarkerClasses(
                                        change
                                    );
                                const markerId = getCardinalityMarkerId({
                                    cardinality: cardinality as Cardinality,
                                    selected: false,
                                    side,
                                    mergePreviewChange: change,
                                });

                                return (
                                    <marker
                                        key={markerId}
                                        id={markerId}
                                        viewBox="0 0 16 16"
                                        markerWidth="16"
                                        markerHeight="16"
                                        refX={side === 'left' ? '15' : '1'}
                                        refY="8"
                                    >
                                        <circle
                                            cx="8"
                                            cy="8"
                                            r="5"
                                            className={cn(markerClasses.circle)}
                                        />
                                        <text
                                            x="7.9"
                                            y="8.4"
                                            fontSize="6"
                                            fontWeight="600"
                                            textAnchor="middle"
                                            dominantBaseline="middle"
                                            className={markerClasses.text}
                                        >
                                            {text}
                                        </text>
                                    </marker>
                                );
                            })
                    )
                )}
            </defs>
        </svg>
    );
};
