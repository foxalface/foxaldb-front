import React, {
    useCallback,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from 'react';
import { Check, Pencil } from 'lucide-react';
import { Input } from '@/components/input/input';
import { useChartDB } from '@/hooks/use-chartdb';
import { useKeyPressEvent } from 'react-use';
import { DiagramIcon } from '@/components/diagram-icon/diagram-icon';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/tooltip/tooltip';
import { useDialog } from '@/hooks/use-dialog';

const MIN_TITLE_WIDTH_PX = 32;
const MAX_TITLE_WIDTH_PX = 220;

export interface DiagramNameProps {}

export const DiagramName: React.FC<DiagramNameProps> = () => {
    const { diagramName, updateDiagramName, currentDiagram } = useChartDB();

    const { t } = useTranslation();
    const [editMode, setEditMode] = useState(false);
    const [editedDiagramName, setEditedDiagramName] = useState(diagramName);
    const [fieldWidth, setFieldWidth] = useState(MIN_TITLE_WIDTH_PX);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const measureRef = useRef<HTMLSpanElement>(null);
    const { openOpenDiagramDialog } = useDialog();

    const textToMeasure = editMode ? editedDiagramName : diagramName;

    useEffect(() => {
        setEditedDiagramName(diagramName);
    }, [diagramName]);

    useLayoutEffect(() => {
        const measuredWidth =
            measureRef.current?.offsetWidth ?? MIN_TITLE_WIDTH_PX;

        setFieldWidth(
            Math.min(
                Math.max(Math.ceil(measuredWidth), MIN_TITLE_WIDTH_PX),
                MAX_TITLE_WIDTH_PX
            )
        );
    }, [textToMeasure, editMode]);

    const saveDiagramName = useCallback(() => {
        if (!editMode) {
            return;
        }

        if (editedDiagramName.trim()) {
            updateDiagramName(editedDiagramName.trim());
        }

        setEditMode(false);
    }, [editMode, editedDiagramName, updateDiagramName]);

    const abortEdit = useCallback(() => {
        setEditedDiagramName(diagramName);
        setEditMode(false);
    }, [diagramName]);

    useEffect(() => {
        if (!editMode) {
            return;
        }

        const handlePointerDown = (event: MouseEvent | TouchEvent) => {
            const target = event.target;
            if (!(target instanceof Node)) {
                return;
            }

            if (containerRef.current?.contains(target)) {
                return;
            }

            saveDiagramName();
        };

        document.addEventListener('mousedown', handlePointerDown, true);
        document.addEventListener('touchstart', handlePointerDown, true);

        return () => {
            document.removeEventListener('mousedown', handlePointerDown, true);
            document.removeEventListener('touchstart', handlePointerDown, true);
        };
    }, [editMode, saveDiagramName]);

    useKeyPressEvent('Enter', () => {
        if (editMode) {
            saveDiagramName();
        }
    });

    useKeyPressEvent('Escape', () => {
        if (editMode) {
            abortEdit();
        }
    });

    useEffect(() => {
        if (!editMode) {
            return;
        }

        const timeoutId = setTimeout(() => {
            inputRef.current?.focus();
            inputRef.current?.select();
        }, 0);

        return () => clearTimeout(timeoutId);
    }, [editMode]);

    const enterEditMode = useCallback(
        (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
            event.stopPropagation();
            setEditedDiagramName(diagramName);
            setEditMode(true);
        },
        [diagramName]
    );

    return (
        <div
            ref={containerRef}
            className={cn(
                'group flex max-w-[min(90vw,28rem)] items-center gap-2 rounded-full border bg-secondary px-3 py-1.5 text-sm text-foreground shadow-none transition-colors',
                'hover:border-border',
                editMode && 'border-border'
            )}
        >
            <span
                ref={measureRef}
                aria-hidden
                className={cn(
                    'pointer-events-none invisible absolute whitespace-pre text-sm font-medium',
                    editMode && 'px-2.5'
                )}
            >
                {textToMeasure || '\u00A0'}
            </span>

            <DiagramIcon
                databaseType={currentDiagram.databaseType}
                databaseEdition={currentDiagram.databaseEdition}
                tooltipSide="bottom"
                onClick={(e) => {
                    e.stopPropagation();
                    openOpenDiagramDialog({ canClose: true });
                }}
            />

            <div className="flex min-w-0 items-center gap-1">
                <div
                    className="relative shrink-0"
                    style={{ width: fieldWidth }}
                >
                    {editMode ? (
                        <Input
                            ref={inputRef}
                            autoFocus
                            type="text"
                            placeholder={diagramName}
                            value={editedDiagramName}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) =>
                                setEditedDiagramName(e.target.value)
                            }
                            onBlur={() => {
                                saveDiagramName();
                            }}
                            className="h-6 w-full rounded-full border-border bg-secondary px-2.5 text-sm focus-visible:ring-0"
                        />
                    ) : (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <h1
                                    className="w-full truncate text-sm font-medium"
                                    onDoubleClick={(e) => {
                                        enterEditMode(e);
                                    }}
                                >
                                    {diagramName}
                                </h1>
                            </TooltipTrigger>
                            <TooltipContent
                                side="bottom"
                                sideOffset={8}
                                className="z-[1100]"
                            >
                                {t('tool_tips.double_click_to_edit')}
                            </TooltipContent>
                        </Tooltip>
                    )}
                </div>

                {editMode ? (
                    <button
                        type="button"
                        className="inline-flex size-6 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={(event) => {
                            event.stopPropagation();
                            saveDiagramName();
                        }}
                    >
                        <Check className="size-3.5" />
                    </button>
                ) : (
                    <button
                        type="button"
                        className="inline-flex size-6 shrink-0 items-center justify-center rounded-full text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
                        onClick={enterEditMode}
                    >
                        <Pencil className="size-3.5" strokeWidth={1.5} />
                    </button>
                )}
            </div>
        </div>
    );
};
