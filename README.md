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

These are the only placeholders in the site. Search for the capitalised strings.

1. **Your name** — `Omkar` appears in the title, nav brand, footer, and OG tags in `index.html`.
2. **Your email** — replace `YOUR@EMAIL.COM` in the contact form note (`index.html`).
3. **Formspree endpoint** — replace `YOUR_FORM_ID` in the form `action` (see below).
4. **Your URL** — replace `https://WIZ4RD-OM24.github.io/portfolio/` in `index.html` (canonical + OG + JSON-LD), `robots.txt`, and `sitemap.xml`.
5. **Projects, pricing, testimonials** — see "Honesty checklist" below.

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
- [ ] **Stats** — "24 projects shipped", "98 Lighthouse", "14 day turnaround" are placeholders. Use your real numbers or delete the `.stats` list.
- [ ] **Prices** — set them to what you actually charge.

## Adding a project

Copy one `<article class="proj">` block in `index.html`. The `data-tags` attribute drives the filter buttons — use `site`, `app`, `shop`, or several separated by spaces. Thumbnails are CSS gradients (`.t1`–`.t6` in `styles.css`); to use a real screenshot, drop it in `assets/` and replace the `<div class="thumb">` with an `<img>`.

## Notes

- Fully responsive, keyboard navigable, respects `prefers-reduced-motion`.
- Only external request is Google Fonts. Self-host the fonts if you want zero third-party calls.
- Everything is static, so hosting stays free at essentially any traffic level.
