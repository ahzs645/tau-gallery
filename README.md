# Tau Gallery

Static gallery app for Tau CAD models.

This repository intentionally consumes Tau through published npm package boundaries instead of importing from the Tau monorepo or vendoring `apps/ui` internals.

## Current Boundary

- `@taucad/runtime` renders CAD source into GLB geometry in a browser Web Worker.
- `@taucad/openscad` is GPL-2.0-or-later because it bundles OpenSCAD WASM. The rest of this app remains under this repository's normal terms.
- This app owns the gallery UI, catalog, deployment config, and temporary Three.js canvas.
- Once `@taucad/viewer` is published from the Tau fork, replace `src/viewer/model-canvas.tsx` with the package viewer.
- OpenSCAD projects with complete copied source can be rendered on demand. Projects whose upstream source references files that are missing upstream are marked source-only with a specific reason.
- Replicad/OpenSCAD runtime rendering is intentionally manual. The app does not auto-render on page load because CAD kernels can be slow or fail on complex models.

## Commands

```bash
pnpm install
pnpm dev
pnpm verify
pnpm projects:check
```

## Upstream Strategy

Keep generic viewer/runtime improvements in `ahzs645/tau` and upstream them to `taucad/tau` when they are broadly useful. Keep gallery-specific UI and deployment decisions here.

Playground projects are copied from:

```text
/Users/ahmadjalil/github/tau/apps/ui/app/routes/playground/projects
```

Refresh copied assets with:

```bash
pnpm projects:sync
pnpm projects:check
```

Then update `src/gallery/catalog.ts` if new projects, entries, runtimes, presets, or known upstream-missing include files were added.
