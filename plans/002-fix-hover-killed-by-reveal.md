# 002 — Fix card hover lift that the scroll reveal silently disables

- **Status**: DONE
- **Commit**: 7f2b3b3
- **Severity**: HIGH
- **Category**: Cohesion (cascade bug) / Easing & duration
- **Estimated scope**: 2 files (`styles.css`, `script.js`), ~15 lines
- **Depends on**: 001 (uses `--ease-out`, `--dur-reveal`)

## Problem

Every `.card` (3) and `.proj` (5) in `index.html` also carries the `reveal` class
(e.g. `index.html:101`, `index.html:155`). The reveal rules are declared *after* the
card rules with equal specificity, so they win:

```css
/* styles.css:318-319 — current */
.reveal{opacity:0;transform:translateY(18px);transition:opacity .6s ease,transform .6s ease}
.reveal.in{opacity:1;transform:none}
```

```css
/* styles.css:124-128 — current (post-001 transition values) */
.card{ ... transition:transform var(--dur-base) var(--ease-out),border-color var(--dur-base) ease,background var(--dur-base) ease; }
.card:hover{transform:translateY(-4px);border-color:#2e3843;background:var(--panel-2)}
/* styles.css:157 */
.proj:hover{transform:translateY(-4px);border-color:#2e3843}
```

1. `.reveal.in` (specificity 0,2,0, line 319) beats `.card:hover` / `.proj:hover` (0,2,0, lines 128/157) because it comes later, so **the hover lift never happens**.
2. `.reveal`'s `transition` (line 318) replaces `.card`'s and `.proj`'s, so the border/background hover change **snaps with no transition**.
3. The reveal itself uses the plain `ease` curve, so it drifts in instead of arriving.

The reveal is driven by `script.js:39-52`:

```js
/* script.js:39-52 — current */
var revealables = $$('.reveal');
if ('IntersectionObserver' in window) {
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry, i) {
      if (!entry.isIntersecting) return;
      var el = entry.target;
      setTimeout(function () { el.classList.add('in'); }, Math.min(i * 60, 240));
      io.unobserve(el);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  revealables.forEach(function (el) { io.observe(el); });
} else {
  revealables.forEach(function (el) { el.classList.add('in'); });
}
```

## Target

The reveal becomes a one-shot **keyframe animation** on the individual `translate`
property (not `transform`, and it never declares `transition`). When it ends, JS
removes `reveal` and `in`, leaving the element as a plain card with its own
transitions and hover intact. Removing the classes also matters for plan 005: an
element shown again after `display:none` must not replay the reveal.

```css
/* target — replaces styles.css:318-319 */
.reveal{opacity:0}
.reveal.in{animation:reveal var(--dur-reveal) var(--ease-out) both}
@keyframes reveal{from{opacity:0;translate:0 18px}to{opacity:1;translate:none}}
```

Values: 600ms (`--dur-reveal`, fine for a marketing-page entrance), `cubic-bezier(0.23,1,0.32,1)` (`--ease-out`), 18px travel.

## Repo conventions to follow

- Compact one-line CSS, section comments like `/* ---------- reveal ---------- */` (`styles.css:317`).
- `script.js` is ES5 inside an IIFE: `var`, `function () {}`, no arrow functions, no `const`/`let`. Match it exactly.

## Steps

1. **`styles.css:318-319`** — replace both lines with the three target lines above.

2. **`styles.css:346`** (inside `@media (prefers-reduced-motion:reduce)`) — replace `  .reveal{opacity:1;transform:none}` with `  .reveal{opacity:1}`.

3. **`script.js:45`** — replace
   ```js
        setTimeout(function () { el.classList.add('in'); }, Math.min(i * 60, 240));
   ```
   with
   ```js
        setTimeout(function () { reveal(el); }, Math.min(i * 60, 240));
   ```

4. **`script.js:51`** — replace
   ```js
     revealables.forEach(function (el) { el.classList.add('in'); });
   ```
   with
   ```js
     revealables.forEach(reveal);
   ```

5. **`script.js`** — directly above the line `  /* ---- scroll reveal ---- */` (line 38), insert:
   ```js
  /* Play the reveal once, then drop the classes so the element's own
     transitions and hover transforms take over again. */
  function reveal(el) {
    var done = function (e) {
      if (e.target !== el) return; // ignore animations bubbling from children
      el.removeEventListener('animationend', done);
      el.removeEventListener('animationcancel', done);
      el.classList.remove('reveal', 'in');
    };
    el.addEventListener('animationend', done);
    el.addEventListener('animationcancel', done);
    el.classList.add('in');
  }

   ```
   (A function declaration is hoisted inside the IIFE, so placement before or after use both work. Put it here for readability.)

## Boundaries

- Do NOT change the IntersectionObserver options, the 60ms/240ms stagger, or which elements have `reveal` in `index.html`.
- Do NOT touch `.card:hover` / `.proj:hover` rules (plan 004 handles hover gating).
- Do NOT use `transform` in the `@keyframes reveal`. It must be `translate`, so it composes with hover `transform`.
- No new dependencies. If the code at the cited lines differs, STOP and report.

## Verification

- **Mechanical**: `python -m http.server 5173`, open http://localhost:5173, console has no errors. In the console after scrolling to the bottom, `document.querySelectorAll('.reveal').length` returns `0`.
- **Feel check**:
  - Scroll to Services. Cards rise 18px and fade in, arriving fast and settling (not drifting). The three cards stagger by about 60ms.
  - After they land, hover a card. It **lifts 4px** and the border/background **fade** over about 250ms. Before this fix neither happened.
  - Hover a card *while* it is still revealing (DevTools Animations panel at 10%). The lift and the reveal translate combine without jumping.
  - Work section: click "Mobile", then "All". Re-shown cards do **not** replay the rise animation.
  - Enable `prefers-reduced-motion: reduce` (Rendering panel) and reload. Content is visible immediately, and hover colour changes still work.
- **Done when**: hover lift works on all 8 cards, and no `.reveal` elements remain after scrolling the full page.
