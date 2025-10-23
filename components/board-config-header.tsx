"use client"

import { Copy, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface BoardConfigHeaderProps {
  roomCode: string
  playerName: string
  onExit?: () => void
}

export function BoardConfigHeader({ roomCode, playerName, onExit }: BoardConfigHeaderProps) {
  const [copied, setCopied] = useState(false)

  const handleCopyRoomCode = () => {
    navigator.clipboard.writeText(roomCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="sticky top-0 z-50 bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between gap-4">
        {/* Left: Logo/Title */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="bg-white/20 p-2 rounded-lg">
            <span className="text-lg sm:text-xl font-bold">🎲</span>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg sm:text-xl font-bold">Bingo Multiplayer</h1>
            <p className="text-xs text-emerald-100">Configure Your Board</p>
          </div>
        </div>

        {/* Center: Room Code */}
        <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-lg">
          <span className="text-xs sm:text-sm font-mono font-bold">{roomCode}</span>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 hover:bg-white/20 text-white"
            onClick={handleCopyRoomCode}
            title="Copy room code"
          >
            <Copy className="h-4 w-4" />
          </Button>
          {copied && <span className="text-xs text-emerald-100">Copied!</span>}
        </div>

        {/* Right: Player Name & Exit */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:block text-right">
            <p className="text-xs text-emerald-100">Playing as</p>
            <p className="text-sm font-semibold">{playerName}</p>
          </div>
          {onExit && (
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 hover:bg-white/20 text-white"
              onClick={onExit}
              title="Exit room"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
