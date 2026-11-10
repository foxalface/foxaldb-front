export type AcceptTermsSegment =
    | { kind: 'text'; text: string }
    | { kind: 'terms' | 'privacy'; text: string };

export const parseAcceptTermsTemplate = (
    template: string
): AcceptTermsSegment[] => {
    const pattern = /<(terms|privacy)>([\s\S]*?)<\/\1>/g;
    const segments: AcceptTermsSegment[] = [];
    let cursor = 0;

    for (const match of template.matchAll(pattern)) {
        const index = match.index ?? 0;
        if (index > cursor) {
            segments.push({
                kind: 'text',
                text: template.slice(cursor, index),
            });
        }

        const tag = match[1];
        if (tag === 'terms' || tag === 'privacy') {
            segments.push({ kind: tag, text: match[2] ?? '' });
        }
        cursor = index + match[0].length;
    }

    if (cursor < template.length) {
        segments.push({ kind: 'text', text: template.slice(cursor) });
    }

    return segments;
};
