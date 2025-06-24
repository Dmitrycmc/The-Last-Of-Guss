# 🦆 The Last of Guss — Tap Battle Game 🎮🔥

📄 [Problem Statement](./TASK.md)

🚀 [==>> Play now! <<==](https://the-last-of-guss-ngbn.onrender.com/)

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
| Deployment      | Docker + Compose          |
| Deployment      | https://render.com/       |

---

## 🧠 Architecture

- Each client opens a WebSocket to a random backend instance, instances are communication via Redis pub/sub

```
🧑‍💻 Client #1 ─┐
🧑‍💻 Client #2 ─┼─→ 🌐 WebSocket → 🐇 Fastify Instance #1 
🧑‍💻 Client #3 ─┘                            ⇅
                               🔄 Redis Pub/Sub (transport)
🧑‍💻 Client #4 ─┐                            ⇅
🧑‍💻 Client #5 ─┼─→ 🌐 WebSocket → 🐇 Fastify Instance #2
🧑‍💻 Client #6 ─┘                           
```

- Scores are stored in Redis and flushed to PostgreSQL after game finish
- One instance acquires a Redis lock to lead and finalize the round
- Only one active WebSocket connection is allowed per user (anti-abuse)

### Local setup

For launch whole infrastructure locally you need to build backend docker image, up docker-compose and run front:dev

- Postgres
- Redis
- Fastify (x3 inst)
- Traefik (balancer)

```shell
yarn back:build-image && yarn back:dev | yarn front:dev
```
```
                                                       🔄 Redis Pub/Sub (Transport)
                                                                ↑↓     ↑↓     ↑↓
🧑‍💻 Client → 🌐 HTTP / WebSocket → ⚖️ Traefik (Balancer) → 🐇 Fastify Instances (xN)
                                                                 ↘         ↙
                                                   🧠 Redis Key Store + 🐘 PostgreSQL
```
### Deployment
Hosted on [https://render.com/](https://the-last-of-guss-ngbn.onrender.com/)
<img width="1092" alt="Screenshot 2025-06-24 at 7 08 33 AM" src="https://github.com/user-attachments/assets/63ddca06-8543-4315-a71c-7be27672d2f1" />
```
                                                       🔄 Redis Pub/Sub (Transport)
                                                              ↑↓     ↑↓     ↑↓
🧑‍💻 Client → 🌐 HTTP / WebSocket → ⚖️ Render (Balancer) → 🐇 Fastify Instances (x3)
                                                                 ↘         ↙
                                                   🧠  Redis Key Store + 🐘 PostgreSQL
```

---

## 🔒 Fault Tolerance Highlights

- Instance crash: clients reconnect via JWT and restore state
- If lead instance fails, another one acquires a Redis lock and keep leading
- Lock holder crash: Redis lock TTL + backup acquirers

### 🧪 Resilience Testing Feature (Killer Feature)

Each client UI shows:
- 🖥️ which Fastify instance it's connected to
- 👑 which instance is currently the **leader**

<img width="178" alt="Screenshot 2025-06-24 at 7 24 06 AM" src="https://github.com/user-attachments/assets/4fe57e2c-64c3-4d9c-a35e-9948de0dcc70" />

From the bottom-right debug panel, users can:
- Click on any instance ID
- Trigger a remote **kill** command via WebSocket
- Observe how the system handles failover and elects a new leader

This enables manual testing of **horizontal fault tolerance** and **leader promotion** in real-time production-like scenarios.

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
- [x] Sync between all Fastify instances
- [x] Periodic check (setInterval) to finalize round if time exceeded
- [x] Failover scenario if leader instance get down

### Stage 5: WebSocket Gateway ⭐️
- [x] WebSocket setup in Fastify
- [x] Handle connect/disconnect
- [x] Broadcast round status + ticks
- [x] Broadcast user scores
- [x] Optimized broadcasting
- [x] Enforce single connection per user per round

### Stage 6: Frontend (React + Vite) ⭐️
- [x] Setup Vite + React + TS
- [x] Login page (create or login user)
- [x] Round list with status indicators
- [x] Round page with goose + timer + tap
- [x] Live updates via WebSocket

### Stage 7: Zustand + UI (shadcn/ui) ⭐️
- [ ] Setup Zustand store
- [x] UI with shadcn/ui
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
- [x] Add entrypoint script for migrations + start
- [ ] (Optional) Add healthcheck endpoints (/healthz, /readyz)
- [x] Deployed and configured deploy on push

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
