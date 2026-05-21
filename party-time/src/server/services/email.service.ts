import { Resend } from 'resend'

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
        <h1 style="font-size: 24px; font-weight: bold;">
          You are invited! 🎉
        </h1>

        <p style="color: #666; line-height: 1.5;">
          ${hostName} has invited you to
          <strong>${eventTitle}</strong>.
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
      </div>
    `,
  })

  if (error) {
    throw new Error(`Failed to send email: ${error.message}`)
  }
}