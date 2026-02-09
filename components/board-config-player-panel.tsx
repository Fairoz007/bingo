"use client"

import { Users, CheckCircle2, Clock, Globe } from "lucide-react"
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
    <Card className="bg-white/80 backdrop-blur-xl border-white/50 shadow-lg p-6 rounded-[24px] ring-1 ring-black/5">
      <div className="space-y-6">
        {/* Player Status */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-emerald-400 to-teal-500 text-white p-2.5 rounded-xl shadow-md">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">You are</p>
              <p className="text-lg font-bold text-slate-800">{playerName}</p>
            </div>
          </div>
          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200 px-3 py-1 rounded-lg">
            P{playerNumber}
          </Badge>
        </div>

        {/* Player Count */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1 bg-slate-50/80 p-3 rounded-xl border border-slate-100">
            <div className="flex items-center gap-2 text-slate-500 mb-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span className="text-xs font-medium uppercase">Joined</span>
            </div>
            <p className="text-2xl font-black text-slate-700">
              {playerCount}<span className="text-slate-300 text-lg">/</span>{maxPlayers}
            </p>
          </div>

          <div className="space-y-1 bg-slate-50/80 p-3 rounded-xl border border-slate-100">
            <div className="flex items-center gap-2 text-slate-500 mb-1">
              <Clock className="h-3.5 w-3.5" />
              <span className="text-xs font-medium uppercase">Ready</span>
            </div>
            <div className="flex items-baseline gap-1">
              <p className="text-2xl font-black text-slate-700">
                {playersReady}<span className="text-slate-300 text-lg">/</span>{maxPlayers}
              </p>
            </div>
            {playersStillConfiguring > 0 && (
              <p className="text-[10px] text-amber-600 font-medium">Waiting for {playersStillConfiguring}...</p>
            )}
          </div>
        </div>

        {/* Game Settings */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-center items-center text-center">
            <span className="text-xs text-slate-400 font-bold uppercase mb-1">Grid Size</span>
            <span className="text-lg font-bold text-slate-700">{gridSize} × {gridSize}</span>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-center items-center text-center">
            <span className="text-xs text-slate-400 font-bold uppercase mb-1">Numbers</span>
            <span className="text-lg font-bold text-slate-700">1 - {totalNumbers}</span>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-emerald-50/80 rounded-xl p-4 border border-emerald-100/50 text-emerald-800 text-sm leading-relaxed">
          <p>
            <strong>Waiting for players...</strong> Once everyone configures their board, the game will start automatically!
          </p>
        </div>
      </div>
    </Card>
  )
}
