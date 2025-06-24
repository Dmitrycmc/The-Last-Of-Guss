# Task: Development of the browser game "The Last of Guss"

Players compete to tap a mutated goose (G-42) as fast and as many times as possible.

---

## Round Configuration

Each round has:
- **Start Date**
- **End Date**

Two durations are configurable via environment variables:

```env
ROUND_DURATION=60       # 1 minute per round
COOLDOWN_DURATION=30    # 30 seconds of countdown before the round starts
```

> Cooldown allows players to open the round page before it becomes active.

---

## Game Rules

- 1 tap = 1 point
- Every 11th tap = +10 points (bonus)
- Players can tap only during **active** rounds
- A round is active if the current time is between its start and end time

---

## User Roles

- `survivor`: a regular player who can tap
- `nikita`: a special case, his taps return success but **always show zero points**
- `admin`: can create new rounds

Roles are assigned during user creation based on the username:
- `"admin"` → admin
- `"Никита"` → nikita
- anyone else → survivor

---

## Backend

- Stack:
  - Node.js
  - TypeScript (`strict` enabled)
  - PostgreSQL
  - ORM (choose one): Prisma, Sequelize, Drizzle, TypeORM
  - API Framework (choose one): Fastify or NestJS

### Tap Endpoint Requirements

Ensure data consistency and prevent race conditions:
- Check user role (`nikita` logic)
- Check round status (active only)
- Update player tap and score count
- Update total score for the round

REST API is acceptable.

### Deployment Considerations

- Must support multiple backend instances
- Expected setup:
  - 1 PostgreSQL DB
  - 1 reverse proxy (e.g., Nginx)
  - 3 Node.js backend containers
- No affinity between users and backend instances
- No need to implement deployment logic (no Dockerfile or docker-compose required)
- For run: `node dist/index.js`

---

## Performance

Expected users per round: ~10  
Use scalable architecture where possible.

---

## Suggested REST API Endpoints

- `POST /login` (cookie or token-based auth)
- `GET /rounds` (no pagination needed)
- `POST /rounds` (admin only)
- `GET /round/:id` (returns winner and personal score)
- `POST /round/:id/tap` (returns updated personal score)

---

## Frontend

- Stack:
  - React
  - TypeScript
  - Vite
  - React Router
  - UI/styling and state management are up to you

### Pages

1. **Login**
   - Username and password
   - If user not exists → create
   - If exists and wrong password → show error

2. **Rounds List**
   - Display active & scheduled rounds
   - Round ID → link to round page
   - If user is admin → show "Create Round" button

3. **Round View**
   - Shows round state (Not started / Active / Finished)
   - Shows goose to tap if round is active
   - Timer until round end or start
   - Shows personal score, updates after each tap

---

## Expectations

- Clean, SOLID-compliant code
- Functional and correct API
- Responsive UI