import React, { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { PasswordInput } from '@/components/password-input/password-input';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) =>
            key === 'auth.password_visibility.hide'
                ? 'Hide password'
                : 'Show password',
    }),
}));

describe('PasswordInput', () => {
    it('toggles visibility without changing the value', async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();

        render(
            <PasswordInput
                aria-label="Password"
                onChange={onChange}
                value="secret-value"
            />
        );

        const input = screen.getByLabelText('Password');
        const toggle = screen.getByRole('button', { name: 'Show password' });

        expect(input).toHaveAttribute('type', 'password');
        expect(toggle).toHaveAttribute('type', 'button');
        expect(toggle).toHaveAttribute('aria-pressed', 'false');

        await user.click(toggle);

        expect(input).toHaveAttribute('type', 'text');
        expect(input).toHaveValue('secret-value');
        expect(
            screen.getByRole('button', { name: 'Hide password' })
        ).toHaveAttribute('aria-pressed', 'true');
        expect(onChange).not.toHaveBeenCalled();

        await user.click(screen.getByRole('button', { name: 'Hide password' }));

        expect(input).toHaveAttribute('type', 'password');
        expect(input).toHaveValue('secret-value');
        expect(
            screen.getByRole('button', { name: 'Show password' })
        ).toBeInTheDocument();
    });

    it('does not toggle a disabled field', () => {
        render(<PasswordInput aria-label="Password" disabled value="secret" />);

        expect(
            screen.getByRole('button', { name: 'Show password' })
        ).toBeDisabled();
        expect(screen.getByLabelText('Password')).toBeDisabled();
        expect(screen.getByLabelText('Password')).toHaveAttribute(
            'type',
            'password'
        );
    });

    it('keeps visibility independent per field', async () => {
        const user = userEvent.setup();

        const Pair = () => {
            const [first, setFirst] = useState('one');
            const [second, setSecond] = useState('two');
            return (
                <>
                    <PasswordInput
                        aria-label="Password"
                        onChange={(event) => setFirst(event.target.value)}
                        value={first}
                    />
                    <PasswordInput
                        aria-label="Confirm password"
                        onChange={(event) => setSecond(event.target.value)}
                        value={second}
                    />
                </>
            );
        };

        render(<Pair />);

        const toggles = screen.getAllByRole('button', {
            name: 'Show password',
        });
        await user.click(toggles[0]);

        expect(screen.getByLabelText('Password')).toHaveAttribute(
            'type',
            'text'
        );
        expect(screen.getByLabelText('Confirm password')).toHaveAttribute(
            'type',
            'password'
        );
        expect(screen.getByLabelText('Password')).toHaveValue('one');
        expect(screen.getByLabelText('Confirm password')).toHaveValue('two');
    });

    it('does not submit the form and keeps autocomplete', async () => {
        const user = userEvent.setup();
        const onSubmit = vi.fn((event: React.FormEvent) =>
            event.preventDefault()
        );

        render(
            <form onSubmit={onSubmit}>
                <PasswordInput
                    aria-label="Password"
                    autoComplete="current-password"
                    defaultValue="secret"
                />
                <button type="submit">Sign in</button>
            </form>
        );

        expect(screen.getByLabelText('Password')).toHaveAttribute(
            'autocomplete',
            'current-password'
        );

        await user.click(screen.getByRole('button', { name: 'Show password' }));
        expect(onSubmit).not.toHaveBeenCalled();

        await user.type(screen.getByLabelText('Password'), '{Enter}');
        expect(onSubmit).toHaveBeenCalledTimes(1);
    });
});
