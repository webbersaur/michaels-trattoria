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
- `index.html` — Homepage (hero, about, featured dishes, gallery, lightbox, private events CTA, rate modal, contact/hours)
- `menu.html` — Hub page linking to 6 sub-menus
- `dinner-menu.html`, `lunch-menu.html`, `pizza-menu.html`, `desserts-menu.html`, `wine-menu.html`, `catering-menu.html` — Individual menu pages
- `private-events.html` — Private dining room info (10-40 guests)

### CSS (2 files, no preprocessor)
- `css/styles.css` (~1,400 lines) — Full site: reset, nav, hero, about, gallery, lightbox, events, contact, footer, rate modal, animations, responsive breakpoints (1024/768/480px)
- `css/menu.css` (~490 lines) — Menu pages: hero, category nav, menu items, landing grid, events page layout, footer info

**Theming via CSS custom properties** on `:root`: dark background (`#1a1a1a`), gold accents (`#c9a96e`), three font families (`--font-script`, `--font-heading`, `--font-body`), spacing scale, transition speeds.

### JavaScript (1 file)
- `js/main.js` (~420 lines) — IIFE with: navbar scroll/mobile toggle, dropdown menus, lightbox gallery (keyboard-accessible, circular nav), IntersectionObserver fade-in animations, rate-your-experience modal (happy → review links, sad → Formspree feedback form), smooth scroll to anchors.

### Config & SEO Files
- `vercel.json` — 301 redirects from old WordPress directory URLs (e.g., `/dinner/` → `/dinner-menu.html`)
- `sitemap.xml` — All pages with lastmod dates and priority levels
- `robots.txt` — Allow all, links to sitemap
- `llms.txt` — Structured business info for LLM discovery

## Schema & SEO Patterns

Every page has: meta description, canonical URL, Open Graph tags (title, description, url, type, image, site_name), and favicon links.

**JSON-LD structured data** varies by page:
- `index.html` — `Restaurant` with address, geo, hours, hasMenu (MenuSection/MenuItem with prices), OrderAction (DoorDash), SpeakableSpecification
- Menu pages — `Menu` with `hasMenuSection` arrays containing every `MenuItem` (name, description, price)
- `menu.html` — `ItemList` with 6 `ListItem` entries linking to sub-menus
- `private-events.html` — `Restaurant` with `amenityFeature` array, `maximumAttendeeCapacity`, SpeakableSpecification

When adding/editing menu items in HTML, also update the corresponding JSON-LD block to stay in sync.

## Conventions

- **Images:** All WebP, named with lowercase hyphenated SEO keywords (e.g., `filet-mignon-mushroom-gravy-mashed-potatoes.webp`). All non-hero images use `loading="lazy"`.
- **Responsive:** Mobile-first with `clamp()` for fluid typography. Breakpoints at 1024px, 768px, 480px.
- **Accessibility:** ARIA labels on interactive elements (modals, lightbox, hamburger), semantic HTML (`<nav>`, `<main>`, `<section>`, `<article>`, `<address>`), keyboard navigation support.
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
- **Nav:** All sub-pages use `class="navbar scrolled"` (pre-scrolled state). Homepage nav scrolls dynamically.
- **Forms:** Formspree (`https://formspree.io/f/xdkogpyn`) for the feedback form in the rate modal.
- **Sitemap:** Update `<lastmod>` dates when modifying pages.
