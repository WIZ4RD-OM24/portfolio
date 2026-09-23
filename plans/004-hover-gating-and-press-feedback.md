# 004 — Gate hover lifts to real pointers; add press feedback

- **Status**: DONE
- **Commit**: 7f2b3b3
- **Severity**: MEDIUM
- **Category**: Physicality & origin / Accessibility
- **Estimated scope**: 2 files (`styles.css`, `404.html`), ~15 lines
- **Depends on**: 001 (tokens, chip transition), 002 (without it, card hover lift doesn't work at all, so you can't verify)

## Problem

Hover lifts apply on touch devices, where a tap fires a "sticky" hover. The tapped
button or card stays raised after the finger leaves. Nothing gives feedback when pressed.

```css
/* styles.css:53 — current */
.btn:hover{transform:translateY(-2px)}
/* styles.css:128 — current */
.card:hover{transform:translateY(-4px);border-color:#2e3843;background:var(--panel-2)}
/* styles.css:157 — current */
.proj:hover{transform:translateY(-4px);border-color:#2e3843}
/* styles.css:145-146 — current: chips have colour hover, no press feedback */
.chip:hover{color:var(--text);border-color:#333e4a}
.chip.is-active{background:var(--accent);border-color:var(--accent);color:var(--accent-ink);font-weight:600}
/* 404.html:21 — current */
  a.btn:hover{transform:translateY(-2px)}
```

`.chip` transition after plan 001 (`styles.css:143`):
`transition:color var(--dur-fast) ease,background-color var(--dur-fast) ease,border-color var(--dur-fast) ease;`

## Target

- **Movement** on hover only for `(hover:hover) and (pointer:fine)`, and only when the user hasn't asked for reduced motion.
- **Colour** hover changes stay ungated (harmless on touch).
- **Press**: `transform: scale(0.97)` on `:active` for `.btn` and `.chip`, using `transition: transform 160ms` with the `cubic-bezier(0.23,1,0.32,1)` curve (`--dur-press` / `--ease-out`, already on `.btn` after 001). Pressing a lifted button drops the lift and shrinks, so it reads as pushed down.

```css
/* target, buttons */
@media (hover:hover) and (pointer:fine) and (prefers-reduced-motion:no-preference){
  .btn:hover{transform:translateY(-2px)}
}
.btn:active{transform:scale(.97)}
```

## Repo conventions to follow

- Compact one-line CSS. Media blocks use 2-space-indented rules inside, like `@media (max-width:960px){` at `styles.css:322`.
- Existing `button[disabled]{...;transform:none!important}` (`styles.css:306`) already cancels press scale on disabled buttons. Leave it.

## Steps

1. **`styles.css:53`** — delete the line `.btn:hover{transform:translateY(-2px)}`.

2. **`styles.css`** — directly after the line `.btn.full{width:100%}` (currently `styles.css:59`), insert:
   ```css
   @media (hover:hover) and (pointer:fine) and (prefers-reduced-motion:no-preference){
     .btn:hover{transform:translateY(-2px)}
   }
   .btn:active{transform:scale(.97)}
   ```
   Order matters: `.btn:active` must come **after** the media block, so it wins over `.btn:hover` at equal specificity.

3. **`styles.css:128`** — replace
   `.card:hover{transform:translateY(-4px);border-color:#2e3843;background:var(--panel-2)}`
   with
   ```css
   .card:hover{border-color:#2e3843;background:var(--panel-2)}
   @media (hover:hover) and (pointer:fine) and (prefers-reduced-motion:no-preference){
     .card:hover{transform:translateY(-4px)}
   }
   ```

4. **`styles.css:143`** (`.chip`) — replace
   `transition:color var(--dur-fast) ease,background-color var(--dur-fast) ease,border-color var(--dur-fast) ease;`
   with
   `transition:color var(--dur-fast) ease,background-color var(--dur-fast) ease,border-color var(--dur-fast) ease,transform var(--dur-press) var(--ease-out);`

5. **`styles.css`** — directly after the line `.chip.is-active{...}` (currently `styles.css:146`), insert:
   ```css
   .chip:active{transform:scale(.97)}
   ```

6. **`styles.css:157`** — replace
   `.proj:hover{transform:translateY(-4px);border-color:#2e3843}`
   with
   ```css
   .proj:hover{border-color:#2e3843}
   @media (hover:hover) and (pointer:fine) and (prefers-reduced-motion:no-preference){
     .proj:hover{transform:translateY(-4px)}
   }
   ```

7. **`404.html:21`** — replace `  a.btn:hover{transform:translateY(-2px)}` with:
   ```css
     @media (hover:hover) and (pointer:fine) and (prefers-reduced-motion:no-preference){
       a.btn:hover{transform:translateY(-2px)}
     }
     a.btn:active{transform:scale(.97)}
   ```

## Boundaries

- Do NOT gate colour hovers (`.btn-primary:hover`, `.btn-ghost:hover`, `.chip:hover`, `.nav-links a:hover`, `.link:hover`, `.foot-links a:hover`).
- Do NOT add press feedback to `.card`, `.proj`, links, or `summary`. Only `.btn` and `.chip`.
- Do NOT use a scale lower than `.97`.
- Do NOT touch the global `prefers-reduced-motion` block.
- If the post-001 chip transition string is not found, STOP and report.

## Verification

- **Mechanical**: `python -m http.server 5173`, open http://localhost:5173, no CSS warnings in the console.
- **Feel check (desktop)**:
  - Hover "Start a project": lifts 2px. Press and hold: drops and shrinks slightly (0.97). Release: returns to lifted. All transform changes take about 160ms and decelerate.
  - Click a filter chip: a small squeeze while pressed, with the colour change fading.
  - Hover a Services card and a Work card: both lift 4px.
- **Feel check (touch)**: DevTools device toolbar (mobile preset, reload) or a real phone. Tap "See recent work" and a chip. **Nothing stays lifted** after the tap, and the press squeeze is visible while the finger is down.
- **Reduced motion**: Rendering panel → `prefers-reduced-motion: reduce`. Hovering shows colour change but no lift.
- **Done when**: no ungated `translateY` hover remains (`grep -n "hover{transform" styles.css 404.html` shows matches only inside the new media blocks), and `:active` scale exists for `.btn`, `.chip`, `a.btn` (404).
