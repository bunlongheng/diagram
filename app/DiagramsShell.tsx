"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { getSession } from "next-auth/react";
import DiagramsClient, { type ShellUser } from "./DiagramsClient";
import LoginLanding from "./LoginLanding";

type Diagram = {
  id: string; title: string; slug: string;
  diagram_type: string; created_at: string; updated_at: string; code: string; tags: string[];
};

export default function DiagramsShell({ initial }: { initial?: { user: ShellUser | null; diagrams: Diagram[] } }) {
  const [user, setUser] = useState<ShellUser | null>(initial?.user ?? null);
  const [diagrams, setDiagrams] = useState<Diagram[]>(initial?.diagrams ?? []);
  // When the server already resolved auth + diagrams (direct index load) we are
  // ready on first paint - no client waterfall. The client fetch only runs when
  // no server data was provided (e.g. returning here from the editor route).
  const [ready, setReady] = useState(!!initial);

  useEffect(() => {
    if (initial) return;
    let cancelled = false;

    (async () => {
      try {
        // The /api/diagrams gate is the source of truth for authorization:
        // 200 on a real owner session OR a local/LAN request (Stickies-style
        // bypass); 401 otherwise. Avoids relying on getSession() alone, which
        // is null on localhost where there is no real session.
        // Both awaits are independent, so run them concurrently.
        const [res, session] = await Promise.all([
          fetch("/api/diagrams"),
          getSession().catch(() => null),
        ]);
        if (!res.ok) { if (!cancelled) { setUser(null); setReady(true); } return; }

        const data = await res.json();
        if (cancelled) return;

        if (Array.isArray(data)) setDiagrams(data);
        setUser({
          email: session?.user?.email ?? "owner",
          user_metadata: {
            full_name: session?.user?.name ?? undefined,
            avatar_url: session?.user?.image ?? undefined,
          },
        });
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setReady(true);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  // Show loading until auth is checked AND diagrams are fetched
  if (!ready) {
    return (
      <div style={{ position: "fixed", inset: 0, background: "#f4f5f7", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
          <div style={{ width: 36, height: 36, border: "3px solid #e5e7eb", borderTopColor: "#7c3aed", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <span style={{ fontSize: 13, color: "#94a3b8", fontFamily: "system-ui" }}>Loading diagrams…</span>
        </div>
      </div>
    );
  }

  if (!user) return <LoginLanding />;

  return <DiagramsClient user={user} diagrams={diagrams} />;
}
