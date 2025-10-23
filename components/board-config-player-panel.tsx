"use client"

import { Users, CheckCircle2, Clock } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface BoardConfigPlayerPanelProps {
  playerName: string
  playerNumber: number
  playerCount: number
  playersReady: number
  maxPlayers: number
  gridSize: number
  totalNumbers: number
}

export function BoardConfigPlayerPanel({
  playerName,
  playerNumber,
  playerCount,
  playersReady,
  maxPlayers,
  gridSize,
  totalNumbers,
}: BoardConfigPlayerPanelProps) {
  const playersNeededToJoin = Math.max(maxPlayers - playerCount, 0)
  const playersStillConfiguring = Math.max(maxPlayers - playersReady, 0)

  return (
    <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200 p-4 sm:p-6">
      <div className="space-y-4">
        {/* Player Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-600 text-white p-2 rounded-lg">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">You are playing as</p>
              <p className="text-lg font-bold text-emerald-900">{playerName}</p>
            </div>
          </div>
          <Badge className="bg-emerald-600 text-white">Player {playerNumber}</Badge>
        </div>

        {/* Player Count */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-emerald-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <div>
              <p className="text-xs text-muted-foreground">Players Joined</p>
              <p className="text-lg font-bold text-emerald-900">
                {playerCount}/{maxPlayers}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-600" />
            <div>
              <p className="text-xs text-muted-foreground">Players Ready</p>
              <p className="text-lg font-bold text-emerald-900">
                {playersReady}/{maxPlayers}
              </p>
              <p className="text-[11px] text-muted-foreground">{playersStillConfiguring} still configuring</p>
            </div>
          </div>
        </div>

        {/* Game Settings */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-emerald-200 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Grid Size</p>
            <p className="font-bold text-emerald-900">
              {gridSize}×{gridSize}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Numbers</p>
            <p className="font-bold text-emerald-900">1-{totalNumbers}</p>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-white/60 rounded-lg p-3 border border-emerald-200">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Once all players join and configure their boards, the game will begin. Fill your board and click "Ready" when
            done.
          </p>
        </div>
      </div>
    </Card>
  )
}
