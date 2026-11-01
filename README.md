# Ahmet Amanov’s portfolio

A responsive static portfolio with work history, projects, education, theme switching, and a contact composer.

## Local preview

Run from this directory, then open <http://localhost:3003>:

```powershell
py -3.13 -m http.server 3003
```

## Editing

- `index.html`: portfolio content, links, and SEO metadata.
- `css/portfolio.css`: layout, themes, and responsive styles.
- `js/portfolio.js`: tabs, project filters, contact composer, and other interactions.
- `js/theme-init.js`: saved theme initialization before rendering.
- `assets/`: portrait, social preview, résumé, icons, and fonts. Original repository assets are preserved.

The contact composer prepares a `mailto:` draft for the visitor to review and send in their email app. It never sends email from a server.

The existing résumé PDF remains the baseline. The updated Google Drive file must be publicly shared before it can be accessed and accurately substituted.

DM Sans is self-hosted in `assets/fonts/` under the SIL Open Font License; see `assets/fonts/dm-sans-OFL.txt`.

## Deployment

Vercel project: `personal_website-main-1` under `ahmeta97s-projects`.

Production: <https://personalwebsite-main-1.vercel.app/>

The `main` branch automatically deploys to production. The `redesign/portfolio-2026` branch creates preview deployments. Vercel serves the repository as a static site using `vercel.json`; no build or install step is needed.
