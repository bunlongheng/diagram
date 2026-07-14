import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { authorizeOwner } from "@/lib/auth-owner";

const NO_CORS = {
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization",
};

/**
 * GET /api/export?id=<diagram-id>&format=svg
 *
 * Returns the stored Mermaid code + settings JSON for a diagram (not raw
 * SVG — the caller renders it, e.g. via the /d/[id] public route or the
 * editor's export button).
 *
 * Query params:
 *   id     — diagram UUID (required)
 *   format — "svg" (default, returns image/svg+xml)
 *   theme  — "light" | "dark" | "monokai" (default: uses saved settings or "light")
 */
export async function GET(req: NextRequest) {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: NO_CORS });

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing ?id= parameter" }, { status: 400, headers: NO_CORS });
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return NextResponse.json({ error: "Invalid diagram ID" }, { status: 400, headers: NO_CORS });
  }

  const { rows } = await db.query("SELECT code, settings, title, is_public FROM diagrams WHERE id = $1", [id]);
  if (!rows.length) return NextResponse.json({ error: "Diagram not found" }, { status: 404, headers: NO_CORS });

  const { code, settings, title, is_public } = rows[0];
  if (!is_public && !(await authorizeOwner(req))) {
    return NextResponse.json({ error: "Diagram not found" }, { status: 404, headers: NO_CORS });
  }
  // Permissive CORS only for public diagrams — owner-only diagrams never get a wildcard origin.
  const CORS = is_public ? { ...NO_CORS, "Access-Control-Allow-Origin": "*" } : NO_CORS;
  if (!code?.trim()) return NextResponse.json({ error: "Diagram has no code" }, { status: 400, headers: CORS });

  // Return the raw Mermaid code + metadata so the caller can render it
  // (Server-side SVG rendering would require the full buildSvg function which is client-only)
  const themeOverride = req.nextUrl.searchParams.get("theme");
  const opts = settings?.opts ?? {};
  if (themeOverride) opts.theme = themeOverride;

  return NextResponse.json({
    id,
    title,
    code,
    settings: { opts },
    format: "mermaid",
    hint: "To get a rendered PNG/SVG, open the diagram URL in a browser and use the export button, or use the /d/[id] public route.",
    url: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://diagrams-bheng.vercel.app"}/?id=${id}`,
  }, { headers: CORS });
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: NO_CORS });
}
