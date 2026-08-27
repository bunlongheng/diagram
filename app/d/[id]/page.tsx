import type { Metadata } from "next";
import { cache } from "react";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import db from "@/lib/db";
import { parse, buildSvg, DEFAULT_OPTS, DEFAULT_LAYOUT } from "@/lib/svg-renderer";
import type { Opts, Layout } from "@/lib/svg-renderer";

export const revalidate = 300;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Row = { code: string; settings: { opts?: Partial<Opts>; layout?: Partial<Layout> } | null; title: string | null; created_at: Date | null };

const getDiagram = cache(async (id: string): Promise<Row | null> => {
  if (!UUID.test(id)) return null;
  const { rows } = await db.query("SELECT code, settings, title, created_at FROM diagrams WHERE id = $1", [id]);
  if (!rows.length || !rows[0].code?.trim()) return null;
  return rows[0] as Row;
});

function render(row: Row) {
  const opts: Opts = { ...DEFAULT_OPTS, ...(row.settings?.opts ?? {}) };
  const layout: Layout = { ...DEFAULT_LAYOUT, ...(row.settings?.layout ?? {}) };
  const diagram = parse(row.code);
  if (!diagram.title && row.title) diagram.title = row.title;
  return { svg: buildSvg(diagram, opts, layout, row.created_at ?? undefined), title: diagram.title || row.title || "Diagram" };
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const row = await getDiagram(id);
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "diagrams-bheng.vercel.app";
  const proto = h.get("x-forwarded-proto") ?? "https";
  const base = `${proto}://${host}`;
  const title = row ? render(row).title : "Diagram not found";
  const description = row ? "View this diagram - copy the link, open it in the editor, or export it." : "This diagram does not exist.";
  return {
    metadataBase: new URL(base),
    title: `${title} · Diagrams`,
    description,
    openGraph: { title, description, type: "article", url: `${base}/d/${id}` },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function DiagramPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const row = await getDiagram(id);
  if (!row) notFound();
  const { svg, title } = render(row);

  return (
    <main style={{ minHeight: "100dvh", background: "#eceef2", fontFamily: "system-ui,-apple-system,sans-serif" }}>
      {/* Slim top bar — logo + demo/sign-in, no editing chrome. */}
      <header style={{
        height: 56, display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 20px", background: "#fff", borderBottom: "1px solid #e5e7eb",
        position: "sticky", top: 0, zIndex: 10,
      }}>
        <a href="/demo" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <span style={{ display: "flex", gap: 4 }}>
            <span style={{ width: 16, height: 10, background: "#ef4444", borderRadius: 2 }} />
            <span style={{ width: 16, height: 10, background: "#eab308", borderRadius: 2 }} />
            <span style={{ width: 16, height: 10, background: "#22c55e", borderRadius: 2 }} />
          </span>
          <span style={{ fontSize: 15, fontWeight: 800, letterSpacing: "-0.01em", color: "#111827" }}>Diagrams</span>
        </a>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <a href={`/svg/${id}`} style={{ fontSize: 13, fontWeight: 600, color: "#4b5563", textDecoration: "none" }}>Download SVG</a>
          <a href="/login" style={{
            display: "inline-flex", alignItems: "center", height: 34, padding: "0 15px",
            fontSize: 13, fontWeight: 600, color: "#fff", background: "#111827",
            borderRadius: 8, textDecoration: "none",
          }}>Sign in</a>
        </div>
      </header>

      {/* Clean, light, full-width diagram — the whole point of the page. */}
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "28px 20px 64px" }}>
        <div
          style={{ background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", padding: "28px 24px", boxShadow: "0 1px 3px rgba(15,23,42,0.06)", overflowX: "auto" }}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
        <p style={{ textAlign: "center", fontSize: 13, color: "#94a3b8", marginTop: 22 }}>
          Made with Diagrams · <a href="/login" style={{ color: "#7c3aed", fontWeight: 600, textDecoration: "none" }}>sign in</a> to create your own
        </p>
      </div>
    </main>
  );
}
