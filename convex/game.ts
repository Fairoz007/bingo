import { v } from "convex/values";
import { mutation, internalMutation } from "./_generated/server";
import { validateBoardNumber, checkWin, getNextPlayerTurn } from "./utils";
import { internal } from "./_generated/api";

export const configureBoard = mutation({
    args: {
        roomId: v.id("rooms"),
        playerNumber: v.string(),
        board: v.array(v.number()),
    },
    handler: async (ctx, args) => {
        const { roomId, playerNumber, board } = args;

        const room = await ctx.db.get(roomId);

        if (!room) {
            throw new Error("Room not found");
        }

        const { grid_size, total_numbers, max_players } = room;
        const expectedBoardSize = grid_size * grid_size;

        if (board.length !== expectedBoardSize) {
            throw new Error(
                `Board must have exactly ${expectedBoardSize} numbers (${grid_size}x${grid_size} grid)`,
            );
        }

        if (!board.every((num) => validateBoardNumber(num, total_numbers))) {
            throw new Error(`All numbers must be between 1 and ${total_numbers}`);
        }

        const player = await ctx.db
            .query("players")
            .withIndex("by_room_id", (q) => q.eq("room_id", roomId))
            .filter((q) => q.eq(q.field("player_number"), playerNumber))
            .unique();

        if (!player) {
            throw new Error("Player not found");
        }

        await ctx.db.patch(player._id, { board });

        // Check if all players are ready
        const players = await ctx.db
            .query("players")
            .withIndex("by_room_id", (q) => q.eq("room_id", roomId))
            .collect();

        // If max_players reached and all have board configured
        if (
            players.length === max_players &&
            players.every((p) => p.board && p.board.length === expectedBoardSize)
        ) {
            const turnDuration = 60 * 1000;
            const turnExpiresAt = Date.now() + turnDuration;

            await ctx.db.patch(roomId, {
                status: "playing",
                current_turn: "player1",
                turn_expires_at: turnExpiresAt,
            });

            await ctx.scheduler.runAfter(turnDuration, internal.game.autoPassTurn, {
                roomId,
                expectedTurn: "player1",
                marketAt: turnExpiresAt,
            });
        }
    },
});

export const autoPassTurn = internalMutation({
    args: {
        roomId: v.id("rooms"),
        expectedTurn: v.string(),
        marketAt: v.number(),
    },
    handler: async (ctx, args) => {
        const { roomId, expectedTurn, marketAt } = args;
        const room = await ctx.db.get(roomId);

        if (!room || room.status !== "playing") return;

        // If turn has already changed or game ended, do nothing
        if (room.current_turn !== expectedTurn) return;

        // If turn time hasn't actually expired (e.g. was extended), do nothing
        // using a small buffer for execution delay
        if (room.turn_expires_at && room.turn_expires_at > Date.now() + 1000) return;

        // Force pass turn
        const nextTurn = getNextPlayerTurn(expectedTurn, room.player_count);
        const turnDuration = 60 * 1000;
        const nextTurnExpiresAt = Date.now() + turnDuration;

        await ctx.db.patch(roomId, {
            current_turn: nextTurn,
            turn_expires_at: nextTurnExpiresAt,
        });

        // Schedule next check
        await ctx.scheduler.runAfter(turnDuration, internal.game.autoPassTurn, {
            roomId,
            expectedTurn: nextTurn,
            marketAt: nextTurnExpiresAt,
        });
    },
});

export const mark = mutation({
    args: {
        roomId: v.id("rooms"),
        playerNumber: v.string(),
        position: v.number(),
    },
    handler: async (ctx, args) => {
        const { roomId, playerNumber, position } = args;

        const room = await ctx.db.get(roomId);
        if (!room) throw new Error("Room not found");

        if (room.current_turn !== playerNumber) throw new Error("Not your turn");
        if (room.status !== "playing") throw new Error("Game is not active");

        const player = await ctx.db
            .query("players")
            .withIndex("by_room_id", (q) => q.eq("room_id", roomId))
            .filter((q) => q.eq(q.field("player_number"), playerNumber))
            .unique();

        if (!player) throw new Error("Player not found");

        const markedPositions = player.marked_positions as number[];
        if (markedPositions.includes(position)) throw new Error("Position already marked");

        const board = player.board as number[];
        const selectedNumber = board[position];

        // Mark for all players
        const allPlayers = await ctx.db
            .query("players")
            .withIndex("by_room_id", (q) => q.eq("room_id", roomId))
            .collect();

        // Sort just in case for consistency, though not strictly needed here
        allPlayers.sort((a, b) => a.join_order - b.join_order);

        let winner: string | null = null;

        for (const p of allPlayers) {
            const playerBoard = p.board as number[];
            const playerMarkedPositions = p.marked_positions as number[];

            const positionOnThisBoard = playerBoard.indexOf(selectedNumber);

            if (positionOnThisBoard !== -1 && !playerMarkedPositions.includes(positionOnThisBoard)) {
                const newMarkedPositions = [...playerMarkedPositions, positionOnThisBoard];

                await ctx.db.patch(p._id, { marked_positions: newMarkedPositions });

                if (checkWin(newMarkedPositions, room.grid_size)) {
                    winner = p.player_number;
                    // We found a winner, we can stop or continue? 
                    // Supabase version updates room immediately.
                    // If multiple winners, Supabase implementation would update room for EACH winner, effectively last one wins or first one wins?
                    // Supabase: inside loop -> update room. Logic: "won: true, winner: p.player_number". 
                    // If simple loop, later winners overwrite earlier ones in same request? 
                    // Wait, Supabase `return NextResponse.json` happens immediately after finding A winner?
                    // Line 90: `return NextResponse.json(...)`. Yes. So the FIRST player in `allPlayers` (sorted by join order) who wins, wins.
                    // Correct.
                    break;
                }
            }
        }

        if (winner) {
            await ctx.db.patch(roomId, {
                status: "finished",
                winner: winner,
                current_turn: undefined // clear turn
            });
            return { success: true, won: true, winner };
        }

        const nextTurn = getNextPlayerTurn(playerNumber, allPlayers.length);
        const turnDuration = 60 * 1000;
        const nextTurnExpiresAt = Date.now() + turnDuration;

        await ctx.db.patch(roomId, {
            current_turn: nextTurn,
            turn_expires_at: nextTurnExpiresAt,
        });

        await ctx.scheduler.runAfter(turnDuration, internal.game.autoPassTurn, {
            roomId,
            expectedTurn: nextTurn,
            marketAt: nextTurnExpiresAt,
        });



        return { success: true, won: false };
    },
});

export const rematch = mutation({
    args: {
        roomId: v.id("rooms"),
        reconfigureBoard: v.boolean(),
    },
    handler: async (ctx, args) => {
        const { roomId, reconfigureBoard } = args;

        const turnDuration = 60 * 1000;
        const turnExpiresAt = Date.now() + turnDuration;

        await ctx.db.patch(roomId, {
            status: reconfigureBoard ? "waiting" : "playing",
            current_turn: "player1",
            winner: undefined,
            turn_expires_at: reconfigureBoard ? undefined : turnExpiresAt,
        });

        if (!reconfigureBoard) {
            await ctx.scheduler.runAfter(turnDuration, internal.game.autoPassTurn, {
                roomId,
                expectedTurn: "player1",
                marketAt: turnExpiresAt,
            });
        }

        const players = await ctx.db
            .query("players")
            .withIndex("by_room_id", (q) => q.eq("room_id", roomId))
            .collect();

        for (const p of players) {
            const updatePayload: any = { marked_positions: [] };
            if (reconfigureBoard) {
                updatePayload.board = [];
            }
            await ctx.db.patch(p._id, updatePayload);
        }
    },
});
