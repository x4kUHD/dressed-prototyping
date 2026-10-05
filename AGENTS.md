# Agent Guidelines

This repo is a pure HTML/CSS/JS iOS simulator for UX prototypes, published via GitHub Pages. No build step, no frameworks, no npm.

## Structure

```
index.html          page shell; #app is the phone's content area
shell/              the device (frame, island, status bar, home indicator)
  device.css
  device.js
app/                the prototype, everything inside the phone
  app.css           global prototype styles
  main.js           entry point, renders into #app
  screens/          one module per screen
```

## Scope: only change what's inside the phone

All prototype work happens in `app/`. Everything the user sees inside the phone screen is built there and rendered into `<main id="app">`.

**Do not modify the device shell** unless the user explicitly asks:
- Anything in `shell/`
- The `.device`, `.screen`, `.island`, `.statusbar`, `.home-indicator` markup in `index.html`
- The page background or anything outside `.screen`

`index.html` may only change to link new files from `app/`. If a prototype seems to need a shell change (e.g. a different device size), stop and ask first.

## Where things go

- New screens: `app/screens/*.js`. New reusable components: `app/components/*.js`. Component and screen styles: `app/*.css`, linked from `<head>`.
- Rendered content must respect `--safe-top` / `--safe-bottom` (or `env(safe-area-inset-*)` on real phones).

## Conventions

- Plain JS with ES modules. Add `// @ts-check` and JSDoc types to new JS files.
- Use the existing CSS custom properties (`--bg`, `--label`, `--secondary-label`, `--font`). Support light and dark mode.
- Match iOS conventions: SF font stack, 17px body text, 44px minimum tap targets, system-style spacing.
- Keep paths relative so the site works under a GitHub Pages subpath (`/repo-name/`). Never use root-absolute paths like `/app/...`.
- Don't add dependencies, bundlers, or CDN scripts without asking.

## Testing

Serve locally with `python3 -m http.server` and open `localhost:8000`. Modules won't load over `file://`. Check both the desktop framed view and the narrow (≤500px) full-bleed view.
