'use client'

import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Components } from 'react-markdown'

interface MarkdownViewerProps {
  content: string
  className?: string
}

const components: Components = {
  h1: ({ children }) => (
    <h1 className="text-2xl font-bold text-gray-900 mt-6 mb-3 first:mt-0">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-xl font-semibold text-gray-900 mt-5 mb-2 first:mt-0">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2 first:mt-0">
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 className="text-base font-semibold text-gray-800 mt-3 mb-1 first:mt-0">
      {children}
    </h4>
  ),
  p: ({ children }) => (
    <p className="text-gray-700 text-sm leading-relaxed mb-3 last:mb-0">
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul className="list-disc list-inside text-gray-700 text-sm space-y-1 mb-3 pl-2">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-inside text-gray-700 text-sm space-y-1 mb-3 pl-2">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-blue-400 pl-4 py-1 my-3 text-gray-600 text-sm bg-blue-50 rounded-r-md">
      {children}
    </blockquote>
  ),
  code: ({ className, children, ...props }) => {
    const isBlock = className?.startsWith('language-')
    if (isBlock) {
      return (
        <code
          className={`block bg-gray-900 text-gray-100 text-xs rounded-lg p-4 overflow-x-auto font-mono leading-relaxed ${className ?? ''}`}
          {...props}
        >
          {children}
        </code>
      )
    }
    return (
      <code
        className="bg-gray-100 text-red-600 text-xs rounded px-1.5 py-0.5 font-mono"
        {...props}
      >
        {children}
      </code>
    )
  },
  pre: ({ children }) => <pre className="mb-3 last:mb-0">{children}</pre>,
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 hover:text-blue-800 underline underline-offset-2 transition-colors"
    >
      {children}
    </a>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-gray-900">{children}</strong>
  ),
  em: ({ children }) => <em className="italic text-gray-700">{children}</em>,
  del: ({ children }) => (
    <del className="line-through text-gray-400">{children}</del>
  ),
  hr: () => <hr className="border-gray-200 my-4" />,
  img: ({ src, alt }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt ?? ''}
      className="max-w-full rounded-md my-2"
    />
  ),
  table: ({ children }) => (
    <div className="overflow-x-auto mb-3">
      <table className="min-w-full text-sm border-collapse border border-gray-200 rounded-lg overflow-hidden">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-gray-50">{children}</thead>
  ),
  tbody: ({ children }) => (
    <tbody className="divide-y divide-gray-200">{children}</tbody>
  ),
  tr: ({ children }) => <tr className="hover:bg-gray-50">{children}</tr>,
  th: ({ children }) => (
    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border border-gray-200">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-3 py-2 text-gray-700 border border-gray-200">
      {children}
    </td>
  ),
  input: ({ checked, ...props }) => (
    <input
      type="checkbox"
      checked={checked}
      readOnly
      className="mr-1.5 accent-blue-600"
      {...props}
    />
  ),
}

export default function MarkdownViewer({
  content,
  className = '',
}: MarkdownViewerProps) {
  return (
    <div className={`markdown-viewer ${className}`}>
      <Markdown remarkPlugins={[remarkGfm]} skipHtml components={components}>
        {content}
      </Markdown>
    </div>
  )
}
