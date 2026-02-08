import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { calculateGridSize, generateRoomCode } from "./utils";

export const create = mutation({
    args: {
        playerName: v.string(),
        playerAvatar: v.optional(v.string()),
        maxPlayers: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const { playerName, playerAvatar, maxPlayers } = args;

        if (!playerName || !playerName.trim()) {
            throw new Error("Player name is required");
        }

        const numPlayers = maxPlayers && !isNaN(maxPlayers) ? Number(maxPlayers) : 2;
        if (numPlayers < 2 || numPlayers > 6) {
            throw new Error("Number of players must be between 2 and 6");
        }

        const { gridSize, totalNumbers } = calculateGridSize(numPlayers);

        let roomCode = generateRoomCode();
        let attempts = 0;
        const maxAttempts = 10;

        while (attempts < maxAttempts) {
            const existingRoom = await ctx.db
                .query("rooms")
                .withIndex("by_room_code", (q) => q.eq("room_code", roomCode))
                .unique();

            if (!existingRoom) break;

            roomCode = generateRoomCode();
            attempts++;
        }

        if (attempts === maxAttempts) {
            throw new Error("Failed to generate unique room code");
        }

        const roomId = await ctx.db.insert("rooms", {
            room_code: roomCode,
            status: "waiting",
            current_turn: undefined, // undefined becomes null/missing implicitly, or we can use null if schema allowed it (v.optional covers undefined)
            winner: undefined,
            max_players: numPlayers,
            player_count: 1,
            grid_size: gridSize,
            total_numbers: totalNumbers,
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        });

        await ctx.db.insert("players", {
            room_id: roomId,
            player_number: "player1",
            player_name: playerName.trim(),
            player_avatar: playerAvatar || "👤",
            join_order: 1,
            board: [],
            marked_positions: [],
        });

        return { roomCode, roomId };
    },
});

export const join = mutation({
    args: {
        roomCode: v.string(),
        playerName: v.string(),
        playerAvatar: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const { roomCode, playerName, playerAvatar } = args;

        if (!roomCode || !playerName) {
            throw new Error("Room code and player name are required");
        }

        if (!playerName.trim()) {
            throw new Error("Player name cannot be empty");
        }

        const normalizedRoomCode = roomCode.trim().toUpperCase();

        if (normalizedRoomCode.length !== 6) {
            throw new Error("Room code must be 6 characters");
        }

        const room = await ctx.db
            .query("rooms")
            .withIndex("by_room_code", (q) => q.eq("room_code", normalizedRoomCode))
            .unique();

        if (!room) {
            throw new Error("Room not found");
        }

        if (room.status !== "waiting") {
            throw new Error("Game already started");
        }

        const existingPlayers = await ctx.db
            .query("players")
            .withIndex("by_room_id", (q) => q.eq("room_id", room._id))
            .collect();

        // Sort manually since we fetched all by room_id. We could add an index for order, but sort in memory is fine for small number.
        existingPlayers.sort((a, b) => a.join_order - b.join_order);

        const maxPlayers = room.max_players || 2;

        if (existingPlayers.length >= maxPlayers) {
            throw new Error(`Room is full (${existingPlayers.length}/${maxPlayers} players)`);
        }

        const nextPlayerNumber = `player${existingPlayers.length + 1}`;
        const nextJoinOrder = existingPlayers.length + 1;

        await ctx.db.insert("players", {
            room_id: room._id,
            player_number: nextPlayerNumber,
            player_name: playerName.trim(),
            player_avatar: playerAvatar || "👤",
            join_order: nextJoinOrder,
            board: [],
            marked_positions: [],
        });

        await ctx.db.patch(room._id, {
            player_count: nextJoinOrder,
        });

        if (nextJoinOrder === maxPlayers) {
            await ctx.db.patch(room._id, {
                status: "playing",
                current_turn: "player1",
            });
        }

        return {
            success: true,
            roomCode: normalizedRoomCode,
            playerNumber: nextPlayerNumber,
            roomId: room._id,
        };
    },
});

export const getToken = query({
    args: { roomCode: v.string() },
    handler: async (ctx, args) => {
        const room = await ctx.db
            .query("rooms")
            .withIndex("by_room_code", (q) => q.eq("room_code", args.roomCode))
            .unique();
        return room;
    }
});

export const getByCode = query({
    args: { roomCode: v.string() },
    handler: async (ctx, args) => {
        const room = await ctx.db
            .query("rooms")
            .withIndex("by_room_code", (q) => q.eq("room_code", args.roomCode))
            .unique();
        return room;
    },
});

export const getPlayers = query({
    args: { roomId: v.id("rooms") },
    handler: async (ctx, args) => {
        const players = await ctx.db
            .query("players")
            .withIndex("by_room_id", (q) => q.eq("room_id", args.roomId))
            .collect();
        return players.sort((a, b) => a.join_order - b.join_order);
    }
});
