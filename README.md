# Young Africans SC — The Home of Wananchi

An unofficial Young Africans Sports Club digital home concept with a membership-first MY YANGA experience.

## Membership architecture

The membership experience keeps official registration separate from online account access:

1. Supporters use **Join Yanga** to request direction to an authorized membership registration channel.
2. The authorized source issues the official membership number.
3. Members use **Set Up Account** to enter that number and prove ownership through an OTP to the official record or authorized staff verification.
4. The member creates a password and uses **Member Login** to access the MY YANGA dashboard.

The prototype never creates official membership numbers, invents OTPs, or activates an account without a trustworthy official membership source. It does not collect payments or require a member to pay again to access MY YANGA.

## Project structure

```text
├── Assets/                         # Club branding, logos, jerseys, and player imagery
├── index.html                      # Main landing page
├── membership.html                 # Membership access routes and MY YANGA explanation
├── membership/join/                # Separate official registration request flow
├── membership/setup/               # Existing-member account setup and ownership verification
├── membership/login/               # Official membership number + password login
├── membership/dashboard/           # MY YANGA personal membership services
├── admin/membership/               # Protected staff verification and support queue
├── api/membership/                 # Serverless membership and support endpoints
├── db/schema.sql                   # Postgres schema
├── styles.css                      # Site styling
└── script.js                       # Global site interactivity
```

## Local development

No build step is required for the static pages. Serve the project with any static server:

```bash
python -m http.server 8000
```

The serverless API is prepared for Vercel with Vercel Postgres/Neon and bcrypt password hashing. Configure `POSTGRES_URL`, `MEMBERSHIP_SESSION_SECRET` (at least 32 characters), and `MEMBERSHIP_ADMIN_EMAILS` before using the API.

### Local OTP email testing with Mailpit

`.env.local` is configured for Mailpit at `127.0.0.1:1025` with no SMTP authentication or TLS. The backend reads SMTP settings only from the active environment, so local Mailpit values do not become an implicit production fallback. OTP settings remain environment-driven, including expiry, maximum attempts, resend delay and rate limits. Mailpit's inbox is available at `http://127.0.0.1:8025`.

The MY YANGA setup flow only sends an OTP after the submitted number matches an active record in `authorized_membership_records` (or an existing account with an authorized membership number). The code is hashed in the database, expires, is single-use and is limited by both IP and membership number. The club's authorized source must populate that table; public Join Yanga requests do not create official records.

For deployment, set the `SMTP_*` variables in the hosting provider's production environment to the credentials and secure transport settings of the approved email provider. Do not copy `.env.local` into production. No domain or paid email service is needed for local Mailpit testing.

The browser fallback is clearly labeled as demo mode. It is not a permanent database and must not be used for real supporter data.

## Disclaimer

This is an unofficial design and implementation concept for demonstration and portfolio purposes. Young Africans SC branding, player photos, and club trademarks belong to their respective owners.
