# Young Africans SC — The Home of Wananchi 🔰

An unofficial modern digital home concept and web platform for **Young Africans Sports Club (Yanga SC)**, celebrating the legacy, passion, and football excellence of *Wananchi*.

---

## 🌟 Overview

This project provides a comprehensive, interactive, and responsive web experience for Young Africans SC supporters, featuring:
- **First Team & Player Profiles**: Detailed rosters, player statistics, bios, and squad management.
- **Women's Team (Yanga Princesses)**: Dedicated team showcase and player profiles.
- **Youth & Academy**: Sections for the Under-20 Academy and Soccer School development programs.
- **Matchday & Fixtures**: Live match schedules, countdowns, and results.
- **Wananchi Membership**: Fan club tiers, registration portal, and membership perks.
- **Yanga Media & TV**: Video highlights, media hub, and club news integration.

---

## 📂 Project Structure

```text
├── Assets/                 # Club branding, logos, jerseys, and player imagery
├── index.html              # Main landing page
├── team.html               # Men's first team roster & squad overview
├── squad.html              # Squad statistics and lineup overview
├── player.html             # Men's player detailed profile page
├── women.html              # Women's team (Yanga Princesses) hub
├── women-player.html       # Women's player profile page
├── under-20.html           # U-20 Academy page
├── academy.html            # Soccer school & youth development
├── technical-staff.html    # Coaching and technical bench
├── membership.html         # Fan membership portal
├── styles.css              # Main styling & responsive layout
├── script.js               # Global site interactivity & animations
├── team.js / team-data.js  # Men's squad data & rendering logic
├── women-team.js / data    # Women's squad data & rendering logic
└── player.js / women-player.js # Individual player page logic
```

---

## 🚀 Getting Started

No build step or external package manager is required. Simply open `index.html` in any modern web browser or serve it using a local static file server:

```bash
# Using Python
python -m http.server 8000

# Using Node / npx
npx serve .
```

Then navigate to `http://localhost:8000` in your browser.

---

## 🎨 Technologies Used

- **HTML5** (Semantic structure & accessibility)
- **CSS3** (Custom properties, CSS Grid, Flexbox, smooth transitions & responsive layouts)
- **Vanilla JavaScript (ES6+)** (Dynamic squad rendering, filtering, modal dialogs, and interactions)

---

## 📄 License & Disclaimer

This project is an unofficial design concept created for demonstration and portfolio purposes. All Young Africans SC logos, player photos, and club trademarks belong to their respective copyright holders.

## Membership registration system

The membership flow now uses the existing Yanga registration interface with five working steps:

1. Account creation with validation and password confirmation.
2. Demonstration membership category selection.
3. Personal details.
4. CRDB BANK or NBC BANK preference selection only.
5. Review and application submission.

The frontend is API-first. When no backend is available, it falls back to a clearly labeled browser demo so the flow can still be reviewed locally. The browser demo is not a permanent database and must not be used for real supporter data.

### Secure deployment setup

The serverless API is prepared for Vercel with Vercel Postgres/Neon and bcrypt password hashing.

```bash
npm install
npx vercel login
npx vercel dev
```

Create the database using [`db/schema.sql`](db/schema.sql), then configure the environment values from [`.env.example`](.env.example):

- `POSTGRES_URL` and the other Postgres connection values supplied by the database integration.
- `MEMBERSHIP_SESSION_SECRET`, a random secret of at least 32 characters.
- `MEMBERSHIP_ADMIN_EMAILS`, a comma-separated list of authorized administrator emails.

The API stores password hashes only, uses an HttpOnly signed session cookie, rate-limits registration and login attempts, checks ownership for member records and protects `/admin/membership/` through server-side authorization. No payment, banking API, official membership activation or membership number is created. The included limiter is intentionally small and in-memory; use a shared Vercel KV/Redis-style store before running multiple production instances.

### Routes

- `/membership/` — landing-page redirect to the existing membership home.
- `/membership/join/` — five-step registration.
- `/membership/login/` — member login.
- `/membership/dashboard/` — authenticated member dashboard.
- `/membership/application-status/` — authenticated application status.
- `/admin/membership/` — protected administrator queue.

For a smoke test, open the site through `npx vercel dev`, select a demonstration category and bank preference, submit the form, confirm the application reference, log out, sign back in and verify the dashboard shows only that account's application. Run the same flow with the Vercel Postgres environment configured before accepting any real supporter information.

