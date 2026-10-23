const TRAILING_COPY_INDEX = /^(.*) \((\d+)\)$/;

/** Diagram name without a trailing " (N)" copy index. */
export const diagramCopyBaseName = (name: string): string => {
    const match = TRAILING_COPY_INDEX.exec(name);

    if (!match || match[1].length === 0) {
        return name;
    }

    return match[1];
};

/**
 * Next copy title: "Main" → "Main (1)", then "Main (2)".
 * Existing "Main (1)" is part of the same sequence even when the source is "Main".
 */
export const nextDiagramCopyName = (
    sourceName: string,
    existingNames: readonly string[]
): string => {
    const base = diagramCopyBaseName(sourceName);
    const numbered = new RegExp(
        `^${base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} \\((\\d+)\\)$`
    );
    let maxIndex = 0;

    for (const name of existingNames) {
        const match = numbered.exec(name);

        if (!match) {
            continue;
        }

        const index = Number(match[1]);

        if (Number.isInteger(index) && index > maxIndex) {
            maxIndex = index;
        }
    }

    return `${base} (${maxIndex + 1})`;
};
