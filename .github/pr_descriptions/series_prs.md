# PR Series: services -> mobile auth -> realtime scale

This branch contains a series of refactors and new features implemented as a set of PRs:

1) PR1: services refactor
   - Move business logic into lib/services/* (church, posts, events).
   - Thin route handlers call services.
   - Add zod validators for payloads.
   - Unit tests placeholders added.

2) PR3: mobile auth (JWT + refresh tokens)
   - New endpoints: /api/auth/token and /api/auth/refresh
   - New Prisma model: RefreshToken (add to prisma/schema.prisma)
   - lib/jwt.ts: simple token creation + refresh helpers
   - Handlers accept cookie sessions OR bearer tokens (to be integrated via getAuthUser)

3) PR4: realtime scale (Redis)
   - lib/io: Socket.IO init with Redis adapter when REDIS_URL present
   - lib/io/publisher: simple Redis publisher helper
   - workers/event-worker.ts: subscribes to post.created and emits to sockets

Notes & next steps
- PR1 is already applied partially (createChurch service extracted). This series finishes PR1 and then adds PR3/PR4.
- DB migration is required for the RefreshToken model (prisma migrate). I added the model to prisma/schema.prisma — run `npx prisma migrate dev --name add_refresh_token` in staging first.
- ENV vars to configure: JWT_SECRET, JWT_EXPIRES_IN, REFRESH_TOKEN_EXPIRES_DAYS, REDIS_URL

