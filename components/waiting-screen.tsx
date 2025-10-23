"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-xl animate-in fade-in zoom-in duration-500">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl sm:text-3xl font-bold text-balance">Waiting for Players</CardTitle>
          <CardDescription className="text-sm sm:text-base">Share the room code to invite more players</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="relative bg-primary/10 rounded-lg p-6 text-center space-y-2 overflow-hidden">
            <div className="absolute inset-0 animate-shimmer" />
            <p className="text-sm text-muted-foreground font-medium relative z-10">Room Code</p>
            <p className="text-3xl sm:text-4xl font-bold tracking-wider text-primary relative z-10">{room.room_code}</p>
          </div>

          <Button
            onClick={copyRoomCode}
            variant="outline"
            className="w-full h-12 bg-transparent transition-all duration-200 hover:scale-105"
            size="lg"
          >
            {copied ? (
              <>
                <Check className="mr-2 h-5 w-5 text-green-600" />
                <span className="text-green-600">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="mr-2 h-5 w-5" />
                Copy Room Code
              </>
            )}
          </Button>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground font-medium">Players</span>
              <span className="text-muted-foreground">
                {room.player_count} / {room.max_players}
              </span>
            </div>
            <div className="space-y-2">
              {sortedPlayers.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 animate-in fade-in slide-in-from-left duration-300"
                >
                  <span className="text-2xl">{player.player_avatar || "👤"}</span>
                  <div className="flex-1">
                    <p className="font-medium text-sm">
                      {player.player_name}
                      {player.player_name === currentPlayerName && (
                        <span className="ml-2 text-xs text-primary">(You)</span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">Player {player.join_order}</p>
                  </div>
                  <div className="h-2 w-2 bg-green-500 rounded-full" />
                </div>
              ))}
              {Array.from({ length: room.max_players - room.player_count }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border-2 border-dashed border-muted-foreground/20"
                >
                  <span className="text-2xl opacity-30">👤</span>
                  <div className="flex-1">
                    <p className="font-medium text-sm text-muted-foreground/50">Waiting...</p>
                    <p className="text-xs text-muted-foreground/50">Player {room.player_count + i + 1}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <div className="h-2 w-2 bg-primary rounded-full animate-pulse" />
              <p className="text-sm text-muted-foreground">
                Waiting for {room.max_players - room.player_count} more player(s)...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
