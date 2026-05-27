# Changelog

All notable changes to PartyUp are documented here.
Format based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
Versioning follows [Semantic Versioning](https://semver.org/).

---

## [1.0.0] — 2026-05-27

### Added

**Authentication**
- User registration with name, email, password and terms acceptance
- Login with email and password
- Forgot password and reset password via email (Resend)
- RGPD account deletion — cascade removes all user data
- Session management via Better Auth 1.6.9

**Dashboard**
- Upcoming and past events separated by date
- Hosting and Attending badges on event cards
- Pending invite banner for unaccepted invites
- Quick actions — Create event, My events

**Events**
- Create event with title, date, location, description
- Enable/disable Photos and Group chat modules per event
- Edit event details
- Event hub with tabs — Info, Guests, Photos, Chat
- Host and guest views with role-based permissions

**Invite flow**
- Host sends email invite to guest via Resend
- Unique 48-hour token generated per invite
- Guest receives branded email with invite link
- New guest redirected to register then RSVP page
- Existing guest lands directly on RSVP page
- RSVP options — Yes I'm going, Maybe, Can't make it
- QR code sharing on invite page
- Copy invite link button

**Settings**
- Update display name
- Change password
- Sign out
- Delete account with confirmation modal (RGPD)

**Infrastructure**
- Next.js 16 App Router with Turbopack
- Drizzle ORM with Neon serverless PostgreSQL
- Better Auth session management with secure cookies
- Tailwind CSS v4 with shadcn/ui components
- Deployed to Vercel at https://party-up.app
- Custom domain via Cloudflare Registrar
- Transactional email via Resend from noreply@party-up.app

### Security
- Argon2 password hashing via Better Auth
- Parameterised queries via Drizzle ORM — no SQL injection
- Server-side session validation on every Server Action
- Role-based access control — host vs guest permissions
- Zod input validation on all forms and Server Actions
- OWASP Top 10 coverage documented in docs/security.md
- httpOnly session cookies
- CSRF protection via Better Auth

### Testing
- 47 unit tests — permission.service, invite.service, validations
- 6 E2E tests — auth flow, event creation, invite flow
- 92% coverage on critical business logic
- Bug detected and fixed — host permission gate ordering in canUpload/canChat

### Documentation
- docs/architecture.md — 4-layer architecture
- docs/security.md — OWASP coverage and permission model
- docs/rgpd.md — data collected, user rights, cascade delete
- docs/test-plan.md — testing strategy, results, coverage, bug report