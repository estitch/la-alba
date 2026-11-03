# AGENTS.md

Static, build-free one-page cocktail menu ("La Alba"). No package.json, bundler, tests, CI, or git repo.
Serve the folder with any static server (e.g. `npx serve .` or `python -m http.server`) and open `index.html`.

## Layout / entrypoints

- `index.html` — static shell only: hero, toolbar controls, footer, drawer markup. The menu list, tabs, and spirit chips are **empty containers filled by JS**.
- `data.js` — sets `window.MENU_DATA` (spirits + categories + items). This is the file to edit for menu content, not `index.html`.
- `script.js` — single IIFE, no modules/imports. Load order matters: `data.js` before `script.js`.
- `styles.css` — design tokens in `:root`, dark variant under `[data-theme="dark"]`, print styles at the end.
- `vendor/qrcode.js` — vendored `qrcode-generator` 1.4.4 (MIT), exposes global `qrcode`. Kept local so QR generation works offline; do not swap it for a CDN call.
- `assets/bar-menu_laalba.webp` — currently unreferenced; don't assume it is used.

## Data conventions (`data.js`)

- `price` is a number; UI formats it with `Intl.NumberFormat('es-ES', 'EUR')` (e.g. `8.5` → `8,50 €`). Never store price strings.
- `base` must match an `id` in `spirits`, otherwise the item shows only under the "Todos" chip.
- Item ids are derived at runtime as `` `${cat.id}-${slug(name)}` ``, not stored. Renaming an item or a category `id` silently drops existing favorites, which are persisted in `localStorage` as `laalba:favs` = `{ "<id>": cantidad }` (legacy arrays of ids still load as quantity 1). Quantities are capped at `MAX_QTY` (99); the header badge shows total units, not distinct items.
- `category.variant` maps to CSS `category--<variant>`; only `classic`, `signature`, `zero` define a ribbon color.
- Adding a category automatically creates its tab/scroll anchor (`href="#<cat.id>"`) — no HTML edit needed.

## Behavior gotchas (`script.js`)

- All item HTML is built via template strings; user-editable text goes through `esc()`. Keep escaping when adding new markup.
- `init()` order is required: render tabs/chips/menu → bind events → sync toolbar height → scroll-spy → `applyFilters()`.
- Theme is applied to `<html data-theme>` on load; the `prefers-color-scheme` CSS block only applies via `:root:not([data-theme="light"])`, so JS wins after init. `applyTheme` also hardcodes the `theme-color` meta (`#efdcb5` / `#121722`) — update it if those colors change.
- Drawer close uses a 300 ms timeout to re-hide the overlay; scroll-spy needs section `id` == tab `data-tab`.
- The drawer list is fully re-rendered on each quantity change; `updateFavUI(bump, keepFocus)` restores focus to the `data-inc`/`data-dec` control so steppers stay keyboard-usable. Card hearts toggle selection (add 1 / remove); quantities change only in the drawer.
- "Mostrar QR" (`state.qrOpen`) swaps the drawer list for `#qrPanel` via `.drawer.is-qr`; the QR encodes the same plain-text order as `orderText()` (units + line totals). It regenerates whenever quantities change and closes automatically when the selection is emptied or the drawer closes.
- `qrcode-generator` defaults to Latin-1; `renderQR()` switches it to `stringToBytesFuncs['UTF-8']` because item names contain tildes and `×`. Keep that line or the QR text will be garbled.

## Conventions

- UI copy, comments, and `lang` are Spanish (`es-ES`); keep new text in Spanish.
- Accessibility is intentional: `[hidden]{display:none!important}`, `aria-pressed` on chips/fav buttons, `inert` drawer, `aria-live` status/toast, skip link. Preserve when editing.
- No lint/format config exists; match existing style (2-space indent, single quotes in JS, kebab/token CSS variables).
- Verify changes by loading the page and checking the console; there is no automated test or typecheck step.
