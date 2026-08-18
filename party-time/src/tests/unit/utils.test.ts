import { describe, it, expect } from 'vitest'
import { escapeHtml } from '@/lib/utils'

describe('escapeHtml', () => {
  it('escapes < and > in a script tag', () => {
    const result = escapeHtml('<script>alert("xss")</script>')
    expect(result).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;')
    expect(result).not.toContain('<script>')
  })

  it('escapes double and single quotes', () => {
    expect(escapeHtml('"quoted"')).toBe('&quot;quoted&quot;')
    expect(escapeHtml("it's")).toBe('it&#39;s')
  })

  it('escapes ampersands', () => {
    expect(escapeHtml('fish & chips')).toBe('fish &amp; chips')
  })

  it('leaves plain strings unchanged', () => {
    expect(escapeHtml('Hello world')).toBe('Hello world')
  })

  it('handles an empty string', () => {
    expect(escapeHtml('')).toBe('')
  })
})
