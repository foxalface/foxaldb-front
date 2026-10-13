import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { TooltipProvider } from '@/components/tooltip/tooltip';
import type { CodeSnippetProps } from '@/components/code-snippet/code-snippet';
import { diagramJsonSample } from '@/lib/import/__tests__/fixtures/import-samples';
import { WizardSchemaSourceField } from '../wizard-schema-source-field';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, options?: Record<string, string>) => {
            if (key === 'new_diagram_dialog.import_schema.selected_file') {
                return `Selected file: ${options?.name ?? ''}`;
            }
            return key;
        },
    }),
}));

vi.mock('@/hooks/use-upload-capabilities', () => ({
    useUploadCapabilities: () => ({ capabilities: null }),
}));

vi.mock('@/components/code-snippet/code-snippet', () => ({
    CodeSnippet: ({ code, language, editorProps }: CodeSnippetProps) => (
        <textarea
            data-testid="schema-source-code-editor"
            data-language={language}
            aria-label={editorProps?.options?.ariaLabel}
            value={code}
            onChange={(event) => {
                editorProps?.onChange?.(event.target.value, undefined);
            }}
            onFocus={() => {
                editorProps?.onMount?.(
                    {
                        onDidFocusEditorText: (listener: () => void) => {
                            listener();
                            return { dispose: () => undefined };
                        },
                        onDidBlurEditorText: () => ({
                            dispose: () => undefined,
                        }),
                    } as never,
                    {} as never
                );
            }}
        />
    ),
}));

const renderField = (
    props: React.ComponentProps<typeof WizardSchemaSourceField>
) =>
    render(
        <TooltipProvider>
            <WizardSchemaSourceField {...props} />
        </TooltipProvider>
    );

const defaultProps = {
    label: 'Schema content',
    placeholder: 'Paste here…',
    value: '',
    onValueChange: vi.fn(),
    selectedFileName: null,
    onFileSelected: vi.fn(),
    chooseFileAriaLabel: 'Choose a file or project',
    changeFileAriaLabel: 'Change file, currently schema.sql',
    privacyContext: 'import' as const,
};

describe('WizardSchemaSourceField', () => {
    it('renders code editor and upload control', () => {
        renderField(defaultProps);

        expect(
            screen.getByTestId('schema-source-code-editor')
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'Choose a file or project' })
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', {
                name: 'new_diagram_dialog.import_schema.privacy_info.link_label',
            })
        ).toBeInTheDocument();
    });

    it('shows upload watermark when empty', () => {
        renderField(defaultProps);

        expect(screen.getByText('Paste here…')).toBeInTheDocument();
    });

    it('forwards file selection from the hidden input', async () => {
        const onFileSelected = vi.fn();
        const user = userEvent.setup();
        const { container } = renderField({
            ...defaultProps,
            onFileSelected,
        });

        const file = new File(['CREATE TABLE t (id INT);'], 'schema.sql', {
            type: 'text/plain',
        });
        const fileInput = container.querySelector('input[type="file"]');

        expect(fileInput).not.toBeNull();
        await user.upload(fileInput as HTMLInputElement, file);

        expect(onFileSelected).toHaveBeenCalledWith(file);
    });

    it('forwards the first dropped file', () => {
        const onFileSelected = vi.fn();
        const { getByTestId } = renderField({
            ...defaultProps,
            onFileSelected,
        });

        const dropZone = getByTestId('wizard-schema-source-editor');

        const file = new File(['SELECT 1;'], 'drop.sql', {
            type: 'text/plain',
        });

        fireEvent.dragEnter(dropZone, {
            dataTransfer: { types: ['Files'], files: [file] },
        });
        fireEvent.drop(dropZone, {
            dataTransfer: { files: [file] },
        });

        expect(onFileSelected).toHaveBeenCalledWith(file);
    });

    it('shows a file-loaded watermark when the editor is empty', () => {
        renderField({
            ...defaultProps,
            selectedFileName: 'project.zip',
            changeFileAriaLabel: 'Change file, currently project.zip',
        });

        expect(
            screen.getByTestId('wizard-schema-file-loaded-watermark')
        ).toBeInTheDocument();
        expect(
            screen.getByTestId('wizard-schema-file-loaded-watermark')
        ).toHaveTextContent('project.zip');
        expect(
            screen.getByRole('button', {
                name: 'Change file, currently project.zip',
            })
        ).toBeInTheDocument();
    });

    it('shows the selected file name below the field when content is present', () => {
        renderField({
            ...defaultProps,
            value: 'Table users { id int [pk] }',
            selectedFileName: 'schema.dbml',
            changeFileAriaLabel: 'Change file, currently schema.dbml',
        });

        expect(
            screen.queryByTestId('wizard-schema-file-loaded-watermark')
        ).not.toBeInTheDocument();
        expect(
            screen.getByText('Selected file: schema.dbml')
        ).toBeInTheDocument();
    });

    it('updates editor language from content', () => {
        const { rerender } = renderField({
            ...defaultProps,
            value: 'Table users { id int [pk] }',
        });

        expect(screen.getByTestId('schema-source-code-editor')).toHaveAttribute(
            'data-language',
            'dbml'
        );

        rerender(
            <TooltipProvider>
                <WizardSchemaSourceField
                    {...defaultProps}
                    value={diagramJsonSample}
                />
            </TooltipProvider>
        );

        expect(screen.getByTestId('schema-source-code-editor')).toHaveAttribute(
            'data-language',
            'json'
        );
    });
});
