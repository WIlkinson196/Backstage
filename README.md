# Backstage v0.1

Fresh modular foundation for Backstage — the venue operating system.

## Rules
- No login UI yet.
- No old CRM CSS/JS copied into the app.
- Every major feature lives in its own folder.
- Supabase = data. Vercel = deployment. OpenAI + Stripe = server-side integrations.
- My Venue = configuration brain.
- AI and automation are first-class features.

## First release
Dashboard + My Venue + Enquiries + database foundation.

## Run
```bash
npm install
npm run dev
```

## Supabase
Run `/supabase/migrations` in numeric order, then optional `/supabase/seed`. No auth is included yet.
