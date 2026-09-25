import React from 'react';
import type { Components } from 'react-markdown';

export const exportMarkdownPreviewComponents: Components = {
    h1: (props) => (
        <h1 className="mb-1.5 mt-2 text-base font-bold first:mt-0" {...props} />
    ),
    h2: (props) => (
        <h2 className="mb-1 mt-2 text-[15px] font-bold first:mt-0" {...props} />
    ),
    h3: (props) => (
        <h3 className="mb-1 mt-1.5 text-sm font-bold first:mt-0" {...props} />
    ),
    h4: (props) => (
        <h4
            className="mb-0.5 mt-1.5 text-sm font-semibold first:mt-0"
            {...props}
        />
    ),
    h5: (props) => (
        <h5
            className="mb-0.5 mt-1.5 text-sm font-semibold first:mt-0"
            {...props}
        />
    ),
    h6: (props) => (
        <h6
            className="mb-0.5 mt-1.5 text-sm font-medium first:mt-0"
            {...props}
        />
    ),
    pre: (props) => (
        <pre
            className="my-1.5 overflow-auto rounded bg-black/5 p-1.5 first:mt-0 dark:bg-white/10"
            {...props}
        />
    ),
    code: (props) => {
        const { className } = props;
        const isInline = !className;

        return isInline ? (
            <code
                className="rounded bg-black/10 px-1 py-0.5 font-mono text-xs dark:bg-white/15"
                {...props}
            />
        ) : (
            <code className="font-mono text-xs" {...props} />
        );
    },
    a: (props) => (
        <a
            className="font-medium text-blue-600 underline decoration-blue-600/50 hover:decoration-blue-600 dark:text-blue-400 dark:decoration-blue-400/50 dark:hover:decoration-blue-400"
            {...props}
        />
    ),
    ul: (props) => (
        <ul className="my-1 list-disc space-y-0.5 pl-5 first:mt-0" {...props} />
    ),
    ol: (props) => (
        <ol
            className="my-1 list-decimal space-y-0.5 pl-5 first:mt-0"
            {...props}
        />
    ),
    li: (props) => <li className="pl-0.5" {...props} />,
    p: (props) => <p className="my-1 first:mt-0" {...props} />,
    blockquote: (props) => (
        <blockquote
            className="my-1.5 border-l-2 border-gray-400 pl-2 italic text-gray-600 first:mt-0 dark:border-gray-500 dark:text-gray-400"
            {...props}
        />
    ),
    hr: (props) => (
        <hr
            className="my-2 border-gray-300 first:mt-0 dark:border-gray-600"
            {...props}
        />
    ),
    table: (props) => (
        <div className="my-1.5 overflow-auto first:mt-0">
            <table className="min-w-full border-collapse text-xs" {...props} />
        </div>
    ),
    thead: (props) => (
        <thead className="bg-black/5 dark:bg-white/5" {...props} />
    ),
    th: (props) => (
        <th
            className="border border-gray-300 px-2 py-1 text-left font-semibold dark:border-gray-600"
            {...props}
        />
    ),
    td: (props) => (
        <td
            className="border border-gray-300 px-2 py-1 dark:border-gray-600"
            {...props}
        />
    ),
    strong: (props) => <strong className="font-semibold" {...props} />,
    em: (props) => <em className="italic" {...props} />,
};
