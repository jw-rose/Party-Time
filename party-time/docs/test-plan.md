# Test Plan — PartyUp

## Strategy

Three layers of testing are implemented:

| Layer | Tool | What it tests |
|---|---|---|
| Unit | Vitest | Pure functions with no dependencies |
| Integration | Vitest | Placeholder — DAL functions against Neon test branch in CI |
| E2E | Playwright | Full user journeys in a real Chromium browser |

## Scope and business risk justification

The tests focus on the two highest-risk areas of the application:

**Permission logic** — If `isHost()`, `canUpload()`, or `canChat()` return
wrong values, a guest could access host-only actions or see data they should
not see. These are pure functions with no side effects — ideal for unit testing.

**Authentication flow** — If register, login, or redirect logic breaks,
no user can access the application at all. E2E tests cover this end to end
in a real browser.

**Invite flow** — The invite token system is the primary entry point for
new users. If token validation, expiry, or single-use enforcement breaks,
security is compromised. Unit tests cover all three validation functions.

**Zod validation** — Every Server Action validates input with Zod before
touching the database. Unit tests cover boundary cases for all schemas.

## Test results

| Suite | Tests | Result |
|---|---|---|
| permission.service.test.ts | 17 | ✅ All passing |
| invite.service.test.ts | 11 | ✅ All passing |
| validations.test.ts | 17 | ✅ All passing |
| events.dal.test.ts | 1 | ✅ Passing |
| invites.dal.test.ts | 1 | ✅ Passing |
| auth.spec.ts (E2E) | 8 | ✅ All passing |
| create-event.spec.ts (E2E) | 4 | ✅ All passing |
| invite-flow.spec.ts (E2E) | 4 | ✅ All passing |
| **Total** | **63** | ✅ **All passing** |

## Coverage report

| File | Statements | Branches | Functions | Lines |
|---|---|---|---|---|
| validations.ts | 100% | 100% | 100% | 100% |
| invite.service.ts | 100% | 100% | 100% | 100% |
| permission.service.ts | 100% | 100% | 100% | 100% |
| **Overall** | **92%** | **77%** | **93%** | **93%** |

## Bug detected by testing

**Bug:** `canUpload()` and `canChat()` returned `false` for the host
when the corresponding module (`photosEnabled` / `chatEnabled`) was set
to `false` on the event.

**Expected behaviour:** The host should always be able to upload and chat
regardless of whether the module is enabled for guests — they are the ones
who toggle it on and off.

**Root cause:** The permission functions checked `photosEnabled` before
checking `isHost()`, so hosts were blocked by the same module gate as guests.

**Fix:** Reordered the checks — `isHost()` is now checked first and returns
`true` immediately for hosts, bypassing the module enabled check entirely.

## Limits and what is not tested

- DAL functions are not tested against a live database in local dev —
  this requires a Neon test branch which is configured for CI only
- Stripe webhook handling is not tested — no payment integration in MVP
- SSE real-time chat is not tested — feature postponed post-MVP
- Photo upload is not tested — feature postponed post-MVP
- No load or performance testing — out of scope for MVP