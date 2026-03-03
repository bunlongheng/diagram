import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
    return new ImageResponse(
        (
            <div
                style={{
                    background: "hsl(285, 90%, 52%)",
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "40px",
                    gap: "14px",
                    padding: "24px",
                }}
            >
                <div style={{ display: "flex", gap: "30px" }}>
                    <div style={{ width: 48, height: 28, background: "white", borderRadius: 8 }} />
                    <div style={{ width: 48, height: 28, background: "white", borderRadius: 8 }} />
                </div>
                <div style={{ display: "flex", alignItems: "center" }}>
                    <div style={{ width: 100, height: 5, background: "white" }} />
                    <div style={{ width: 0, height: 0, borderTop: "10px solid transparent", borderBottom: "10px solid transparent", borderLeft: "16px solid white" }} />
                </div>
                <div style={{ display: "flex", alignItems: "center", flexDirection: "row-reverse" }}>
                    <div style={{ width: 100, height: 5, background: "rgba(255,255,255,0.7)" }} />
                    <div style={{ width: 0, height: 0, borderTop: "10px solid transparent", borderBottom: "10px solid transparent", borderRight: "16px solid rgba(255,255,255,0.7)" }} />
                </div>
            </div>
        ),
        { ...size }
    );
}
