## Project TODO (Cleaned)

This list consolidates duplicates, marks completed work, and adds a few sensible next steps for SEO, accessibility and security. UK English applied.

### High Priority (Next)
- [ ] Form: wire to backend and secure
  - [ ] Point `form action` to `/submit-form` and test end‑to‑end
  - [ ] Add basic spam protection (honeypot + rate limiting or CAPTCHA)
  - [ ] Server‑side validation + sanitisation in `main.py`
- [ ] SEO: finish core items
  - [ ] Add GMC number to About Me section
  - [ ] Add Business + Physician JSON‑LD (schema.org)
  - [ ] Add Open Graph/Twitter meta (title, description, image, `og:locale` `en_GB`)
  - [ ] Generate `sitemap.xml` and `robots.txt`; reference in Search Console
- [ ] FAQ section: add concise FAQs + future FAQ schema
- [ ] Accessibility pass (a11y)
  - [ ] Check colour contrast in night/light modes
  - [ ] Ensure focus outlines and keyboard access for timeline tabs and menu
  - [ ] Add `aria-current` for active nav links

### Medium Priority
- [ ] Mobile landscape checks (spacing, nav, body map overlay)
- [ ] Conditions styling: decide final hover/highlight colour (green vs orange)
- [ ] Policies: Privacy, Cookies, Terms/Complaints; link from footer
- [ ] Analytics: GA4 + track `tel:` and `mailto:` clicks

### Content To Source/Add
- [ ] GMC number (for profile + schema)
- [ ] CQC/NHS page links (for footer + schema `sameAs`)
- [ ] Testimonial/citation from Dad’s post
- [ ] Business card design assets (offline collateral)

### Technical/Deployment
- [ ] `.env.example` documenting required vars (`SMTP_*`, `EMAIL_*`, etc.)
- [ ] README: update Planned/Current features to reflect night mode, mobile, etc.
- [ ] Render/Cloudflare: finalise env vars and test cold start; note in docs
- [ ] Optional: convert large images to WebP and compress

### Nice to Have / Backlog
- [ ] Tailwind full integration review (minimise custom CSS where practical)
- [ ] About Acupuncture timeline: stronger active “dot” highlight when open
- [ ] Dedicated condition pages (Back pain, Migraine, Shoulder/neck, etc.)

### Completed (for record)
- [x] Night mode toggle and theme persistence
- [x] Tradition card (About Acupuncture) mobile behaviour and timeline tooltips
- [x] Code tidy: indentation and duplicate removal
- [x] Mobile menu: no page scroll lock while open; Escape/Click close
- [x] Welcome section: title + blurb
- [x] Responsive layouts: medium + mobile views across sections
- [x] Top bar and navigation alignment + icons
- [x] About Me layout + profile image
- [x] About Acupuncture: redesigned cards + content panel
- [x] Conditions: clickable points with persistent highlight + linked cards
- [x] Colour palette and section backgrounds
- [x] Favicon/logo for browser tab
- [x] Location: images gallery + Google Map embed
- [x] Prices: cards with Book Now linking back to form
- [x] README clean‑up & repo restructure (archive/ for old files)

