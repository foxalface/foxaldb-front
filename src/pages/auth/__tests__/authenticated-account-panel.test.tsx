import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { en } from '@/i18n/locales/en';

vi.mock('@/hooks/use-auth', () => ({
    useAuth: () => ({
        user: {
            id: 1,
            first_name: 'Alexis',
            last_name: 'Renart',
            full_name: 'Alexis Renart',
            email: 'alexis@example.com',
        },
        logout: vi.fn(),
    }),
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => {
            const parts = key.split('.');
            let current: unknown = en.translation;
            for (const part of parts) {
                if (
                    typeof current !== 'object' ||
                    current === null ||
                    !(part in current)
                ) {
                    return key;
                }
                current = (current as Record<string, unknown>)[part];
            }
            return typeof current === 'string' ? current : key;
        },
    }),
}));

import { AuthenticatedAccountPanel } from '../auth-form-panels';

describe('AuthenticatedAccountPanel', () => {
    it('displays full_name in the signed-in account panel', () => {
        render(<AuthenticatedAccountPanel />);

        expect(screen.getByText('Alexis Renart')).toBeInTheDocument();
        expect(screen.getByText('alexis@example.com')).toBeInTheDocument();
        expect(
            screen.getByText(en.translation.auth.account.signed_in_as, {
                exact: false,
            })
        ).toBeInTheDocument();
    });
});
