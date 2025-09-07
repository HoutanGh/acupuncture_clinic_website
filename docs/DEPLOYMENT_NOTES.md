# FastAPI Website Deployment Notes

This document explains how the FastAPI backend and static site are deployed using Render and a Cloudflare-managed domain.

## How `main.py` Works
- `main.py` is the entry point for your FastAPI app.
- It serves both API endpoints (e.g., `/submit-form`) and static files (HTML, CSS, JS, images).
- Static files are served using FastAPI's `StaticFiles` and custom routes.
- Form submissions are handled by a POST endpoint, which can send emails using credentials from environment variables.
- Sensitive info (like email credentials) is loaded from environment variables (set in Render dashboard).

## Deployment Steps

### 1. Prepare Your Code
- Ensure all code is committed and pushed to GitHub.
- Check that `main.py` runs locally with `uvicorn main:app --reload`.
- Make sure all static files (HTML, CSS, JS, images) are in the correct locations.
- Add a `requirements.txt` with all dependencies (FastAPI, uvicorn, python-dotenv, etc).

### 2. Set Up Render
- Go to [Render.com](https://render.com/) and sign up/log in.
- Click "New Web Service" and connect your GitHub repo.
- This repo contains `render.yaml`, which preconfigures a Python Web Service:
  - Installs `requirements.txt`
  - Starts with Gunicorn + Uvicorn worker: `gunicorn -k uvicorn.workers.UvicornWorker -w 2 -b 0.0.0.0:$PORT main:app`
- Choose a free or paid plan.
- Set environment variables (from your `.env` file) in the Render dashboard (use `.env.example` as a guide).
- Deploy the service. Render will build and start your app.

### 3. Connect Your Domain (Cloudflare)
- In Render, go to your service's settings and add your custom domain.
- Render will give you a CNAME or A record to add to your Cloudflare DNS.
- In Cloudflare, add the DNS record as instructed.
- Wait for DNS to propagate (can take a few minutes to hours).
- Cloudflare will handle SSL automatically.

### 4. Test Your Website
- Visit your domain to check the site is live.
- Test all forms and static files.
- If using the free plan, note that the app may "sleep" after inactivity (cold start delay).

### 5. Maintenance
- Push code updates to GitHub; Render redeploys automatically.
- Update environment variables in Render dashboard as needed.
- Monitor logs and errors in Render dashboard.

---

**Summary:**
- `main.py` serves your site and API.
- Render hosts your app and connects to your domain via Cloudflare.
- Free plan is available, but app may sleep when idle.
- Paid plan keeps the app always running.

See also: [`docs/FASTAPI_DEPLOYMENT_GUIDE.md`](FASTAPI_DEPLOYMENT_GUIDE.md)

## Release Tags

- v-logo5 (1206b12, 2025-09-07): Stable state using `images/logo5.png` for favicon and logos in `index.html`. Use this tag to quickly restore the logo5 version.
  - Checkout: `git checkout v-logo5`
  - Restore only HTML: `git restore --source v-logo5 -- index.html`
