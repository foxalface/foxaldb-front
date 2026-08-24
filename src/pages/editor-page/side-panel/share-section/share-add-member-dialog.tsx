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
import { Label } from '@/components/label/label';
import {
    Select,
    SelectContent,
    SelectTrigger,
    SelectValue,
} from '@/components/select/select';
import {
    addDiagramMember,
    DIAGRAM_MEMBER_ROLE_EDITOR,
    type DiagramMemberResource,
    type DiagramMemberRole,
} from '@/lib/api/diagram-members';
import { parseLaravelValidationErrors } from '@/lib/api/parse-validation-errors';
import { useTranslation } from 'react-i18next';
import { ShareMemberRoleSelectItems } from './share-member-role-select-items';

export interface ShareAddMemberDialogProps {
    diagramId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onMemberAdded: (member: DiagramMemberResource) => void;
}

export const ShareAddMemberDialog: React.FC<ShareAddMemberDialogProps> = ({
    diagramId,
    open,
    onOpenChange,
    onMemberAdded,
}) => {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<DiagramMemberRole>(
        DIAGRAM_MEMBER_ROLE_EDITOR
    );
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<
        Partial<Record<'email' | 'role', string>>
    >({});

    useEffect(() => {
        if (!open) {
            setEmail('');
            setRole(DIAGRAM_MEMBER_ROLE_EDITOR);
            setFieldErrors({});
            setIsSubmitting(false);
        }
    }, [open]);

    const handleSubmit = useCallback(
        async (event: React.FormEvent) => {
            event.preventDefault();
            setFieldErrors({});
            setIsSubmitting(true);

            try {
                const member = await addDiagramMember(diagramId, {
                    email: email.trim(),
                    role,
                });
                onMemberAdded(member);
                onOpenChange(false);
            } catch (error: unknown) {
                const validationErrors = parseLaravelValidationErrors(error);
                if (Object.keys(validationErrors).length > 0) {
                    setFieldErrors({
                        email: validationErrors.email,
                        role: validationErrors.role,
                    });
                } else {
                    setFieldErrors({
                        email: t('share_diagram_dialog.errors.add_failed'),
                    });
                }
            } finally {
                setIsSubmitting(false);
            }
        },
        [diagramId, email, onMemberAdded, onOpenChange, role, t]
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="flex max-w-md flex-col"
                showClose
                data-vaul-no-drag
            >
                <form
                    className="flex flex-col gap-4"
                    onSubmit={(event) => void handleSubmit(event)}
                >
                    <DialogHeader>
                        <DialogTitle>
                            {t('share_diagram_dialog.add_member.title')}
                        </DialogTitle>
                        <DialogDescription>
                            {t(
                                'side_panel.share_section.collaborators.description'
                            )}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="share-add-member-email">
                                {t(
                                    'share_diagram_dialog.add_member.email_label'
                                )}
                            </Label>
                            <Input
                                id="share-add-member-email"
                                type="email"
                                autoComplete="email"
                                placeholder={t(
                                    'share_diagram_dialog.add_member.email_placeholder'
                                )}
                                value={email}
                                onChange={(event) =>
                                    setEmail(event.target.value)
                                }
                                disabled={isSubmitting}
                            />
                            {fieldErrors.email ? (
                                <p className="text-xs text-destructive">
                                    {fieldErrors.email}
                                </p>
                            ) : null}
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label htmlFor="share-add-member-role">
                                {t(
                                    'side_panel.share_section.member_actions.role'
                                )}
                            </Label>
                            <Select
                                value={role}
                                onValueChange={(value) =>
                                    setRole(value as DiagramMemberRole)
                                }
                                disabled={isSubmitting}
                            >
                                <SelectTrigger id="share-add-member-role">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <ShareMemberRoleSelectItems />
                                </SelectContent>
                            </Select>
                            {fieldErrors.role ? (
                                <p className="text-xs text-destructive">
                                    {fieldErrors.role}
                                </p>
                            ) : null}
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
                        <Button
                            type="submit"
                            disabled={isSubmitting || email.trim() === ''}
                        >
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
