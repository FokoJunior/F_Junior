"use client"

import Link from "next/link"
import ReactMarkdown, { type Components } from "react-markdown"
import remarkGfm from "remark-gfm"

// Rendu soigné des réponses de l'assistant. Le HTML brut n'est pas interprété (pas d'injection).
const components: Components = {
  p: ({ children }) => <p className="my-2 first:mt-0 last:mb-0">{children}</p>,
  h1: ({ children }) => <p className="mb-1.5 mt-3 font-serif text-lg leading-snug first:mt-0">{children}</p>,
  h2: ({ children }) => <p className="mb-1.5 mt-3 font-serif text-lg leading-snug first:mt-0">{children}</p>,
  h3: ({ children }) => (
    <p className="mb-1.5 mt-3 font-mono text-[0.68rem] uppercase tracking-[0.12em] text-muted-foreground first:mt-0">
      {children}
    </p>
  ),
  strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  ul: ({ children }) => <ul className="my-2 space-y-1.5">{children}</ul>,
  ol: ({ children }) => <ol className="my-2 list-none space-y-1.5 [counter-reset:item]">{children}</ol>,
  li: ({ children, node }) => {
    const ordered = (node as any)?.parent?.tagName === "ol"
    return (
      <li
        className={
          ordered
            ? "relative pl-6 [counter-increment:item] before:absolute before:left-0 before:font-mono before:text-[0.7rem] before:leading-[1.6rem] before:text-primary before:content-[counter(item,decimal-leading-zero)]"
            : "relative pl-4 before:absolute before:left-0 before:top-[0.7em] before:h-px before:w-2 before:bg-primary"
        }
      >
        {children}
      </li>
    )
  },
  a: ({ href = "", children }) => {
    const cls = "font-medium text-primary underline decoration-primary/30 underline-offset-2 hover:decoration-primary"
    if (href.startsWith("/")) {
      return (
        <Link href={href} className={cls}>
          {children}
        </Link>
      )
    }
    return (
      <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className={cls}>
        {children}
      </a>
    )
  },
  code: ({ children }) => (
    <code className="rounded bg-background/70 px-1 py-0.5 font-mono text-[0.8em]">{children}</code>
  ),
  pre: ({ children }) => (
    <pre className="my-2 overflow-x-auto rounded-md bg-foreground p-3 text-[0.75rem] text-background [&_code]:bg-transparent [&_code]:p-0">
      {children}
    </pre>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-2 border-l-2 border-primary pl-3 text-muted-foreground">{children}</blockquote>
  ),
  hr: () => <hr className="my-3 border-border" />,
  table: ({ children }) => (
    <div className="my-2 overflow-x-auto">
      <table className="w-full border-collapse text-xs">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border-b border-foreground/30 px-2 py-1.5 text-left font-mono text-[0.65rem] uppercase tracking-wider">
      {children}
    </th>
  ),
  td: ({ children }) => <td className="border-b border-border px-2 py-1.5 align-top">{children}</td>,
}

export default function ChatMarkdown({ children }: { children: string }) {
  return (
    <div className="text-sm leading-relaxed">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  )
}
