import React from 'react';
import { Ellipsis, Trash2 } from 'lucide-react';
import { Button } from '@/components/button/button';
import { Label } from '@/components/label/label';
import { Separator } from '@/components/separator/separator';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/popover/popover';
import {
    Select,
    SelectContent,
    SelectTrigger,
    SelectValue,
} from '@/components/select/select';
import {
    type DiagramMemberResource,
    type DiagramMemberRole,
} from '@/lib/api/diagram-members';
import { useTranslation } from 'react-i18next';
import { ShareMemberRoleSelectItems } from './share-member-role-select-items';

export interface ShareMemberActionsPopoverProps {
    member: DiagramMemberResource;
    disabled?: boolean;
    onRoleChange: (role: DiagramMemberRole) => void;
    onRemove: () => void;
}

export const ShareMemberActionsPopover: React.FC<
    ShareMemberActionsPopoverProps
> = ({ member, disabled = false, onRoleChange, onRemove }) => {
    const { t } = useTranslation();
    const [open, setOpen] = React.useState(false);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="ghost"
                    disabled={disabled}
                    aria-label={t(
                        'side_panel.share_section.member_actions.trigger_aria'
                    )}
                    className="h-8 w-[32px] shrink-0 p-2 text-slate-500 hover:bg-primary-foreground hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                >
                    <Ellipsis className="size-3.5" aria-hidden="true" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-52" align="end">
                <div className="flex flex-col gap-2">
                    <div className="text-sm font-semibold">
                        {t('side_panel.share_section.member_actions.title')}
                    </div>
                    <Separator orientation="horizontal" />
                    <div className="flex flex-col gap-2">
                        <Label className="text-subtitle">
                            {t('side_panel.share_section.member_actions.role')}
                        </Label>
                        <Select
                            value={member.role}
                            onValueChange={(value) => {
                                onRoleChange(value as DiagramMemberRole);
                            }}
                            disabled={disabled}
                        >
                            <SelectTrigger className="w-full bg-muted">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <ShareMemberRoleSelectItems />
                            </SelectContent>
                        </Select>
                    </div>
                    <Separator orientation="horizontal" />
                    <Button
                        type="button"
                        variant="outline"
                        className="flex gap-2 !text-red-700"
                        disabled={disabled}
                        onClick={() => {
                            onRemove();
                            setOpen(false);
                        }}
                    >
                        <Trash2
                            className="size-3.5 text-red-700"
                            aria-hidden="true"
                        />
                        {t('delete')}
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
};
