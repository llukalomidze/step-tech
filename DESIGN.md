# STEP TECH design system

## Color strategy

**Restrained.** Warm tinted neutrals carry every surface; one warm accent appears in ≤10% of the visible surface (CTAs, active chips, focus rings, link hovers, key indicators). Avoid second accents; rely on type weight and scale for hierarchy.

## Theme

Light. Scene: tech-curious shopper at a kitchen table on a bright afternoon, scrolling on a 14-inch laptop with a coffee. Warm ambient light, relaxed mood. The interface should feel like flipping through a print magazine, not staring at a terminal.

## Palette (OKLCH)

All neutrals tinted toward cool blue-grey (h ≈ 250) so the surface reads as an "office paper" white rather than a clinical or warm one. Single muted slate-blue accent. (Note: warm cream + terracotta variant lives in palette history, kept aside for future projects.)

| Token | OKLCH | Use |
|---|---|---|
| `--bg`             | `oklch(0.97 0.004 250)`  | Page background, cool off-white |
| `--surface`        | `oklch(0.985 0.003 250)` | Cards, elevated panels |
| `--surface-2`      | `oklch(0.935 0.006 250)` | Hover, alternate sections |
| `--ink`            | `oklch(0.18 0.020 260)`  | Primary text, headings |
| `--ink-soft`       | `oklch(0.30 0.018 260)`  | Secondary headings |
| `--muted`          | `oklch(0.50 0.012 260)`  | Body muted, helper text |
| `--dim`            | `oklch(0.68 0.010 260)`  | Captions, disabled |
| `--border`         | `oklch(0.88 0.006 250)`  | Card borders, dividers |
| `--border-strong`  | `oklch(0.78 0.008 250)`  | Hover borders |
| `--accent`         | `oklch(0.45 0.11 250)`   | The single cool accent (muted slate blue) |
| `--accent-strong`  | `oklch(0.35 0.11 250)`   | Pressed / hover state |
| `--accent-soft`    | `oklch(0.92 0.025 250)`  | Tinted backgrounds |
| `--accent-tint`    | `oklch(0.96 0.012 250)`  | Notice / pill backgrounds |
| `--success`        | `oklch(0.55 0.10 145)`   | Confirmations |
| `--danger`         | `oklch(0.55 0.16 25)`    | Errors |
| `--rating`         | `oklch(0.78 0.12 70)`    | Stars |

Rule of thumb: chroma drops as lightness approaches 0 or 100. No `#000` / `#fff` anywhere.

## Typography

Editorial pairing: a variable serif for display, a tight sans for body, a mono for monospaced labels and prices.

| Role | Family | Notes |
|---|---|---|
| Display | **Fraunces** (variable, opsz + soft + wonk axes) | Italic optical sizing for emphasis. Big editorial moments. |
| Body | **Inter Tight** | 300-700; tight tracking; numerals in tabular |
| Mono | **JetBrains Mono** | Eyebrows, prices, captions, micro-labels |

Scale (1.25 ratio, with display headings stretching further):

```
xs   .72 rem  · mono labels, eyebrows
sm   .82 rem  · meta text, fine print
base 1   rem  · body
lg   1.15 rem · lede paragraphs
xl   1.4 rem  · subhead
2xl  1.85 rem · h3
3xl  2.4 rem  · h2
4xl  clamp(2.8rem, 5.5vw, 4.4rem) · page heading
5xl  clamp(3.5rem, 9vw, 7rem)     · hero
```

Display headings tighten letter-spacing to `-0.025em` to `-0.04em`. Body uses default tracking, line-height 1.6 for prose, 1.45 for UI strings. Cap measure at 65–72ch.

## Layout

- Wide editorial gutters: page max-width 1300px with `clamp(1rem, 3vw, 2rem)` side padding
- Asymmetric grids on hero / about / cta — not all 12-col centered
- Vertical rhythm: hero blocks 6–8rem padding; section gap 5–6rem; card padding 1.4–2rem
- Cards exist but are not the only affordance. Numbered lists, marquee bands, and full-bleed bands appear instead in a few places
- Bento grid for category showcase only (a single instance, not a tic everywhere)

## Elevation

Real shadows cast off the warm background, never pure black:

```
--shadow-sm:  0 2px 6px -2px oklch(0.20 0.02 270 / 0.08)
--shadow-md:  0 18px 36px -12px oklch(0.20 0.02 270 / 0.14)
--shadow-lg:  0 30px 60px -16px oklch(0.20 0.02 270 / 0.20)
```

No glow shadows. No accent-tinted box-shadows on default cards.

## Motion

| Token | Curve | Use |
|---|---|---|
| `--ease-out-quint` | `cubic-bezier(0.22, 1, 0.36, 1)` | Default UI ease |
| `--ease-out-expo`  | `cubic-bezier(0.19, 1, 0.22, 1)` | Reveals, hero |
| `--ease-soft`      | `cubic-bezier(0.4, 0, 0.2, 1)`   | Hovers |

Durations: 200ms (hover), 350ms (focus, swap), 700–900ms (scroll reveals). Never animate layout properties (use transform/opacity). No bounce, no elastic.

### Scroll-driven motion
Scroll-triggered reveals via an `appReveal` directive (IntersectionObserver). Three variants on a `data-reveal` attribute:
- `up` (default): translateY(28px) → 0 + opacity 0 → 1
- `fade`: opacity-only
- `stagger`: container fades children at 60ms intervals

Hero gets a subtle parallax: background shifts at 0.4× scroll, foreground at 1×.

## Anti-patterns banned for this project

- Side-stripe colored borders
- Gradient text via `background-clip`
- Decorative glassmorphism
- Hero metric cards (big number / small label / supporting stats)
- Identical-card grids of icon-heading-paragraph
- Glow shadows around CTAs

## Components — register-relevant choices

- **Button**: warm-cream surface buttons with deep ink labels; the accent variant is solid terracotta on cream, never glowing
- **Product card**: paper surface, no border highlight on hover; instead, image scales softly and a thin underline reveals beneath the title
- **Input**: cream-bg input with 1px warm-grey border; focus ring uses `--accent-soft` not the accent itself
- **Toast**: paper card with a left bar in the role color; never a saturated full-bleed
