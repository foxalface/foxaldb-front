import React, { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/button/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/dialog/dialog';
import { Input } from '@/components/input/input';
import {
    Select,
    SelectContent,
    SelectTrigger,
    SelectValue,
} from '@/components/select/select';
import { FormField } from '@/components/form-field/form-field';
import {
    formFieldDescribedBy,
    formFieldErrorId,
    invalidControlClassName,
} from '@/components/form-field/form-field-ids';
import { Label } from '@/components/label/label';
import {
    DIAGRAM_MEMBER_ROLE_EDITOR,
    type DiagramMemberRole,
} from '@/lib/api/diagram-members';
import { shareDiagram } from '@/lib/api/diagram-invitations';
import { normalizeApiError } from '@/lib/api/normalize-api-error';
import { useToast } from '@/components/toast/use-toast';
import { collectFormValidity } from '@/lib/forms/collect-form-validity';
import { focusFirstInvalid } from '@/lib/forms/focus-first-invalid-field';
import {
    fieldRuleMessageKey,
    nonFieldErrorMessageKey,
    submissionToastMessageKey,
    toastMessageForMappedFields,
} from '@/lib/forms/form-error-messages';
import { useTranslation } from 'react-i18next';
import { ShareMemberRoleSelectItems } from './share-member-role-select-items';

const ADD_MEMBER_TOAST_KEY = 'share:add-member';

export interface ShareAddMemberDialogProps {
    diagramId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onShared: () => void;
}

export const ShareAddMemberDialog: React.FC<ShareAddMemberDialogProps> = ({
    diagramId,
    open,
    onOpenChange,
    onShared,
}) => {
    const { t } = useTranslation();
    const { toast } = useToast();
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<DiagramMemberRole>(
        DIAGRAM_MEMBER_ROLE_EDITOR
    );
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [emailErrorKey, setEmailErrorKey] = useState<string | null>(null);
    const [roleInvalid, setRoleInvalid] = useState(false);

    useEffect(() => {
        if (!open) {
            setEmail('');
            setRole(DIAGRAM_MEMBER_ROLE_EDITOR);
            setEmailErrorKey(null);
            setRoleInvalid(false);
            setIsSubmitting(false);
        }
    }, [open]);

    const handleSubmit = useCallback(
        async (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            setEmailErrorKey(null);
            setRoleInvalid(false);

            const validity = collectFormValidity(event.currentTarget);
            if (validity.issues.length > 0) {
                const emailIssue = validity.issues.find(
                    (issue) => issue.name === 'email'
                );
                if (emailIssue) {
                    setEmailErrorKey(fieldRuleMessageKey(emailIssue.code));
                }
                focusFirstInvalid(validity.firstInvalid);
                toast({
                    title: t(submissionToastMessageKey(validity.issues)),
                    variant: 'danger',
                    dedupeKey: ADD_MEMBER_TOAST_KEY,
                });
                return;
            }

            setIsSubmitting(true);

            try {
                await shareDiagram(diagramId, {
                    email: email.trim(),
                    role,
                });
                onShared();
                toast({
                    title: t('share_diagram_dialog.add_member.success'),
                    variant: 'success',
                });
                onOpenChange(false);
            } catch (error: unknown) {
                const apiError = normalizeApiError(error);
                if (apiError.code === 'validation_failed') {
                    const emailRule = apiError.fields.email?.[0]?.code ?? null;
                    const roleRule = apiError.fields.role?.[0]?.code ?? null;
                    const mapped: Record<string, string> = {};
                    if (emailRule !== null || 'email' in apiError.fields) {
                        const messageKey = fieldRuleMessageKey(emailRule);
                        mapped.email = t(messageKey);
                        setEmailErrorKey(messageKey);
                    }
                    if (roleRule !== null || 'role' in apiError.fields) {
                        mapped.role = t(fieldRuleMessageKey(roleRule));
                        setRoleInvalid(true);
                    }
                    toast({
                        title: toastMessageForMappedFields(mapped, t),
                        variant: 'danger',
                        dedupeKey: ADD_MEMBER_TOAST_KEY,
                    });
                    return;
                }

                const domainKey =
                    apiError.code === 'forbidden' ||
                    apiError.code === 'not_found' ||
                    apiError.code === 'too_many_requests' ||
                    apiError.code === 'network' ||
                    apiError.code === 'unauthenticated' ||
                    apiError.code === 'session_expired' ||
                    apiError.code === 'server'
                        ? nonFieldErrorMessageKey(apiError.code)
                        : 'share_diagram_dialog.errors.add_failed';
                toast({
                    title: t(domainKey),
                    variant: 'danger',
                    dedupeKey: ADD_MEMBER_TOAST_KEY,
                });
            } finally {
                setIsSubmitting(false);
            }
        },
        [diagramId, email, onOpenChange, onShared, role, t, toast]
    );

    const emailErrorId = formFieldErrorId('share-add-member-email');

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="flex max-w-md flex-col"
                showClose
                data-vaul-no-drag
            >
                <form
                    className="flex flex-col gap-4"
                    noValidate
                    onSubmit={(event) => void handleSubmit(event)}
                >
                    <DialogHeader>
                        <DialogTitle>
                            {t('share_diagram_dialog.add_member.title')}
                        </DialogTitle>
                        <DialogDescription>
                            {t('share_diagram_dialog.add_member.helper')}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col gap-4">
                        <FormField
                            id="share-add-member-email"
                            label={t(
                                'share_diagram_dialog.add_member.email_label'
                            )}
                            error={
                                emailErrorKey === null ? null : t(emailErrorKey)
                            }
                        >
                            <Input
                                id="share-add-member-email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                placeholder={t(
                                    'share_diagram_dialog.add_member.email_placeholder'
                                )}
                                value={email}
                                onChange={(event) => {
                                    setEmail(event.target.value);
                                    setEmailErrorKey(null);
                                }}
                                disabled={isSubmitting}
                                aria-invalid={
                                    emailErrorKey !== null ? true : undefined
                                }
                                aria-describedby={formFieldDescribedBy(
                                    'share-add-member-email',
                                    { error: emailErrorKey !== null }
                                )}
                                aria-errormessage={
                                    emailErrorKey !== null
                                        ? emailErrorId
                                        : undefined
                                }
                                className={invalidControlClassName(
                                    emailErrorKey !== null
                                )}
                            />
                        </FormField>

                        <div className="flex flex-col gap-2">
                            <Label htmlFor="share-add-member-role">
                                {t(
                                    'side_panel.share_section.member_actions.role'
                                )}
                            </Label>
                            <Select
                                value={role}
                                onValueChange={(value) => {
                                    setRole(value as DiagramMemberRole);
                                    setRoleInvalid(false);
                                }}
                                disabled={isSubmitting}
                            >
                                <SelectTrigger
                                    id="share-add-member-role"
                                    aria-invalid={
                                        roleInvalid ? true : undefined
                                    }
                                    className={invalidControlClassName(
                                        roleInvalid
                                    )}
                                >
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <ShareMemberRoleSelectItems />
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            disabled={isSubmitting}
                            onClick={() => onOpenChange(false)}
                        >
                            {t('share_diagram_dialog.add_member.cancel')}
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting
                                ? t('share_diagram_dialog.add_member.adding')
                                : t('share_diagram_dialog.add_member.add')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
