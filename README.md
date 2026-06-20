# Tau Gallery

Static gallery app for Tau CAD models.

This repository intentionally consumes Tau through published npm package boundaries instead of importing from the Tau monorepo or vendoring `apps/ui` internals.

## Current Boundary

- `@taucad/runtime` renders CAD source into GLB geometry.
- This app owns the gallery UI, catalog, deployment config, and temporary Three.js canvas.
- Once `@taucad/viewer` is published from the Tau fork, replace `src/viewer/model-canvas.tsx` with the package viewer.

## Commands

```bash
pnpm install
pnpm dev
pnpm verify
```

## Upstream Strategy

Keep generic viewer/runtime improvements in `ahzs645/tau` and upstream them to `taucad/tau` when they are broadly useful. Keep gallery-specific UI and deployment decisions here.
