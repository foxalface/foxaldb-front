import { useEffect, useState } from 'react';
import {
    peekUploadCapabilities,
    resolveUploadCapabilities,
} from '@/lib/upload-capabilities';
import type { UploadCapabilities } from '@/lib/upload-capabilities';

export const useUploadCapabilities = (
    enabled = true
): { capabilities: UploadCapabilities | null } => {
    const [capabilities, setCapabilities] = useState<UploadCapabilities | null>(
        () => (enabled ? peekUploadCapabilities() : null)
    );

    useEffect(() => {
        if (!enabled) {
            return;
        }

        const cached = peekUploadCapabilities();
        if (cached) {
            setCapabilities(cached);
            return;
        }

        let active = true;

        void resolveUploadCapabilities().then((value) => {
            if (active) {
                setCapabilities(value);
            }
        });

        return () => {
            active = false;
        };
    }, [enabled]);

    return { capabilities };
};
