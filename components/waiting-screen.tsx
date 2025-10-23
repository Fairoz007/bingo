"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, Check, Users, Zap } from "lucide-react"
import { useState } from "react"
import type { Player, Room } from "@/lib/types"

interface WaitingScreenProps {
  room: Room
  players: Player[]
  currentPlayerName: string
}

export function WaitingScreen({ room, players, currentPlayerName }: WaitingScreenProps) {
  const [copied, setCopied] = useState(false)

  const copyRoomCode = () => {
    navigator.clipboard.writeText(room.room_code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const sortedPlayers = [...players].sort((a, b) => a.join_order - b.join_order)
  const playersNeeded = room.max_players - room.player_count

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* Header Section */}
        <div className="text-center space-y-3 animate-in fade-in slide-in-from-top duration-500">
          <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-emerald-100/50 border border-emerald-200">
            <Zap className="h-4 w-4 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-700">Game Starting Soon</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-balance bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Waiting for Players
          </h1>
          <p className="text-lg text-muted-foreground">
            {playersNeeded === 0
              ? "All players ready! Game will start shortly."
              : `Invite ${playersNeeded} more player${playersNeeded !== 1 ? "s" : ""} to begin`}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Room Code Card */}
          <Card className="shadow-lg border-emerald-200/50 animate-in fade-in slide-in-from-left duration-500 delay-100">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Copy className="h-5 w-5 text-emerald-600" />
                Room Code
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 text-center border-2 border-emerald-200/50 overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/0 via-emerald-400/5 to-emerald-400/0 group-hover:via-emerald-400/10 transition-all duration-300" />
                <p className="text-sm text-muted-foreground font-medium relative z-10 mb-2">Share this code</p>
                <p className="text-5xl font-bold tracking-widest text-emerald-600 relative z-10 font-mono">
                  {room.room_code}
                </p>
              </div>
              <Button
                onClick={copyRoomCode}
                className="w-full h-11 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold transition-all duration-200 hover:shadow-lg"
                size="lg"
              >
                {copied ? (
                  <>
                    <Check className="mr-2 h-5 w-5" />
                    <span>Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-5 w-5" />
                    Copy Room Code
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Players Card */}
          <Card className="shadow-lg border-emerald-200/50 animate-in fade-in slide-in-from-right duration-500 delay-100">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-emerald-600" />
                Players
              </CardTitle>
              <CardDescription>
                {room.player_count} of {room.max_players} joined
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {sortedPlayers.map((player, index) => (
                  <div
                    key={player.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/50 animate-in fade-in slide-in-from-left duration-300"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="text-3xl">{player.player_avatar || "👤"}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">
                        {player.player_name}
                        {player.player_name === currentPlayerName && (
                          <span className="ml-2 text-xs font-medium text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full inline-block">
                            You
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">Player {player.join_order}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="h-2.5 w-2.5 bg-emerald-500 rounded-full animate-pulse" />
                      <span className="text-xs text-emerald-600 font-medium">Ready</span>
                    </div>
                  </div>
                ))}
                {Array.from({ length: playersNeeded }).map((_, i) => (
                  <div
                    key={`empty-${i}`}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border-2 border-dashed border-muted-foreground/20 animate-pulse"
                  >
                    <span className="text-3xl opacity-30">👤</span>
                    <div className="flex-1">
                      <p className="font-medium text-sm text-muted-foreground/60">Waiting for player...</p>
                      <p className="text-xs text-muted-foreground/50">Player {room.player_count + i + 1}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status Footer */}
        <div className="text-center space-y-3 animate-in fade-in slide-in-from-bottom duration-500 delay-200">
          <div className="flex items-center justify-center gap-2">
            <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
            <p className="text-sm font-medium text-muted-foreground">
              {playersNeeded === 0 ? (
                <span className="text-emerald-600">All players joined! Starting game...</span>
              ) : (
                <span>
                  Waiting for {playersNeeded} more player{playersNeeded !== 1 ? "s" : ""}...
                </span>
              )}
            </p>
          </div>
          <p className="text-xs text-muted-foreground/70">
            Game will start automatically once all players have joined and configured their boards.
          </p>
        </div>
      </div>
    </div>
  )
}
