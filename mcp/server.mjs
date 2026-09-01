#!/usr/bin/env node
// ─── diagrams MCP server ─────────────────────────────────────────────────────
// Exposes the Diagrams app (diagrams-bheng.vercel.app) to any MCP-capable agent
// (Claude Code, Claude Desktop, etc.) so it can create, list, read, update, and
// delete the same Mermaid sequence diagrams the web app renders.
//
// This is a THIN wrapper over the app's existing HTTP API — it does NOT touch the
// database directly. That means all validation (only-sequenceDiagram gate, title
// embedding, owner tagging) lives in ONE place (the route handlers) and can never
// drift from what the public API enforces. The server only needs AI_API_SECRET.
//
// Env: AI_API_SECRET (Bearer for every route). Optional: DIAGRAMS_APP_URL
// (default prod) to point at a local dev server instead.
//
// NOTE: separate from the system-design MCP server — different app, different API,
// different store. Sequence diagrams ONLY; architecture/node-edge diagrams belong
// to the system-design MCP.
import './load-env.mjs' // MUST be first — resolves AI_API_SECRET before anything runs
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'

const APP_URL = (process.env.DIAGRAMS_APP_URL || 'https://diagrams-bheng.vercel.app').replace(/\/$/, '')
const SECRET = process.env.AI_API_SECRET
const ok = obj => ({ content: [{ type: 'text', text: JSON.stringify(obj, null, 2) }] })
const fail = msg => ({ isError: true, content: [{ type: 'text', text: msg }] })

// Every route authorizes via the same Bearer. One helper for all calls.
async function api(path, { method = 'GET', body } = {}) {
  if (!SECRET) throw new Error('AI_API_SECRET not set — export it or add it to .env.local')
  const res = await fetch(`${APP_URL}${path}`, {
    method,
    headers: { Authorization: `Bearer ${SECRET}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  const text = await res.text()
  let json
  try { json = text ? JSON.parse(text) : {} } catch { json = { raw: text } }
  if (!res.ok) {
    const detail = json?.error || json?.hint || json?.raw || res.statusText
    throw new Error(`${method} ${path} → ${res.status}: ${typeof detail === 'string' ? detail : JSON.stringify(detail)}`)
  }
  return json
}

const server = new McpServer({ name: 'diagrams', version: '1.0.0' })

// ── Create ───────────────────────────────────────────────────────────────────
server.registerTool(
  'create_diagram',
  {
    title: 'Create diagram',
    description:
      'Create a Mermaid SEQUENCE diagram in the Diagrams app. `code` MUST be valid Mermaid sequenceDiagram syntax (must contain "sequenceDiagram") — flowcharts, class, ER, etc. are rejected. Returns { id, url, svg_url, canvas } plus `svg` (the inline script-free SVG markup, docs-safe) or `svg_error` if the inline render failed.',
    inputSchema: {
      title: z.string().describe('Descriptive title, e.g. "User Login Flow" (3-6 words)'),
      code: z.string().describe('Valid Mermaid sequenceDiagram code, e.g. "sequenceDiagram\\n  participant U as User\\n  U->>S: Login"'),
      diagramType: z.string().optional().describe('Only "sequence" is supported (the default). Any other value is rejected.'),
    },
  },
  async ({ title, code, diagramType = 'sequence' }) => {
    try {
      if (!/sequenceDiagram/i.test(code)) {
        return fail('Only sequenceDiagram code is accepted — the code must contain "sequenceDiagram". This app is for sequence diagrams only; use the system-design MCP for architecture/node-edge diagrams.')
      }
      const { id, url, svg_url, svg, svg_error } = await api('/api/ai/diagrams?format=svg', { method: 'POST', body: { title, code, diagramType } })
      return ok({ id, url, svg_url, canvas: url, ...(svg ? { svg } : {}), ...(svg_error ? { svg_error } : {}) })
    } catch (e) { return fail(`create failed: ${e.message}`) }
  },
)

// ── List ───────────────────────────────────────────────────────────────────
server.registerTool(
  'list_diagrams',
  {
    title: 'List diagrams',
    description: "List the owner's saved diagrams (newest first) with id, title, type, tags, and shareable URLs.",
    inputSchema: { limit: z.number().optional().describe('Max rows to return (default 50)') },
  },
  async ({ limit = 50 }) => {
    try {
      const rows = await api('/api/diagrams')
      const list = (Array.isArray(rows) ? rows : []).slice(0, limit).map(r => ({
        id: r.id, title: r.title, type: r.diagram_type, tags: r.tags ?? [],
        updated_at: r.updated_at, svg: `${APP_URL}/svg/${r.id}`, canvas: `${APP_URL}/d/${r.id}`,
      }))
      return ok({ count: list.length, diagrams: list })
    } catch (e) { return fail(`list failed: ${e.message}`) }
  },
)

// ── Read one ─────────────────────────────────────────────────────────────────
server.registerTool(
  'get_diagram',
  {
    title: 'Get diagram',
    description: 'Fetch one diagram by id, returning its full title, code, type, tags, and URLs.',
    inputSchema: { id: z.string().describe('The diagram id (uuid) from list_diagrams') },
  },
  async ({ id }) => {
    try {
      const r = await api(`/api/diagrams/${id}`)
      return ok({
        id: r.id, title: r.title, type: r.diagram_type, tags: r.tags ?? [], code: r.code,
        svg: `${APP_URL}/svg/${r.id}`, canvas: `${APP_URL}/d/${r.id}`,
      })
    } catch (e) { return fail(`get failed: ${e.message}`) }
  },
)

// ── Update (title / code) ────────────────────────────────────────────────────
server.registerTool(
  'update_diagram',
  {
    title: 'Update diagram',
    description: 'Modify an existing diagram by id. Any of title or code you provide replaces that field; omitted fields are left unchanged. New code must still be sequenceDiagram syntax.',
    inputSchema: {
      id: z.string().describe('The diagram id to update'),
      title: z.string().optional(),
      code: z.string().optional().describe('Replacement Mermaid sequenceDiagram code (must contain "sequenceDiagram")'),
    },
  },
  async ({ id, title, code }) => {
    try {
      if (code != null && !/sequenceDiagram/i.test(code)) {
        return fail('Only sequenceDiagram code is accepted — the code must contain "sequenceDiagram".')
      }
      const body = {}
      if (title != null) body.title = title
      if (code != null) body.code = code
      if (!Object.keys(body).length) return fail('Nothing to update — provide title and/or code.')
      await api(`/api/diagrams/${id}`, { method: 'PATCH', body })
      return ok({ id, updated: Object.keys(body), svg: `${APP_URL}/svg/${id}`, canvas: `${APP_URL}/d/${id}` })
    } catch (e) { return fail(`update failed: ${e.message}`) }
  },
)

// ── Delete ───────────────────────────────────────────────────────────────────
server.registerTool(
  'delete_diagram',
  {
    title: 'Delete diagram',
    description: 'Permanently delete a diagram by id.',
    inputSchema: { id: z.string().describe('The diagram id to delete') },
  },
  async ({ id }) => {
    try {
      await api(`/api/diagrams/${id}`, { method: 'DELETE' })
      return ok({ deleted: id })
    } catch (e) { return fail(`delete failed: ${e.message}`) }
  },
)

// ── Machine-readable schema + example ────────────────────────────────────────
server.registerTool(
  'get_diagram_schema',
  {
    title: 'Get diagram schema',
    description: 'Explain the exact structure to create a diagram in this app: field shapes, the one hard rule, and a complete example.',
    inputSchema: {},
  },
  async () => ok({
    rules: [
      'A diagram is { title, code }.',
      'HARD REQUIREMENT: `code` MUST be Mermaid sequenceDiagram syntax (must contain "sequenceDiagram"). Flowcharts, class, ER, gantt, pie, mindmap, and architecture diagrams are REJECTED — use the system-design MCP for node/edge architecture diagrams.',
      'Model actors as participants and steps as directed messages in real flow order.',
      'title should be 3-6 descriptive words; it is embedded into the code header automatically.',
      'Response gives an SVG url (vector, best for docs/slides) and a /d/ canvas url (editable in-app).',
    ],
    example: {
      title: 'User Login Flow',
      code: '---\ntitle: User Login Flow\n---\nsequenceDiagram\n  participant U as 🧑 User\n  participant A as 🔐 Auth Service\n  participant D as 🗄️ Database\n  U->>A: POST /login\n  A->>D: Look up user\n  D-->>A: User record\n  A-->>U: 200 OK + JWT',
    },
  }),
)

const transport = new StdioServerTransport()
await server.connect(transport)
// stderr only — stdout is the MCP transport channel.
console.error(`diagrams MCP server running on stdio (app: ${APP_URL})`)
