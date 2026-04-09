# Website Improvement Plan

## Current State Assessment

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Framer Motion, Three.js, Supabase, Resend, Leaflet, RSS Parser
**Live at:** leoharling.com

### What exists today

| Page | Status | Notes |
|------|--------|-------|
| Home (`/`) | Live | 3D globe hero, 3 highlight cards, then nothing — very thin below the fold |
| About (`/about`) | Live | CV-style timeline (experience, education, awards, languages). No photo, no personal narrative |
| Tools (`/tools`) | Live | 5 tools grid (TrippyPlans, Orbit Intel, Launch Tracker, Satellite Visualizer, Defence Procurement) |
| Blog (`/blog`) | Placeholder | "Coming Soon" — zero published content |
| Photography (`/photography`) | Live | Supabase-backed gallery with category filter + map view |
| Contact (`/contact`) | Live | Form → Supabase + Resend email |

### What the site does well
- **Strong technical foundation** — modern stack, clean code, good component structure
- **Impressive interactive tools** — the space tools (launch tracker, satellite visualizer, news feed) are genuinely differentiated and demonstrate real domain expertise
- **Polished dark design** — glassmorphism cards, smooth animations, good typography (Geist)
- **Clear domain focus** — aerospace, space & defence positioning is consistent throughout
- **Photography section** — adds personality and shows the site isn't purely professional

---

## Improvement Areas

### 1. The Home Page Needs More Depth

**Problem:** After the hero and 3 highlight cards, the page ends. Visitors who scroll see nothing else. The site's strongest content (tools, about info, photography) is hidden behind navigation clicks. Most visitors won't click through to every page.

**What great personal sites do:** They use the home page as a curated "best of" — a single scrollable experience that tells your story, shows your work, and invites action.

**Recommendations:**
- Add a brief **personal intro section** below the highlights — 2-3 sentences about who you are, what you care about, and what you're working on. This is the "human" moment that makes the site feel personal rather than corporate
- Add a **featured tools/projects section** — show 2-3 of your best tools with screenshots or live previews. These are your strongest differentiator and they're currently one click away
- Add a **latest from the blog** section (once blog exists) — signals that the site is alive and regularly updated
- Add a **photography teaser** — 3-4 of your best photos in a row, linking to the full gallery. This adds visual warmth
- Add a **brief contact CTA** at the bottom — "Interested in aerospace & space strategy? Let's talk." with a link to the contact page

**Priority: High** — The home page is where 80%+ of visitors form their impression.

---

### 2. The About Page Reads Like a Resume, Not a Story

**Problem:** The About page is a structured CV (role → company → bullets). This is useful information, but it doesn't tell visitors *who you are*. It reads the same whether you're excited about space or not. There's no photo, no personal voice, no "why."

**What great personal sites do:** They lead with a personal narrative — a few paragraphs that explain your worldview, what drives you, and what you're working toward. The CV details come second.

**Recommendations:**
- Add a **profile photo** at the top. This is the single most impactful change. People connect with faces. Every respected personal site (Brittany Chiang, Sara Soueidan, etc.) leads with a photo
- Add a **personal narrative section** before the experience timeline — 2-3 paragraphs in your own voice about your journey, what fascinates you about space/defence, and what you're building toward
- Consider adding a **"Currently"** or **"Now"** section — what are you reading, working on, excited about? This makes the page feel alive and gives visitors a reason to return
- The CV content is good — keep it, but make it secondary to the story

**Priority: High** — The About page is typically the second-most visited page.

---

### 3. The Blog Is Empty — This Is the Biggest Gap

**Problem:** The blog page says "Coming Soon" and lists topic ideas but has zero content. An empty blog is worse than no blog at all — it signals unfinished intentions. More importantly, **original writing is the single most effective way to build authority and attract organic traffic** in a niche like aerospace/space strategy.

**What great personal sites do:** They publish regularly, even if infrequently. One well-researched post per month on New Space economics or European defence procurement would establish Leo as a voice in the space.

**Recommendations:**
- **Set up MDX support** — Next.js has excellent MDX integration. This allows writing blog posts in Markdown with embedded React components (interactive charts, code snippets, etc.)
- **Create a content directory** (`content/blog/`) with frontmatter-driven posts (title, date, description, tags, category)
- **Build the blog index page** with proper post cards, tag filtering, and search
- **Build individual blog post pages** with good typography, reading time estimates, table of contents, and social sharing
- **Write 2-3 initial posts** on topics you already know well — e.g., "The Economics of Small Satellite Launches in 2025," "How European Defence Procurement Actually Works," or "What I Learned Building Space Tools"
- Consider an **RSS feed** for the blog (you already have RSS infrastructure from Orbit Intel)
- Consider a **newsletter signup** — even a simple "get notified of new posts" via email

**Priority: Critical** — This is the highest-leverage improvement for long-term value.

---

### 4. No Profile Photo Anywhere

**Problem:** There is no photo of Leo anywhere on the site. Not on the home page, not on the about page, not in the footer. The site feels impersonal — like it could belong to anyone. Research consistently shows that personal websites with photos build significantly more trust and connection.

**Recommendations:**
- Add a **professional headshot** to the About page header
- Consider a smaller version in the home page intro section
- Use a high-quality photo that reflects your professional context (doesn't have to be a corporate headshot — something authentic)

**Priority: High** — Small effort, large impact.

---

### 5. SEO & Social Sharing Are Incomplete

**Problem:** The site has basic meta tags but is missing several critical elements for discoverability and social sharing.

**Current gaps:**
- No **Open Graph image** — when someone shares leoharling.com on LinkedIn or Twitter, there's no preview image. For someone in strategy consulting, LinkedIn shares are a primary traffic driver
- No **custom favicon** — still using Next.js defaults
- No **sitemap.xml** — Google can't efficiently discover all pages
- No **robots.txt**
- No **structured data** (JSON-LD) — missing Person schema, WebSite schema
- No **canonical URLs** on pages
- Default Next.js assets still in `/public` (vercel.svg, window.svg, etc.)

**Recommendations:**
- Create a custom **OG image** (1200×630) — your name, title, and a visual element. This is extremely important for LinkedIn sharing
- Design a **favicon** that works at small sizes (initials "LH" or a simple geometric mark)
- Add **Next.js sitemap generation** (`app/sitemap.ts`)
- Add **robots.txt** (`app/robots.ts`)
- Add **JSON-LD structured data** for Person and WebSite schemas
- Clean up `/public` — remove unused default SVGs
- Add per-page OG images or at minimum a default one

**Priority: High** — Especially the OG image, given LinkedIn is a key channel for your profile.

---

### 6. Missing GitHub & Broader Social Presence

**Problem:** The site only links to LinkedIn and Instagram. For someone building technical tools (satellite visualizer, 3D globe, RSS aggregator), not linking to GitHub is a missed opportunity. The tools are impressive — showing the source code would amplify that signal.

**Recommendations:**
- Add **GitHub** to social links (if you have public repos for any of these tools)
- Consider adding **Twitter/X** if you use it for industry commentary
- Add social links to the About page, not just the footer

**Priority: Medium**

---

### 7. Tools Lack Context and Documentation

**Problem:** The tools are the site's strongest feature, but each tool page jumps straight into the interactive UI without explaining *why* it was built, what problem it solves, or what the tech approach is. For someone in strategy consulting, the *thinking* behind the tool is as valuable as the tool itself.

**Recommendations:**
- Add a **brief intro paragraph** to each tool page explaining the motivation ("I built this because...")
- Consider adding a **"How it works"** or **"About this tool"** collapsible section
- On the tools index page, consider adding screenshots or preview images instead of just text descriptions
- Complete or remove the **Defence Procurement Tracker** "Coming Soon" — an indefinite "coming soon" status erodes credibility

**Priority: Medium**

---

### 8. No Light Mode

**Problem:** The site is dark-mode only. While the dark theme looks good and fits the space/tech aesthetic, some visitors (especially in professional/corporate contexts) prefer light mode. Accessibility standards recommend supporting user preference.

**Recommendations:**
- Add a **light/dark mode toggle** that respects `prefers-color-scheme`
- The design system is already well-structured with CSS variables, making this relatively straightforward
- This is a lower priority than content improvements

**Priority: Low**

---

### 9. Performance Considerations

**Problem:** The home page is entirely `"use client"` because of the Three.js globe and Framer Motion animations. This means the entire page is client-rendered, which affects initial load time and SEO (though Next.js handles this reasonably well).

**Recommendations:**
- Keep the globe as a dynamic import (already done correctly)
- Consider **lazy-loading the globe** so it only initializes when visible, or providing a static fallback for the initial render
- The Three.js bundle (three + react-three/fiber + drei) is substantial — consider whether the globe adds enough value on mobile (where 3D performance varies). A simpler animated SVG or CSS animation could serve mobile visitors better
- Add `loading="lazy"` to photography images
- Consider adding a **`next.config.js` image optimization** configuration for Supabase-hosted photos

**Priority: Low** — The site likely performs fine for most visitors, but worth addressing for mobile.

---

### 10. Small but Impactful Polish Items

These are individually minor but collectively raise the quality bar:

- **Remove default Next.js assets** from `/public` (vercel.svg, file.svg, globe.svg, window.svg, next.svg) — they serve no purpose
- **Add a 404 page** — a custom not-found page that matches the site design
- **Add page transitions** — smooth transitions between pages using Framer Motion's layout animations or Next.js View Transitions
- **Add a "back to top" button** on long pages (especially About)
- **Improve the empty state** on Photography — the "Gallery Coming Soon" message could link to Instagram as a preview
- **Add keyboard navigation** support for the tools dropdown in the navbar
- **Add `aria-label` and focus management** improvements for accessibility
- **Consider adding a "Uses" page** (`/uses`) listing your tools, hardware, software setup — this is popular in the developer community and good for SEO on long-tail search terms

**Priority: Low-Medium**

---

## Recommended Implementation Order

Based on impact vs. effort:

### Phase 1 — Foundation & Identity (Highest Impact)
1. Add a profile photo to the About page and home page
2. Write a personal narrative for the About page
3. Create OG image, favicon, sitemap, robots.txt
4. Expand the home page with featured work, intro section, and CTAs
5. Clean up `/public` directory

### Phase 2 — Blog & Content (Highest Long-Term Value)
6. Set up MDX blog infrastructure
7. Build blog index and post pages
8. Write 2-3 initial blog posts
9. Add RSS feed for blog
10. Add "latest posts" section to home page

### Phase 3 — Polish & Completeness
11. Add tool context/motivation paragraphs
12. Complete or remove Defence Procurement "Coming Soon"
13. Add GitHub to social links
14. Add custom 404 page
15. Add structured data (JSON-LD)
16. Implement light mode toggle
17. Add "Uses" page
18. Mobile performance optimizations for Three.js globe
