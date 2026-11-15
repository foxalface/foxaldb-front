import React from 'react';
import {
    formFieldDescriptionId,
    formFieldErrorId,
} from '@/components/form-field/form-field-ids';
import { cn } from '@/lib/utils';

export interface FormFieldProps {
    id: string;
    label: React.ReactNode;
    error?: string | null;
    description?: React.ReactNode;
    className?: string;
    children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
    id,
    label,
    error = null,
    description,
    className,
    children,
}) => {
    const invalid = error !== null && error !== '';

    return (
        <div className={cn('flex flex-col gap-1 text-sm', className)}>
            <label htmlFor={id}>{label}</label>
            {children}
            {description !== undefined && description !== null ? (
                <p
                    className="text-xs text-muted-foreground"
                    id={formFieldDescriptionId(id)}
                >
                    {description}
                </p>
            ) : null}
            {invalid ? (
                <p className="sr-only" id={formFieldErrorId(id)}>
                    {error}
                </p>
            ) : null}
        </div>
    );
};
