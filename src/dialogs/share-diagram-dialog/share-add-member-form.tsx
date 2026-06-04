import React, { useCallback, useState } from 'react';
import { Button } from '@/components/button/button';
import { Input } from '@/components/input/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/select/select';
import {
    addDiagramMember,
    DIAGRAM_MEMBER_ROLE_EDITOR,
    DIAGRAM_MEMBER_ROLE_VIEWER,
    type DiagramMemberResource,
    type DiagramMemberRole,
} from '@/lib/api/diagram-members';
import { parseLaravelValidationErrors } from '@/lib/api/parse-validation-errors';
import { useTranslation } from 'react-i18next';

export interface ShareAddMemberFormProps {
    diagramId: string;
    onMemberAdded: (member: DiagramMemberResource) => void;
}

export const ShareAddMemberForm: React.FC<ShareAddMemberFormProps> = ({
    diagramId,
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
                setEmail('');
                setRole(DIAGRAM_MEMBER_ROLE_EDITOR);
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
        [diagramId, email, onMemberAdded, role, t]
    );

    return (
        <form
            className="flex flex-col gap-3 border-t pt-4"
            onSubmit={(event) => void handleSubmit(event)}
        >
            <p className="text-sm font-medium">
                {t('share_diagram_dialog.add_member.title')}
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
                <div className="flex flex-1 flex-col gap-1">
                    <Input
                        type="email"
                        autoComplete="email"
                        placeholder={t(
                            'share_diagram_dialog.add_member.email_placeholder'
                        )}
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        disabled={isSubmitting}
                    />
                    {fieldErrors.email ? (
                        <p className="text-xs text-destructive">
                            {fieldErrors.email}
                        </p>
                    ) : null}
                </div>
                <div className="flex w-full flex-col gap-1 sm:w-36">
                    <Select
                        value={role}
                        onValueChange={(value) =>
                            setRole(value as DiagramMemberRole)
                        }
                        disabled={isSubmitting}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={DIAGRAM_MEMBER_ROLE_EDITOR}>
                                {t('share_diagram_dialog.roles.editor')}
                            </SelectItem>
                            <SelectItem value={DIAGRAM_MEMBER_ROLE_VIEWER}>
                                {t('share_diagram_dialog.roles.viewer')}
                            </SelectItem>
                        </SelectContent>
                    </Select>
                    {fieldErrors.role ? (
                        <p className="text-xs text-destructive">
                            {fieldErrors.role}
                        </p>
                    ) : null}
                </div>
                <Button
                    type="submit"
                    disabled={isSubmitting || email.trim() === ''}
                    className="sm:self-start"
                >
                    {isSubmitting
                        ? t('share_diagram_dialog.add_member.adding')
                        : t('share_diagram_dialog.add_member.add')}
                </Button>
            </div>
            {/* Future: pending invitations */}
        </form>
    );
};
