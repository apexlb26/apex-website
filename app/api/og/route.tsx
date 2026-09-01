import { ImageResponse } from "next/og";

function clean(value: string | null, fallback: string, max = 120) {
  const text = (value || fallback).replace(/[<>]/g, "").trim();
  return text.slice(0, max);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = clean(searchParams.get("title"), "Intelligent systems. Real momentum.", 90);
  const subtitle = clean(
    searchParams.get("subtitle"),
    "Software, AI, data, integration, and workflow systems built for measurable operational progress.",
    170,
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #ffffff 0%, #f0fbfa 56%, #dff7f4 100%)",
          color: "#1E2328",
          padding: "72px 82px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
          <div style={{ width: "16px", height: "16px", borderRadius: "50%", background: "#00B3A4" }} />
          <div style={{ fontSize: "28px", fontWeight: 800, letterSpacing: "0.18em" }}>APEX</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", maxWidth: "980px" }}>
          <div style={{ fontSize: "62px", lineHeight: 1.04, fontWeight: 800, letterSpacing: "-0.045em" }}>{title}</div>
          <div style={{ marginTop: "28px", fontSize: "24px", lineHeight: 1.45, color: "#566068", maxWidth: "900px" }}>{subtitle}</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "20px", color: "#007F75" }}>
          <span>apexlb.tech</span>
          <span>AI & DIGITAL SYSTEMS</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
