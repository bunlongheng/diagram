# Mermaid++

> Beautiful diagram generator — paste any Mermaid syntax and get a polished, colorful visual instantly.

**Live → [mermaid-bheng.netlify.app](https://mermaid-bheng.netlify.app)**

![Screenshot](screenshot.png)

---

## Features

- **Multi-diagram support** — sequenceDiagram, flowchart, classDiagram, erDiagram, gantt, pie, gitGraph, mindmap, timeline, and more
- **Custom sequence renderer** — hand-crafted colorful SVG for sequence diagrams with colored lifelines, pill labels, icons, and big step numbers
- **Colorful mermaid styling** — all other diagram types rendered with PAL palette colors, rounded corners, white bold text
- **Pan & zoom canvas** — scroll to pan, Ctrl+scroll to zoom, pinch-to-zoom on mobile, double-click to zoom in, `F` to fit
- **Dark / Light / Monokai themes**
- **Resizable code editor** with dark mode toggle
- **Export PNG** (2× retina), export raw code, export JSON, copy to clipboard
- **Mobile responsive** — full-screen code editor + settings bottom sheet
- **Diagram type badge** in the header — auto-detected from first line

## Diagram Types

| First line keyword | Type |
|---|---|
| `sequenceDiagram` | Sequence (custom renderer) |
| `graph TD` / `flowchart LR` | Flowchart |
| `classDiagram` | Class |
| `erDiagram` | ER |
| `gantt` | Gantt |
| `pie` | Pie |
| `gitGraph` | Git |
| `mindmap` | Mindmap |
| `timeline` | Timeline |

## Keyboard Shortcuts

| Key | Action |
|---|---|
| `F` | Fit to window |
| `⌘0` / `Ctrl+0` | Fit to window |
| `⌘+` / `⌘−` | Zoom in / out |
| `Scroll` | Pan canvas |
| `Ctrl+Scroll` | Zoom to cursor |
| `Space + Drag` | Pan canvas |
| `Double-click` | Zoom in 1.5× |

## Stack

- Next.js 15 · React 19 · TypeScript
- [mermaid.js](https://mermaid.js.org) for non-sequence diagram layout
- Custom SVG renderer for sequence diagrams
- Tailwind CSS · Bun
