import { describe, it, expect } from "vitest"
import { getPoint } from "@/components/feedback/pdf/radar-chart"

describe("getPoint", () => {
  const cx = 150
  const cy = 150
  const radius = 100

  it("places first point at 12 o'clock (top) for full score", () => {
    const { x, y } = getPoint(0, 4, 100, 100, radius, cx, cy)
    expect(x).toBeCloseTo(cx, 0)
    expect(y).toBeCloseTo(cy - radius, 0)
  })

  it("places second point of 4 at 3 o'clock (right)", () => {
    const { x, y } = getPoint(1, 4, 100, 100, radius, cx, cy)
    expect(x).toBeCloseTo(cx + radius, 0)
    expect(y).toBeCloseTo(cy, 0)
  })

  it("places third point of 4 at 6 o'clock (bottom)", () => {
    const { x, y } = getPoint(2, 4, 100, 100, radius, cx, cy)
    expect(x).toBeCloseTo(cx, 0)
    expect(y).toBeCloseTo(cy + radius, 0)
  })

  it("places fourth point of 4 at 9 o'clock (left)", () => {
    const { x, y } = getPoint(3, 4, 100, 100, radius, cx, cy)
    expect(x).toBeCloseTo(cx - radius, 0)
    expect(y).toBeCloseTo(cy, 0)
  })

  it("returns center for score 0", () => {
    const { x, y } = getPoint(0, 5, 0, 100, radius, cx, cy)
    expect(x).toBeCloseTo(cx, 0)
    expect(y).toBeCloseTo(cy, 0)
  })

  it("scales to half radius for score 50", () => {
    const { x, y } = getPoint(0, 5, 50, 100, radius, cx, cy)
    expect(x).toBeCloseTo(cx, 0)
    expect(y).toBeCloseTo(cy - radius / 2, 0)
  })

  it("handles 5 criteria (pentagonal) correctly", () => {
    // 5 points evenly spaced, first at top
    const points = Array.from({ length: 5 }, (_, i) =>
      getPoint(i, 5, 100, 100, radius, cx, cy)
    )
    // All points should be radius distance from center
    for (const p of points) {
      const dist = Math.sqrt((p.x - cx) ** 2 + (p.y - cy) ** 2)
      expect(dist).toBeCloseTo(radius, 0)
    }
  })

  it("handles 6 criteria (hexagonal) correctly", () => {
    const points = Array.from({ length: 6 }, (_, i) =>
      getPoint(i, 6, 100, 100, radius, cx, cy)
    )
    for (const p of points) {
      const dist = Math.sqrt((p.x - cx) ** 2 + (p.y - cy) ** 2)
      expect(dist).toBeCloseTo(radius, 0)
    }
  })

  it("returns full radius for score 100", () => {
    const { x, y } = getPoint(0, 4, 100, 100, radius, cx, cy)
    const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2)
    expect(dist).toBeCloseTo(radius, 0)
  })
})
