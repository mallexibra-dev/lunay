'use client';

import path from 'node:path';
import { useRef, useState, type ReactNode } from 'react';
import { Check, Copy } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';

const resolveImageUrl = (raw: string, mediaBase: string) => {
  if (
    !raw ||
    raw.startsWith('/') ||
    raw.startsWith('http://') ||
    raw.startsWith('https://') ||
    raw.startsWith('data:')
  ) {
    return raw;
  }
  const resolved = path.posix.normalize(path.posix.join(mediaBase, raw));
  return resolved.startsWith(`${mediaBase}/`) ? resolved : raw;
};

const CodeBlock = ({ children }: { children?: ReactNode }) => {
  const preRef = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const text = preRef.current?.innerText ?? '';
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className='group relative my-6'>
      <pre
        ref={preRef}
        className='no-scrollbar overflow-x-auto rounded-xl border-2 bg-muted px-4 py-3.5 pr-12 text-foreground'
      >
        {children}
      </pre>
      <button
        type='button'
        onClick={handleCopy}
        aria-label={copied ? 'Kode tersalin' : 'Salin kode'}
        title={copied ? 'Tersalin' : 'Salin kode'}
        className='absolute top-2 right-2 inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition hover:text-foreground'
      >
        {copied ? (
          <Check className='size-3.5' />
        ) : (
          <Copy className='size-3.5' />
        )}
      </button>
    </div>
  );
};

export const MarkdownRenderer = ({
  content,
  mediaBase,
}: {
  content: string;
  mediaBase: string;
}) => {
  return (
    <div className='docs-prose text-[15px] leading-7 text-muted-foreground'>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSlug]}
        components={{
          h1: ({ children, id }) => (
            <h1
              id={id}
              className='mb-4 scroll-mt-24 text-2xl font-semibold tracking-tight text-foreground'
            >
              {children}
            </h1>
          ),
          h2: ({ children, id }) => (
            <h2
              id={id}
              className='mt-10 mb-3 scroll-mt-24 border-b border-border pb-2 text-xl font-semibold tracking-tight text-foreground first:mt-0'
            >
              {children}
            </h2>
          ),
          h3: ({ children, id }) => (
            <h3
              id={id}
              className='mt-8 mb-2 scroll-mt-24 text-lg font-semibold tracking-tight text-foreground'
            >
              {children}
            </h3>
          ),
          p: ({ children }) => <p className='mb-4 last:mb-0'>{children}</p>,
          ul: ({ children }) => (
            <ul className='mb-5 list-disc space-y-2 pl-5 marker:text-primary'>
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className='mb-5 list-decimal space-y-2 pl-5 marker:font-semibold marker:text-primary'>
              {children}
            </ol>
          ),
          li: ({ children, className }) => (
            <li
              className={
                className?.includes('task-list-item')
                  ? 'list-none pl-0 text-muted-foreground'
                  : 'pl-1 text-muted-foreground'
              }
            >
              {children}
            </li>
          ),
          input: ({ node: _node, ...props }) =>
            props.type === 'checkbox' ? (
              <input
                {...props}
                disabled
                className='mt-1 mr-2 size-3.5 rounded accent-primary'
              />
            ) : (
              <input {...props} />
            ),
          strong: ({ children }) => (
            <strong className='font-semibold text-foreground'>
              {children}
            </strong>
          ),
          em: ({ children }) => <em className='italic'>{children}</em>,
          hr: () => <hr className='my-8 border-border' />,
          blockquote: ({ children }) => (
            <blockquote className='my-6 rounded-r-lg border-l-4 border-primary bg-primary/5 px-4 py-3 text-foreground/80 not-italic dark:bg-primary/10'>
              {children}
            </blockquote>
          ),
          a: ({ href, children }) => {
            const external =
              typeof href === 'string' && href.startsWith('http');
            return (
              <a
                href={href}
                target={external ? '_blank' : undefined}
                rel={external ? 'noreferrer' : undefined}
                className='font-medium text-primary underline decoration-primary/30 underline-offset-3 transition hover:decoration-primary'
              >
                {children}
              </a>
            );
          },
          img: ({ src, alt, title }) => {
            const raw = typeof src === 'string' ? src : '';
            return (
              <img
                src={resolveImageUrl(raw, mediaBase)}
                alt={alt ?? ''}
                title={title}
                loading='lazy'
                className='my-6 rounded-xl border-2 border-border bg-muted/50 shadow-sm'
              />
            );
          },
          code: ({ className, children }) => {
            const isBlock = Boolean(className);
            if (isBlock) {
              return (
                <code className={`${className ?? ''} text-[13px] leading-6`}>
                  {children}
                </code>
              );
            }
            return (
              <code className='rounded-md border border-border bg-muted px-1.5 py-0.5 font-mono text-[13px] text-primary'>
                {children}
              </code>
            );
          },
          pre: ({ children }) => <CodeBlock>{children}</CodeBlock>,
          table: ({ children }) => (
            <div className='my-6 no-scrollbar overflow-x-auto rounded-xl border-2 border-border'>
              <table className='w-full border-collapse text-sm'>
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className='bg-muted/50 text-left text-foreground'>
              {children}
            </thead>
          ),
          th: ({ children }) => (
            <th className='border-b border-border px-3.5 py-2.5 font-semibold'>
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className='border-b border-border px-3.5 py-2.5 text-muted-foreground'>
              {children}
            </td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
