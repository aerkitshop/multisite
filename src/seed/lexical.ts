/** Tiny helper to build Lexical rich-text JSON for seeds / API examples. */
type Block = ['h2' | 'h3' | 'p', string] | ['ul' | 'ol', string[]]

const text = (t: string) => {
  // **bold** support
  const parts = t.split(/(\*\*[^*]+\*\*)/g).filter(Boolean)
  return parts.map((p) => ({
    type: 'text',
    text: p.startsWith('**') ? p.slice(2, -2) : p,
    format: p.startsWith('**') ? 1 : 0,
    detail: 0,
    mode: 'normal',
    style: '',
    version: 1,
  }))
}
const base = { format: '', indent: 0, version: 1, direction: 'ltr' as const }

export const lexical = (blocks: Block[]) => ({
  root: {
    type: 'root',
    ...base,
    children: blocks.map((b) => {
      const [kind, content] = b
      if (kind === 'h2' || kind === 'h3') return { type: 'heading', tag: kind, ...base, children: text(content as string) }
      if (kind === 'ul' || kind === 'ol')
        return {
          type: 'list',
          listType: kind === 'ul' ? 'bullet' : 'number',
          start: 1,
          tag: kind,
          ...base,
          children: (content as string[]).map((item, i) => ({ type: 'listitem', value: i + 1, ...base, children: text(item) })),
        }
      return { type: 'paragraph', textFormat: 0, textStyle: '', ...base, children: text(content as string) }
    }),
  },
})
