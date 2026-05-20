import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from '@/server/db/index'
import * as schema from '@/server/db/schema'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:3000',
  trustedOrigins: [
    'https://party-up.app',
    'https://www.party-up.app',
  ],
  advanced: {
    cookiePrefix: 'party-up',
    useSecureCookies: process.env.NODE_ENV === 'production',
    crossSubdomainCookies: {
      enabled: false,
    },
  },
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    },
  }),
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      // In dev — log to terminal as fallback
      console.log('🔑 Password reset URL (dev):', url)

      // Send via Resend
      await resend.emails.send({
        from: 'PartyUp <noreply@party-up.app>',
        to: user.email,
        subject: 'Reset your PartyUp password',
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
            <h1 style="font-size: 24px; font-weight: bold;">Reset your password</h1>
            <p style="color: #666;">Click the link below to reset your password.</p>
            
              href="${url}"
              style="
                display: inline-block;
                margin-top: 16px;
                padding: 12px 24px;
                background: #3B82F6;
                color: white;
                border-radius: 8px;
                text-decoration: none;
                font-weight: 500;
              "
            >
              Reset password
            </a>
            <p style="margin-top: 16px; font-size: 12px; color: #999;">
              This link expires in 1 hour. If you did not request this
              ignore this email.
            </p>
          </div>
        `,
      })
    },
  },
})