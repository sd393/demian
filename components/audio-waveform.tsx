"use client"

import { useRef, useEffect } from "react"

export function AudioWaveform({ analyser }: { analyser: AnalyserNode | null }) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!analyser || !containerRef.current) return
    const a = analyser
    const bars = Array.from(
      containerRef.current.querySelectorAll("[data-bar]")
    ) as HTMLElement[]
    const dataArray = new Uint8Array(a.frequencyBinCount)
    let rafId: number

    function update() {
      a.getByteFrequencyData(dataArray)
      const step = Math.max(1, Math.floor(dataArray.length / bars.length))
      bars.forEach((bar, i) => {
        const value = dataArray[i * step] / 255
        bar.style.height = `${Math.max(3, Math.round(value * 22))}px`
      })
      rafId = requestAnimationFrame(update)
    }

    rafId = requestAnimationFrame(update)
    return () => cancelAnimationFrame(rafId)
  }, [analyser])

  return (
    <div ref={containerRef} className="flex w-[90%] mx-auto items-center justify-between overflow-hidden">
      {Array.from({ length: 56 }).map((_, i) => (
        <div
          key={i}
          data-bar=""
          className="w-0.5 flex-shrink-0 rounded-full bg-primary/70"
          style={{ height: "3px" }}
        />
      ))}
    </div>
  )
}
