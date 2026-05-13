# RGPD Compliance — PartyUp

## Data collected

| Data | Purpose | Retention |
|---|---|---|
| Name | Display in app | Until account deleted |
| Email | Authentication | Until account deleted |
| Password | Authentication (Argon2 hashed) | Until account deleted |
| Event data | App functionality | Until event or account deleted |
| Guest records | RSVP tracking | Until event or account deleted |
| Invite tokens | Access control | Until used, expired, or account deleted |
| Session tokens | Authentication | Until sign out or expiry |
| IP address | Security logging | Until session expires |

## User rights

| Right | How implemented |
|---|---|
| Right to access | User can view all their data in the app |
| Right to rectification | User can update their name in Settings |
| Right to erasure | deleteAccount() removes all data permanently |
| Right to portability | Not implemented in MVP |
| Right to object | User can delete account at any time |

## deleteAccount() cascade

When a user deletes their account the following happens in order:

1. All event posts authored by the user are deleted
2. All invites created by the user are deleted
3. All guest records for the user are deleted
4. All events hosted by the user are deleted
   (cascade removes guests, invites, posts for those events)
5. The user record is deleted
   (cascade removes sessions and OAuth accounts)

The entire operation happens in a single request.
No data is retained after deletion.

## Password security

Passwords are hashed using Argon2 via Better Auth.
Plain text passwords are never stored or logged.

## Data location

All data is stored in Neon (serverless PostgreSQL)
hosted on AWS EU West (Frankfurt) — within EU jurisdiction.

## Legal mentions

Users must accept Terms of Service and Privacy Policy
at registration. The acceptance checkbox is required
and cannot be bypassed.