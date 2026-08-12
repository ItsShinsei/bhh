# Bee Happy Holiday — Design System

> **Version:** 1.0 · **Theme:** Light · **Platform:** Responsive static web

## Brand direction

Bee Happy Holiday is a warm, trustworthy travel partner based in Surabaya. The visual language pairs editorial hospitality with an approachable travel feel: deep purple for confidence and depth, restrained gold for warmth and premium emphasis, and generous white space for calm decision-making.

**Design principle:** Make planning feel as enjoyable and reassuring as the trip itself.

## Color tokens

Use semantic tokens in components; do not introduce page-level raw hex values.

| Role | Token | Value | Usage |
| --- | --- | --- | --- |
| Deep brand | `--purple-900` | `#1E0730` | deepest backgrounds and contrast |
| Brand dark | `--purple-700` | `#3A0F50` | footer, primary purple surfaces |
| Brand mid | `--purple-600` | `#4E1A6B` | gradients and elevated purple surfaces |
| Body text | `--text` / `--purple-800` | `#2A1838` | headings and primary copy |
| Muted text | `--text-muted` / `--purple-500` | `#6B5A78` | supporting copy and metadata |
| Soft text | `--text-light` | `#9B89A6` | tertiary labels only |
| Accent | `--gold-500` | `#9A761D` | primary CTA, eyebrow, active emphasis |
| Accent hover | `--gold-400` | `#B6942E` | hover and highlighted accent |
| Accent light | `--gold-300` | `#C9A84C` | decorative gold and light theme detail |
| Page surface | `--bg` | `#FFFFFF` | main page background |
| Card surface | `--bg-card` | `#FAF7FC` | cards and quiet surfaces |
| Soft tint | `--bg-tint` | `#F4EEF7` | hover backgrounds and page tint |
| Border | `--border` | purple alpha | default separators |

`--purple-rgb` (`58, 15, 80`) exists for alpha-based purple surfaces and shadows. Functional colors such as WhatsApp green and destructive red remain explicit because they are external/semantic colors.

## Typography

- **Display:** Playfair Display, 700/900; headings, card titles, brand wordmark.
- **Body:** Inter, 400–700; navigation, labels, descriptions, controls.
- **Body line-height:** 1.75 for paragraphs; 1.6 for UI text.
- **Heading line-height:** 1.15.
- **Eyebrow:** Inter, 0.72rem, 600, uppercase, `0.22em` tracking, gold.

| Role | Size | Weight |
| --- | --- | --- |
| `h1` | `clamp(2.2rem, 5.5vw, 4rem)` | 900 |
| `h2` | `clamp(1.7rem, 3.5vw, 2.6rem)` | 700 |
| `h3` | `clamp(1.2rem, 2vw, 1.5rem)` | 700 |
| UI text | 0.78–1rem | 500–600 |
| Body | 0.92rem | 400 |

## Spacing, shape, and elevation

Use the existing `--space-*` scale in `tokens.css` and the 4/8 rhythm. Common section spacing is 3–5rem; card and control spacing uses 0.5–1.5rem.

- `--radius-sm`: compact controls and labels
- `--radius`: buttons, panels, dropdowns
- `--radius-lg`: cards and large content surfaces
- `--radius-full`: badges and pills
- `--shadow-sm`: navigation and subtle separation
- `--shadow`: cards at rest
- `--shadow-lg`: hover cards, dropdowns, elevated surfaces

## Components

### Navigation

The fixed navigation is the persistent primary route. It uses a translucent white surface, blur, a subtle border, and purple active state. Dropdowns reveal on hover/focus; mobile uses the existing menu disclosure. Structural icons are SVGs from `js/icons.js`, not emoji. Keep labels visible alongside icons and preserve the 44px+ effective touch area.

### Buttons

- `.btn-primary`: one primary conversion action per region; gold background and white text.
- `.btn-outline`: secondary action; purple border and text.
- `.btn-wa`: WhatsApp action; reserved for contact/conversion actions.
- `.btn-ghost`: low-emphasis utility action.
- `.btn-lg` / `.btn-sm`: size variants.

Every button needs visible hover/focus/pressed states. Do not rely on hover alone. `.btn--block` makes a full-width mobile CTA; `.btn--fit` keeps a content-width action.

### Cards

`.card` is for package/listing content and uses a quiet surface, border, rounded corners, and a translate/shadow hover state. `.doc-card` is for service/category information. Keep card actions text-labelled and do not encode meaning through color alone.

### Footer

The purple footer closes every page with four clear groups: brand, travel packages, services/about, and contact. Footer link and contact icons use the shared SVG family and inherit their color via `currentColor`.

### Feedback and motion

Reveal and hover transitions use the existing fast/mid/slow timing tokens. `prefers-reduced-motion: reduce` removes reveal transforms, decorative floating motion, and smooth scrolling while keeping content visible and usable.

## Utility classes

Utilities live in `css/base/utilities.css` and replace repeated inline styles:

- **Spacing:** `.mt-2` through `.mt-12`, `.mb-2` through `.mb-10`, `.mx-auto`
- **Layout:** `.flex`, `.flex-col`, `.flex-wrap`, `.items-center`, `.items-start`, `.justify-center`, `.justify-between`, `.stack`, `.grid-2`, `.gap-1` through `.gap-10`
- **Type:** `.text-xs`, `.text-sm`, `.text-md`, `.text-base`, `.text-lg`, `.text-xl`, `.fw-500`, `.fw-600`, `.fw-700`, `.uppercase`, `.ls-sm`, `.ls-md`, `.ls-lg`, `.lh-normal`, `.lh-loose`
- **Width:** `.mw-sm`, `.mw-md`, `.mw-lg`
- **Helpers:** `.doc-card--center`, `.doc-icon--center`, `.btn--fit`, `.btn--block`, `.stat-tile`, `.stat-num-lg`, `.icon-lg`, `.panel-gold`, `.list-col`, `.list-row`, `.team-avatar`, `.team-name`, `.team-role`, `.no-underline`, `.section--flush-bottom`

## Accessibility and quality rules

1. Maintain at least 4.5:1 contrast for normal text and preserve visible `:focus-visible` rings.
2. Keep interactive hit areas at least 44px; provide text labels for navigation destinations and icon-only controls.
3. Use meaningful `alt` text for images. Decorative SVG icons use `aria-hidden="true"`.
4. Preserve heading order and move focus logically after route/modal changes.
5. Respect `prefers-reduced-motion`; never make an animation required to understand content.
6. Do not use emoji as structural icons. Content illustration/expressive emoji may remain in editorial sections.
7. Prefer utility/component classes over inline styles. Data-driven inline styles (for example, a dynamic image background or animation delay) are acceptable when CSS cannot know the value.
8. Keep the single primary CTA visually dominant; secondary and informational actions must remain subordinate.
9. Test responsive behavior at 375px, 768px, 1024px, and 1440px. Do not introduce horizontal scrolling.
