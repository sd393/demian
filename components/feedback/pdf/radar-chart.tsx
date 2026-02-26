import { Svg, G, Polygon, Circle, Line, Text as SvgText } from "@react-pdf/renderer"
import { colors, fonts } from "./theme"

interface RadarChartProps {
  /** Array of { name, score } — score is 0-100. */
  criteria: { name: string; score: number }[]
  /** Radius of the outermost grid ring in SVG units. */
  radius?: number
}

const GRID_RINGS = [0.25, 0.5, 0.75, 1]
const LABEL_PADDING = 18

/**
 * Calculate the (x, y) position for a point on the radar chart.
 * Angle 0 starts at 12 o'clock (top), going clockwise.
 */
export function getPoint(
  index: number,
  total: number,
  value: number,
  maxValue: number,
  radius: number,
  cx: number,
  cy: number
): { x: number; y: number } {
  const angle = (2 * Math.PI * index) / total - Math.PI / 2
  const r = (value / maxValue) * radius
  return {
    x: cx + r * Math.cos(angle),
    y: cy + r * Math.sin(angle),
  }
}

/** Wrap long label text into lines of ~maxChars characters. */
function wrapLabel(text: string, maxChars = 14): string[] {
  const words = text.split(" ")
  const lines: string[] = []
  let current = ""

  for (const word of words) {
    const next = current ? `${current} ${word}` : word
    if (next.length > maxChars && current) {
      lines.push(current)
      current = word
    } else {
      current = next
    }
  }
  if (current) lines.push(current)
  return lines
}

/**
 * Static SVG radar chart for @react-pdf/renderer.
 * Uses native SVG primitives — no Recharts dependency.
 */
export function PdfRadarChart({ criteria, radius = 100 }: RadarChartProps) {
  const n = criteria.length
  if (n < 3) return null

  const size = (radius + LABEL_PADDING + 40) * 2
  const cx = size / 2
  const cy = size / 2

  // Grid rings
  const gridPolygons = GRID_RINGS.map((pct) => {
    const points = Array.from({ length: n }, (_, i) => {
      const { x, y } = getPoint(i, n, pct * 100, 100, radius, cx, cy)
      return `${x},${y}`
    }).join(" ")
    return (
      <Polygon
        key={`ring-${pct}`}
        points={points}
        style={{
          fill: "none",
          stroke: colors.border,
          strokeWidth: 0.5,
        }}
      />
    )
  })

  // Axis lines from center to each vertex
  const axisLines = Array.from({ length: n }, (_, i) => {
    const { x, y } = getPoint(i, n, 100, 100, radius, cx, cy)
    return (
      <Line
        key={`axis-${i}`}
        x1={cx}
        y1={cy}
        x2={x}
        y2={y}
        style={{ stroke: colors.border, strokeWidth: 0.5 }}
      />
    )
  })

  // Data polygon
  const dataPoints = criteria.map((c, i) =>
    getPoint(i, n, Math.max(c.score, 0), 100, radius, cx, cy)
  )
  const dataPolygonPoints = dataPoints.map((p) => `${p.x},${p.y}`).join(" ")

  // Data dots
  const dataDots = dataPoints.map((p, i) => (
    <Circle
      key={`dot-${i}`}
      cx={p.x}
      cy={p.y}
      r={2.5}
      style={{ fill: colors.primary }}
    />
  ))

  // Labels
  const labels = criteria.map((c, i) => {
    const { x, y } = getPoint(i, n, 100, 100, radius + LABEL_PADDING, cx, cy)
    const lines = wrapLabel(c.name)
    const anchor = Math.abs(x - cx) < 1 ? "middle" : x > cx ? "start" : "end"
    const dy = y < cy ? -4 * lines.length : y > cy ? 4 : 0

    return (
      <G key={`label-${i}`}>
        {lines.map((line, li) => (
          <SvgText
            key={li}
            x={x}
            y={y + dy + li * 10}
            style={{
              fontFamily: fonts.sans,
              fontSize: 7,
              fill: colors.textSecondary,
              textAnchor: anchor,
            }}
          >
            {line}
          </SvgText>
        ))}
      </G>
    )
  })

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {gridPolygons}
      {axisLines}
      <Polygon
        points={dataPolygonPoints}
        style={{
          fill: colors.primary,
          fillOpacity: 0.15,
          stroke: colors.primary,
          strokeWidth: 1.5,
        }}
      />
      {dataDots}
      {labels}
    </Svg>
  )
}
