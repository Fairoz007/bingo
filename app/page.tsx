"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, LogIn } from "lucide-react"

const AVATAR_OPTIONS = ["👤", "😀", "😎", "🎮", "🎯", "🎲", "🎪", "🎨", "🎭", "🎸"]

export default function HomePage() {
  const router = useRouter()
  const [playerName, setPlayerName] = useState("")
  const [playerAvatar, setPlayerAvatar] = useState(AVATAR_OPTIONS[0])
  const [maxPlayers, setMaxPlayers] = useState("2")
  const [roomCode, setRoomCode] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [isJoining, setIsJoining] = useState(false)

  const handleCreateRoom = async () => {
    if (!playerName.trim()) {
      alert("Please enter your name")
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
        alert(data.error || "Failed to create room")
      }
    } catch (error) {
      alert("Failed to create room")
    } finally {
      setIsCreating(false)
    }
  }

  const handleJoinRoom = async () => {
    if (!playerName.trim()) {
      alert("Please enter your name")
      return
    }
    if (!roomCode.trim()) {
      alert("Please enter room code")
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
        alert(data.error || "Failed to join room")
      }
    } catch (error) {
      alert("Failed to join room")
    } finally {
      setIsJoining(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-sky-50 to-blue-100 p-4">
      <Card className="w-full max-w-md shadow-lg border-0 animate-in fade-in slide-up duration-500">
        <CardHeader className="text-center space-y-3 pb-6">
          <CardTitle className="text-3xl sm:text-4xl font-bold text-slate-800">Bingo Game</CardTitle>
          <CardDescription className="text-base text-slate-600">Create or join a multiplayer room</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="playerName" className="text-sm font-semibold text-slate-700">
                Your Name
              </Label>
              <Input
                id="playerName"
                placeholder="Enter your name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="h-11 text-base border-slate-300 focus:border-primary transition-smooth"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="playerAvatar" className="text-sm font-semibold text-slate-700">
                Choose Avatar
              </Label>
              <Select value={playerAvatar} onValueChange={setPlayerAvatar}>
                <SelectTrigger className="h-11 text-2xl border-slate-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AVATAR_OPTIONS.map((avatar) => (
                    <SelectItem key={avatar} value={avatar} className="text-2xl">
                      {avatar}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="maxPlayers" className="text-sm font-semibold text-slate-700">
                Number of Players
              </Label>
              <Select value={maxPlayers} onValueChange={setMaxPlayers}>
                <SelectTrigger className="h-11 border-slate-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 Players</SelectItem>
                  <SelectItem value="3">3 Players</SelectItem>
                  <SelectItem value="4">4 Players</SelectItem>
                  <SelectItem value="5">5 Players</SelectItem>
                  <SelectItem value="6">6 Players</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleCreateRoom}
              disabled={!playerName.trim() || isCreating}
              className="w-full h-12 text-base font-semibold transition-smooth hover:shadow-md bg-primary hover:bg-primary/90"
              size="lg"
            >
              <Users className="mr-2 h-5 w-5" />
              {isCreating ? "Creating..." : "Create New Room"}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-3 text-slate-500 font-medium">Or Join Existing</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="roomCode" className="text-sm font-semibold text-slate-700">
                Room Code
              </Label>
              <Input
                id="roomCode"
                placeholder="Enter 6-digit code"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                maxLength={6}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && roomCode.trim() && playerName.trim()) {
                    handleJoinRoom()
                  }
                }}
                className="h-12 text-base tracking-widest font-mono border-slate-300 focus:border-primary transition-smooth text-center text-lg font-bold"
              />
            </div>

            <Button
              onClick={handleJoinRoom}
              disabled={!playerName.trim() || !roomCode.trim() || isJoining}
              variant="outline"
              className="w-full h-12 text-base font-semibold transition-smooth hover:bg-slate-50 border-slate-300 bg-transparent"
              size="lg"
            >
              <LogIn className="mr-2 h-5 w-5" />
              {isJoining ? "Joining..." : "Join Room"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
