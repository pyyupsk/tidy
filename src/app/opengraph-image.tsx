import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "tidy — clean your xlsx"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: 1200,
        height: 630,
        display: "flex",
        background: "#141414",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      {/* Left panel */}
      <div
        style={{
          width: 580,
          height: 630,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(to right, #1e1e1e, #141414)",
        }}
      >
        {/* Grid icon 300×300 */}
        <div
          style={{
            width: 300,
            height: 300,
            borderRadius: 66,
            background: "#2e2e2e",
            display: "flex",
            flexWrap: "wrap",
            padding: 60,
            gap: 13,
          }}
        >
          {/* row 0: filled filled empty */}
          <div
            style={{
              width: 51,
              height: 51,
              borderRadius: 9,
              background: "#eaeaea",
            }}
          />
          <div
            style={{
              width: 51,
              height: 51,
              borderRadius: 9,
              background: "#eaeaea",
            }}
          />
          <div
            style={{
              width: 51,
              height: 51,
              borderRadius: 9,
              background: "#3d3d3d",
            }}
          />
          {/* row 1: filled empty empty */}
          <div
            style={{
              width: 51,
              height: 51,
              borderRadius: 9,
              background: "#eaeaea",
            }}
          />
          <div
            style={{
              width: 51,
              height: 51,
              borderRadius: 9,
              background: "#3d3d3d",
            }}
          />
          <div
            style={{
              width: 51,
              height: 51,
              borderRadius: 9,
              background: "#3d3d3d",
            }}
          />
          {/* row 2: empty empty empty */}
          <div
            style={{
              width: 51,
              height: 51,
              borderRadius: 9,
              background: "#3d3d3d",
            }}
          />
          <div
            style={{
              width: 51,
              height: 51,
              borderRadius: 9,
              background: "#3d3d3d",
            }}
          />
          <div
            style={{
              width: 51,
              height: 51,
              borderRadius: 9,
              background: "#3d3d3d",
            }}
          />
        </div>
      </div>

      {/* Vertical divider */}
      <div
        style={{
          width: 1,
          height: 470,
          background: "#252525",
          marginTop: 80,
          flexShrink: 0,
        }}
      />

      {/* Right panel */}
      <div
        style={{
          flex: 1,
          height: 630,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          paddingLeft: 60,
          paddingRight: 60,
          gap: 0,
        }}
      >
        {/* Wordmark */}
        <div
          style={{
            fontSize: 108,
            fontWeight: 600,
            color: "#eaeaea",
            letterSpacing: -4,
            lineHeight: 1,
          }}
        >
          tidy
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 23,
            color: "#505050",
            letterSpacing: 1.5,
            textTransform: "uppercase",
            marginTop: 8,
          }}
        >
          clean your xlsx
        </div>

        {/* Rule */}
        <div
          style={{
            width: "100%",
            height: 1,
            background: "#222",
            marginTop: 28,
            marginBottom: 28,
          }}
        />

        {/* Feature bullets */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {[
            "Drop columns & duplicate rows",
            "Fill missing values — literal, median, empty",
            "100% client-side — your data stays local",
          ].map((text) => (
            <div
              key={text}
              style={{ display: "flex", alignItems: "center", gap: 14 }}
            >
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 1.5,
                  background: "#a8a8a8",
                  flexShrink: 0,
                }}
              />
              <div style={{ fontSize: 20, color: "#888" }}>{text}</div>
            </div>
          ))}
        </div>

        {/* Badge */}
        <div
          style={{
            marginTop: 40,
            display: "inline-flex",
            alignSelf: "flex-start",
            background: "#252525",
            borderRadius: 8,
            padding: "8px 16px",
            fontSize: 15,
            color: "#555",
            fontFamily: "monospace",
          }}
        >
          .xlsx → clean.xlsx
        </div>
      </div>
    </div>,
    { width: 1200, height: 630 },
  )
}
