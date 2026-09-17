# Revenue Ripple

Marketing membership platform: React (Vite) frontend, Flask API, Supabase, Stripe/PayPal, and email sequences.

## Layout

```
src/            React app (pages, components, services)
server.py       Flask entrypoint (Render: gunicorn server:app)
server/         Engagement and insights routes
email_crm/      SES/GetResponse enrollment and send
insights/       AI insights API module
api/            Vercel serverless routes (content engine)
infra/email/    Terraform for SES, bounce handling, due-worker
supabase/migrations/   SQL migrations
scripts/        Email import, video normalize, diagnostics
tests/          Python tests
docs/           Product and ops notes
```

## Local development

```bash
# Frontend (Vite, typically http://localhost:5173)
npm install
npm run dev

# Backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python server.py
```

Copy `env_example.txt` to `.env` and fill in values. Frontend vars need the `VITE_` prefix.

## Deploy

- **Frontend:** Vercel (`vercel.json`)
- **API:** Render (`render.yaml` → `gunicorn server:app`)
- **Email infra:** `infra/email/` (see `infra/email/README.md` and `infra/email/CUTOVER.md`)

Health: `GET /health` and `GET /cors-test`.

Set `ALLOWED_ORIGINS` on Render (comma-separated). Override the API base with `VITE_API_BASE_URL`.

## Tests

```bash
python -m pytest tests/
```
