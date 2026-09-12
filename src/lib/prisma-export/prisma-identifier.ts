const PRISMA_RESERVED_IDENTIFIERS = new Set([
    'model',
    'enum',
    'type',
    'datasource',
    'generator',
    'import',
    'true',
    'false',
    'null',
]);

const IDENTIFIER_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;

export interface AllocatedIdentifier {
    physicalName: string;
    prismaName: string;
    needsMap: boolean;
}

const splitPhysicalSegments = (physicalName: string): string[] =>
    physicalName
        .trim()
        .split(/[^a-zA-Z0-9]+/)
        .filter((segment) => segment.length > 0);

const capitalizeSegment = (segment: string): string => {
    if (segment.length === 0) {
        return '';
    }

    return segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase();
};

export const toPascalCaseIdentifier = (physicalName: string): string => {
    const segments = splitPhysicalSegments(physicalName);

    if (segments.length === 0) {
        return 'Unnamed';
    }

    return segments.map(capitalizeSegment).join('');
};

export const toCamelCaseIdentifier = (physicalName: string): string => {
    const pascal = toPascalCaseIdentifier(physicalName);

    if (pascal.length === 0) {
        return 'unnamed';
    }

    return pascal.charAt(0).toLowerCase() + pascal.slice(1);
};

const sanitizeBaseIdentifier = (
    base: string,
    fallbackPrefix: string
): string => {
    const trimmed = base.trim();

    if (trimmed.length === 0) {
        return fallbackPrefix;
    }

    let sanitized = trimmed.replace(/[^a-zA-Z0-9_]/g, '_');

    if (/^[0-9]/.test(sanitized)) {
        sanitized = `${fallbackPrefix}_${sanitized}`;
    }

    if (!IDENTIFIER_PATTERN.test(sanitized)) {
        return fallbackPrefix;
    }

    if (PRISMA_RESERVED_IDENTIFIERS.has(sanitized.toLowerCase())) {
        return `${sanitized}Value`;
    }

    return sanitized;
};

export class IdentifierAllocator {
    private readonly used = new Set<string>();

    allocate(
        physicalName: string,
        style: 'pascal' | 'camel',
        fallbackPrefix: string
    ): AllocatedIdentifier {
        const base =
            style === 'pascal'
                ? toPascalCaseIdentifier(physicalName)
                : toCamelCaseIdentifier(physicalName);
        const sanitizedBase = sanitizeBaseIdentifier(base, fallbackPrefix);
        let candidate = sanitizedBase;
        let suffix = 2;

        while (this.used.has(candidate)) {
            candidate = `${sanitizedBase}${suffix}`;
            suffix += 1;
        }

        this.used.add(candidate);

        const expectedPrisma =
            style === 'pascal'
                ? toPascalCaseIdentifier(physicalName)
                : toCamelCaseIdentifier(physicalName);
        const needsMap =
            physicalName !== candidate &&
            (physicalName !== expectedPrisma ||
                !IDENTIFIER_PATTERN.test(physicalName) ||
                PRISMA_RESERVED_IDENTIFIERS.has(physicalName.toLowerCase()));

        return {
            physicalName,
            prismaName: candidate,
            needsMap:
                needsMap ||
                physicalName !== candidate ||
                physicalName !== expectedPrisma,
        };
    }

    reserve(name: string): void {
        this.used.add(name);
    }

    has(name: string): boolean {
        return this.used.has(name);
    }
}

export const isValidPrismaIdentifier = (name: string): boolean =>
    IDENTIFIER_PATTERN.test(name) &&
    !PRISMA_RESERVED_IDENTIFIERS.has(name.toLowerCase());

export const sanitizeRelationName = (
    name: string,
    fallback: string
): string => {
    const trimmed = name.trim();

    if (trimmed.length === 0) {
        return fallback;
    }

    const sanitized = trimmed.replace(/[^a-zA-Z0-9_]/g, '_');

    if (!IDENTIFIER_PATTERN.test(sanitized)) {
        return fallback;
    }

    return sanitized;
};

export const deriveForwardRelationFieldName = (
    fkPhysicalName: string,
    allocator: IdentifierAllocator
): string => {
    const camel = toCamelCaseIdentifier(fkPhysicalName);

    if (camel.endsWith('Id')) {
        const stripped = camel.slice(0, -2);

        if (stripped.length > 0 && !allocator.has(stripped)) {
            return stripped;
        }
    }

    if (camel.endsWith('_id')) {
        const stripped = camel.slice(0, -3);

        if (stripped.length > 0 && !allocator.has(stripped)) {
            return stripped;
        }
    }

    const allocated = allocator.allocate(
        `${fkPhysicalName}_relation`,
        'camel',
        'relation'
    );

    return allocated.prismaName;
};

export const deriveInverseRelationFieldName = (
    relatedModelIdentifier: string
): string =>
    relatedModelIdentifier.charAt(0).toLowerCase() +
    relatedModelIdentifier.slice(1);
