"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { AvatarCarousel } from "@/components/avatar-carousel"
import { PlayerCountSelector } from "@/components/player-count-selector"
import { Users, LogIn, AlertCircle } from "lucide-react"

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

  const handleCreateRoom = async () => {
    if (!isNameValid) {
      setNameError("Please enter a valid name")
      return
    }

    setIsCreating(true)
    try {
      const response = await fetch("/api/rooms/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerName: playerName.trim(),
          playerAvatar,
          maxPlayers: Number.parseInt(maxPlayers),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        router.push(`/room/${data.roomCode}?player=player1`)
      } else {
        setNameError(data.error || "Failed to create room")
      }
    } catch (error) {
      setNameError("Failed to create room. Please try again.")
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
      const response = await fetch("/api/rooms/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomCode: roomCode.trim().toUpperCase(),
          playerName: playerName.trim(),
          playerAvatar,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        router.push(`/room/${roomCode.trim().toUpperCase()}?player=${data.playerNumber}`)
      } else {
        setNameError(data.error || "Failed to join room")
      }
    } catch (error) {
      setNameError("Failed to join room. Please try again.")
    } finally {
      setIsJoining(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4">
      <Card className="w-full max-w-2xl shadow-xl border-0 animate-in fade-in slide-up duration-500">
        <CardHeader className="text-center space-y-2 pb-8 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-t-lg border-b border-emerald-100">
          <CardTitle className=" sm:text-5xl  bg-gradient-to-r from-emerald-600 to-teal-600 ">
            അണ്ടിശ്ശേരി ജ്യോതി
          </CardTitle>
          <CardDescription className="text-base text-slate-600">
            Create or join a multiplayer room and play with friends
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-8 pt-8">
          <div className="space-y-6 pb-6 border-b border-slate-200">
            <div className="space-y-2">
              <Label htmlFor="playerName" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                Your Name
              </Label>
              <Input
                id="playerName"
                placeholder="Enter your name"
                value={playerName}
                onChange={(e) => handleNameChange(e.target.value)}
                className="h-12 text-base border-slate-300 focus:border-emerald-500 focus:ring-emerald-500 transition-all"
                maxLength={30}
              />
              {nameError && (
                <div className="flex items-start gap-2 text-sm text-red-600 animate-in fade-in">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{nameError}</span>
                </div>
              )}
            </div>

            <AvatarCarousel value={playerAvatar} onChange={setPlayerAvatar} />
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Create New Room</h3>
              <PlayerCountSelector value={maxPlayers} onChange={setMaxPlayers} />
            </div>

            <Button
              onClick={handleCreateRoom}
              disabled={!isNameValid || isCreating}
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              size="lg"
            >
              <Users className="mr-2 h-5 w-5" />
              {isCreating ? "Creating Room..." : "Create New Room"}
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-slate-500 font-semibold tracking-wide">Or Join Existing</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="roomCode" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                Room Code
              </Label>
              <Input
                id="roomCode"
                placeholder="Enter 6-digit code"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                maxLength={6}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && roomCode.trim() && isNameValid) {
                    handleJoinRoom()
                  }
                }}
                className="h-12 text-lg tracking-widest font-mono border-slate-300 focus:border-emerald-500 focus:ring-emerald-500 transition-all text-center font-bold"
              />
            </div>

            <Button
              onClick={handleJoinRoom}
              disabled={!isNameValid || !roomCode.trim() || isJoining}
              variant="outline"
              className="w-full h-12 text-base font-semibold border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-transparent"
              size="lg"
            >
              <LogIn className="mr-2 h-5 w-5" />
              {isJoining ? "Joining Room..." : "Join Room"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
