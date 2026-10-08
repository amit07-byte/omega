import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(<Mark size={32} />, { ...size });
}

function Mark({ size: box }: { size: number }) {
  const circle = Math.round(box * 0.34);
  const gap = Math.round(box * 0.06);
  return (
    <div
      style={{
        width: box,
        height: box,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#1A4E4B",
        borderRadius: Math.round(box * 0.22),
      }}
    >
      <div
        style={{
          width: circle,
          height: circle,
          borderRadius: 999,
          background: "#F6F3EC",
          marginRight: gap,
        }}
      />
      <div
        style={{
          width: circle,
          height: circle,
          borderRadius: 999,
          border: `${Math.max(2, Math.round(box * 0.06))}px solid #F6F3EC`,
        }}
      />
    </div>
  );
}
