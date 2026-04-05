# leoharling.com

Personal portfolio and tools platform for Leo Harling — strategy consultant specialising in aerospace, space, and defence. Built with Next.js 15 (App Router).

## Overview

A full-stack platform that goes beyond a typical portfolio, combining curated intelligence feeds, interactive data visualisations, and custom-built domain tools in one place.

**Live sections:**
- **Intel** — Signal feed across aerospace, AI, biotech, energy, and defence
- **Space** — Live launch tracker with countdowns + 3D satellite constellation visualiser
- **Geopolitics** — Active conflict monitor with territory overlays and UCDP event data
- **AI** — Data centre infrastructure map, model benchmarks, and real-world applications
- **Projects** — DCM Tool (supply chain simulation), SiKo Tool (IT compliance), TrippyPlans

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 15 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS 4, Framer Motion |
| 3D / Maps | Three.js, @react-three/fiber, MapLibre GL |
| Backend | Supabase (PostgreSQL, Storage) |
| Email | Resend |
| Orbital math | satellite.js (TLE propagation) |
| Deployment | Vercel |

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Create a `.env.local` file:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Email (Resend)
RESEND_API_KEY=

# Admin (photo upload)
ADMIN_PASSWORD=

# External APIs
UCDP_API_KEY=
```

## Project Structure

```
app/                  # Routes (intel, space, geopolitics, ai, projects, about, contact)
app/api/              # API routes (launches, satellites, conflict data, RSS, cron jobs)
components/           # UI, layout, hero, space, tools, ai
lib/                  # Domain data (rockets, conflicts, AI models, spaceports, feeds)
public/projects/      # Static assets for DCM Tool and SiKo Tool
```

## Data Sources

- **The Space Devs API** — launch data, cached in Supabase via cron job
- **Celestrak** — TLE sets for real-time satellite orbital positions
- **UCDP** — conflict event data, cached in Supabase via cron job
- **RSS feeds** — aggregated news across multiple sources
- **Supabase** — photos, contact submissions, cached external data
