"use client"

import { Copy, LogOut, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useRouter } from "next/navigation"

interface BoardConfigHeaderProps {
  roomCode: string
  playerName: string
}

export function BoardConfigHeader({ roomCode, playerName }: BoardConfigHeaderProps) {
  const router = useRouter()
  const [copied, setCopied] = useState(false)

  const handleCopyRoomCode = () => {
    navigator.clipboard.writeText(roomCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-white/50 shadow-sm supports-[backdrop-filter]:bg-white/60">
      <div className="max-w-[1600px] mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Left: Logo/Title */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/')}
            className="h-9 w-9 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 text-white font-bold shadow-sm">
              B
            </span>
            <div className="hidden sm:block">
              <h1 className="text-sm font-bold text-slate-800 leading-tight">Bingo Party</h1>
              <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">Board Setup</p>
            </div>
          </div>
        </div>

        {/* Center: Room Code */}
        <div
          onClick={handleCopyRoomCode}
          className="group relative flex items-center gap-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-4 py-1.5 rounded-full cursor-pointer transition-all active:scale-95"
        >
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Room</span>
          <span className="text-sm font-mono font-black text-slate-700 tracking-widest">{roomCode}</span>
          <Copy className="h-3.5 w-3.5 text-slate-400 group-hover:text-emerald-500 transition-colors" />

          {copied && (
            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded-md shadow-lg animate-in fade-in zoom-in duration-200">
              Copied!
            </div>
          )}
        </div>

        {/* Right: Player Name */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Player</p>
            <p className="text-sm font-bold text-slate-700 truncate max-w-[120px]">{playerName}</p>
          </div>
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 ring-2 ring-white shadow-sm flex items-center justify-center text-white font-bold text-xs">
            {playerName.slice(0, 2).toUpperCase()}
          </div>
        </div>
      </div>
    </div>
  )
}
