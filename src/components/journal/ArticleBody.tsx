/**
 * Renders a Markdown article body.
 *
 * We use a lightweight server-side approach: split the Markdown into
 * paragraphs and render them directly. For richer Markdown (headings,
 * lists, links, code blocks) swap this for `next-mdx-remote` or
 * `react-markdown`.
 *
 * This component is intentionally a Server Component — no 'use client'
 * directive, so it contributes zero JS to the client bundle.
 */

interface Props {
  content: string
}

export default function ArticleBody({ content }: Props) {
  if (!content) return null

  // Split on double newlines to get paragraphs
  // This handles plain-prose Markdown well enough for the journal
  const paragraphs = content
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean)

  return (
    <div className="space-y-5">
      {paragraphs.map((paragraph, i) => {
        // Heading 2
        if (paragraph.startsWith('## ')) {
          return (
            <h2
              key={i}
              className="font-display font-black text-3xl uppercase tracking-tight leading-tight text-ink mt-8 mb-2"
            >
              {paragraph.slice(3)}
            </h2>
          )
        }

        // Heading 3
        if (paragraph.startsWith('### ')) {
          return (
            <h3
              key={i}
              className="font-tag font-bold text-sm tracking-[0.2em] uppercase text-ink/45 mt-6 mb-1 pb-2 border-b border-dashed border-ink"
            >
              {paragraph.slice(4)}
            </h3>
          )
        }

        // Blockquote
        if (paragraph.startsWith('> ')) {
          return (
            <blockquote
              key={i}
              className="border-l-4 border-stamp pl-4 italic font-mono text-[18px] text-ink/70 leading-[1.75]"
            >
              {paragraph.slice(2)}
            </blockquote>
          )
        }

        // Regular paragraph
        return (
          <p
            key={i}
            className="font-mono text-[18px] text-ink leading-[1.85] opacity-85"
          >
            {paragraph}
          </p>
        )
      })}
    </div>
  )
}
