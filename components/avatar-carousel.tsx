"use client"

import { useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const AVATAR_OPTIONS = [
  "🎮",
  "😀",
  "😎",
  "🎯",
  "🎲",
  "🎪",
  "🎨",
  "🎭",
  "🎸",
  "🐱",
  "🐶",
  "👤",
  "🐼",
  "🐵",
  "🦄",
  "🐉",
  "🚀",
  "🌙",
  "⭐",
  "⚡",
  "🍀",
  "🍕",
  "🎧",
]

interface AvatarCarouselProps {
  value: string
  onChange: (avatar: string) => void
}

export function AvatarCarousel({ value, onChange }: AvatarCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const { current } = scrollContainerRef
      const scrollAmount = 200
      if (direction === "left") {
        current.scrollBy({ left: -scrollAmount, behavior: "smooth" })
      } else {
        current.scrollBy({ left: scrollAmount, behavior: "smooth" })
      }
    }
  }

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between px-1">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Choose Avatar</p>
        <p className="text-xs text-slate-500 font-medium">Selected: <span className="text-slate-800">{value}</span></p>
      </div>

      <div className="relative flex items-center group/carousel">
        {/* Left Arrow */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => scroll("left")}
          className="absolute left-0 z-10 -ml-3 h-8 w-8 rounded-full bg-white/80 shadow-sm border border-slate-100 text-slate-400 hover:text-emerald-600 hover:bg-white opacity-0 group-hover/carousel:opacity-100 transition-all duration-300 hidden sm:flex"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Scrollable Strip */}
        <div
          ref={scrollContainerRef}
          className="flex items-center gap-3 overflow-x-auto scrollbar-hide py-3 px-1 w-full mask-linear-fade"
        >
          {AVATAR_OPTIONS.map((avatar) => (
            <button
              key={avatar}
              type="button"
              onClick={() => onChange(avatar)}
              className={`flex-shrink-0 h-10 w-10 rounded-xl flex items-center justify-center text-xl transition-all duration-300 sm:h-12 sm:w-12 sm:text-2xl disable-tap-highlight ${value === avatar
                  ? "bg-emerald-500 ring-4 ring-emerald-100 scale-110 shadow-lg shadow-emerald-500/30 z-10"
                  : "bg-slate-50 hover:bg-slate-100 hover:scale-105 text-slate-600 grayscale-[0.2]"
                }`}
            >
              {avatar}
            </button>
          ))}
        </div>

        {/* Right Arrow */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => scroll("right")}
          className="absolute right-0 z-10 -mr-3 h-8 w-8 rounded-full bg-white/80 shadow-sm border border-slate-100 text-slate-400 hover:text-emerald-600 hover:bg-white opacity-0 group-hover/carousel:opacity-100 transition-all duration-300 hidden sm:flex"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* Fade gradient masks for scroll indication on mobile */}
        <div className="absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-white/80 to-transparent pointer-events-none sm:hidden" />
        <div className="absolute inset-y-0 right-0 w-4 bg-gradient-to-l from-white/80 to-transparent pointer-events-none sm:hidden" />
      </div>
    </div>
  )
}
