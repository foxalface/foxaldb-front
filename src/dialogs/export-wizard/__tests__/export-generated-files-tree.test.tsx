import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExportGeneratedFilesTree } from '../export-generated-files-tree';

vi.mock('@/components/code-snippet/code-snippet', () => ({
    CodeSnippet: ({ code }: { code: string }) => (
        <pre data-testid="code-snippet">{code}</pre>
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

const sampleFiles = [
    { path: 'README.md', content: '# Rails 8.1' },
    {
        path: 'app/models/user.rb',
        content: 'class User < ApplicationRecord; end',
    },
    {
        path: 'db/schema.rb',
        content: 'ActiveRecord::Schema[8.1].define {}',
    },
];

describe('ExportGeneratedFilesTree', () => {
    it('renders files in a tree and previews a selected file', async () => {
        const user = userEvent.setup();

        render(
            <ExportGeneratedFilesTree
                files={sampleFiles}
                testId="export-file-list"
                previewTestId="export-file-preview"
            />
        );

        expect(screen.getByTestId('export-file-list')).toHaveTextContent(
            'README.md'
        );
        expect(
            screen.queryByTestId('export-file-preview')
        ).not.toBeInTheDocument();

        await user.click(screen.getByText('user.rb'));

        expect(screen.getByTestId('export-file-preview')).toBeInTheDocument();
        expect(
            screen.getByTestId('export-file-preview-path')
        ).toHaveTextContent('app/models/user.rb');
        expect(screen.getByTestId('code-snippet')).toHaveTextContent(
            'class User < ApplicationRecord; end'
        );
    });

    it('toggles folder expansion when clicking a folder row', async () => {
        const user = userEvent.setup();

        render(
            <ExportGeneratedFilesTree
                files={sampleFiles}
                testId="export-file-list"
                previewTestId="export-file-preview"
            />
        );

        const fileList = screen.getByTestId('export-file-list');
        expect(fileList).toHaveTextContent('user.rb');

        await user.click(within(fileList).getByText('app'));
        await waitFor(() => {
            expect(fileList).not.toHaveTextContent('user.rb');
        });

        await user.click(within(fileList).getByText('app'));
        await waitFor(() => {
            expect(fileList).toHaveTextContent('user.rb');
        });
    });

    it('renders markdown preview for README files', async () => {
        const user = userEvent.setup();

        render(
            <ExportGeneratedFilesTree
                files={sampleFiles}
                testId="export-file-list"
                previewTestId="export-file-preview"
            />
        );

        await user.click(screen.getByText('README.md'));

        expect(
            screen.getByTestId('export-file-preview-markdown')
        ).toBeInTheDocument();
        expect(screen.getByTestId('markdown-preview')).toHaveTextContent(
            '# Rails 8.1'
        );
    });

    it('closes preview when the close button is clicked', async () => {
        const user = userEvent.setup();

        render(
            <ExportGeneratedFilesTree
                files={sampleFiles}
                testId="export-file-list"
                previewTestId="export-file-preview"
            />
        );

        await user.click(screen.getByText('user.rb'));
        expect(screen.getByTestId('export-file-preview')).toBeInTheDocument();

        await user.click(
            screen.getByTestId('export-file-preview-close-button')
        );
        expect(
            screen.queryByTestId('export-file-preview')
        ).not.toBeInTheDocument();
    });

    it('toggles preview off when clicking the same file again', async () => {
        const user = userEvent.setup();

        render(
            <ExportGeneratedFilesTree
                files={sampleFiles}
                testId="export-file-list"
                previewTestId="export-file-preview"
            />
        );

        await user.click(screen.getByText('user.rb'));
        expect(screen.getByTestId('export-file-preview')).toBeInTheDocument();

        await user.click(screen.getByText('user.rb'));
        expect(
            screen.queryByTestId('export-file-preview')
        ).not.toBeInTheDocument();
    });
});
