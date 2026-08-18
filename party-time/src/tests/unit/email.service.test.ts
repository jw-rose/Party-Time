import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockSend = vi.hoisted(() => vi.fn().mockResolvedValue({ error: null }))

vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(function () {
    return { emails: { send: mockSend } }
  }),
}))

import { sendInviteEmail } from '@/server/services/email.service'

describe('sendInviteEmail', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('escapes HTML in eventTitle so injected markup is not live in the email body', async () => {
    await sendInviteEmail({
      to: 'guest@example.com',
      inviteUrl: 'https://party-up.app/invite/token123',
      eventTitle: '</strong><a href="https://evil.com">click me</a><strong>',
      hostName: 'Alice',
    })

    const call = mockSend.mock.calls[0][0]
    expect(call.html).not.toContain('</strong><a href=')
    expect(call.html).toContain('&lt;/strong&gt;')
    expect(call.html).toContain('&lt;a href=')
  })

  it('escapes HTML in hostName so injected markup is not live in the email body', async () => {
    await sendInviteEmail({
      to: 'guest@example.com',
      inviteUrl: 'https://party-up.app/invite/token123',
      eventTitle: 'Birthday Party',
      hostName: '<img src=x onerror=alert(1)>',
    })

    const call = mockSend.mock.calls[0][0]
    expect(call.html).not.toContain('<img src=x')
    expect(call.html).toContain('&lt;img src=x')
  })

  it('does not escape the inviteUrl (server-generated, must remain a valid URL)', async () => {
    const inviteUrl = 'https://party-up.app/invite/abc-123'
    await sendInviteEmail({
      to: 'guest@example.com',
      inviteUrl,
      eventTitle: 'Party',
      hostName: 'Bob',
    })

    const call = mockSend.mock.calls[0][0]
    expect(call.html).toContain(`href="${inviteUrl}"`)
  })
})
