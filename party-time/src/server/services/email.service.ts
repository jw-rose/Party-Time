import { Resend } from 'resend'
import { escapeHtml } from '@/lib/utils'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendInviteEmail({
  to,
  inviteUrl,
  eventTitle,
  hostName,
}: {
  to: string
  inviteUrl: string
  eventTitle: string
  hostName: string
}) {
  const { error } = await resend.emails.send({
    from: 'PartyUp <noreply@party-up.app>',
    to,
    subject: `You are invited to ${eventTitle}`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; margin-bottom: 24px;">
          <tr>
            <td
              width="32"
              height="32"
              align="center"
              valign="middle"
              bgcolor="#534AB7"
              style="width: 32px; height: 32px; background-color: #534AB7; border-radius: 8px; color: #ffffff; font-family: sans-serif; font-size: 14px; font-weight: bold; text-align: center; vertical-align: middle;"
            >
              P
            </td>
            <td
              valign="middle"
              style="padding-left: 8px; font-family: sans-serif; font-size: 18px; font-weight: 600; color: #111111; vertical-align: middle;"
            >
              Party Up
            </td>
          </tr>
        </table>

        <h1 style="font-size: 24px; font-weight: bold;">
          You are invited! 🎉
        </h1>

        <p style="color: #666; line-height: 1.5;">
          ${escapeHtml(hostName)} has invited you to
          <strong>${escapeHtml(eventTitle)}</strong>.
        </p>

        <a
          href="${inviteUrl}"
          target="_blank"
          style="
            display: inline-block;
            margin-top: 16px;
            padding: 12px 24px;
            background: #534AB7;
            color: #ffffff;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 500;
          "
        >
          <span style="color: #ffffff;">
            View invitation
          </span>
        </a>

        <p style="margin-top: 16px; font-size: 12px; color: #999;">
          This link expires in 48 hours.
        </p>

        <p style="margin-top: 24px; font-size: 12px; color: #999;">
          © Party Up
        </p>
      </div>
    `,
  })

  if (error) {
    throw new Error(`Failed to send email: ${error.message}`)
  }
}