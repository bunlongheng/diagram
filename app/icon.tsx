import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
    return new ImageResponse(
        (
            <div
                style={{
                    background: "hsl(285, 90%, 52%)",
                    width: "100%",
                    height: "100%",
                    borderRadius: "22%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "3px",
                    padding: "5px",
                }}
            >
                {/* Two participant boxes */}
                <div style={{ display: "flex", gap: "7px" }}>
                    <div style={{ width: 9, height: 6, background: "white", borderRadius: 2 }} />
                    <div style={{ width: 9, height: 6, background: "white", borderRadius: 2 }} />
                </div>
                {/* Forward arrow */}
                <div style={{ display: "flex", alignItems: "center" }}>
                    <div style={{ width: 18, height: 2, background: "white" }} />
                    <div style={{ width: 0, height: 0, borderTop: "3px solid transparent", borderBottom: "3px solid transparent", borderLeft: "5px solid white" }} />
                </div>
                {/* Return arrow */}
                <div style={{ display: "flex", alignItems: "center", flexDirection: "row-reverse" }}>
                    <div style={{ width: 18, height: 2, background: "rgba(255,255,255,0.7)" }} />
                    <div style={{ width: 0, height: 0, borderTop: "3px solid transparent", borderBottom: "3px solid transparent", borderRight: "5px solid rgba(255,255,255,0.7)" }} />
                </div>
            </div>
        ),
        { ...size }
    );
}
