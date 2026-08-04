import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

const AI_SECRET = process.env.AI_API_SECRET;

/**
 * GET /api/diagrams/[id]/export
 *
 * Returns the diagram's Mermaid code + metadata for the owner. Rendering is done
 * by the caller (e.g. deck-gen.mjs renders it client-side via the mermaid CDN);
 * nothing is sent off-host. `svg` is always null here and kept only so existing
 * callers that read the field keep working.
 *
 * Headers:
 *   Authorization: Bearer <AI_API_SECRET>
 *
 * Response 200:
 *   { "id": "…", "title": "…", "code": "…", "diagramType": "…", "svg": null }
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
  // ── Auth ──────────────────────────────────────────────────────────────────
  if (!AI_SECRET) {
    return NextResponse.json({ error: "AI_API_SECRET not configured" }, { status: 500 });
  }
  const header = req.headers.get("authorization") ?? "";
  const expected = `Bearer ${AI_SECRET}`;
  const authorized = header.length === expected.length && crypto.timingSafeEqual(Buffer.from(header), Buffer.from(expected));
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // ── Fetch diagram ─────────────────────────────────────────────────────────
  const { rows } = await db.query("SELECT id, title, code, diagram_type FROM diagrams WHERE id = $1", [id]);
  if (rows.length === 0) {
    return NextResponse.json({ error: "Diagram not found" }, { status: 404 });
  }
  const diagram = rows[0];

  return NextResponse.json({
    id: diagram.id,
    title: diagram.title,
    code: diagram.code,
    diagramType: diagram.diagram_type,
    svg: null,
  });
  } catch (outerErr: unknown) {
    const msg = outerErr instanceof Error ? outerErr.message : String(outerErr);
    console.error("[export] outer catch:", msg);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
