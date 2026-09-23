# 006 — Animate the FAQ answers opening and closing (progressive enhancement)

- **Status**: DONE
- **Commit**: 7f2b3b3
- **Severity**: LOW (missed opportunity)
- **Category**: Missed opportunities
- **Estimated scope**: 1 file (`styles.css`), ~8 lines
- **Depends on**: 001 (uses `--dur-base`, `--dur-fast`, `--ease-out`)

## Problem

The FAQ uses native `<details>` (`index.html:361-368`). The chevron rotates
smoothly, but the answer text appears and disappears in a single frame, and
everything below jumps:

```css
/* styles.css:278-285 — current (post-001 transition values) */
.faq{display:grid;gap:12px}
.faq details{background:var(--panel);border:1px solid var(--line);border-radius:var(--radius);padding:4px 20px;transition:border-color var(--dur-fast) ease}
.faq details[open]{border-color:#2e3843}
.faq summary{cursor:pointer;list-style:none;padding:16px 28px 16px 0;font-weight:600;font-size:1rem;position:relative}
.faq summary::-webkit-details-marker{display:none}
.faq summary::after{...;transition:transform var(--dur-base) var(--ease-in-out)}
.faq details[open] summary::after{transform:translateY(-20%) rotate(-135deg);border-color:var(--accent)}
.faq details p{color:var(--muted);font-size:.94rem;padding:0 0 18px}
```

## Target

Pure CSS, only in browsers that support animating to `auto` sizes, using
`interpolate-size` and the `::details-content` pseudo-element. Everything else
keeps today's instant behaviour, which is why it's wrapped in `@supports`. No JS.

- Height: `block-size` 0 → `auto`, 250ms, `cubic-bezier(0.23,1,0.32,1)` (content entering → strong ease-out).
- Opacity: 0 → 1, 200ms, same curve.
- `content-visibility` transitions with `allow-discrete`, so the answer stays rendered while it collapses.

```css
/* target */
@supports (interpolate-size:allow-keywords){
  .faq{interpolate-size:allow-keywords}
  .faq details::details-content{
    block-size:0;overflow:hidden;opacity:0;
    transition:block-size var(--dur-base) var(--ease-out),opacity var(--dur-fast) var(--ease-out),content-visibility var(--dur-base) allow-discrete;
  }
  .faq details[open]::details-content{block-size:auto;opacity:1}
}
```

Performance note: `block-size` is a layout property, normally avoided. It's accepted
here because a user-triggered accordion of 8 short items is occasional, and the
content below must move either way. Don't swap it for `transform: scaleY`, which
distorts text.

## Repo conventions to follow

- Compact CSS; FAQ rules live under `/* ---------- faq ---------- */` (`styles.css:277`).
- Multi-line declarations inside a block are acceptable when a rule is long (see `.btn` at `styles.css:46-52`).

## Steps

1. **`styles.css`** — directly after the line `.faq details p{color:var(--muted);font-size:.94rem;padding:0 0 18px}` (currently `styles.css:285`), insert the whole Target block above, exactly as written.

## Boundaries

- Do NOT add JavaScript or change `<details>`/`<summary>` markup.
- Do NOT modify the existing chevron (`summary::after`) rules.
- Do NOT move `interpolate-size` to `:root`. Scope it to `.faq`.
- Do NOT touch the reduced-motion block. Its global `transition-duration:.01ms!important` already makes this instant for reduced-motion users.

## Verification

- **Mechanical**: `python -m http.server 5173`, open http://localhost:5173 in Chrome/Edge 131+. In the console, `CSS.supports('interpolate-size','allow-keywords')` returns `true`.
- **Feel check**:
  - Open "Why are there no prices listed?" (the longest answer). The panel expands quickly and settles, and the text fades in as it opens. The chevron rotation and the height growth feel like one motion.
  - Close it: the text stays readable while the panel collapses, instead of vanishing first and then collapsing.
  - Toggle the same question rapidly with the mouse. The height reverses from its current value without snapping.
  - Animations panel at 10% playback: no frame shows text overflowing outside the card's rounded border.
  - Keyboard: Tab to a summary, press Enter/Space. It animates the same way and focus stays on the summary.
  - Firefox / Safari (or any browser where `CSS.supports` returns false): open and close still work, instantly, with no broken layout.
  - Rendering panel → `prefers-reduced-motion: reduce`: opening is instant.
- **Done when**: answers animate open and closed in Chromium, and behave exactly as before everywhere else.
