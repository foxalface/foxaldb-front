import React from 'react';
import { ViewportPortal } from '@xyflow/react';
import { useRemoteCursors } from '@/hooks/use-remote-cursors';
import { RemoteCursor } from './remote-cursor';

export const CursorOverlay: React.FC = () => {
    const { isOverlayActive, remoteCursors } = useRemoteCursors();

    if (!isOverlayActive || remoteCursors.length === 0) {
        return null;
    }

    return (
        <ViewportPortal>
            <div className="pointer-events-none absolute inset-0 overflow-visible">
                {remoteCursors.map((cursor) => (
                    <RemoteCursor
                        key={cursor.userId}
                        userId={cursor.userId}
                        targetX={cursor.x}
                        targetY={cursor.y}
                        name={cursor.name}
                        colorClass={cursor.colorClass}
                        textColorClass={cursor.textColorClass}
                    />
                ))}
            </div>
        </ViewportPortal>
    );
};
