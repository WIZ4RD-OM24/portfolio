# Portfolio

A static, dependency-free portfolio and client-acquisition site. Plain HTML, CSS, and JavaScript — no build step, no framework, no npm install.

```
index.html      the whole site (one page, anchor navigation)
styles.css      design tokens + all styling
script.js       nav, scroll reveal, project filter, contact form
404.html        self-contained not-found page
assets/         favicon + social share image
robots.txt      search engine directives
sitemap.xml     one URL, update the date when you change content
.nojekyll       tells GitHub Pages to serve files as-is
```

## Run it locally

Open `index.html` in a browser, or serve it:

```bash
python -m http.server 5173
```

Then visit http://localhost:5173

## Before you go live

Name, email and the contact form are all set. One placeholder remains:

- **Your URL** — replace `https://WIZ4RD-OM24.github.io/portfolio/` in `index.html` (canonical + OG + JSON-LD), `robots.txt`, and `sitemap.xml` if your repo or domain ever changes.

Then work through the "Honesty checklist" below before sending the link to anyone.

## The contact form

Submissions go to Formspree (`https://formspree.io/f/xqpkjozn`) and arrive by email. Free tier is 50 submissions a month; the dashboard keeps a copy of everything.

The form posts via `fetch`, so the visitor never leaves the page: success and failure both render inline, and a failure points them at the email address instead. A hidden `_gotcha` field catches most spam bots.

**Formspree only starts delivering after you confirm the address** — it emails you on the first submission. If enquiries are not arriving, check that first.

**Do not turn on reCAPTCHA in the Formspree dashboard.** It expects a captcha token that only their own hosted form page produces, so every submission from this page is rejected. Spam protection here is the hidden `_gotcha` honeypot plus Formspree's own filtering. If spam ever becomes a real problem, add a honeypot with a delay check or move to a service whose captcha works with AJAX — do not re-enable that toggle.

If the form starts failing, the on-page message now repeats whatever the service said, and the full response is logged to the browser console.

Five fields are sent: `name`, `email`, `project_type`, `timeline`, `message`.

To point the form somewhere else, change the `action` on the `<form>` in `index.html` — nothing else is hard-coded to Formspree.

## Deploy to GitHub Pages (free)

From this directory:

```bash
git init -b main
git add -A
git commit -m "Add portfolio site"
git remote add origin https://github.com/WIZ4RD-OM24/portfolio.git
git push -u origin main
```

Create the `portfolio` repo on GitHub first (public). Then in the repo: **Settings → Pages → Source: Deploy from a branch → Branch: `main` / `(root)` → Save**.

Live in about a minute at `https://WIZ4RD-OM24.github.io/portfolio/`.

### Want the shorter URL?

Name the repo `WIZ4RD-OM24.github.io` instead and it serves at `https://WIZ4RD-OM24.github.io/` with no subpath. Cleaner for a business card.

### Custom domain

Buy a domain (~$12/yr), then in **Settings → Pages → Custom domain** enter it, and at your registrar add:

- `A` records for `@` → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
- `CNAME` for `www` → `WIZ4RD-OM24.github.io`

Tick **Enforce HTTPS** once the certificate provisions. GitHub adds a `CNAME` file to the repo automatically — do not delete it.

## Honesty checklist

The site ships with realistic sample content so you can see the design working. Before it goes in front of a client, every one of these must be true or gone:

- [x] **Projects** — all seven cards are real work. Keep it that way: delete a card rather than pad the grid.
- [ ] **Testimonials** — these are written samples. Delete the whole `#testimonials` section until you have real quotes with permission to publish them. A fake testimonial is the fastest way to lose a client who checks.
- [x] **Stats** — confirmed accurate. Recheck "stacks shipped this year" each January.
- [ ] **Package contents** — the comparison table is a sensible default, not a contract. Read every row and make sure you are genuinely willing to deliver each "Yes" at a fixed quote, and that each "Not included" is really excluded.

## A note on pricing

The site deliberately shows **no rupee figures** — only timelines and scope. This is the right call for Indian freelance work:

- A published number anchors the negotiation before you know the client's budget, and you can only ever move down from it.
- The same "5-page website" brief ranges from a weekend to a month depending on content, integrations, and how decisive the client is. One public price either loses you the big jobs or traps you on the small ones.
- Competitors quoting ₹5,000 on a listing site make any honest number look expensive out of context. A conversation lets you sell the difference first.

What replaces the number is specificity: exact scope, a firm timeline, and a comparison table that is candid about exclusions. That reads as more professional than a price tag, and it filters out people shopping purely on cost.

When you do quote: put it in writing, mark it valid 30 days, state 50% advance / 50% on launch, and list the exclusions from the table explicitly so scope creep has a paper trail to bump against.

## Adding a project

Copy one `<article class="proj">` block in `index.html`. The `data-tags` attribute drives the filter buttons — use `site`, `app`, `shop`, `mobile`, or several separated by spaces.

### Thumbnails

Screenshots live in `assets/shots/` and the frame is 16:10. Three variants:

```html
<!-- standard: roughly 16:10 source, fills the frame -->
<div class="thumb has-shot"><img src="assets/shots/name.png" alt="..." width="1600" height="1000" loading="lazy" decoding="async"><span class="thumb-tag">Web app</span></div>

<!-- wide: source much wider than 16:10, anchors left so the nav survives the crop -->
<div class="thumb has-shot wide">...</div>

<!-- portrait: a phone screen, letterboxed over a blurred copy of itself -->
<div class="thumb has-shot portrait" style="--shot:url('assets/shots/name.jpg')">...</div>
```

Capture desktop shots at 1600×1000 so they stay sharp on retina screens. Headless Chrome does it without opening a window:

```bash
chrome --headless=new --hide-scrollbars --window-size=1600,1000 --virtual-time-budget=6000 --screenshot="out.png" "http://localhost:3000/"
```

Before publishing a screenshot of anything with a database behind it, check what is actually on screen — a dashboard full of real client names and billing figures should not go on a public page.

The gradient tiles (`.t1`–`.t6` in `styles.css`) are still there as a fallback for projects you cannot screenshot.

## Notes

- Fully responsive, keyboard navigable, respects `prefers-reduced-motion`.
- Only external request is Google Fonts. Self-host the fonts if you want zero third-party calls.
- Everything is static, so hosting stays free at essentially any traffic level.
