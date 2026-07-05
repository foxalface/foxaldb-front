export const PRESENCE_COLOR_CLASSES = [
    'bg-red-500',
    'bg-orange-500',
    'bg-amber-500',
    'bg-green-500',
    'bg-teal-500',
    'bg-cyan-500',
    'bg-blue-500',
    'bg-indigo-500',
    'bg-violet-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-rose-500',
] as const;

export const PRESENCE_TEXT_COLOR_CLASSES = [
    'text-red-500',
    'text-orange-500',
    'text-amber-500',
    'text-green-500',
    'text-teal-500',
    'text-cyan-500',
    'text-blue-500',
    'text-indigo-500',
    'text-violet-500',
    'text-purple-500',
    'text-pink-500',
    'text-rose-500',
] as const;

export const PRESENCE_BORDER_COLOR_CLASSES = [
    'border-red-500',
    'border-orange-500',
    'border-amber-500',
    'border-green-500',
    'border-teal-500',
    'border-cyan-500',
    'border-blue-500',
    'border-indigo-500',
    'border-violet-500',
    'border-purple-500',
    'border-pink-500',
    'border-rose-500',
] as const;

export const PRESENCE_STROKE_COLOR_CLASSES = [
    '!stroke-red-500',
    '!stroke-orange-500',
    '!stroke-amber-500',
    '!stroke-green-500',
    '!stroke-teal-500',
    '!stroke-cyan-500',
    '!stroke-blue-500',
    '!stroke-indigo-500',
    '!stroke-violet-500',
    '!stroke-purple-500',
    '!stroke-pink-500',
    '!stroke-rose-500',
] as const;

export const PRESENCE_RING_COLOR_CLASSES = [
    'ring-red-500',
    'ring-orange-500',
    'ring-amber-500',
    'ring-green-500',
    'ring-teal-500',
    'ring-cyan-500',
    'ring-blue-500',
    'ring-indigo-500',
    'ring-violet-500',
    'ring-purple-500',
    'ring-pink-500',
    'ring-rose-500',
] as const;

export const hashUserId = (userId: number): number => {
    let hash = userId;

    hash = ((hash >> 16) ^ hash) * 0x45d9f3b;
    hash = ((hash >> 16) ^ hash) * 0x45d9f3b;
    hash = (hash >> 16) ^ hash;

    return Math.abs(hash);
};

export const getPresenceColorClass = (userId: number): string => {
    const index = hashUserId(userId) % PRESENCE_COLOR_CLASSES.length;
    return PRESENCE_COLOR_CLASSES[index];
};

export const getPresenceTextColorClass = (userId: number): string => {
    const index = hashUserId(userId) % PRESENCE_TEXT_COLOR_CLASSES.length;
    return PRESENCE_TEXT_COLOR_CLASSES[index];
};

export const getPresenceBorderColorClass = (userId: number): string => {
    const index = hashUserId(userId) % PRESENCE_BORDER_COLOR_CLASSES.length;
    return PRESENCE_BORDER_COLOR_CLASSES[index];
};

export const getPresenceStrokeColorClass = (userId: number): string => {
    const index = hashUserId(userId) % PRESENCE_STROKE_COLOR_CLASSES.length;
    return PRESENCE_STROKE_COLOR_CLASSES[index];
};

export const getPresenceRingColorClass = (userId: number): string => {
    const index = hashUserId(userId) % PRESENCE_RING_COLOR_CLASSES.length;
    return PRESENCE_RING_COLOR_CLASSES[index];
};

export const getInitialsFromName = (name: string): string => {
    const parts = name.trim().split(/\s+/).filter(Boolean);

    if (parts.length === 0) {
        return '?';
    }

    if (parts.length === 1) {
        return parts[0].slice(0, 2).toUpperCase();
    }

    const firstInitial = parts[0][0] ?? '';
    const lastInitial = parts[parts.length - 1][0] ?? '';

    return `${firstInitial}${lastInitial}`.toUpperCase();
};
