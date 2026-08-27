"use client";
import Image from "next/image";

type Demo = { id: string; title: string; diagram_type: string };

// Public landing shown to logged-out visitors: a curated gallery of the best
// public diagrams as a live demo, on the app's on-brand animated backdrop, with
// a single Sign in call to action. No login is forced — strangers browse freely;
// only creating your own needs an account (/login).
export default function LandingDemo({ diagrams }: { diagrams: Demo[] }) {
  const demos = diagrams.slice(0, 24);

  return (
    <div style={{
      position: "fixed", inset: 0, overflowY: "auto",
      background: "radial-gradient(120% 90% at 50% 0%, #ffffff 0%, #f5f6fb 55%, #eceef5 100%)",
      fontFamily: "system-ui,-apple-system,sans-serif",
    }}>
      {/* On-brand animated backdrop: sequence lifelines with message arrows. */}
      <svg aria-hidden="true" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice"
        style={{ position: "fixed", inset: 0, width: "100%", height: "100%", pointerEvents: "none", opacity: 0.8 }}>
        <defs>
          <radialGradient id="ldR"><stop offset="0%" stopColor="#ef4444" stopOpacity="0.14" /><stop offset="70%" stopColor="#ef4444" stopOpacity="0" /></radialGradient>
          <radialGradient id="ldY"><stop offset="0%" stopColor="#eab308" stopOpacity="0.14" /><stop offset="70%" stopColor="#eab308" stopOpacity="0" /></radialGradient>
          <radialGradient id="ldGr"><stop offset="0%" stopColor="#22c55e" stopOpacity="0.14" /><stop offset="70%" stopColor="#22c55e" stopOpacity="0" /></radialGradient>
        </defs>
        <ellipse className="ld-blob" cx="360" cy="300" rx="320" ry="290" fill="url(#ldR)" />
        <ellipse className="ld-blob" cx="620" cy="480" rx="340" ry="300" fill="url(#ldY)" style={{ animationDelay: "-8s" }} />
        <ellipse className="ld-blob" cx="860" cy="320" rx="320" ry="290" fill="url(#ldGr)" style={{ animationDelay: "-16s" }} />
        <line className="ld-life" x1="380" y1="0" x2="380" y2="800" stroke="#ef4444" strokeWidth="3" strokeDasharray="10 14" opacity="0.16" />
        <line className="ld-life" x1="600" y1="0" x2="600" y2="800" stroke="#eab308" strokeWidth="3" strokeDasharray="10 14" opacity="0.16" style={{ animationDuration: "44s" }} />
        <line className="ld-life" x1="820" y1="0" x2="820" y2="800" stroke="#22c55e" strokeWidth="3" strokeDasharray="10 14" opacity="0.16" style={{ animationDuration: "40s" }} />
      </svg>

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1440, margin: "0 auto", padding: "0 24px 80px" }}>
        {/* Header */}
        <header style={{ height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Image src="/icon-512.png" alt="Diagrams" width={32} height={32} priority style={{ borderRadius: 8 }} />
            <span style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-0.01em", color: "#111827" }}>Diagrams</span>
          </div>
          <a href="/login" style={{
            display: "inline-flex", alignItems: "center", gap: 7, height: 36, padding: "0 16px",
            fontSize: 13.5, fontWeight: 600, color: "#fff", background: "#111827",
            borderRadius: 9, textDecoration: "none", boxShadow: "0 2px 8px rgba(15,23,42,0.18)",
          }}>Sign in</a>
        </header>

        {/* Hero */}
        <section className="ld-in" style={{ textAlign: "center", padding: "40px 0 30px" }}>
          <h1 style={{ fontSize: 40, lineHeight: 1.1, fontWeight: 800, letterSpacing: "-0.03em", color: "#0f172a", margin: "0 0 14px" }}>
            Beautiful sequence diagrams,<br />generated from plain English
          </h1>
          <p style={{ fontSize: 16, color: "#64748b", margin: "0 auto", maxWidth: 520, lineHeight: 1.55 }}>
            A live demo of what you can build. Browse these freely -{" "}
            <a href="/login" style={{ color: "#7c3aed", fontWeight: 600, textDecoration: "none" }}>sign in</a>{" "}
            to create and save your own.
          </p>
        </section>

        {/* Gallery */}
        {demos.length > 0 && (
          <section className="ld-grid ld-in" style={{ display: "grid", gap: 14 }}>
            {demos.map((d, i) => (
              <a key={d.id} href={`/d/${d.id}`} className="ld-card" style={{
                display: "flex", flexDirection: "column", background: "#fff",
                border: "1px solid #e6e8ee", borderRadius: 16, overflow: "hidden",
                textDecoration: "none", boxShadow: "0 1px 4px rgba(15,23,42,0.05)",
                animationDelay: `${0.05 * i}s`,
              }}>
                <div style={{ padding: "13px 16px 10px", display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid #f1f2f6" }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", flexShrink: 0 }} />
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.title}</span>
                </div>
                <div style={{ height: 128, background: "#fbfbfd", display: "flex", alignItems: "center", justifyContent: "center", padding: 10, overflow: "hidden" }}>
                  {/* Public SVG render — sharp at any size, no auth needed. */}
                  <img src={`/svg/${d.id}`} alt={d.title} loading="lazy"
                    style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                </div>
              </a>
            ))}
          </section>
        )}

        <p style={{ textAlign: "center", fontSize: 12.5, color: "#94a3b8", marginTop: 34 }}>
          Click any diagram to open the full view.
        </p>
      </div>

      <style>{`
        @keyframes ldUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes ldFlow { to { stroke-dashoffset: -240; } }
        @keyframes ldBlob { 0%,100% { transform: translate(0,0); } 50% { transform: translate(24px,-18px); } }
        .ld-in { opacity: 0; animation: ldUp 0.6s cubic-bezier(.16,.84,.44,1) both; }
        .ld-card { opacity: 0; animation: ldUp 0.6s cubic-bezier(.16,.84,.44,1) both; transition: box-shadow .16s, transform .16s, border-color .16s; }
        .ld-card:hover { transform: translateY(-3px); border-color: #cbd0dc; box-shadow: 0 12px 32px rgba(15,23,42,0.12); }
        .ld-life { animation: ldFlow 48s linear infinite; }
        .ld-blob { animation: ldBlob 18s ease-in-out infinite; }
        .ld-grid { grid-template-columns: repeat(auto-fill, minmax(168px, 1fr)); }
        @media (max-width: 480px) { .ld-grid { grid-template-columns: repeat(2, 1fr); } h1 { font-size: 30px !important; } }
        @media (prefers-reduced-motion: reduce) {
          .ld-in, .ld-card, .ld-life, .ld-blob { animation: none !important; opacity: 1 !important; }
        }
      `}</style>
    </div>
  );
}
