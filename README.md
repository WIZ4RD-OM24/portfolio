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

## Before you go live — five edits

Name (Omkar Sanadi) and email (omkarsanadi67@gmail.com) are already set. Two placeholders remain:

1. **Formspree endpoint** — replace `YOUR_FORM_ID` in the form `action` (see below).
2. **Your URL** — replace `https://WIZ4RD-OM24.github.io/portfolio/` in `index.html` (canonical + OG + JSON-LD), `robots.txt`, and `sitemap.xml` if your repo or domain differs.

Then work through the "Honesty checklist" below before sending the link to anyone.

## Wire up the contact form (free)

1. Sign up at https://formspree.io (free tier: 50 submissions/month).
2. Create a new form; it gives you an endpoint like `https://formspree.io/f/xyzabcde`.
3. Paste that ID over `YOUR_FORM_ID` in the `<form action="...">` in `index.html`.
4. Submit the form once yourself and confirm the address Formspree emails you.

The form posts via `fetch` so the visitor never leaves the page. If the endpoint is still the placeholder, the form refuses to submit and says so instead of silently failing. A hidden `_gotcha` field catches most spam bots.

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

- [ ] **Projects** — replace all six with work you actually did. Delete the cards you cannot fill; three real projects beat six invented ones.
- [ ] **Testimonials** — these are written samples. Delete the whole `#testimonials` section until you have real quotes with permission to publish them. A fake testimonial is the fastest way to lose a client who checks.
- [ ] **Stats** — "5+ years" is yours, but "24 projects shipped" and "98 avg Lighthouse" are placeholders. Use your real numbers or delete those two `<li>` items.
- [ ] **Package contents** — the comparison table is a sensible default, not a contract. Read every row and make sure you are genuinely willing to deliver each "Yes" at a fixed quote, and that each "Not included" is really excluded.

## A note on pricing

The site deliberately shows **no rupee figures** — only timelines and scope. This is the right call for Indian freelance work:

- A published number anchors the negotiation before you know the client's budget, and you can only ever move down from it.
- The same "5-page website" brief ranges from a weekend to a month depending on content, integrations, and how decisive the client is. One public price either loses you the big jobs or traps you on the small ones.
- Competitors quoting ₹5,000 on a listing site make any honest number look expensive out of context. A conversation lets you sell the difference first.

What replaces the number is specificity: exact scope, a firm timeline, and a comparison table that is candid about exclusions. That reads as more professional than a price tag, and it filters out people shopping purely on cost.

When you do quote: put it in writing, mark it valid 30 days, state 50% advance / 50% on launch, and list the exclusions from the table explicitly so scope creep has a paper trail to bump against.

## Adding a project

Copy one `<article class="proj">` block in `index.html`. The `data-tags` attribute drives the filter buttons — use `site`, `app`, `shop`, or several separated by spaces. Thumbnails are CSS gradients (`.t1`–`.t6` in `styles.css`); to use a real screenshot, drop it in `assets/` and replace the `<div class="thumb">` with an `<img>`.

## Notes

- Fully responsive, keyboard navigable, respects `prefers-reduced-motion`.
- Only external request is Google Fonts. Self-host the fonts if you want zero third-party calls.
- Everything is static, so hosting stays free at essentially any traffic level.
