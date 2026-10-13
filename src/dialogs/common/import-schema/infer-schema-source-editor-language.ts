import type { CodeSnippetLanguage } from '@/components/code-snippet/code-snippet-language';
import { detectImportFormat } from '@/lib/import/detect-format';
import { hasGenericDdlKeywords } from '@/lib/import/sql-evidence';

const languageFromFileName = (fileName: string): CodeSnippetLanguage => {
    const extension = fileName.split('.').pop()?.toLowerCase();

    switch (extension) {
        case 'json':
            return 'json';
        case 'sql':
            return 'sql';
        case 'dbml':
            return 'dbml';
        default:
            return 'sql';
    }
};

export const inferSchemaSourceEditorLanguage = (
    content: string,
    selectedFileName: string | null
): CodeSnippetLanguage => {
    const trimmed = content.trim();

    if (trimmed.length > 0) {
        const { format } = detectImportFormat(content);

        switch (format) {
            case 'dbml':
                return 'dbml';
            case 'metadata_json':
            case 'diagram_json':
                return 'json';
            case 'sql':
            case 'postgres_dump':
                return 'sql';
            default:
                return hasGenericDdlKeywords(content) ? 'sql' : 'plaintext';
        }
    }

    if (selectedFileName) {
        return languageFromFileName(selectedFileName);
    }

    return 'plaintext';
};
