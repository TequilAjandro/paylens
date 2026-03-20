# PayLens Frontend

Next.js 14 application for the PayLens salary benchmark platform.

## Stack

- **Next.js 14** (App Router)
- **Tailwind CSS** + **shadcn/ui**
- **Recharts** — radar charts, bar charts
- **Framer Motion** — animations

## Dev (local)

```bash
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
bun install
bun dev
```

Open [http://localhost:3000](http://localhost:3000). Requires backend running on `:8000`.

**Important:** Without `.env.local`, the frontend uses built-in mock API routes instead of the real backend.

### Demo mode (no backend needed)

```
http://localhost:3000?demo=true
```

Skips all API calls, uses pre-cached Carlos Mendoza profile with full diagnosis, what-if, and negotiation data.

## ⚡ Task Runner

From the repo root — requires [Task](https://taskfile.dev):

```bash
task dev:front   # this service only
task tsc         # TypeScript check
```

## 🐳 Docker

Build and run from the **repo root**:

```bash
docker compose build
docker compose up -d
```

For hot-reload dev mode:
```bash
docker compose -f docker-compose.dev.yml up
```
