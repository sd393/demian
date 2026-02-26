import { describe, it, expect } from "vitest"
import { getScoringTier } from "@/components/feedback/pdf/theme"

describe("getScoringTier", () => {
  it("returns 'needsWork' for score 0", () => {
    expect(getScoringTier(0).key).toBe("needsWork")
  })

  it("returns 'needsWork' for score 49", () => {
    expect(getScoringTier(49).key).toBe("needsWork")
  })

  it("returns 'developing' for score 50", () => {
    expect(getScoringTier(50).key).toBe("developing")
  })

  it("returns 'developing' for score 69", () => {
    expect(getScoringTier(69).key).toBe("developing")
  })

  it("returns 'proficient' for score 70", () => {
    expect(getScoringTier(70).key).toBe("proficient")
  })

  it("returns 'proficient' for score 84", () => {
    expect(getScoringTier(84).key).toBe("proficient")
  })

  it("returns 'exceptional' for score 85", () => {
    expect(getScoringTier(85).key).toBe("exceptional")
  })

  it("returns 'exceptional' for score 100", () => {
    expect(getScoringTier(100).key).toBe("exceptional")
  })

  it("includes label and color for each tier", () => {
    const tier = getScoringTier(90)
    expect(tier.label).toBe("Exceptional")
    expect(tier.color).toBeTruthy()
    expect(tier.bg).toBeTruthy()
  })

  it("returns correct label for each tier", () => {
    expect(getScoringTier(30).label).toBe("Needs Work")
    expect(getScoringTier(55).label).toBe("Developing")
    expect(getScoringTier(75).label).toBe("Proficient")
    expect(getScoringTier(90).label).toBe("Exceptional")
  })
})
