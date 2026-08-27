import db from "@/lib/db";
import LandingDemo from "../LandingDemo";

// Public /demo gallery: browsable by anyone, no auth. Shows the 6 newest public
// diagrams (YouTube automations excluded) as a live demo of the app.
export const revalidate = 300;

type Demo = { id: string; title: string; diagram_type: string };

export default async function DemoPage() {
  const { rows } = await db.query(
    `SELECT id, title, diagram_type
       FROM diagrams
      WHERE is_public = true
        AND NOT ('YouTube' = ANY(COALESCE(tags, '{}')))
      ORDER BY updated_at DESC
      LIMIT 12`
  );
  const diagrams = JSON.parse(JSON.stringify(rows)) as Demo[];
  return <LandingDemo diagrams={diagrams} />;
}
