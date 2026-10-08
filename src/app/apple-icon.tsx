import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1A4E4B",
          borderRadius: 40,
        }}
      >
        <div
          style={{
            width: 62,
            height: 62,
            borderRadius: 999,
            background: "#F6F3EC",
            marginRight: -16,
          }}
        />
        <div
          style={{
            width: 62,
            height: 62,
            borderRadius: 999,
            border: "8px solid #F6F3EC",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
