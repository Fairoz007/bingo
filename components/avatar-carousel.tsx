"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const AVATAR_OPTIONS = ["👤", "😀", "😎", "🎮", "🎯", "🎲", "🎪", "🎨", "🎭", "🎸"]

interface AvatarCarouselProps {
  value: string
  onChange: (avatar: string) => void
}

export function AvatarCarousel({ value, onChange }: AvatarCarouselProps) {
  const [startIndex, setStartIndex] = useState(0)
  const visibleCount = 5

  const handlePrev = () => {
    setStartIndex((prev) => (prev === 0 ? Math.max(0, AVATAR_OPTIONS.length - visibleCount) : prev - 1))
  }

  const handleNext = () => {
    setStartIndex((prev) => (prev + visibleCount >= AVATAR_OPTIONS.length ? 0 : prev + 1))
  }

  const visibleAvatars = AVATAR_OPTIONS.slice(startIndex, startIndex + visibleCount)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-700">Choose Avatar</p>
        <p className="text-xs text-slate-500">Selected: {value}</p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handlePrev}
          className="h-10 w-10 p-0 hover:bg-slate-100"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex flex-1 gap-2 justify-center">
          {visibleAvatars.map((avatar) => (
            <button
              key={avatar}
              onClick={() => onChange(avatar)}
              className={`h-14 w-14 rounded-lg flex items-center justify-center text-3xl transition-all duration-200 ${
                value === avatar
                  ? "bg-emerald-500 ring-2 ring-emerald-600 scale-110 shadow-lg"
                  : "bg-slate-100 hover:bg-slate-200 hover:scale-105"
              }`}
            >
              {avatar}
            </button>
          ))}
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleNext}
          className="h-10 w-10 p-0 hover:bg-slate-100"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
