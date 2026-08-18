import React, { useMemo } from 'react';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/sidebar/sidebar';
import {
    BookOpen,
    Group,
    FileType,
    Plus,
    FolderOpen,
    CodeXml,
    History,
} from 'lucide-react';
import { SlBubbles } from 'react-icons/sl';
import { Table, Workflow } from 'lucide-react';
import { useLayout } from '@/hooks/use-layout';
import { useTranslation } from 'react-i18next';
import { DiscordLogoIcon, TwitterLogoIcon } from '@radix-ui/react-icons';
import { useBreakpoint } from '@/hooks/use-breakpoint';
import ChartDBLogo from '@/assets/logo-light.png';
import ChartDBDarkLogo from '@/assets/logo-dark.png';
import { useTheme } from '@/hooks/use-theme';
import { useChartDB } from '@/hooks/use-chartdb';
import { useDialog } from '@/hooks/use-dialog';
import { Separator } from '@/components/separator/separator';
import { useConversationsAvailability } from '@/hooks/use-conversations-availability';
import { useActivitiesAvailability } from '@/hooks/use-activities-availability';
import { useDiagramConversations } from '@/hooks/use-diagram-conversations';
import { ConversationUnreadBadgeWithTranslation } from '@/components/conversations/conversation-unread-badge';
import { supportsCustomTypes } from '@/lib/domain/database-capabilities';

export interface SidebarItem {
    title: string;
    icon: React.FC;
    onClick: () => void;
    active: boolean;
    badge?: string;
    unreadCount?: number;
    secondary?: boolean;
    ariaLabel?: string;
}

export interface EditorSidebarProps {}

export const EditorSidebar: React.FC<EditorSidebarProps> = () => {
    const {
        toggleSidebarSection,
        selectedSidebarSection,
        isSidePanelShowed,
        selectVisualsTab,
    } = useLayout();
    const { t } = useTranslation();
    const { isMd: isDesktop } = useBreakpoint('md');
    const { effectiveTheme } = useTheme();
    const { databaseType } = useChartDB();
    const { openCreateDiagramDialog, openOpenDiagramDialog } = useDialog();
    const conversationsAvailable = useConversationsAvailability();
    const activitiesAvailable = useActivitiesAvailability();
    const { totalUnreadCount } = useDiagramConversations();

    const diagramItems: SidebarItem[] = useMemo(
        () => [
            {
                title: t('editor_sidebar.new_diagram'),
                icon: Plus,
                onClick: () => {
                    openCreateDiagramDialog();
                },
                active: false,
            },
            {
                title: t('editor_sidebar.browse'),
                icon: FolderOpen,
                onClick: () => {
                    openOpenDiagramDialog();
                },
                active: false,
            },
        ],
        [t, openCreateDiagramDialog, openOpenDiagramDialog]
    );

    const baseItems: SidebarItem[] = useMemo(
        () => [
            {
                title: t('editor_sidebar.tables'),
                icon: Table,
                onClick: () => {
                    toggleSidebarSection('tables');
                },
                active:
                    selectedSidebarSection === 'tables' && isSidePanelShowed,
            },
            {
                title: 'DBML',
                icon: CodeXml,
                onClick: () => {
                    toggleSidebarSection('dbml');
                },
                active: selectedSidebarSection === 'dbml' && isSidePanelShowed,
            },
            {
                title: t('editor_sidebar.refs'),
                icon: Workflow,
                onClick: () => {
                    toggleSidebarSection('refs');
                },
                active: selectedSidebarSection === 'refs' && isSidePanelShowed,
            },
            ...(supportsCustomTypes(databaseType)
                ? [
                      {
                          title: t('editor_sidebar.custom_types'),
                          icon: FileType,
                          onClick: () => {
                              toggleSidebarSection('customTypes');
                          },
                          active:
                              selectedSidebarSection === 'customTypes' &&
                              isSidePanelShowed,
                      },
                  ]
                : []),
            {
                title: t('editor_sidebar.visuals'),
                icon: Group,
                onClick: () => {
                    toggleSidebarSection('visuals');
                    if (
                        selectedSidebarSection !== 'visuals' ||
                        !isSidePanelShowed
                    ) {
                        selectVisualsTab('areas');
                    }
                },
                active:
                    selectedSidebarSection === 'visuals' && isSidePanelShowed,
            },
            ...(conversationsAvailable
                ? [
                      {
                          title: t('editor_sidebar.conversations'),
                          icon: SlBubbles,
                          onClick: () => {
                              toggleSidebarSection('conversations');
                          },
                          active:
                              selectedSidebarSection === 'conversations' &&
                              isSidePanelShowed,
                          unreadCount: totalUnreadCount,
                      },
                  ]
                : []),
            ...(activitiesAvailable
                ? [
                      {
                          title: t('editor_sidebar.activities'),
                          icon: History,
                          onClick: () => {
                              toggleSidebarSection('activities');
                          },
                          active:
                              selectedSidebarSection === 'activities' &&
                              isSidePanelShowed,
                      },
                  ]
                : []),
        ],
        [
            toggleSidebarSection,
            selectedSidebarSection,
            isSidePanelShowed,
            t,
            databaseType,
            selectVisualsTab,
            conversationsAvailable,
            activitiesAvailable,
            totalUnreadCount,
        ]
    );

    const footerItems: SidebarItem[] = useMemo(
        () => [
            {
                title: 'Discord',
                icon: DiscordLogoIcon,
                onClick: () =>
                    window.open('https://discord.gg/QeFwyWSKwC', '_blank'),
                active: false,
            },
            {
                title: 'Twitter',
                icon: TwitterLogoIcon,
                onClick: () =>
                    window.open(
                        'https://x.com/intent/follow?screen_name=jonathanfishner',
                        '_blank'
                    ),
                active: false,
            },
            {
                title: 'Docs',
                icon: BookOpen,
                onClick: () => window.open('https://docs.chartdb.io', '_blank'),
                active: false,
            },
        ],
        []
    );

    return (
        <Sidebar
            side="left"
            collapsible="icon-extended"
            variant="sidebar"
            className="relative h-full"
        >
            {!isDesktop ? (
                <SidebarHeader>
                    <a
                        href="https://chartdb.io"
                        className="cursor-pointer"
                        rel="noreferrer"
                    >
                        <img
                            src={
                                effectiveTheme === 'light'
                                    ? ChartDBLogo
                                    : ChartDBDarkLogo
                            }
                            alt="chartDB"
                            className="h-4 max-w-fit"
                        />
                    </a>
                </SidebarHeader>
            ) : null}
            <SidebarContent className="overflow-visible group-data-[collapsible=icon-extended]:overflow-visible">
                <SidebarGroup>
                    {/* <SidebarGroupLabel /> */}
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {diagramItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        className="justify-center space-y-0.5 !px-0 hover:bg-gray-200 data-[active=true]:bg-gray-100 data-[active=true]:text-pink-600 data-[active=true]:hover:bg-pink-100 dark:hover:bg-gray-800 dark:data-[active=true]:bg-gray-900 dark:data-[active=true]:text-pink-400 dark:data-[active=true]:hover:bg-pink-950"
                                        isActive={item.active}
                                        asChild
                                    >
                                        <button onClick={item.onClick}>
                                            <item.icon />
                                            <span>
                                                {item.title
                                                    .split(' ')
                                                    .map((word, index) => (
                                                        <div key={index}>
                                                            {word}
                                                        </div>
                                                    ))}
                                            </span>
                                        </button>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                        <Separator className="my-2" />
                        <SidebarMenu>
                            {baseItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    {typeof item.unreadCount === 'number' &&
                                    item.unreadCount > 0 ? (
                                        <ConversationUnreadBadgeWithTranslation
                                            count={item.unreadCount}
                                            translationKey="editor_sidebar.conversations_unread_aria"
                                            className="z-30"
                                        />
                                    ) : null}
                                    <SidebarMenuButton
                                        className="justify-center space-y-0.5 !px-0 hover:bg-gray-200 data-[active=true]:bg-gray-100 data-[active=true]:text-pink-600 data-[active=true]:hover:bg-pink-100 dark:hover:bg-gray-800 dark:data-[active=true]:bg-gray-900 dark:data-[active=true]:text-pink-400 dark:data-[active=true]:hover:bg-pink-950"
                                        isActive={item.active}
                                        asChild
                                    >
                                        <button
                                            type="button"
                                            onClick={item.onClick}
                                            aria-label={
                                                item.ariaLabel ?? item.title
                                            }
                                            title={item.ariaLabel ?? item.title}
                                        >
                                            <item.icon />
                                            <span>
                                                {item.title
                                                    .split(' ')
                                                    .map((word, index) => (
                                                        <div key={index}>
                                                            {word}
                                                        </div>
                                                    ))}
                                            </span>
                                        </button>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <SidebarMenu>
                    {footerItems.map((item) => (
                        <SidebarMenuItem key={item.title}>
                            {item.badge && (
                                <span className="absolute -right-1 -top-1 rounded-full bg-pink-500 px-[3px] py-px text-[8px] font-semibold text-white">
                                    {item.badge}
                                </span>
                            )}
                            <SidebarMenuButton
                                className="justify-center space-y-0.5 !px-0 hover:bg-gray-200 data-[active=true]:bg-gray-100 data-[active=true]:text-pink-600 data-[active=true]:hover:bg-pink-100 dark:hover:bg-gray-800 dark:data-[active=true]:bg-gray-900 dark:data-[active=true]:text-pink-400 dark:data-[active=true]:hover:bg-pink-950"
                                isActive={item.active}
                                asChild
                            >
                                <button onClick={item.onClick}>
                                    <item.icon />
                                    <span>{item.title}</span>
                                </button>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
};
