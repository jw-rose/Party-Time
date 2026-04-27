# Party Time — Project Structure

## Layer responsibilities

| Layer | Location | Responsibility |
|---|---|---|
| Route | src/app/ | Pages, layouts, API routes |
| Component | src/components/ | UI — never imports from src/server/ |
| Server | src/server/ | DAL, actions, services |
| Data | src/server/db/ | Drizzle schema + Neon client |

## Security rule
Every DAL function calls getSession() before any DB query.
The DAL is the single security choke point.
Client components never import from src/server/.

## Real-time chat
SSE replaces Socket.io entirely.
api/chat/[eventId]/stream/route.ts returns text/event-stream.
src/hooks/use-chat.ts uses native EventSource — no library needed.

## Package manager
This project uses pnpm. Do not use npm or yarn.