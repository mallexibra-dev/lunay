'use client';

import path from 'node:path';
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

export const MarkdownRenderer = ({
  content,
  mediaBase,
}: {
  content: string;
  mediaBase: string;
}) => {
  return (
    <div className="docs-prose text-[15px] leading-7 text-slate-600">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSlug]}
        components={{
          h1: ({ children, id }) => (
            <h1
              id={id}
              className="mb-4 scroll-mt-24 text-2xl font-semibold tracking-tight text-slate-900"
            >
              {children}
            </h1>
          ),
          h2: ({ children, id }) => (
            <h2
              id={id}
              className="mt-10 mb-3 scroll-mt-24 border-b border-slate-100 pb-2 text-xl font-semibold tracking-tight text-slate-900 first:mt-0"
            >
              {children}
            </h2>
          ),
          h3: ({ children, id }) => (
            <h3
              id={id}
              className="mt-8 mb-2 scroll-mt-24 text-lg font-semibold tracking-tight text-slate-900"
            >
              {children}
            </h3>
          ),
          p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
          ul: ({ children }) => (
            <ul className="mb-5 list-disc space-y-2 pl-5 marker:text-primary">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-5 list-decimal space-y-2 pl-5 marker:font-semibold marker:text-primary">
              {children}
            </ol>
          ),
          li: ({ children, className }) => (
            <li
              className={
                className?.includes('task-list-item')
                  ? 'list-none pl-0 text-slate-600'
                  : 'pl-1 text-slate-600'
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
                className="mr-2 mt-1 size-3.5 rounded border-slate-300 accent-primary"
              />
            ) : (
              <input {...props} />
            ),
          strong: ({ children }) => <strong className="font-semibold text-slate-900">{children}</strong>,
          em: ({ children }) => <em className="italic text-slate-700">{children}</em>,
          hr: () => <hr className="my-8 border-slate-200" />,
          blockquote: ({ children }) => (
            <blockquote className="my-6 rounded-r-lg border-l-4 border-primary bg-primary/5 px-4 py-3 text-slate-700 not-italic">
              {children}
            </blockquote>
          ),
          a: ({ href, children }) => {
            const external = typeof href === 'string' && href.startsWith('http');
            return (
              <a
                href={href}
                target={external ? '_blank' : undefined}
                rel={external ? 'noreferrer' : undefined}
                className="font-medium text-primary underline decoration-primary/30 underline-offset-3 transition hover:decoration-primary"
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
                loading="lazy"
                className="my-6 rounded-xl border border-slate-200 bg-slate-50 shadow-sm"
              />
            );
          },
          code: ({ className, children }) => {
            const isBlock = Boolean(className);
            if (isBlock) {
              return <code className={`${className ?? ''} text-[13px] leading-6`}>{children}</code>;
            }
            return (
              <code className="rounded-md border border-slate-200 bg-slate-100 px-1.5 py-0.5 font-mono text-[13px] text-primary">
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="my-6 overflow-x-auto rounded-xl border border-slate-800 bg-slate-900 px-4 py-3.5 text-slate-100">
              {children}
            </pre>
          ),
          table: ({ children }) => (
            <div className="my-6 overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full border-collapse text-sm">{children}</table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-slate-50 text-left text-slate-700">{children}</thead>
          ),
          th: ({ children }) => (
            <th className="border-b border-slate-200 px-3.5 py-2.5 font-semibold">{children}</th>
          ),
          td: ({ children }) => (
            <td className="border-b border-slate-100 px-3.5 py-2.5 text-slate-600">{children}</td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
