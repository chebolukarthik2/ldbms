# Library Database Management System

A modern library management system built with React + TypeScript (frontend) and Supabase (backend + database). The frontend is deployed on Vercel and the backend is managed via Lovable.

## Tech Stack

- **Frontend** — React, TypeScript, Tailwind CSS, shadcn/ui, React Router, TanStack Query
- **Backend** — Supabase (PostgreSQL database, Auth, Edge Functions)
- **Deployment** — Vercel (frontend), Supabase Cloud (backend)
- **Built with** — Vite, Lovable

## Features

- Admin and student login
- Student self-registration
- Admin dashboard — manage books, issue/return books, view students
- Student dashboard — browse library, view borrowed books
- Role-based access control (admin / student)

## Project Structure

```
student-welcome-portal-main/
├── src/
│   ├── pages/
│   │   ├── Index.tsx           # Auth redirect
│   │   ├── LoginPage.tsx       # Login
│   │   ├── RegistrationPage.tsx# Student registration
│   │   ├── AdminDashboard.tsx  # Admin panel
│   │   └── StudentDashboard.tsx# Student panel
│   ├── lib/
│   │   └── store.ts            # Supabase data layer
│   └── integrations/
│       └── supabase/           # Supabase client + types
├── supabase/
│   ├── functions/              # Edge Functions
│   └── migrations/             # Database migrations
├── vercel.json                 # SPA routing for Vercel
├── vite.config.ts
└── package.json
```

## Deployment

### Frontend — Vercel

1. Push this repo to GitHub
2. Import the repo in [vercel.com](https://vercel.com)
3. Set **Root Directory** to `ldbms`
4. Set **Framework Preset** to Vite
5. Add Supabase environment variables in Vercel → Settings → Environment Variables
6. Click Deploy

### Backend — Lovable + Supabase

Backend (database, auth, edge functions) is managed through Lovable and hosted on Supabase Cloud. Any backend changes should be made in Lovable — they sync automatically to Supabase.

## Workflow — Making Changes

| Change type | Where |
|---|---|
| UI, pages, frontend logic | Edit locally → push to GitHub → Vercel auto-deploys |
| Database tables / columns | Lovable |
| Edge Functions | Lovable |
| Auth / RLS policies | Lovable / Supabase dashboard |
