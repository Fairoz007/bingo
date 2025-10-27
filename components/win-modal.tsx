"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Home, RotateCcw, LogOut, Settings } from "lucide-react"
import { useEffect, useState } from "react"

interface WinModalProps {
  didIWin: boolean
  winnerName: string
  roomId: string
  playerNumber: string
  onRematch: (reconfigureBoard: boolean) => void
  gridSize: number
}

export function WinModal({ didIWin, winnerName, roomId, playerNumber, onRematch, gridSize }: WinModalProps) {
  const router = useRouter()
  const [show, setShow] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 300)
    return () => clearTimeout(timer)
  }, [])

  const handleExitRoom = async () => {
    setIsExiting(true)
    try {
      const response = await fetch("/api/game/exit-room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, playerNumber }),
      })

      if (!response.ok) {
        throw new Error("Failed to exit room")
      }

      router.push("/")
    } catch (error) {
      console.error("[v0] Error exiting room:", error)
      alert("Failed to exit room. Please try again.")
      setIsExiting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
      <Card className={`w-full max-w-sm transform transition-all duration-300 bg-white shadow-xl ${show ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
        <CardHeader className="text-center space-y-3 p-6 pb-4">
          <div className="relative mx-auto w-20 h-20">
            <div className={`absolute inset-0 rounded-full flex items-center justify-center transition-all duration-500 ${
              didIWin 
                ? 'bg-gradient-to-br from-yellow-300 to-amber-400 shadow-md' 
                : 'bg-gray-200'
            }`}>
              <Trophy className={`h-10 w-10 transition-transform ${didIWin ? 'text-yellow-700' : 'text-gray-400'}`} />
              {didIWin && (
                <div className="absolute -top-1 -right-1 bg-yellow-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                  {gridSize}
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-1">
            {didIWin && (
              <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-amber-600">
                BINGO!
              </div>
            )}
            <h3 className="text-xl font-bold text-gray-800">
              {didIWin ? 'Congratulations!' : 'Game Over'}
            </h3>
            <p className="text-gray-600 text-sm">
              {didIWin 
                ? 'You won the game! 🎉' 
                : <>{winnerName} won the game! <span className="text-yellow-500">🏆</span></>
              }
            </p>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3 p-6 pt-0">
          {didIWin && (
            <div className="bg-green-50 rounded-lg p-3 text-center border border-green-100 text-sm text-green-700">
              Completed <span className="font-semibold">{gridSize} lines</span>
              {gridSize === 5 && <span className="block text-xs text-green-600 mt-1">(B-I-N-G-O)</span>}
            </div>
          )}

          <div className="space-y-2">
            <Button 
              onClick={() => onRematch(false)}
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Play Again
            </Button>
            
            <Button
              onClick={() => onRematch(true)}
              variant="outline"
              className="w-full h-11 text-sm font-medium border-gray-200 hover:border-blue-300 hover:bg-blue-50"
            >
              <Settings className="mr-2 h-4 w-4" />
              Rematch
            </Button>
            
            <div className="flex space-x-2 pt-1">
              <Button
                onClick={handleExitRoom}
                disabled={isExiting}
                variant="outline"
                className="flex-1 h-9 text-xs font-medium border-gray-200 hover:border-red-300 hover:bg-red-50"
              >
                {isExiting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Exiting...
                  </>
                ) : (
                  <>
                    <LogOut className="mr-1.5 h-3.5 w-3.5" />
                    Exit Room
                  </>
                )}
              </Button>
              
              <Button
                onClick={() => router.push('/')}
                variant="ghost"
                className="flex-1 h-9 text-xs text-gray-600 hover:bg-gray-100"
              >
                <Home className="mr-1.5 h-3.5 w-3.5" />
                Home
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
