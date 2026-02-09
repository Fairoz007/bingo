"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { AvatarCarousel } from "@/components/avatar-carousel"
import { PlayerCountSelector } from "@/components/player-count-selector"
import { Users, LogIn, AlertCircle, Sparkles } from "lucide-react"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { cn } from "@/lib/utils"

const DEFAULT_AVATAR = "🎮"

export default function HomePage() {
  const router = useRouter()
  const [playerName, setPlayerName] = useState("")
  const [playerAvatar, setPlayerAvatar] = useState(DEFAULT_AVATAR)
  const [maxPlayers, setMaxPlayers] = useState("2")
  const [roomCode, setRoomCode] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [isJoining, setIsJoining] = useState(false)
  const [nameError, setNameError] = useState("")

  const handleNameChange = (value: string) => {
    setPlayerName(value)
    if (value.trim()) {
      const nameRegex = /^[a-zA-Z0-9\s\-']{1,30}$/
      if (!nameRegex.test(value.trim())) {
        setNameError("Only letters, numbers, spaces, hyphens, and apostrophes allowed (max 30 characters)")
      } else {
        setNameError("")
      }
    } else {
      setNameError("")
    }
  }

  const isNameValid = playerName.trim() && !nameError

  const createRoom = useMutation(api.rooms.create)
  const joinRoom = useMutation(api.rooms.join)

  const handleCreateRoom = async () => {
    if (!isNameValid) {
      setNameError("Please enter a valid name")
      return
    }

    setIsCreating(true)
    try {
      const { roomCode } = await createRoom({
        playerName: playerName.trim(),
        playerAvatar,
        maxPlayers: Number.parseInt(maxPlayers),
      })

      router.push(`/room/${roomCode}?player=player1`)
    } catch (error: any) {
      setNameError(error.message || "Failed to create room")
    } finally {
      setIsCreating(false)
    }
  }

  const handleJoinRoom = async () => {
    if (!isNameValid) {
      setNameError("Please enter a valid name")
      return
    }

    if (!roomCode.trim()) {
      setNameError("Please enter a room code")
      return
    }

    setIsJoining(true)
    try {
      const { roomCode: code, playerNumber } = await joinRoom({
        roomCode: roomCode.trim().toUpperCase(),
        playerName: playerName.trim(),
        playerAvatar,
      })

      router.push(`/room/${code}?player=${playerNumber}`)
    } catch (error: any) {
      setNameError(error.message || "Failed to join room")
    } finally {
      setIsJoining(false)
    }
  }

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-emerald-50/50 via-white to-teal-50/50 font-sans">
      <Card className="w-full max-w-lg shadow-xl border-white/50 ring-1 ring-black/5 bg-white/90 backdrop-blur-xl rounded-[2rem] overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500 mb-[5vh]">
        <CardHeader className="text-center space-y-1 pt-8 pb-2 px-6 relative overflow-hidden">
          {/* Subtle background glow for header */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-emerald-100/40 blur-3xl -z-10 rounded-full" />

          <CardTitle className="text-4xl font-black tracking-tight text-slate-800 flex items-center justify-center gap-2">
            Bingo
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">Game</span>
          </CardTitle>
          <CardDescription className="text-sm text-slate-500 font-medium tracking-wide uppercase">
            Multiplayer &bull; Instant &bull; Fun
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 px-6 pb-8">
          {/* Avatar & Name Section */}
          <div className="space-y-5">
            <div className="flex justify-center -my-2">
              <div className="scale-90 sm:scale-100 origin-center">
                <AvatarCarousel value={playerAvatar} onChange={setPlayerAvatar} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="playerName" className="sr-only">
                Your Name
              </Label>
              <Input
                id="playerName"
                placeholder="Enter your name"
                value={playerName}
                onChange={(e) => handleNameChange(e.target.value)}
                className="h-12 sm:h-14 text-center font-bold text-slate-700 bg-slate-50/50 border-slate-200 shadow-sm rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all placeholder:text-slate-400"
                maxLength={30}
              />
              {nameError && (
                <div className="flex items-center justify-center gap-2 text-xs text-red-500 font-medium animate-in fade-in">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>{nameError}</span>
                </div>
              )}
            </div>
          </div>

          {/* Create Room Section */}
          <div className="space-y-3 pt-2">
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-3">
                <PlayerCountSelector value={maxPlayers} onChange={setMaxPlayers} />

                <Button
                  onClick={handleCreateRoom}
                  disabled={!isNameValid || isCreating}
                  className="w-full h-12 sm:h-14 text-base font-bold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.01] active:scale-[0.98] rounded-xl border-none disabled:opacity-70 disabled:hover:scale-100"
                >
                  {isCreating ? (
                    <span className="animate-spin mr-2">⏳</span>
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  {isCreating ? "Creating Room..." : "Create New Room"}
                </Button>
              </div>
            </div>

            {/* Divider */}
            <div className="relative py-3">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-100" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-white px-2 text-slate-300 font-bold tracking-widest">OR</span>
              </div>
            </div>

            {/* Join Room Section */}
            <div className="space-y-3">
              <div className="relative group">
                <Input
                  id="roomCode"
                  placeholder="ENTER CODE"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && roomCode.trim() && isNameValid) {
                      handleJoinRoom()
                    }
                  }}
                  className="h-12 sm:h-14 text-lg tracking-widest font-black text-center text-slate-800 bg-slate-50/50 border-slate-200 shadow-sm rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all placeholder:text-slate-300 placeholder:tracking-normal placeholder:font-bold"
                />
              </div>

              <Button
                onClick={handleJoinRoom}
                disabled={!isNameValid || !roomCode.trim() || isJoining}
                variant="ghost"
                className="w-full h-12 text-sm font-semibold text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-all rounded-lg"
              >
                {isJoining ? (
                  <span className="animate-spin mr-2">⏳</span>
                ) : (
                  <LogIn className="mr-2 h-4 w-4" />
                )}
                {isJoining ? "Joining..." : "Join Existing Room"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
