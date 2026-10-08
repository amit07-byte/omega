import { ImageResponse } from "next/og";

export const alt = "Omega — Connect local businesses with creators";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#F6F3EC",
          color: "#241F1A",
          padding: "72px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "#1A4E4B",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 16,
            }}
          >
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: 999,
                background: "#F6F3EC",
                marginRight: 4,
              }}
            />
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: 999,
                border: "3px solid #F6F3EC",
              }}
            />
          </div>
          <div style={{ fontSize: 36, fontWeight: 600 }}>Omega</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 860 }}>
          <div style={{ fontSize: 68, lineHeight: 1.05, letterSpacing: -1.5 }}>
            Connect local businesses with creators.
          </div>
          <div
            style={{
              marginTop: 24,
              fontSize: 28,
              lineHeight: 1.4,
              color: "#5C564E",
            }}
          >
            A marketplace for neighborhood collaborations.
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
