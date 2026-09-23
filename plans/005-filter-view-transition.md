# 005 — Animate the project filter with the View Transitions API

- **Status**: DONE
- **Commit**: 7f2b3b3
- **Severity**: LOW (missed opportunity; the most visible "modern" upgrade)
- **Category**: Missed opportunities
- **Estimated scope**: 2 files (`script.js`, `styles.css`), ~30 lines
- **Depends on**: 002 (revealed cards must no longer carry `.reveal.in`, otherwise re-shown cards replay the reveal inside the transition)

## Problem

Clicking a filter chip hides non-matching projects instantly. The grid reflows in
one frame, with cards jumping from column to column and the empty message popping in:

```js
/* script.js:70-91 — current */
/* ---- project filter ---- */
var chips = $$('.chip');
var projects = $$('#work-grid .proj');
var emptyMsg = $('#work-empty');
chips.forEach(function (chip) {
  chip.addEventListener('click', function () {
    var filter = chip.dataset.filter;
    chips.forEach(function (c) {
      var on = c === chip;
      c.classList.toggle('is-active', on);
      c.setAttribute('aria-pressed', String(on));
    });
    var shown = 0;
    projects.forEach(function (p) {
      var tags = (p.dataset.tags || '').split(/\s+/);
      var match = filter === 'all' || tags.indexOf(filter) !== -1;
      p.hidden = !match;
      if (match) shown++;
    });
    if (emptyMsg) emptyMsg.hidden = shown !== 0;
  });
});
```

The page doesn't explain where cards went, and this is exactly the kind of spatial
change motion is for. Filtering happens a few times per visit, so a short transition is justified.

## Target

- Wrap the DOM update in `document.startViewTransition()` where supported, and skip it under `prefers-reduced-motion: reduce`. Unsupported browsers (older Firefox/Safari) get today's instant behaviour, with no polyfill.
- Each project card gets a unique `view-transition-name` (set from JS) and a shared `view-transition-class: proj`.
- **Staying cards** glide to their new grid positions: 250ms, `cubic-bezier(0.77,0,0.175,1)` (strong ease-in-out, for on-screen movement).
- **Entering cards**: fade from 0 plus `scale(.97)` → 1 over 200ms, `cubic-bezier(0.23,1,0.32,1)`, delayed 50ms so they arrive after the gap opens.
- **Leaving cards**: fade to 0 plus `scale(.97)` over 150ms, `cubic-bezier(0.23,1,0.32,1)`.
- Never `scale(0)`.

View-transition pseudo-elements are styled with **literal values**, not `var(--…)`,
so older implementations can't resolve them wrong.

## Repo conventions to follow

- `script.js` is ES5 inside an IIFE: `var`, `function () {}`, no arrow functions. Section comments look like `/* ---- project filter ---- */`.
- CSS is compact one-line rules. Put new rules right after the Work section's `.empty{...}` rule (`styles.css:203`).

## Steps

1. **`script.js`** — replace the whole block from `  /* ---- project filter ---- */` through the closing `  });` of `chips.forEach` (`script.js:70-91`) with:
   ```js
  /* ---- project filter ---- */
  var chips = $$('.chip');
  var projects = $$('#work-grid .proj');
  var emptyMsg = $('#work-empty');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  // Unique names let the browser track each card across the reflow.
  projects.forEach(function (p, i) { p.style.viewTransitionName = 'proj-' + i; });
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      var filter = chip.dataset.filter;
      var apply = function () {
        chips.forEach(function (c) {
          var on = c === chip;
          c.classList.toggle('is-active', on);
          c.setAttribute('aria-pressed', String(on));
        });
        var shown = 0;
        projects.forEach(function (p) {
          var tags = (p.dataset.tags || '').split(/\s+/);
          var match = filter === 'all' || tags.indexOf(filter) !== -1;
          p.hidden = !match;
          if (match) shown++;
        });
        if (emptyMsg) emptyMsg.hidden = shown !== 0;
      };
      if (document.startViewTransition && !reduceMotion.matches) {
        document.startViewTransition(apply);
      } else {
        apply();
      }
    });
  });
   ```

2. **`styles.css`** — directly after `.empty{color:var(--dim);text-align:center;padding:40px 0}` insert:
   ```css
   /* filter reflow: cards glide to new slots, entering/leaving cards fade with a slight scale */
   .proj{view-transition-class:proj}
   ::view-transition-group(.proj){animation-duration:250ms;animation-timing-function:cubic-bezier(0.77,0,0.175,1)}
   ::view-transition-new(.proj):only-child{animation:proj-in 200ms cubic-bezier(0.23,1,0.32,1) 50ms both}
   ::view-transition-old(.proj):only-child{animation:proj-out 150ms cubic-bezier(0.23,1,0.32,1) both}
   @keyframes proj-in{from{opacity:0;transform:scale(.97)}}
   @keyframes proj-out{to{opacity:0;transform:scale(.97)}}
   ```
   Keep these as separate rules. If a browser doesn't support class selectors in view-transition pseudos, only those rules are dropped, and the default crossfade still works.

## Boundaries

- Do NOT change filter logic, chip markup, `aria-pressed` handling, or `data-tags`.
- Do NOT add a polyfill or dependency.
- Do NOT give `#work-grid`, sections, or the nav a `view-transition-name`. Only `.proj` cards.
- Do NOT animate grid `height`/`gap` with CSS transitions. The view transition handles the reflow.
- If `script.js:70-91` doesn't match the excerpt above, STOP and report.

## Verification

- **Mechanical**: `python -m http.server 5173`, open http://localhost:5173 in Chrome/Edge 125+ (for class selectors), no console errors.
- **Feel check**:
  - Scroll to Work (let the cards finish revealing). Click **Web apps**: non-matching cards shrink slightly and fade out, and the remaining cards slide to fill the first slots. Click **All**: cards glide back and the returning cards scale up from 0.97 and fade in.
  - Returning cards do **not** replay the 18px scroll-reveal rise. If they do, plan 002 isn't applied.
  - Click **Mobile** → **E-commerce** → **All** rapidly. No console errors, and the final state is always correct. A new transition skips the previous one; that's expected.
  - DevTools → Animations panel at 10%: movement curves accelerate then decelerate, and nothing ever scales from 0.
  - Content below the grid (Process section) shifts with the root crossfade. Check it doesn't visibly double-expose. If it does, report it; don't improvise a fix.
  - Rendering panel → `prefers-reduced-motion: reduce`: filtering is instant, as before.
  - Firefox (or any browser without `startViewTransition`): filtering works instantly with no errors.
- **Done when**: filtering animates in Chromium, is instant under reduced motion and in unsupported browsers, and filter results are unchanged.
