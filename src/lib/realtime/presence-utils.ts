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
