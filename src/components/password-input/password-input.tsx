import React, { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/input/input';
import { cn } from '@/lib/utils';

export type PasswordInputProps = Omit<
    React.ComponentProps<typeof Input>,
    'type'
>;

export const PasswordInput = React.forwardRef<
    HTMLInputElement,
    PasswordInputProps
>(({ className, disabled, ...props }, ref) => {
    const { t } = useTranslation();
    const [visible, setVisible] = useState(false);
    const label = visible
        ? t('auth.password_visibility.hide')
        : t('auth.password_visibility.show');

    return (
        <div className="relative">
            <Input
                {...props}
                className={cn('pr-9', className)}
                disabled={disabled}
                ref={ref}
                type={visible ? 'text' : 'password'}
            />
            <button
                aria-label={label}
                aria-pressed={visible}
                className="absolute inset-y-0 right-0 flex w-9 items-center justify-center rounded-md text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                disabled={disabled}
                onClick={() => setVisible((current) => !current)}
                onMouseDown={(event) => {
                    event.preventDefault();
                }}
                type="button"
            >
                {visible ? (
                    <FiEyeOff aria-hidden className="size-4" />
                ) : (
                    <FiEye aria-hidden className="size-4" />
                )}
            </button>
        </div>
    );
});
PasswordInput.displayName = 'PasswordInput';
