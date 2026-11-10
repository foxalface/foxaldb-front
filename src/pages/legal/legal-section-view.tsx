import React from 'react';
import { Link } from 'react-router-dom';
import type {
    LegalBlock,
    LegalInline,
    LegalSection,
} from '@/lib/legal/legal-document';

const linkClass =
    'rounded-sm underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

const Inline: React.FC<{ part: LegalInline }> = ({ part }) => {
    if (part.kind === 'internal') {
        return (
            <Link className={linkClass} to={part.href}>
                {part.label}
            </Link>
        );
    }

    if (part.kind === 'external') {
        return (
            <a
                className={linkClass}
                href={part.href}
                rel="noopener noreferrer license"
                target="_blank"
            >
                {part.label}
            </a>
        );
    }

    return <>{part.text}</>;
};

const Block: React.FC<{ block: LegalBlock }> = ({ block }) => {
    if (block.kind === 'list') {
        return (
            <ul className="list-disc space-y-1 pl-5">
                {block.items.map((item, index) => (
                    <li key={index}>
                        {item.map((part, partIndex) => (
                            <Inline key={partIndex} part={part} />
                        ))}
                    </li>
                ))}
            </ul>
        );
    }

    return (
        <p>
            {block.parts.map((part, index) => (
                <Inline key={index} part={part} />
            ))}
        </p>
    );
};

export const LegalSectionView: React.FC<{
    section: LegalSection;
    headingLevel: 2 | 3;
}> = ({ section, headingLevel }) => {
    const Heading = headingLevel === 2 ? 'h2' : 'h3';
    const headingClass =
        headingLevel === 2
            ? 'text-xl font-semibold tracking-tight'
            : 'text-base font-semibold';

    return (
        <section className="flex flex-col gap-3" id={section.id}>
            <Heading className={headingClass}>{section.title}</Heading>
            {section.blocks.map((block, index) => (
                <Block key={index} block={block} />
            ))}
            {section.subsections?.map((child) => (
                <LegalSectionView
                    key={child.id}
                    headingLevel={3}
                    section={child}
                />
            ))}
        </section>
    );
};
