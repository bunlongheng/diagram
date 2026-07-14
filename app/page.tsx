import db from "@/lib/db";
import { auth } from "@/auth";
import { resolveOwnerIdServer } from "@/lib/auth-owner";
import DiagramsShell from "./DiagramsShell";
import DiagramEditor from "./DiagramEditor";
import type { ShellUser } from "./DiagramsClient";

// The "/" route. ?id= / ?new / ?data open the client editor; everything else is
// the index, which is server-rendered: auth + the owner's diagrams are resolved
// on the server and handed to the shell as initial data (no client waterfall,
// content in the initial HTML).
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  if ("id" in sp || "new" in sp || "data" in sp) return <DiagramEditor />;

  const uid = await resolveOwnerIdServer();
  let user: ShellUser | null = null;
  let diagrams: Diagram[] = [];
  if (uid) {
    const [session, result] = await Promise.all([
      auth(),
      db.query(
        "SELECT id, title, slug, diagram_type, created_at, updated_at, code, tags, settings->>'youtubeId' AS youtube_id FROM diagrams WHERE user_id = $1 ORDER BY updated_at DESC",
        [uid]
      ),
    ]);
    // Match NextResponse.json: Date columns serialize to ISO strings for the client.
    diagrams = JSON.parse(JSON.stringify(result.rows));
    user = {
      email: session?.user?.email ?? "owner",
      user_metadata: {
        full_name: session?.user?.name ?? undefined,
        avatar_url: session?.user?.image ?? undefined,
      },
    };
  }

  return <DiagramsShell initial={{ user, diagrams }} />;
}

type Diagram = {
  id: string; title: string; slug: string;
  diagram_type: string; created_at: string; updated_at: string; code: string; tags: string[];
};
