# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static HTML/CSS/JS website for **Michael's Trattoria**, an Italian restaurant at 344 Center Street, Wallingford, CT 06492. Phone: (203) 269-5303. No build system, bundler, or package manager — files are served directly via **Vercel** (auto-deploys on push to `main`).

## Development

```bash
# Local dev server
python3 -m http.server 8080

# Image processing (macOS)
sips -Z <max_dimension> <file>          # Resize
cwebp -q 85 input.png -o output.webp   # Convert to WebP
```

There are no tests, linters, or build steps.

## Architecture

### Pages (9 HTML files)
- `index.html` — Homepage (hero, about, featured dishes, gallery, lightbox, private parties CTA, rate modal, contact/hours)
- `menu.html` — Hub page linking to 6 sub-menus
- `dinner-menu.html`, `lunch-menu.html`, `pizza-menu.html`, `desserts-menu.html`, `wine-menu.html`, `catering-menu.html` — Individual menu pages
- `private-parties.html` — Private parties page with 4 dining rooms (16-75 guests), room cards, FAQ section with FAQPage schema
- `restaurants-in-wallingford.html` — SEO landing page targeting "restaurants in wallingford" keyword, with rich local content, FAQPage schema, and internal links

### CSS (2 files, no preprocessor)
- `css/styles.css` (~1,400 lines) — Full site: reset, nav, hero, about, gallery, lightbox, events, contact, footer, rate modal, animations, responsive breakpoints (1024/768/480px)
- `css/menu.css` (~560 lines) — Menu pages: breadcrumbs, browse-other-menus, hero, category nav, menu items, landing grid, events page layout, FAQ accordion, footer info

**Theming via CSS custom properties** on `:root`: dark background (`#1a1a1a`), gold accents (`#c9a96e`), three font families (`--font-script`, `--font-heading`, `--font-body`), spacing scale, transition speeds.

### JavaScript (1 file)
- `js/main.js` (~490 lines) — IIFE with: navbar scroll/mobile toggle, dropdown menus, lightbox gallery (keyboard-accessible, circular nav), IntersectionObserver fade-in animations, rate-your-experience modal, the private-feedback form (posts JSON to `/api/contact`), smooth scroll to anchors.

### Serverless
- `api/contact.js` — Vercel serverless function (CommonJS, zero-dependency, uses global `fetch`) that emails the private-feedback form via **Resend** to `michaelstrattoria@att.net`, sending from `noreply@webbersaurus.com` (the shared Webbersaurus Resend account's already-verified domain, so no per-site DNS was needed — same `RESEND_API_KEY` as martins-website / pavement-protectors). Has a `company` honeypot. **Requires env var `RESEND_API_KEY`** — set in Vercel **Production** (encrypted). *Preview* env is NOT set: the CLI won't take it non-interactively; add it from the Vercel dashboard if branch previews ever need to send mail. `CONTACT_TO_EMAIL` / `CONTACT_FROM_EMAIL` are optional overrides with correct defaults in code.
- This **replaced a dead Formspree endpoint** (`formspree.io/f/michaelstrattoria@att.net` — an email address where a form ID belongs, so it was almost certainly discarding every submission).

### Config & SEO Files
- `vercel.json` — `cleanUrls: true` for extension-free URLs (Vercel auto-redirects `.html` → clean). 22 permanent 301 redirects from old WordPress directory URLs (e.g., `/dinner/` → `/dinner-menu`).
- `sitemap.xml` — 10 URLs (9 pages + llms.txt) with lastmod dates and priority levels
- `robots.txt` — Allow all, disallows report files, links to sitemap
- `llms.txt` — Structured business info for LLM discovery

### Internal Report Files (not indexed)
- `seo-rankings-report.html` — Client-facing SEO rankings tracker (has `noindex, nofollow` meta tag)
- `seo-assessment.html` — SEO audit assessment
- `work-report.html` — Development work log

All three are blocked in `robots.txt` and excluded from `sitemap.xml`.

## Performance Patterns

The homepage and sub-pages use different loading strategies:

**Homepage (`index.html`):**
- Critical CSS inlined in `<style>` tag (navbar, hero, buttons, layout primitives)
- Full `styles.css` loaded non-render-blocking: `media="print" onload="this.media='all'"` with `<noscript>` fallback
- LCP image preloaded: `<link rel="preload" as="image" ...>`
- Hero image uses `loading="eager" fetchpriority="high"`
- JS loaded with `defer`

**All sub-pages (menu, events):**
- Fonts loaded non-render-blocking with same `media="print" onload` pattern + `<noscript>` fallback
- Both `styles.css` and `menu.css` loaded non-render-blocking with same pattern
- JS loaded with `defer`
- No inlined critical CSS (relies on async loading)

## Schema & SEO Patterns

Every page has: meta description, canonical URL, Open Graph tags, `twitter:card` meta tag, and favicon links.

**JSON-LD structured data** varies by page:
- `index.html` — `Restaurant` (with `@id: #restaurant`) including address, geo, hours, hasMenu (MenuSection/MenuItem with prices), OrderAction (DoorDash), SpeakableSpecification
- Menu pages — `Menu` with `hasMenuSection` arrays containing every `MenuItem` (name, description, price). `mainEntity` references the Restaurant `@id`.
- `menu.html` — `ItemList` with 6 `ListItem` entries linking to sub-menus
- `private-parties.html` — `Restaurant` with `amenityFeature` array (4 rooms), `maximumAttendeeCapacity: 75`, SpeakableSpecification, plus `FAQPage` schema with 12 questions
- All sub-pages — `BreadcrumbList` schema

When adding/editing menu items in HTML, also update the corresponding JSON-LD block to stay in sync.

**Google integrations:** GA4 (`G-HGC476RN0K`) and Site Verification (`uEe5-TNKQqWojQrGLuxkLwjym9q5Pc6-8KDgQpMw7Ks`) on all pages.

## Sub-Page Structure

All sub-pages share this common structure:
1. `<head>`: gtag → meta description → title → canonical + OG + twitter:card → favicon → font preconnect/preload → async CSS → JSON-LD schemas → site verification
2. `<nav class="navbar scrolled">` (pre-scrolled dark state, unlike homepage which scrolls dynamically)
3. `<section class="menu-hero">` with breadcrumb nav inside, then h1
4. Main content area
5. "Browse Other Menus" cross-link section (menu pages only — excludes the current page from links)
6. Footer info section (location, contact, hours)
7. Copyright footer
8. `<script src="js/main.js" defer>`

## Conventions

- **Images:** All WebP, named with lowercase hyphenated SEO keywords (e.g., `filet-mignon-mushroom-gravy-mashed-potatoes.webp`). All non-hero images use `loading="lazy"`.
- **Responsive:** Mobile-first with `clamp()` for fluid typography. Breakpoints at 1024px, 768px, 480px.
- **Accessibility:** ARIA labels on interactive elements (modals, lightbox, hamburger), semantic HTML, keyboard navigation support.
- **Animations:** `.fade-in` class + IntersectionObserver (0.1 threshold) for scroll-triggered reveals.
- **Menu item HTML pattern:**
  ```html
  <div class="menu-item">
      <div class="menu-item-header">
          <h4 class="menu-item-name">Item Name</h4>
          <span class="menu-item-price">29.95</span>
      </div>
      <p class="menu-item-description">Description text</p>
  </div>
  ```
- **Nav:** All sub-pages use `class="navbar scrolled"` (pre-scrolled state). Homepage nav scrolls dynamically at 50px threshold.
- **Forms:** the rate modal's private-feedback form posts JSON to `/api/contact` (Vercel function → Resend). No Formspree.
- **Rate Us modal — NO REVIEW GATING (2026-07-14).** The modal used to fork on sentiment: a "Happy" button that showed the review links and a "Not Happy" button that diverted to a private form instead. **That is review gating, which Google has prohibited since 2018 and suspends Business Profiles over.** It was removed. `rateStep1` now shows the **review links (Google, TripAdvisor, Facebook, Yelp) to everyone**, with an opt-in `rateStepPrivate` ("Something wasn't right? Tell us privately instead") offered *alongside* them, never in place of them. **Do not reintroduce a sentiment fork.**
- **Breadcrumbs:** All sub-pages have `<nav class="breadcrumb" aria-label="Breadcrumb">` inside the hero section. Menu sub-pages use 3-level breadcrumbs (Home → Menus → Page).
- **FAQ accordion:** Uses native `<details>`/`<summary>` elements with CSS-only +/− toggle animation.
- **Sitemap:** Update `<lastmod>` dates when modifying pages.
- **Internal links:** All internal links use clean URLs (e.g., `href="/menu"`, `href="/dinner-menu"`, `href="/private-parties"`). Homepage links use `href="/"`. Canonical, OG, JSON-LD, and sitemap URLs also use clean format. Each menu sub-page cross-links to all other menus via "Browse Other Menus" section.
