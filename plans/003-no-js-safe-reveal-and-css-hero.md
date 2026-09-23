# 003 — Keep content visible without JS; animate the hero with pure CSS

- **Status**: DONE
- **Commit**: 7f2b3b3
- **Severity**: HIGH
- **Category**: Accessibility / robustness (and perceived load speed)
- **Estimated scope**: 2 files (`index.html`, `styles.css`), ~15 lines
- **Depends on**: 001 (tokens) and 002 (`@keyframes reveal`, new `.reveal` rules)

## Problem

After plan 002, the reveal rules are:

```css
/* styles.css — after plan 002 */
.reveal{opacity:0}
.reveal.in{animation:reveal var(--dur-reveal) var(--ease-out) both}
@keyframes reveal{from{opacity:0;translate:0 18px}to{opacity:1;translate:none}}
```

`.reveal{opacity:0}` applies unconditionally, and only `script.js` (loaded with
`defer`, `index.html:435`) ever makes content visible. Two consequences:

1. If the script fails to load or errors, **the whole page stays invisible**: every section heading, card, FAQ and the contact form.
2. The **hero headline**, the page's largest paint, is itself `.reveal`:
   ```html
   <!-- index.html:70-77 — current -->
   <p class="eyebrow reveal"><span class="dot"></span> Available for new projects</p>
   <h1 class="reveal">I build <span class="grad">fast websites</span> that turn visitors into customers.</h1>
   <p class="lede reveal">Freelance web developer ...</p>
   <div class="hero-cta reveal">
   ...
   <ul class="stats reveal">
   ```
   It stays blank until HTML parsing finishes, the deferred script runs, and the IntersectionObserver's first callback fires. On slow phones that blank hero is visible.

## Target

- An inline script in `<head>` adds `js` to `<html>` before first paint. Content is only hidden when `html.js` is present.
- Hero children animate on **first paint with CSS alone**, reusing `@keyframes reveal`, staggered 0/60/120/180/240ms (the same rhythm `script.js:45` uses).

```css
/* target */
.js .reveal{opacity:0}
.js .reveal.in{animation:reveal var(--dur-reveal) var(--ease-out) both}
@keyframes reveal{from{opacity:0;translate:0 18px}to{opacity:1;translate:none}}

.hero-inner>*{animation:reveal var(--dur-reveal) var(--ease-out) both}
.hero-inner>:nth-child(2){animation-delay:60ms}
.hero-inner>:nth-child(3){animation-delay:120ms}
.hero-inner>:nth-child(4){animation-delay:180ms}
.hero-inner>:nth-child(5){animation-delay:240ms}
```

## Repo conventions to follow

- Compact one-line CSS rules; hero styles live under `/* ---------- hero ---------- */` (`styles.css:79`).
- `index.html` already has inline `<script>` in `<head>` (JSON-LD at `index.html:24`), so a tiny inline script there fits.

## Steps

1. **`index.html:22`** — directly *above* `<link rel="stylesheet" href="styles.css">`, insert:
   ```html
   <script>document.documentElement.classList.add('js')</script>
   ```

2. **`index.html:70-77`** — remove the word `reveal` from exactly these five class attributes, and change nothing else on the lines:
   - `class="eyebrow reveal"` → `class="eyebrow"`
   - `<h1 class="reveal">` → `<h1>`
   - `class="lede reveal"` → `class="lede"`
   - `class="hero-cta reveal"` → `class="hero-cta"`
   - `class="stats reveal"` → `class="stats"`

3. **`styles.css`** reveal section — replace
   ```css
   .reveal{opacity:0}
   .reveal.in{animation:reveal var(--dur-reveal) var(--ease-out) both}
   ```
   with
   ```css
   .js .reveal{opacity:0}
   .js .reveal.in{animation:reveal var(--dur-reveal) var(--ease-out) both}
   ```
   Leave the `@keyframes reveal` line as is.

4. **`styles.css`** — directly after the line `.hero-inner{position:relative}` (currently `styles.css:88`, may shift after plan 001), insert the five `.hero-inner>*` lines from Target.

5. **`styles.css`** reduced-motion block — replace `  .reveal{opacity:1}` with:
   ```css
     .js .reveal{opacity:1}
     .hero-inner>*{animation:none}
   ```
   (`animation:none` removes the stagger delays too, so reduced-motion users never see a blank hero for 240ms.)

## Boundaries

- Do NOT change `script.js`. `$$('.reveal')` simply no longer includes hero elements, and the plan 002 `reveal()` helper removes `reveal`/`in` classes, which also ends `.js .reveal` hiding.
- Do NOT add `reveal` or remove it anywhere except the five hero elements.
- Do NOT touch `.glow`, `.dot` pulse, or the marquee.
- If the plan 002 rules are not present in `styles.css`, STOP: this plan requires 002 first.

## Verification

- **Mechanical**: `python -m http.server 5173`, open http://localhost:5173, no console errors.
- **No-JS check**: DevTools → Command menu → "Disable JavaScript", reload. **Every section is visible** and nothing is stuck at opacity 0. The hero does still animate (CSS-only). Re-enable JS afterwards.
- **Feel check**:
  - Hard reload with DevTools Network throttling "Slow 4G". The hero starts animating as soon as the CSS arrives, not after the script loads.
  - The five hero blocks rise in sequence (eyebrow → headline → lede → buttons → stats), each about 60ms apart, with no flash of fully-visible content before the animation starts.
  - Animations panel at 10%: hover "Start a project" while `.hero-cta` is mid-rise. The button's lift composes with the container's `translate` without jumping.
  - `prefers-reduced-motion: reduce` → reload: hero is instantly fully visible.
- **Done when**: page is fully readable with JS disabled, and the hero animates without depending on `script.js`.
