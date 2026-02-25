"use client"

import { useState } from "react"
import ReactMarkdown from "react-markdown"
import { Search, ChevronDown } from "lucide-react"
import type { ResearchMeta } from "@/hooks/use-chat"

export function ResearchCard({ meta }: { meta: ResearchMeta }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="rounded-lg border border-border/60 bg-muted/30">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm"
      >
        <Search className="h-3.5 w-3.5 text-primary/60" />
        <span className="font-medium text-foreground/80">
          Audience research completed
        </span>
        <span className="text-muted-foreground/60">
          — {meta.searchTerms.length} searches
        </span>
        <ChevronDown
          className={`ml-auto h-3.5 w-3.5 text-muted-foreground/50 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {isOpen && (
        <div className="max-h-80 overflow-y-auto border-t border-border/60 px-4 py-3 text-sm">
          <p className="mb-2 font-medium text-foreground/70">
            {meta.audienceSummary}
          </p>
          <div className="mb-3">
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground/50">
              Search terms
            </p>
            <div className="flex flex-wrap gap-1.5">
              {meta.searchTerms.map((term) => (
                <span
                  key={term}
                  className="rounded-md border border-border/40 bg-background px-2 py-0.5 text-xs text-foreground/70"
                >
                  {term}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground/50">
              Briefing
            </p>
            <div className="prose prose-sm max-w-none text-xs leading-relaxed text-foreground/70 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_strong]:text-foreground [&_strong]:font-semibold [&_a]:text-primary/70 [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:text-primary">
              <ReactMarkdown>{meta.briefing}</ReactMarkdown>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
