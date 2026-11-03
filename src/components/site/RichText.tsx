import type { SerializedEditorState, SerializedLexicalNode } from '@payloadcms/richtext-lexical/lexical'
import { type JSXConvertersFunction, RichText as LexicalRichText } from '@payloadcms/richtext-lexical/react'
import React from 'react'

import { slugify } from '@/utilities/slugify'
import { cn } from '@/utilities/ui'

type AnyNode = SerializedLexicalNode & { children?: AnyNode[]; text?: string; tag?: string }

export const nodeText = (node: AnyNode): string =>
  node.text ?? (node.children || []).map((c) => nodeText(c)).join('')

/** h2/h3 headings for a table of contents. */
export const extractHeadings = (data: unknown): { id: string; text: string; level: 2 | 3 }[] => {
  const root = (data as SerializedEditorState | null)?.root as unknown as AnyNode | undefined
  if (!root?.children) return []
  return root.children
    .filter((n) => n.type === 'heading' && (n.tag === 'h2' || n.tag === 'h3'))
    .map((n) => {
      const text = nodeText(n)
      return { id: slugify(text), text, level: n.tag === 'h2' ? 2 : 3 }
    })
}

const converters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  heading: ({ node, nodesToJSX }) => {
    const Tag = (node as unknown as { tag: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' }).tag
    const id = slugify(nodeText(node as unknown as AnyNode))
    return (
      <Tag id={id} className="scroll-mt-24">
        {nodesToJSX({ nodes: node.children })}
      </Tag>
    )
  },
})

export const RichText: React.FC<{ data: unknown; className?: string }> = ({ data, className }) => {
  if (!data || typeof data !== 'object' || !('root' in data)) return null
  return (
    <LexicalRichText
      data={data as SerializedEditorState}
      converters={converters}
      className={cn('prose prose-neutral max-w-none dark:prose-invert prose-headings:font-semibold prose-a:text-primary-text', className)}
    />
  )
}
