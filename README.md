# Auralis Interiors

AI-powered interior and exterior design app with:
- Frontend: Next.js App Router + TypeScript + Tailwind + Framer Motion + React Hook Form + Zod
- Backend: FastAPI + SQLAlchemy

## Local setup

1. Frontend environment
```bash
cp .env.example .env.local
```

2. Backend environment
```bash
cd backend
cp .env.example .env
```

3. Start PostgreSQL and create `auralis_interiors`

4. Install frontend dependencies
```bash
cd ..
npm install
```

5. Install backend dependencies + migrate + seed
```bash
cd backend
pip install -r requirements.txt
alembic upgrade head
python seed.py
```

6. Run backend
```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

7. Run frontend
```bash
cd ..
npm run dev
```

Frontend: `http://localhost:3000`
Backend: `http://127.0.0.1:8000`

## Scripts
- `npm run dev` — dev server
- `npm run build` — production build (frontend)
- `npm run typecheck` — tsc --noEmit
- `npm run lint` — eslint

Backend:
- `alembic upgrade head` — run database migrations
- `python seed.py` — seed products/blog posts
- `pytest -q` — run backend tests

## Pages
/ · /try-us · /about · /blogs · /blogs/[slug] · /booking · /contact

## Integration notes
- Frontend services in `lib/services` now call FastAPI endpoints directly using cookie sessions (`credentials: include`).
- Errors from backend responses are normalized in `lib/services/http.ts`.
- `lib/types.ts` remains the UI contract; service adapters map backend payloads to those shapes.

## Stripe webhook (local)
1. Start backend on `127.0.0.1:8000`.
2. Login to Stripe CLI and run:
```bash
stripe listen --forward-to 127.0.0.1:8000/api/webhooks/stripe
```
3. Copy the signing secret printed by Stripe CLI into `STRIPE_WEBHOOK_SECRET`.

## Try Us backend flow (current)
1. Optional image upload goes through `POST /api/uploads`.
2. Frontend checks `GET /api/user/free-generation-status`.
3. Generation calls `POST /api/designs/generate`.
4. If free generation is used, backend responds with `PAYMENT_REQUIRED`.
5. Frontend creates checkout via `POST /api/payments/create-checkout-session`.
