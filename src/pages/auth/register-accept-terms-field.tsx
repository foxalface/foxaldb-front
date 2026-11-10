import React from 'react';
import { Checkbox } from '@/components/checkbox/checkbox';
import { useTranslation } from 'react-i18next';
import { parseAcceptTermsTemplate } from './parse-accept-terms-template';

const linkClass =
    'rounded-sm underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

export interface RegisterAcceptTermsFieldProps {
    checked: boolean;
    disabled?: boolean;
    error: string | null;
    onCheckedChange: (checked: boolean) => void;
}

export const RegisterAcceptTermsField: React.FC<
    RegisterAcceptTermsFieldProps
> = ({ checked, disabled = false, error, onCheckedChange }) => {
    const { t } = useTranslation();
    const segments = parseAcceptTermsTemplate(t('auth.register.accept_terms'));

    return (
        <div className="flex flex-col gap-1">
            <div className="flex items-start gap-2">
                <Checkbox
                    aria-describedby={
                        error !== null
                            ? 'register-accept-terms-error'
                            : undefined
                    }
                    aria-invalid={error !== null ? true : undefined}
                    aria-labelledby="register-accept-terms-copy"
                    checked={checked}
                    disabled={disabled}
                    id="register-accept-terms"
                    onCheckedChange={(value) => onCheckedChange(value === true)}
                />
                <p
                    className="text-sm leading-5"
                    id="register-accept-terms-copy"
                >
                    {segments.map((segment, index) => {
                        if (segment.kind === 'terms') {
                            return (
                                <a
                                    key={index}
                                    className={linkClass}
                                    href="/terms"
                                >
                                    {segment.text}
                                </a>
                            );
                        }

                        if (segment.kind === 'privacy') {
                            return (
                                <a
                                    key={index}
                                    className={linkClass}
                                    href="/privacy"
                                >
                                    {segment.text}
                                </a>
                            );
                        }

                        return (
                            <label
                                key={index}
                                className="cursor-pointer"
                                htmlFor="register-accept-terms"
                            >
                                {segment.text}
                            </label>
                        );
                    })}
                </p>
            </div>
            {error !== null ? (
                <p
                    className="text-xs text-destructive"
                    id="register-accept-terms-error"
                    role="alert"
                >
                    {error}
                </p>
            ) : null}
        </div>
    );
};
