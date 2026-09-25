import type { CodeSnippetLanguage } from '@/components/code-snippet/code-snippet-language';

export const isMarkdownExportFile = (filePath: string): boolean => {
    const extension = filePath.split('.').pop()?.toLowerCase();

    return extension === 'md' || extension === 'markdown';
};

export const inferExportFileLanguage = (
    filePath: string
): CodeSnippetLanguage => {
    const extension = filePath.split('.').pop()?.toLowerCase();

    switch (extension) {
        case 'json':
            return 'json';
        case 'sql':
            return 'sql';
        case 'prisma':
            return 'prisma';
        case 'dbml':
            return 'dbml';
        case 'sh':
        case 'bash':
            return 'shell';
        case 'rb':
            return 'ruby';
        case 'py':
            return 'python';
        case 'cs':
            return 'csharp';
        case 'ts':
        case 'tsx':
            return 'typescript';
        case 'js':
        case 'jsx':
            return 'javascript';
        case 'xml':
        case 'csproj':
        case 'sln':
            return 'xml';
        case 'yaml':
        case 'yml':
            return 'yaml';
        default:
            return 'plaintext';
    }
};
