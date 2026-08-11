"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { getSession } from "next-auth/react";
import DiagramsClient, { type ShellUser } from "./DiagramsClient";
import LoginForm from "./SignInButton";

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

  if (!user) {
    return (
      <div style={{
        position: "fixed", inset: 0, overflow: "hidden",
        background: "radial-gradient(120% 90% at 50% 0%, #ffffff 0%, #f5f6fb 55%, #eceef5 100%)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "system-ui,-apple-system,sans-serif",
      }}>
        {/* On-brand animated backdrop: red/yellow/green sequence lifelines with
            message arrows cascading down them - a live sequence diagram running. */}
        <svg aria-hidden="true" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
          <defs><filter id="dgSoft"><feGaussianBlur stdDeviation="60" /></filter></defs>
          <circle className="dg-blob" cx="380" cy="300" r="150" fill="#ef4444" opacity="0.10" filter="url(#dgSoft)" />
          <circle className="dg-blob" cx="600" cy="480" r="160" fill="#eab308" opacity="0.10" filter="url(#dgSoft)" style={{ animationDelay: "-3s" }} />
          <circle className="dg-blob" cx="820" cy="320" r="150" fill="#22c55e" opacity="0.10" filter="url(#dgSoft)" style={{ animationDelay: "-6s" }} />
          <line className="dg-life" x1="380" y1="110" x2="380" y2="710" stroke="#ef4444" strokeWidth="3" strokeDasharray="10 14" opacity="0.28" />
          <line className="dg-life" x1="600" y1="110" x2="600" y2="710" stroke="#eab308" strokeWidth="3" strokeDasharray="10 14" opacity="0.28" style={{ animationDuration: "7.5s" }} />
          <line className="dg-life" x1="820" y1="110" x2="820" y2="710" stroke="#22c55e" strokeWidth="3" strokeDasharray="10 14" opacity="0.28" style={{ animationDuration: "6.5s" }} />
          <g className="dg-msg">
            <line x1="380" y1="210" x2="600" y2="210" stroke="#f97316" strokeWidth="4.5" strokeLinecap="round" />
            <polygon points="600,210 578,200 578,220" fill="#f97316" />
          </g>
          <g className="dg-msg" style={{ animationDelay: "0.6s" }}>
            <line x1="600" y1="300" x2="820" y2="300" stroke="#22c55e" strokeWidth="4.5" strokeLinecap="round" />
            <polygon points="820,300 798,290 798,310" fill="#22c55e" />
          </g>
          <g className="dg-msg" style={{ animationDelay: "1.2s" }}>
            <line x1="820" y1="390" x2="600" y2="390" stroke="#06b6d4" strokeWidth="4.5" strokeLinecap="round" />
            <polygon points="600,390 622,380 622,400" fill="#06b6d4" />
          </g>
          <g className="dg-msg" style={{ animationDelay: "1.8s" }}>
            <line x1="600" y1="480" x2="380" y2="480" stroke="#ef4444" strokeWidth="4.5" strokeLinecap="round" />
            <polygon points="380,480 402,470 402,490" fill="#ef4444" />
          </g>
          <g className="dg-msg" style={{ animationDelay: "2.4s" }}>
            <line x1="380" y1="570" x2="820" y2="570" stroke="#8b5cf6" strokeWidth="4.5" strokeLinecap="round" />
            <polygon points="820,570 798,560 798,580" fill="#8b5cf6" />
          </g>
          <g className="dg-msg" style={{ animationDelay: "3s" }}>
            <line x1="820" y1="640" x2="600" y2="640" stroke="#eab308" strokeWidth="4.5" strokeLinecap="round" />
            <polygon points="600,640 622,630 622,650" fill="#eab308" />
          </g>
        </svg>

        <div style={{ position: "relative", zIndex: 1, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 18, padding: 24 }}>
          <div className="dg-icon">
            <Image src="/icon-512.png" alt="Diagrams" width={88} height={88} priority
              style={{ borderRadius: 20, boxShadow: "0 12px 40px rgba(15,23,42,0.16)" }} />
          </div>
          <h1 className="dg-in dg-t1" style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.02em", color: "#111827", margin: 0 }}>Diagrams</h1>
          <p className="dg-in dg-t2" style={{ fontSize: 15, color: "#6b7280", margin: 0, maxWidth: 320, lineHeight: 1.5 }}>Sign in to view your saved diagrams</p>
          <div className="dg-in dg-t3" style={{ marginTop: 6 }}><LoginForm /></div>
        </div>

        <style>{`
          @keyframes dgUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes dgFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-7px); } }
          @keyframes dgFlow { to { stroke-dashoffset: -240; } }
          @keyframes dgMsg { 0%,8% { opacity: 0; } 16% { opacity: 0.32; } 34% { opacity: 0.32; } 46%,100% { opacity: 0; } }
          @keyframes dgBlob { 0%,100% { transform: translate(0,0); } 50% { transform: translate(22px,-18px); } }
          .dg-in { opacity: 0; animation: dgUp 0.7s cubic-bezier(.16,.84,.44,1) both; }
          .dg-icon { opacity: 0; animation: dgUp 0.7s cubic-bezier(.16,.84,.44,1) both, dgFloat 5.5s ease-in-out 0.8s infinite; }
          .dg-t1 { animation-delay: 0.12s; }
          .dg-t2 { animation-delay: 0.22s; }
          .dg-t3 { animation-delay: 0.34s; }
          .dg-life { animation: dgFlow 8s linear infinite; }
          .dg-msg { opacity: 0; animation: dgMsg 3.6s ease-in-out infinite; }
          .dg-blob { animation: dgBlob 9s ease-in-out infinite; }
          @media (prefers-reduced-motion: reduce) {
            .dg-in, .dg-icon, .dg-life, .dg-msg, .dg-blob { animation: none !important; opacity: 1 !important; }
          }
        `}</style>
      </div>
    );
  }

  return <DiagramsClient user={user} diagrams={diagrams} />;
}
