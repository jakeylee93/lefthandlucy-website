const ALLOWED_FONT_FAMILIES = new Set([
  'var(--font-heading)',
  'Inter, system-ui, sans-serif',
  'Georgia, serif',
  'Arial, sans-serif',
])

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function cleanAttributes(tagName: string, attributes = '') {
  if (tagName !== 'span') return ''
  const styleMatch = attributes.match(/style\s*=\s*(['"])(.*?)\1/i)
  if (!styleMatch) return ''
  const fontMatch = styleMatch[2].match(/font-family\s*:\s*([^;]+)/i)
  if (!fontMatch) return ''
  const family = fontMatch[1].trim().replace(/^['"]|['"]$/g, '')
  if (!ALLOWED_FONT_FAMILIES.has(family)) return ''
  return ` style="font-family: ${family}"`
}

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_match, code) => String.fromCharCode(Number(code)))
}

export function sanitizeRichText(input = '') {
  if (!input) return ''

  const placeholders: string[] = []
  const token = (value: string) => {
    placeholders.push(value)
    return `__CMS_HTML_${placeholders.length - 1}__`
  }

  let html = decodeHtmlEntities(input)
    .replace(/<\s*(script|style|iframe|object|embed|link|meta)[\s\S]*?<\s*\/\s*\1\s*>/gi, '')
    .replace(/<\s*(br)\s*\/?>/gi, () => token('<br>'))
    .replace(/<\s*\/?\s*(div|p)\b[^>]*>/gi, () => token('<br>'))
    .replace(/<\s*(strong|b|em|i|u)\b[^>]*>/gi, (_match, tag) => token(`<${tag.toLowerCase()}>`))
    .replace(/<\s*\/\s*(strong|b|em|i|u)\s*>/gi, (_match, tag) => token(`</${tag.toLowerCase()}>`))
    .replace(/<\s*span\b([^>]*)>/gi, (_match, attrs) => token(`<span${cleanAttributes('span', attrs)}>`))
    .replace(/<\s*\/\s*span\s*>/gi, () => token('</span>'))

  html = escapeHtml(html)
  placeholders.forEach((value, index) => {
    html = html.split(`__CMS_HTML_${index}__`).join(value)
  })

  return html
    .replace(/(<br>\s*){3,}/g, '<br><br>')
    .replace(/^(<br>\s*)+|(<br>\s*)+$/g, '')
    .trim()
}

export function richTextToPlainText(input = '') {
  return sanitizeRichText(input)
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
}
