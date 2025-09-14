import React, { useState, FC } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CopyIcon, CheckIcon } from './Icons';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeBlockProps {
    inline?: boolean;
    className?: string;
    children: React.ReactNode;
}

const CodeBlock: FC<CodeBlockProps> = ({ inline, className, children }) => {
    const [isCopied, setIsCopied] = useState(false);
    const match = /language-(\w+)/.exec(className || '');
    const codeString = String(children).replace(/\n$/, '');

    const handleCopy = () => {
        navigator.clipboard.writeText(codeString).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }, (err) => {
            console.error('Failed to copy text: ', err);
        });
    };
    
    if (inline) {
        return <code className="bg-brand-surface px-1 py-0.5 rounded-md text-sm text-brand-primary font-mono">{children}</code>;
    }

    const language = match ? match[1] : 'text';

    // Customize the theme to blend with the app's UI
    const customTheme = {
        ...oneDark,
        'pre[class*="language-"]': {
            ...oneDark['pre[class*="language-"]'],
            backgroundColor: 'transparent', // Use container's background
            padding: '1rem',
            margin: '0',
            overflow: 'auto',
        },
        'code[class*="language-"]': {
             ...oneDark['code[class*="language-"]'],
             fontFamily: 'inherit', // Use font-mono from parent
        }
    };

    return (
        <div className="my-3 rounded-lg border border-brand-border font-mono text-sm overflow-hidden bg-brand-bg">
            <div className="flex items-center justify-between px-4 py-2 bg-brand-surface border-b border-brand-border">
                <span className="text-xs font-sans text-brand-text-secondary">{language}</span>
                <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 text-xs text-brand-text-secondary hover:text-brand-text-primary transition-colors"
                    aria-label={isCopied ? 'Copied to clipboard' : 'Copy code to clipboard'}
                >
                    {isCopied ? <CheckIcon className="w-4 h-4 text-green-400" /> : <CopyIcon className="w-4 h-4" />}
                    {isCopied ? 'Copied!' : 'Copy'}
                </button>
            </div>
            <SyntaxHighlighter
                language={language}
                style={customTheme}
            >
                {codeString}
            </SyntaxHighlighter>
        </div>
    );
};

export const MarkdownRenderer: FC<{ content: string }> = ({ content }) => {
    return (
        <div className="markdown-container text-brand-text-primary text-sm leading-relaxed [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    code: CodeBlock,
                    h1: ({node, ...props}) => <h1 className="text-2xl font-bold my-4 border-b border-brand-border pb-2 text-brand-primary" {...props} />,
                    h2: ({node, ...props}) => <h2 className="text-xl font-bold my-4 border-b border-brand-border pb-2 text-brand-primary" {...props} />,
                    h3: ({node, ...props}) => <h3 className="text-lg font-bold my-3 text-brand-primary" {...props} />,
                    p: ({node, ...props}) => <p className="my-3" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc list-inside my-3 pl-4 space-y-1" {...props} />,
                    ol: ({node, ...props}) => <ol className="list-decimal list-inside my-3 pl-4 space-y-1" {...props} />,
                    li: ({node, ...props}) => <li className="" {...props} />,
                    a: ({node, ...props}) => <a className="text-brand-primary hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
                    blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-brand-border pl-4 italic text-brand-text-secondary my-3" {...props} />,
                    table: ({node, ...props}) => <div className="overflow-x-auto my-3"><table className="w-full text-sm border-collapse border border-brand-border" {...props} /></div>,
                    th: ({node, ...props}) => <th className="border border-brand-border px-4 py-2 bg-brand-surface font-semibold text-left" {...props} />,
                    td: ({node, ...props}) => <td className="border border-brand-border px-4 py-2" {...props} />,
                    hr: ({node, ...props}) => <hr className="my-4 border-brand-border" {...props} />,
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
};