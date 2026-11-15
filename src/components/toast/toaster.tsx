import React from 'react';
import {
    FiAlertCircle,
    FiAlertTriangle,
    FiCheckCircle,
    FiInfo,
} from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import {
    Toast,
    ToastClose,
    ToastDescription,
    ToastProvider,
    ToastTitle,
    ToastViewport,
} from '@/components/toast/toast';
import { useToast, type ToasterToast } from '@/components/toast/use-toast';

const ToastGlyph: React.FC<{ variant: ToasterToast['variant'] }> = ({
    variant,
}) => {
    if (variant === 'success') {
        return (
            <FiCheckCircle
                aria-hidden
                className="size-4 shrink-0 text-primary"
            />
        );
    }

    if (variant === 'warning') {
        return (
            <FiAlertTriangle
                aria-hidden
                className="size-4 shrink-0 text-destructive"
            />
        );
    }

    if (variant === 'danger' || variant === 'destructive') {
        return <FiAlertCircle aria-hidden className="size-4 shrink-0" />;
    }

    return (
        <FiInfo aria-hidden className="size-4 shrink-0 text-muted-foreground" />
    );
};

const toastProps = (item: ToasterToast) => ({
    className: item.className,
    duration: item.duration,
    onOpenChange: item.onOpenChange,
    open: item.open,
    variant: item.variant,
});

export function Toaster() {
    const { toasts } = useToast();
    const { t } = useTranslation();

    return (
        <ToastProvider>
            {toasts.map((item) => {
                const layout = item.layout ?? 'row';

                return (
                    <Toast
                        key={`${item.id}:${item.revision}`}
                        {...toastProps(item)}
                    >
                        <ToastGlyph variant={item.variant} />
                        <div
                            className={`grid gap-1${layout === 'column' ? ' w-full' : ''}`}
                        >
                            {item.title ? (
                                <ToastTitle>{item.title}</ToastTitle>
                            ) : null}
                            {item.description ? (
                                <ToastDescription>
                                    {item.description}
                                </ToastDescription>
                            ) : null}
                            {layout === 'column' ? (
                                <div className="mt-2">{item.action}</div>
                            ) : null}
                        </div>
                        {layout === 'row' ? item.action : null}
                        <ToastClose aria-label={t('toast.close')} />
                    </Toast>
                );
            })}
            <ToastViewport />
        </ToastProvider>
    );
}
