import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TooltipProvider } from '@/components/tooltip/tooltip';
import { ExportGeneratedFilePreview } from '../export-generated-file-preview';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

vi.mock('@/components/toast/use-toast', () => ({
    useToast: () => ({
        toast: vi.fn(),
    }),
}));

vi.mock('@/components/code-snippet/code-snippet', () => ({
    CodeSnippet: ({ code, language }: { code: string; language: string }) => (
        <pre data-testid="code-snippet" data-language={language}>
            {code}
        </pre>
    ),
}));

vi.mock('react-markdown', () => ({
    default: ({ children }: { children: string }) => (
        <div data-testid="markdown-preview">{children}</div>
    ),
}));

vi.mock('remark-gfm', () => ({
    default: vi.fn(),
}));

vi.mock('rehype-raw', () => ({
    default: vi.fn(),
}));

describe('ExportGeneratedFilePreview', () => {
    it('renders a rendered markdown preview for .md files', () => {
        render(
            <TooltipProvider>
                <ExportGeneratedFilePreview
                    file={{
                        path: 'README.md',
                        content: '# Rails 8.1',
                    }}
                    testId="export-file-preview"
                    onClose={vi.fn()}
                />
            </TooltipProvider>
        );

        expect(
            screen.getByTestId('export-file-preview-copy-button')
        ).toBeInTheDocument();
        expect(
            screen.getByTestId('export-file-preview-markdown')
        ).toBeInTheDocument();
        expect(screen.getByTestId('markdown-preview')).toHaveTextContent(
            '# Rails 8.1'
        );
        expect(screen.queryByTestId('code-snippet')).not.toBeInTheDocument();
    });

    it('calls onClose when the close button is clicked', async () => {
        const user = userEvent.setup();
        const onClose = vi.fn();

        render(
            <TooltipProvider>
                <ExportGeneratedFilePreview
                    file={{
                        path: 'app/models/user.rb',
                        content: 'class User < ApplicationRecord; end',
                    }}
                    testId="export-file-preview"
                    onClose={onClose}
                />
            </TooltipProvider>
        );

        await user.click(
            screen.getByTestId('export-file-preview-close-button')
        );
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('renders a syntax-highlighted code preview for source files', () => {
        render(
            <TooltipProvider>
                <ExportGeneratedFilePreview
                    file={{
                        path: 'app/models/user.rb',
                        content: 'class User < ApplicationRecord; end',
                    }}
                    testId="export-file-preview"
                    onClose={vi.fn()}
                />
            </TooltipProvider>
        );

        expect(
            screen.getByTestId('export-file-preview-editor')
        ).toBeInTheDocument();
        expect(screen.getByTestId('code-snippet')).toHaveAttribute(
            'data-language',
            'ruby'
        );
        expect(
            screen.queryByTestId('export-file-preview-markdown')
        ).not.toBeInTheDocument();
    });
});
