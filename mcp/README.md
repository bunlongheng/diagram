# diagrams MCP server

Exposes the Diagrams app (`diagrams-bheng.vercel.app`) to any MCP-capable agent
(Claude Code, Claude Desktop, etc.) as structured tools, so a local agent can
create/read/update/delete sequence diagrams without hand-rolling `curl` + JSON
escaping.

It is a **thin wrapper over the app's HTTP API** — it does not touch the database.
All validation (the only-`sequenceDiagram` gate, title embedding, owner tagging)
stays in the route handlers, so the MCP path and the public API can never drift.

> Separate from the **system-design** MCP server — different app, different API,
> different store. This one is sequence diagrams ONLY; architecture / node-edge
> diagrams belong to the system-design MCP.

## Tools

| Tool | What it does |
|------|--------------|
| `create_diagram` | Create a Mermaid sequence diagram → returns `{ id, svg, canvas }` |
| `list_diagrams` | List the owner's diagrams (newest first) |
| `get_diagram` | Fetch one diagram's title + code + URLs by id |
| `update_diagram` | Replace title and/or code on an existing diagram |
| `delete_diagram` | Permanently delete a diagram by id |
| `get_diagram_schema` | The exact shape + rules + a complete example |

## Env

- `AI_API_SECRET` — **required**. Bearer token for every route. On the primary
  workstation it's exported from `~/.zshenv` (source of truth: `.env.local`), and
  the server inherits it. If missing from the process env, `load-env.mjs` reads it
  from this repo's `.env.local` as a fallback.
- `DIAGRAMS_APP_URL` — optional. Defaults to `https://diagrams-bheng.vercel.app`.
  Set to `http://localhost:3002` to target a local dev server.

## Register

```bash
claude mcp add diagrams -s user -- node /Users/bheng/Sites/diagrams/mcp/server.mjs
```

`-s user` makes it available to agents in any project. Drop `-s user` for
project-local scope. Verify with `claude mcp list` (should show `✔ Connected`).

## Cloud / headless note

This is a local stdio server — a remote cloud agent or scheduled routine has no
such process. There, use the HTTP API directly (`POST /api/ai/diagrams` with the
Bearer). That's why the `/create-diagram` skill keeps the `curl` path as a
fallback: MCP for local, curl for cloud.
