# 🦆 The Last of Guss — Tap Battle Game

Multiplayer browser game where players compete in tapping a mutated goose. Each game round has a `cooldown` and `duration`, stores player scores, winner, and real-time game status. The game is built with WebSocket and supports horizontal scaling.

---

## 🧱 Tech Stack

| Layer           | Technology                |
|-----------------|---------------------------|
| Package Manager | Yarn                      |
|                 |                           |
| Backend         | Fastify (TypeScript)      |
| Database        | PostgreSQL                |
| ORM             | Prisma                    |
| Redis           | node-redis                |
|                 |                           |
| Frontend        | React + Vite + TypeScript |
| UI Kit          | shadcn/ui                 |
| State Manager   | Zustand                   |
|                 |                           |
| WS              | ws + Redis Pub/Sub        |
| CI/CD           | GitHub Actions (*)        |
| Testing         | Vitest, Supertest (*)     |
| Deployment      | Docker + Compose (*)      |

---

## 🧠 Architecture

```
Client → Nginx (Reverse Proxy) → Multiple Fastify Instances
             ↘        ↙
               Redis (Pub/Sub + Key Store)
               PostgreSQL (Game state)
```

- Each client opens a WebSocket to a random backend instance
- All instances are subscribed to Redis pub/sub by `round:{id}`
- Scores are stored in Redis and flushed to PostgreSQL periodically
- One instance acquires a Redis lock to finalize the round
- **Only one active WebSocket connection is allowed per user** (anti-abuse)

---

## 🔒 Fault Tolerance Highlights

- Redis failure: AOF + periodic PostgreSQL flushes (*)
- Instance crash: clients reconnect via JWT and restore state
- Lock holder crash: Redis lock TTL + backup acquirers

---

## 🧩 Data Models

- `User`: name, password, role (`admin`, `nikita`, `survivor`)
- `Round`: uuid, startAt, endAt, status (`cooldown`, `active`, `finished`)
- `UserRoundScore` (Redis + DB Sync): score count per player per round

---

## 🚧 Roadmap

### 🔌 Base Setup

- Set up monorepo with Fastify and React
- Configure ESLint + Prettier (*)
- Add Docker Compose (PostgreSQL, Redis, backend) (*)

---

### 🔁 Backend

- User model with hashed password + role assignment (*)
- Round model with time-based lifecycle (*)
- Auth: login/register with bearer token or cookie (*)
- API: create round (admin-only) (*)
- API: list rounds, get round details
- WebSocket server: subscribe to round updates (*)
- One-user-one-connection constraint via Redis (*)
- Tap events with correct score logic (`+1`, every 11th = `+10`) (*)
- Redis pub/sub for score updates across instances
- Redis lock for round finalization (*)
- Periodic Redis-to-PostgreSQL flush (*)
- Periodic check (setInterval) to finalize round if time exceeded

---

### 🎨 Frontend

- Login page with error on wrong credentials (*)
- Round list view + "create" button if admin
- Round view: timer, tap button, goose state
- Smooth goose animation (*)
- WebSocket integration to receive score updates (*)
- Zustand for global state: user, round, score

---

### 🧪 Tests & Infra

- Unit tests for scoring and timer logic (*)
- E2E test: tap flow via WebSocket (*)
- GitHub Actions: lint, test, build (*)

---

### ☁️ Production Notes

- Redis cluster preferred for HA, single node okay for MVP
- Add readiness/liveness probes
- Enable secure cookies + CORS + rate limiting
- Use `X-Forwarded-For` behind proxy for IP-based rules
- Enable AOF mode in Redis config (for durability)

---

## 📂 Project Structure

```
/backend
  /prisma
  /src
    /errors
    /modules
      /auth
      /round
      /tap
    /ws
    /infra
    /redis
    /config.ts
    /utils
    /middlewares
    /plugins

/frontend
  /src
    /pages
    /components
    /store
```

---

## 🚀 Getting Started

```bash
# Backend
cp .example.env .env
docker-compose up -d
pnpm dev

# Frontend
pnpm install
pnpm dev
```

---

## 🛠 Work Plan

### Stage 1: Fastify + Auth ⭐️
- [x] Init Fastify project with TypeScript
- [x] Setup env config (dotenv)
- [x] Add authentication (username/password)
- [x] Implement login + user creation
- [x] Assign roles: admin, user, nikita
- [x] Added JWT middleware
- [ ] (?) Add JWT expiration + refresh token

### Stage 2: Prisma + PostgreSQL ⭐️
- [x] Init Prisma + connect PostgreSQL
- [x] Design schema: User, Round, UserRoundScore
- [x] Add relations + constraints
- [x] Create seeding & migration scripts

### Stage 3: Game Logic & API ⭐️
- [x] Create round (admin only)
- [x] Get all rounds (active, scheduled)
- [x] Get round info (status, self score, winner)
- [x] Tap handler (role, cooldown, score logic)

### Stage 4: Redis + Pub/Sub ⭐️
- [x] Init node-redis client
- [x] Use Redis for tap counters `score:${roundId}:${userId}`
- [x] Broadcast score updates via Pub/Sub
- [ ] Sync between all Fastify instances
- [ ] Periodic check (setInterval) to finalize round if time exceeded

### Stage 5: WebSocket Gateway ⭐️
- [x] WebSocket setup in Fastify
- [x] Handle connect/disconnect
- [ ] Broadcast round status + ticks
- [x] Broadcast user scores
- [x] Optimized broadcasting
- [ ] Enforce single connection per user per round

### Stage 6: Frontend (React + Vite) ⭐️
- [ ] Setup Vite + React + TS
- [ ] Login page (create or login user)
- [ ] Round list with status indicators
- [ ] Round page with goose + timer + tap
- [ ] Live updates via WebSocket

### Stage 7: Zustand + UI (shadcn/ui) ⭐️
- [ ] Setup Zustand store
- [ ] UI with shadcn/ui
- [ ] Optimistic UI for taps
- [ ] Toasts/errors/loading states

### Stage 8: Testing & Validation ⭐️
- [ ] Add unit tests (e.g. tap logic)
- [ ] Add integration test (round creation)
- [ ] Manual testing for WebSocket & sync

### Stage 9: Deployment-Ready Setup ⭐️
- [x] Add Dockerfile
- [x] Add Redis + PostgreSQL in docker-compose
- [x] Add load-balancer
- [ ] Add entrypoint script for migrations + start
- [ ] (Optional) Add healthcheck endpoints (/healthz, /readyz)

### Stage 10: CI/CD ⭐️
- [ ] Add GitHub Actions workflow for backend
- [ ] Add GitHub Actions workflow for frontend
- [ ] Run lint, test, build on PR

---

## ✨ Future Ideas

- Real-time leaderboard
- Session recovery on reconnect
- Redis TTL on score keys
- Tap spam prevention (rate limiter)
- Animated goose combos (e.g., "Frenzy mode")
