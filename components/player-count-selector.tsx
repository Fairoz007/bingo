"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users } from "lucide-react"

interface PlayerCountSelectorProps {
  value: string
  onChange: (value: string) => void
}

export function PlayerCountSelector({ value, onChange }: PlayerCountSelectorProps) {
  const playerCounts = [
    { value: "2", label: "2 Players", description: "Head-to-head" },
    { value: "3", label: "3 Players", description: "Small group" },
    { value: "4", label: "4 Players", description: "Medium group" },
    { value: "5", label: "5 Players", description: "Large group" },
    { value: "6", label: "6 Players", description: "Maximum" },
  ]

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-emerald-600" />
        <label className="text-sm font-semibold text-slate-700">Number of Players</label>
      </div>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-11 border-slate-300 focus:border-emerald-500 focus:ring-emerald-500">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {playerCounts.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex items-center gap-2">
                <span>{option.label}</span>
                <span className="text-xs text-slate-500">({option.description})</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
