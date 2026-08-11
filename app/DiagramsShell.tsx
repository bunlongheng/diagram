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
          <defs>
            <radialGradient id="dgR"><stop offset="0%" stopColor="#ef4444" stopOpacity="0.16" /><stop offset="70%" stopColor="#ef4444" stopOpacity="0" /></radialGradient>
            <radialGradient id="dgY"><stop offset="0%" stopColor="#eab308" stopOpacity="0.16" /><stop offset="70%" stopColor="#eab308" stopOpacity="0" /></radialGradient>
            <radialGradient id="dgGr"><stop offset="0%" stopColor="#22c55e" stopOpacity="0.16" /><stop offset="70%" stopColor="#22c55e" stopOpacity="0" /></radialGradient>
            <radialGradient id="dgSpotG"><stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" /><stop offset="45%" stopColor="#8b5cf6" stopOpacity="0.14" /><stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" /></radialGradient>
          </defs>
          {/* organic drifting color glows - radial gradients, no hard square edges */}
          <ellipse className="dg-blob" cx="360" cy="330" rx="320" ry="290" fill="url(#dgR)" />
          <ellipse className="dg-blob" cx="620" cy="500" rx="340" ry="300" fill="url(#dgY)" style={{ animationDelay: "-8s" }} />
          <ellipse className="dg-blob" cx="850" cy="330" rx="320" ry="290" fill="url(#dgGr)" style={{ animationDelay: "-16s" }} />
          {/* lifelines */}
          <line className="dg-life" x1="380" y1="100" x2="380" y2="720" stroke="#ef4444" strokeWidth="3" strokeDasharray="10 14" opacity="0.24" />
          <line className="dg-life" x1="600" y1="100" x2="600" y2="720" stroke="#eab308" strokeWidth="3" strokeDasharray="10 14" opacity="0.24" style={{ animationDuration: "44s" }} />
          <line className="dg-life" x1="820" y1="100" x2="820" y2="720" stroke="#22c55e" strokeWidth="3" strokeDasharray="10 14" opacity="0.24" style={{ animationDuration: "40s" }} />
          {/* message arrows cascading down the lifelines */}
          <g className="dg-msg">
            <line x1="380" y1="220" x2="600" y2="220" stroke="#f97316" strokeWidth="4.5" strokeLinecap="round" />
            <polygon points="600,220 578,210 578,230" fill="#f97316" />
          </g>
          <g className="dg-msg" style={{ animationDelay: "1.2s" }}>
            <line x1="600" y1="310" x2="820" y2="310" stroke="#22c55e" strokeWidth="4.5" strokeLinecap="round" />
            <polygon points="820,310 798,300 798,320" fill="#22c55e" />
          </g>
          <g className="dg-msg" style={{ animationDelay: "2.4s" }}>
            <line x1="820" y1="400" x2="600" y2="400" stroke="#06b6d4" strokeWidth="4.5" strokeLinecap="round" />
            <polygon points="600,400 622,390 622,410" fill="#06b6d4" />
          </g>
          <g className="dg-msg" style={{ animationDelay: "3.6s" }}>
            <line x1="600" y1="490" x2="380" y2="490" stroke="#ef4444" strokeWidth="4.5" strokeLinecap="round" />
            <polygon points="380,490 402,480 402,500" fill="#ef4444" />
          </g>
          <g className="dg-msg" style={{ animationDelay: "4.8s" }}>
            <line x1="380" y1="580" x2="820" y2="580" stroke="#8b5cf6" strokeWidth="4.5" strokeLinecap="round" />
            <polygon points="820,580 798,570 798,590" fill="#8b5cf6" />
          </g>
          <g className="dg-msg" style={{ animationDelay: "6s" }}>
            <line x1="820" y1="650" x2="600" y2="650" stroke="#eab308" strokeWidth="4.5" strokeLinecap="round" />
            <polygon points="600,650 622,640 622,660" fill="#eab308" />
          </g>
          {/* roaming spotlight - flashes a random-feeling spot every ~10s */}
          <g className="dg-spot"><circle r="170" fill="url(#dgSpotG)" /></g>
        </svg>

        <div style={{ position: "relative", zIndex: 1, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 18, padding: 24 }}>
          <div className="dg-icon">
            <Image src="/icon-512.png" alt="Diagrams" width={88} height={88} priority
              style={{ borderRadius: 20, boxShadow: "0 12px 40px rgba(15,23,42,0.16)" }} />
          </div>
          <h1 className="dg-in dg-t1" style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.02em", color: "#111827", margin: 0 }}>Diagrams</h1>
          <p className="dg-in dg-t2" style={{ fontSize: 15, color: "#6b7280", margin: 0, maxWidth: 320, lineHeight: 1.5 }}>Sign in to view your diagrams</p>
          <div className="dg-in dg-t3" style={{ marginTop: 6 }}><LoginForm /></div>
        </div>

        <style>{`
          @keyframes dgUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes dgFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-7px); } }
          @keyframes dgFlow { to { stroke-dashoffset: -240; } }
          @keyframes dgMsg { 0%,10% { opacity: 0; } 18% { opacity: 0.3; } 40% { opacity: 0.3; } 52%,100% { opacity: 0; } }
          @keyframes dgBlob { 0%,100% { transform: translate(0,0); } 50% { transform: translate(26px,-20px); } }
          @keyframes dgSpot {
            0%,30% { opacity: 0; transform: translate(320px,250px); }
            34% { opacity: 0.55; transform: translate(320px,250px); }
            38% { opacity: 0; transform: translate(320px,250px); }
            63% { opacity: 0; transform: translate(880px,300px); }
            67% { opacity: 0.55; transform: translate(880px,300px); }
            71% { opacity: 0; transform: translate(880px,300px); }
            96% { opacity: 0; transform: translate(600px,610px); }
            99% { opacity: 0.55; transform: translate(600px,610px); }
            100% { opacity: 0; transform: translate(600px,610px); }
          }
          .dg-in { opacity: 0; animation: dgUp 0.7s cubic-bezier(.16,.84,.44,1) both; }
          .dg-icon { opacity: 0; animation: dgUp 0.7s cubic-bezier(.16,.84,.44,1) both, dgFloat 6.5s ease-in-out 0.8s infinite; }
          .dg-t1 { animation-delay: 0.12s; }
          .dg-t2 { animation-delay: 0.22s; }
          .dg-t3 { animation-delay: 0.34s; }
          .dg-life { animation: dgFlow 48s linear infinite; }
          .dg-msg { opacity: 0; animation: dgMsg 11s ease-in-out infinite; }
          .dg-blob { animation: dgBlob 18s ease-in-out infinite; }
          .dg-spot { animation: dgSpot 30s ease-in-out infinite; }
          @media (prefers-reduced-motion: reduce) {
            .dg-in, .dg-icon, .dg-life, .dg-msg, .dg-blob { animation: none !important; opacity: 1 !important; }
            .dg-spot { display: none; }
          }
        `}</style>
      </div>
    );
  }

  return <DiagramsClient user={user} diagrams={diagrams} />;
}
