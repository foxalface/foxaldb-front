import React from 'react';
import type { RouteObject } from 'react-router-dom';
import { createBrowserRouter } from 'react-router-dom';
import type { TemplatePageLoaderData } from './pages/template-page/template-page';
import type { TemplatesPageLoaderData } from './pages/templates-page/templates-page';

const loadTemplatesAndAllTags = async (options?: {
    featured?: boolean;
    tag?: string;
}) => {
    const { getTemplatesAndAllTags } =
        await import('./templates-data/template-utils');
    return getTemplatesAndAllTags(options);
};

export const routes: RouteObject[] = [
    {
        // One editor instance for `/` and `/diagrams/:diagramId` so leaving an
        // online diagram for `/` does not remount the editor or restart the
        // guest auth gate.
        path: '/',
        children: [{ index: true }, { path: 'diagrams/:diagramId' }],
        async lazy() {
            const { EditorPage } =
                await import('./pages/editor-page/editor-page');

            return {
                element: <EditorPage />,
            };
        },
    },
    {
        path: 'login',
        async lazy() {
            const { LoginPage } = await import('./pages/auth/login-page');
            return {
                element: <LoginPage />,
            };
        },
    },
    {
        path: 'verify-email',
        async lazy() {
            const { VerifyEmailPage } =
                await import('./pages/auth/verify-email-page');
            return {
                element: <VerifyEmailPage />,
            };
        },
    },
    {
        path: 'forgot-password',
        async lazy() {
            const { ForgotPasswordPage } =
                await import('./pages/auth/forgot-password-page');
            return {
                element: <ForgotPasswordPage />,
            };
        },
    },
    {
        path: 'restore-account',
        async lazy() {
            const { RestoreAccountPage } =
                await import('./pages/auth/restore-account-page');
            return {
                element: <RestoreAccountPage />,
            };
        },
    },
    {
        path: 'reset-password',
        async lazy() {
            const { ResetPasswordPage } =
                await import('./pages/auth/reset-password-page');
            return {
                element: <ResetPasswordPage />,
            };
        },
    },
    {
        path: 'invitations/:token',
        async lazy() {
            const { InvitationPage } =
                await import('./pages/invitation-page/invitation-page');
            return {
                element: <InvitationPage />,
            };
        },
    },
    {
        path: 'register',
        async lazy() {
            const { RegisterPage } = await import('./pages/auth/register-page');
            return {
                element: <RegisterPage />,
            };
        },
    },
    {
        path: 'legal',
        async lazy() {
            const { LegalPage } = await import('./pages/legal/legal-page');
            return {
                element: <LegalPage documentId="notice" />,
            };
        },
    },
    {
        path: 'privacy',
        async lazy() {
            const { LegalPage } = await import('./pages/legal/legal-page');
            return {
                element: <LegalPage documentId="privacy" />,
            };
        },
    },
    {
        path: 'terms',
        async lazy() {
            const { LegalPage } = await import('./pages/legal/legal-page');
            return {
                element: <LegalPage documentId="terms" />,
            };
        },
    },
    {
        id: 'templates',
        path: 'templates',
        async lazy() {
            const { TemplatesPage } =
                await import('./pages/templates-page/templates-page');
            return {
                element: <TemplatesPage />,
            };
        },

        loader: async (): Promise<TemplatesPageLoaderData> => {
            const { tags, templates } = await loadTemplatesAndAllTags();

            return {
                allTags: tags,
                templates,
            };
        },
    },
    {
        id: 'templates_featured',
        path: 'templates/featured',
        async lazy() {
            const { TemplatesPage } =
                await import('./pages/templates-page/templates-page');
            return {
                element: <TemplatesPage />,
            };
        },
        loader: async (): Promise<TemplatesPageLoaderData> => {
            const { tags, templates } = await loadTemplatesAndAllTags({
                featured: true,
            });

            return {
                allTags: tags,
                templates,
            };
        },
    },
    {
        id: 'templates_tags',
        path: 'templates/tags/:tag',
        async lazy() {
            const { TemplatesPage } =
                await import('./pages/templates-page/templates-page');
            return {
                element: <TemplatesPage />,
            };
        },
        loader: async ({ params }): Promise<TemplatesPageLoaderData> => {
            const { tags, templates } = await loadTemplatesAndAllTags({
                tag: params.tag?.replace(/-/g, ' '),
            });

            return {
                allTags: tags,
                templates,
            };
        },
    },
    {
        id: 'templates_templateSlug',
        path: 'templates/:templateSlug',
        async lazy() {
            const { TemplatePage } =
                await import('./pages/template-page/template-page');
            return {
                element: <TemplatePage />,
            };
        },
        loader: async ({ params }): Promise<TemplatePageLoaderData> => {
            const { templates } =
                await import('./templates-data/templates-data');
            return {
                template: templates.find(
                    (template) => template.slug === params.templateSlug
                ),
            };
        },
    },
    {
        id: 'templates_load',
        path: 'templates/clone/:templateSlug',
        async lazy() {
            const { CloneTemplatePage } =
                await import('./pages/clone-template-page/clone-template-page');
            return {
                element: <CloneTemplatePage />,
            };
        },
        loader: async ({ params }) => {
            const { templates } =
                await import('./templates-data/templates-data');
            return {
                template: templates.find(
                    (template) => template.slug === params.templateSlug
                ),
            };
        },
    },
    {
        path: '*',
        async lazy() {
            const { NotFoundPage } =
                await import('./pages/not-found-page/not-found-page');
            return {
                element: <NotFoundPage />,
            };
        },
    },
];

export const router = createBrowserRouter(routes);
