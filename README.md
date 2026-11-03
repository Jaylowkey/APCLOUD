# APCLOUD

Private photo cloud built with Next.js 15, TypeScript, Tailwind CSS v4 and Supabase.

## Features
- Email/password sign-up and sign-in
- Email confirmation callback
- Password recovery and reset
- Private gallery backed by Supabase Storage
- Upload multiple images from the device gallery
- Native mobile camera capture
- Private previews using signed URLs
- Download and delete photos
- Per-user access enforced by Supabase RLS

## Requirements
- Node.js 22+
- Supabase project with the APCLOUD schema and private `photos` bucket

## Local setup
1. Clone this repository.
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env.local`.
4. Set the Supabase project URL and publishable key.
5. Run `npm run dev`.

## Environment variables
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Never put a Supabase service-role key in a browser or any `NEXT_PUBLIC_` variable.

## Supabase Auth configuration
Set the Site URL to your deployed application URL. Add these redirect URLs:
- `http://localhost:3000/auth/callback`
- `https://YOUR_DOMAIN/auth/callback`
- `http://localhost:3000/reset-password`
- `https://YOUR_DOMAIN/reset-password`

## Deployment
Import this GitHub repository into Vercel. Add both environment variables to Production, Preview and Development, then deploy.

## Storage assumptions
The private `photos` bucket has a 20 MB per-file limit. Every upload path starts with the authenticated user's UUID. Never make this bucket public.
