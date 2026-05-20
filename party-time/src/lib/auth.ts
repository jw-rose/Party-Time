import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from '@/server/db'
import * as schema from '@/server/db/schema'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL ?? 'https://party-up.app',

  trustedOrigins: [
    'https://party-up.app',
    'https://www.party-up.app',
  ],

  advanced: {
    cookiePrefix: 'party-up',
    useSecureCookies: process.env.NODE_ENV === 'production',

    // ✅ IMPORTANT FIX: allow www + apex sharing
    crossSubdomainCookies: {
      enabled: true,
      domain: '.party-up.app',
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
      console.log('🔑 Password reset URL:', url)

      await resend.emails.send({
        from: 'PartyUp <noreply@party-up.app>',
        to: user.email,
        subject: 'Reset your password',
        html: `
          <div style="font-family: sans-serif;">
            <h1>Reset your password</h1>
            <p>Click below to reset:</p>
            <a href="${url}">Reset password</a>
          </div>
        `,
      })
    },
  },
})