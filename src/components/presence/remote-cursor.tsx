import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import {
    CURSOR_INTERPOLATION_FACTOR,
    hasReachedTarget,
    interpolatePosition,
} from '@/lib/realtime/cursor-utils';

export interface RemoteCursorProps {
    userId: number;
    targetX: number;
    targetY: number;
    name: string;
    colorClass: string;
    textColorClass: string;
}

export const RemoteCursor: React.FC<RemoteCursorProps> = ({
    userId,
    targetX,
    targetY,
    name,
    colorClass,
    textColorClass,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const displayRef = useRef({ x: targetX, y: targetY });
    const targetRef = useRef({ x: targetX, y: targetY });
    const initializedRef = useRef(false);

    useEffect(() => {
        targetRef.current = { x: targetX, y: targetY };

        if (!initializedRef.current) {
            displayRef.current = { x: targetX, y: targetY };
            initializedRef.current = true;

            const element = containerRef.current;
            if (element !== null) {
                element.style.transform = `translate(${targetX}px, ${targetY}px)`;
            }
        }
    }, [targetX, targetY]);

    useEffect(() => {
        let animationFrameId: number;

        const tick = (): void => {
            const target = targetRef.current;
            const display = displayRef.current;

            if (!hasReachedTarget(display, target)) {
                const next = interpolatePosition(
                    display,
                    target,
                    CURSOR_INTERPOLATION_FACTOR
                );
                display.x = next.x;
                display.y = next.y;
            } else {
                display.x = target.x;
                display.y = target.y;
            }

            const element = containerRef.current;
            if (element !== null) {
                element.style.transform = `translate(${display.x}px, ${display.y}px)`;
            }

            animationFrameId = requestAnimationFrame(tick);
        };

        animationFrameId = requestAnimationFrame(tick);

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [userId]);

    return (
        <div
            ref={containerRef}
            className="pointer-events-none absolute left-0 top-0 will-change-transform"
            style={{ zIndex: 1000 }}
            data-remote-cursor-user-id={userId}
        >
            <svg
                width="16"
                height="20"
                viewBox="0 0 16 20"
                className={cn('drop-shadow-sm', textColorClass)}
                aria-hidden
            >
                <path
                    d="M1 1L1 15.5L5.25 11.75L8.5 18.5L10.5 17.5L7.25 10.75L12.5 10.75L1 1Z"
                    fill="currentColor"
                    stroke="white"
                    strokeWidth="1.25"
                    strokeLinejoin="round"
                />
            </svg>
            <span
                className={cn(
                    'ml-3 -mt-4 inline-block max-w-[160px] truncate rounded px-1.5 py-0.5 text-[11px] font-medium leading-tight text-white shadow-sm',
                    colorClass
                )}
            >
                {name}
            </span>
        </div>
    );
};
