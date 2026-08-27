import db from "@/lib/db";
import LandingDemo from "../LandingDemo";

// Public /demo gallery: browsable by anyone, no auth. Shows up to 8 public
// diagrams (YouTube automations excluded) that have at least 5 participants, so
// every demo looks substantial. Newest first.
export const revalidate = 300;

type Demo = { id: string; title: string; diagram_type: string };

export default async function DemoPage() {
  const { rows } = await db.query(
    `SELECT id, title, diagram_type
       FROM diagrams
      WHERE is_public = true
        AND NOT ('YouTube' = ANY(COALESCE(tags, '{}')))
        AND (length(code) - length(replace(code, 'participant', ''))) / length('participant') >= 5
      ORDER BY updated_at DESC
      LIMIT 8`
  );
  const diagrams = JSON.parse(JSON.stringify(rows)) as Demo[];
  return <LandingDemo diagrams={diagrams} />;
}
