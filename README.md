# Acupuncture Clinic Website

Modern, responsive website for an acupuncture clinic. Frontend is a single page (HTML/CSS/JS); backend is a FastAPI app that serves the site, exposes a health check, and processes a contact form by sending an email via SMTP. Deployed on Render with CI pings from GitHub Actions.

- Live site: https://acuhealthmaster.co.uk/

## Overview

- Single-page site with sections: Welcome, About Me, About Acupuncture, Treated Conditions, Prices, Location, Contact.
- Clean, accessible layout with mobile-first responsiveness and a night mode toggle.
- Contact form for patient enquiries posts to a FastAPI endpoint; the backend sends an email to the clinic.

## Architecture

- FastAPI app (`main.py`) serves both static files and API routes.
  - Static: `GET /`, `GET /style.css`, `GET /script.js`, `GET /images/*`.
  - Form handler: `POST /submit-form` accepts multipart form data and sends an SMTP email.
  - Health check: `GET /health` returns `OK` for uptime/monitoring and keep-awake pings.
- Safe diagnostics: `GET /debug/email-config` returns non‑sensitive flags to verify env is set (not included in OpenAPI schema).
- Frontend form (in `index.html`) is progressively enhanced by `script.js`:
  - Client‑side validation, inline feedback, and AJAX submission with graceful fall‑back.
  - Displays success/error overlay; resets form on success.
- Configuration via environment variables (`.env` locally; set in Render for production). See `.env.example` for required keys.

### FastAPI Form Flow

1) User submits the form in `index.html` (action `/submit-form`, method `POST`).
2) `main.py` uses `Form(...)` parameters to parse fields (`first_name`, `last_name`, `email`, `phone`, `message`, `appointment_type`).
3) Backend composes an email and sends via SMTP using `EMAIL_USER`/`EMAIL_PASSWORD` credentials and `SMTP_SERVER`/`SMTP_PORT`.
4) Returns JSON `{ status: "success" }` on success; frontend shows a transient overlay message.

### Key Endpoints

- `GET /` → Serves `index.html`.
- `GET /style.css`, `GET /script.js`, `GET /images/*` → Static assets.
- `POST /submit-form` → Form submission; emails details to clinic.
- `GET /health` → Plain text `OK` response for monitors and keep‑awake jobs.
- `GET /debug/email-config` → Non-sensitive config flags for troubleshooting.

## Deployment

- Host: Render Web Service (free plan supported).
- Process: GitHub → Render auto-deploys on push.
- App server: Gunicorn with Uvicorn workers for ASGI.
- Health check (Render): configured to `GET /` via `render.yaml`.

Files in repo:
- `render.yaml` (YAML infra config) defines the Render service: build and start commands, plan, health check, auto‑deploy.
- `Procfile` defines the production command (`gunicorn -k uvicorn.workers.UvicornWorker ... main:app`), compatible with Render and other PaaS.
- `.github/workflows/keep-wake.yml` is a GitHub Action that pings `https://acuhealthmaster.co.uk/health` on a schedule to reduce cold starts on free plans.

## CI: Keep Render Awake (GitHub Actions)

- Scheduled workflow runs every 5 minutes (UTC), but only pings during 06:00–24:00 Europe/London.
- Adds random jitter to distribute traffic and avoid patterns.
- Uses `curl` to `GET /health` and logs execution time and outcome.
- File: `.github/workflows/keep-wake.yml` (YAML).

## Configuration

Environment variables (see `.env.example`):
- `SMTP_SERVER`, `SMTP_PORT` – SMTP details (e.g., Gmail: `smtp.gmail.com:587`).
- `EMAIL_USER`, `EMAIL_PASSWORD` – SMTP credentials or app password.
- `RECIPIENT_EMAIL` – Destination inbox for form submissions.
- `CLINIC_NAME` – Used in email subject/body branding.
- Optional: `LOG_LEVEL`, `PORT`.

Security notes:
- No secrets are exposed via endpoints; `/debug/email-config` only returns boolean flags/port.
- CORS is permissive for development; restrict `allow_origins` for production.
- Minimal logging avoids storing sensitive payloads.

## Local Development

Prerequisites: Python 3.11+, `pip`.

1) Create and activate a virtual environment, then install dependencies:
   - `python -m venv .venv && source .venv/bin/activate`
   - `pip install -r requirements.txt`
2) Create a `.env` from `.env.example` and fill values (for local e‑mail tests).
3) Run the app locally:
   - `uvicorn main:app --reload --host 0.0.0.0 --port 8001`
4) Open `http://localhost:8001`.

Quick endpoint checks:
- `curl -i http://localhost:8001/health`
- `curl -i -X POST -F first_name=A -F last_name=B -F email=a@b.com -F appointment_type=initial_consultation http://localhost:8001/submit-form`

## Project Structure

```
├── index.html                # Main SPA page
├── style.css                 # Styles
├── script.js                 # Frontend logic (form, UI, accessibility)
├── images/                   # Static assets
├── main.py                   # FastAPI app (static + API)
├── requirements.txt          # Python dependencies
├── Procfile                  # Production start command
├── render.yaml               # Render Web Service config (YAML)
├── .github/workflows/keep-wake.yml  # Keep-awake GitHub Action (YAML)
├── .env.example              # Example env vars for local dev
├── docs/                     # Deployment notes, guides, TODOs
└── archive/                  # Older versions of the site
```

## CV Highlights

- Implemented a FastAPI backend that serves a static SPA and exposes form, health, and diagnostic endpoints.
- Built a production e‑mail pipeline (SMTP) for contact form submissions using environment‑based configuration and secure app passwords.
- Deployed to Render using infrastructure-as-code in `render.yaml` and a `Procfile` with Gunicorn + Uvicorn workers.
- Added a scheduled GitHub Actions workflow (YAML) that conditionally pings the `/health` endpoint with jitter to minimise cold starts.
- Applied logging, basic CORS, and safe diagnostics for operability and troubleshooting.
- Wrote frontend progressive enhancement (vanilla JS) for validation, AJAX form submission, accessibility, and mobile UX.

## Notes

- Render health check path is `/` (fast to serve); operational pings target `/health`.
- For custom domains, see `docs/DEPLOYMENT_NOTES.md` (Cloudflare + Render DNS setup summary).
