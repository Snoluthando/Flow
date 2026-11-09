# Theming guide

All colours live in `app/globals.css`, in three layers:

1. **Palette** (`--navy-900`, `--green-700`…) raw colours, never used in components.
2. **Semantic** (`--bg-card`, `--fg-muted`, `--brand`, `--line`…) what a colour is for. Light values in `:root`, dark in `.dark`.
3. **Component** (`--sidebar-bg`, `--btn-bg`, `--input-border-focus`, `--badge-paid-bg`…) one per UI part. Change one line to restyle one thing.

Each component token is exposed to Tailwind in the `@theme inline` block (e.g. `--btn-bg` -> `bg-btn`).

**To restyle one thing:** edit its component token (in `:root`, and in `.dark` if dark should differ).
**To rebrand everything:** edit the palette / semantic layer.
**Invoice PDF:** colours are in `lib/pdf/theme.ts` (the PDF can't read CSS variables).

## Independent sections

**Navigation card** (`--sidebar-*`, `--nav-*`): takes its values straight from the palette, so it is NOT tied to page cards or dashboard cards. Restyle it freely: background, border, shadow, brand text, section labels, link text/icon/hover/active colours, the "Create invoice" button (`--nav-cta-*`) and the user block at the bottom.

**Dashboard** (`--hero-*`, `--dash-*`, `--stat-icon-*`, `--spark-*`, `--delta-*`, `--chart-*`):
- `--hero-bg` is a full CSS gradient for the greeting banner.
- `--dash-card-*` styles every dashboard card (stat cards, charts, lists) separately from cards on other pages.
- Each stat card has its own icon colours; sparklines, delta colours, bar colours and the five status-donut colours are all separate tokens.

Dashboard numbers come from `lib/dashboard.ts` (period ranges, comparison, chart data).

## Landing page (`app/page.tsx`)

The landing page is a dark, glass-card design that stays dark regardless of the app's light/dark mode.
All of its colours are the `--landing-*` tokens in `app/globals.css`:
- palette, text and accent colours (`--landing-base`, `--landing-text`, `--landing-accent`, `--landing-accent-2`…)
- glass cards (`--landing-card`, `--landing-card-border`, `--landing-card-shadow`, icon glow)
- buttons (`--landing-btn-*`, `--landing-outline*`)
- mountain scene and fog (`--mtn-*`, `--fog-*`)

**Background** (`components/LandingBackground.tsx`): change `MODE` to `"mountains"` (default, pure SVG/CSS),
`"video"` (the Flow clip, plays once and holds the slogan frame) or `"image"` (that last frame as a still).

**Logo** (`components/landing/FlowLogo.tsx`): drawn from `public/flow-logo.svg` / `flow-mark.svg`; its colour follows the text colour.

**Nav links** (`components/landing/LandingNav.tsx`): edit the `LINKS` list at the top. Pricing and About currently point at the closest section.

**Animations** (`components/landing/Reveal.tsx`): fade + lift on scroll, staggered by the `delay` prop; disabled for "reduce motion".

**Fonts**: Playfair Display and Inter are installed locally (`@fontsource-variable/*`), used only on this page.
