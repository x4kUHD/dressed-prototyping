# Agent Guidelines

> `CLAUDE.md` and `GEMINI.md` are symlinks to this file. Edit only `AGENTS.md`; never replace the symlinks with real files.

This repo is a pure HTML/CSS/JS iOS simulator for UX prototypes, published via GitHub Pages. No build step, no frameworks, no npm. **It must work when `index.html` is opened directly from disk (`file://`) as well as on GitHub Pages.**

## Structure

```
index.html              page shell; #app is the phone's content area; lists every script in load order
shell/                  the device (frame, island, status bar, home indicator)
  device.css
  device.js
app/                    the prototype, everything inside the phone
  app.css               global prototype styles
  core.js               defines the global `App` namespace (loaded first)
  icons.js              Tabler SVGs, inlined as strings in App.icons
  components/*.js       reusable UI, attached to App.components
  screens/*.js          one file per screen, attached to App.screens
  main.js               router + render into #app (loaded last)
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

## JavaScript: classic scripts, not modules

`file://` blocks ES modules and `fetch()`, so:

- **No `import`/`export`, no `type="module"`, no `fetch()` of local files, no top-level `await`.**
- Add each new script to `index.html` as `<script defer src="...">`, **in dependency order**: `core.js` and `icons.js` first, then components, then screens, then `main.js` last.
- Wrap each file in an IIFE `(() => { ... })();` so top-level names don't collide.
- Share code through the `App` global: `App.components.name = ...`, `App.screens.name = ...`, `App.icon("name")`.
- Add `// @ts-check` and JSDoc types to new JS files.

## Conventions

- **Light mode, greyscale only, for now.** The phone is always light (white background, black text), regardless of the device's dark-mode setting. Every color inside the phone must be neutral (black, white, or grey where r = g = b). No blue, red, green, or any other hue, including for links, selected states, badges, and errors. Show emphasis with weight, contrast, size, or filled-vs-outline instead of color. Photos and user imagery are the only exception.
- Use the existing CSS custom properties (`--bg`, `--label`, `--secondary-label`, `--accent`, `--separator`, `--font`) instead of hard-coded colors, and define any new color as a greyscale light-mode token in `app/app.css`. Don't add dark-mode styles or `prefers-color-scheme` queries.
- Match iOS conventions: SF font stack, 17px body text, 44px minimum tap targets, system-style spacing.
- Keep paths relative so the site works under a GitHub Pages subpath (`/repo-name/`) and from `file://`. Never use root-absolute paths like `/app/...`.
- Don't add dependencies, bundlers, or CDN scripts without asking.

## Icons

**Use icons ONLY from [Tabler Icons](https://tabler.io/icons).** Never draw custom icons, use emoji as icons, or pull from other sets (SF Symbols, Font Awesome, Material, Heroicons, etc.). If Tabler has no matching icon, pick the closest Tabler one or ask the user.

- Add each icon you use to `app/icons.js` as an entry in `App.icons`, named like the Tabler icon (`"home"`, and `"home-filled"` for the filled variant). Paste the SVG as a string. Don't load Tabler through a CDN or npm package, and don't fetch SVG files.
- Keep the original Tabler SVG attributes (`stroke="currentColor"`, `stroke-width`, 24x24 viewBox) so icons inherit text color. Resize with CSS `width`/`height`, not by editing the paths.
- Use the `outline` style by default and the `filled` variant for selected or active states, as iOS does.
- Render with `App.icon("name")`.

## Testing

Open `index.html` directly in a browser. No server is needed. Also check the published GitHub Pages URL after pushing. Check both the desktop framed view and the narrow (≤500px) full-bleed view.
