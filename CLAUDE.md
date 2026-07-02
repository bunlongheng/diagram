# diagrams - AI diagram generator (port 3002, diagrams.localhost)

## Run
- Dev: `npm run dev` (next dev --port 3002)
- Build: `npm run build` / Prod: `npm run prod` (next start -p 3002)
- Lint: `npm run lint`

## Architecture rules
- PAL palette: ef4444, f97316, eab308, 22c55e, 14b8a6, 06b6d4, 3b82f6, 8b5cf6, ec4899, f43f5e, 84cc16, 0891b2
- Themes: light bg #ffffff, dark bg #16161e, monokai bg #272822
- sequenceDiagram uses a custom SVG renderer. All other diagram types use mermaid.js dynamic import + applyColorfulMermaidStyle.
- detectDiagramType reads the first line keyword to pick the renderer.

## Infra
- Deploy: `NODE_TLS_REJECT_UNAUTHORIZED=0 netlify deploy --prod`
- Live URL: https://mermaid-bheng.netlify.app
- Stack: Bun (`bun run build`, `bun dev`) alongside the npm scripts.

## Test
- `npm run test` (vitest run)
- `npm run test:e2e` (Playwright)
- `npm run test:all` (coverage + e2e)
