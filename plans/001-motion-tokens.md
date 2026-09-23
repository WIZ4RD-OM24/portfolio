# 001 — Add motion tokens and replace every ad-hoc transition

- **Status**: DONE
- **Commit**: 7f2b3b3
- **Severity**: LOW (foundational — plans 002–006 depend on it)
- **Category**: Cohesion & tokens (also fixes two `transition: all` performance findings)
- **Estimated scope**: 2 files (`styles.css`, `404.html`), ~15 one-line edits

## Problem

`styles.css` has colour/radius tokens in `:root` (`styles.css:2-21`) but no motion
tokens. Every transition hand-types a duration (`.15s`, `.2s`, `.25s`) and the
built-in `ease` curve, which is too weak for deliberate motion. Two rules use
`transition: all`, which animates unintended properties:

```css
/* styles.css:143 — current (.chip) */
padding:8px 16px;border-radius:999px;font-size:.875rem;cursor:pointer;transition:all .2s ease;

/* styles.css:331 — current (mobile .nav-links, inside @media (max-width:760px)) */
transform:translateY(-12px);opacity:0;visibility:hidden;transition:all .25s ease;
```

Morphs that move on screen (burger → X, FAQ chevron rotation) use `ease` instead
of an in-out curve.

## Target

New tokens in `:root`, and every transition in `styles.css` rewritten to use them
with explicit property lists. Rules:

- Enter/exit and transform feedback → `var(--ease-out)`
- On-screen morphs (rotation) → `var(--ease-in-out)`
- Colour / border / background / box-shadow changes → plain `ease` (correct for colour)

```css
--ease-out:cubic-bezier(0.23,1,0.32,1);
--ease-in-out:cubic-bezier(0.77,0,0.175,1);
--dur-press:160ms;
--dur-fast:200ms;
--dur-base:250ms;
--dur-reveal:600ms;
```

## Repo conventions to follow

- Tokens live in the `:root` block at `styles.css:2-21`. Same minified style: `--name:value;`, no spaces after the colon, one per line, 2-space indent.
- The file is written in compact one-line-per-rule CSS. Keep that style; do not reformat surrounding rules.

## Steps

1. **`styles.css:20`** — after the line `  --mono:"JetBrains Mono",ui-monospace,SFMono-Regular,Menlo,monospace;` insert:
   ```css
     --ease-out:cubic-bezier(0.23,1,0.32,1);
     --ease-in-out:cubic-bezier(0.77,0,0.175,1);
     --dur-press:160ms;
     --dur-fast:200ms;
     --dur-base:250ms;
     --dur-reveal:600ms;
   ```

2. **`styles.css:50`** (`.btn`) — replace
   `transition:transform .15s ease,background .2s ease,border-color .2s ease,box-shadow .2s ease;`
   with
   `transition:transform var(--dur-press) var(--ease-out),background var(--dur-fast) ease,border-color var(--dur-fast) ease,box-shadow var(--dur-fast) ease;`

3. **`styles.css:62`** (`.nav`) — replace `transition:border-color .25s ease,background .25s ease` with `transition:border-color var(--dur-base) ease,background var(--dur-base) ease`

4. **`styles.css:69`** (`.nav-links a`) — replace `transition:color .2s ease` with `transition:color var(--dur-fast) ease`

5. **`styles.css:73`** (`.burger span`) — replace `transition:transform .25s ease,opacity .2s ease` with `transition:transform var(--dur-base) var(--ease-in-out),opacity var(--dur-fast) ease`

6. **`styles.css:126`** (`.card`) — replace `transition:transform .25s ease,border-color .25s ease,background .25s ease;` with `transition:transform var(--dur-base) var(--ease-out),border-color var(--dur-base) ease,background var(--dur-base) ease;`

7. **`styles.css:143`** (`.chip`) — replace `transition:all .2s ease;` with `transition:color var(--dur-fast) ease,background-color var(--dur-fast) ease,border-color var(--dur-fast) ease;`

8. **`styles.css:150`** (`.proj`) — replace `transition:transform .25s ease,border-color .25s ease;` with `transition:transform var(--dur-base) var(--ease-out),border-color var(--dur-base) ease;`

9. **`styles.css:279`** (`.faq details`) — replace `transition:border-color .2s ease` with `transition:border-color var(--dur-fast) ease`

10. **`styles.css:283`** (`.faq summary::after`) — replace `transition:transform .25s ease` with `transition:transform var(--dur-base) var(--ease-in-out)`

11. **`styles.css:294`** (form inputs) — replace `transition:border-color .2s ease,box-shadow .2s ease;` with `transition:border-color var(--dur-fast) ease,box-shadow var(--dur-fast) ease;`

12. **`styles.css:331`** (mobile `.nav-links`) — replace `transition:all .25s ease;` with
    `transition:transform var(--dur-fast) var(--ease-out),opacity var(--dur-fast) var(--ease-out),visibility var(--dur-fast);`
    (A `visibility` transition stays `visible` for its whole duration whenever one end is `visible`, so the menu stays visible while it fades out and appears immediately when opening. No delay trick is needed.)

13. **`404.html:20`** — the 404 page is intentionally self-contained (see comment on `404.html:10`), so do NOT link tokens. Replace `transition:transform .15s ease}` with `transition:transform 160ms cubic-bezier(0.23,1,0.32,1)}`.

## Boundaries

- Do NOT touch `.reveal` (`styles.css:318-319`). Plan 002 rewrites it.
- Do NOT touch the `@media (prefers-reduced-motion:reduce)` block (`styles.css:343-347`).
- Do NOT touch `@keyframes pulse`, `@keyframes slide`, `.dot` or `.marquee-track` animations (they are correct: `linear` for the marquee).
- Do NOT change any `:hover` rule, colours, or markup. Only the `transition` values listed.
- If any "replace X" string above is not found verbatim, STOP and report the drift instead of improvising.

## Verification

- **Mechanical** (no build step exists):
  - `grep -n "transition:all" styles.css` → no output.
  - `grep -nE "\.[0-9]+s ease" styles.css` → only the `.reveal` line (`opacity .6s ease,transform .6s ease`) remains.
  - `python -m http.server 5173` and open http://localhost:5173. The DevTools console shows no CSS parse warnings.
- **Feel check**:
  - Resize to < 760px, tap the burger quickly several times. The menu slides and fades in about 200ms, and closing mid-open reverses smoothly from where it was without jumping.
  - The burger's X morph visibly accelerates and decelerates (in-out) rather than starting fast.
  - Click chips in Work: colour fades, nothing else animates (no padding/size wobble).
  - DevTools → Animations panel at 10% playback: hover a `.btn`. The transform finishes (160ms) before the colour change (200ms).
- **Done when**: both grep checks pass and every `transition` in `styles.css` except `.reveal` references `var(--dur-*)`.
