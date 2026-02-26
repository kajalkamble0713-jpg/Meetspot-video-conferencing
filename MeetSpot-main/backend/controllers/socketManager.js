import { Server } from "socket.io"
import { User } from "../models/user.model.js";

let connections = {}
let messages = {}
let timeOnline = {}
let socketIdToUsername = {}
let socketIdToProfile = {}
// Room-scoped settings; keyed by meeting path
let roomSettings = {}

const findRoomBySocket = (socketId) => {
    for (const [roomKey, roomSockets] of Object.entries(connections)) {
        if (roomSockets.includes(socketId)) return roomKey;
    }
    return null;
}

const connectToSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
            allowedHeaders: ["*"],
            credentials: true
        }
    });

    io.on("connection", (socket) => {
        console.log("SOMETHING CONNECTED")

        socket.on("join-call", async (payload) => {
            const { path, username } = typeof payload === 'string' ? { path: payload, username: undefined } : payload;

            if (username) {
                socketIdToUsername[socket.id] = username;
            }

            if (!connections[path]) connections[path] = []
            connections[path].push(socket.id)

            timeOnline[socket.id] = new Date();

            // initialize default room settings if not exists
            if (!roomSettings[path]) {
                roomSettings[path] = { allowPrivateMessages: false, hostId: socket.id } // first joiner becomes host
            }

            let profile = null;
            try {
                if (username) {
                    const user = await User.findOne({ username }).select('username email linkedin designation');
                    if (user) {
                        // Convert mongoose document to plain object
                        profile = {
                            username: user.username,
                            email: user.email,
                            linkedin: user.linkedin,
                            designation: user.designation
                        };
                    }
                }
            } catch (e) { 
                console.error('Error fetching user profile:', e);
            }
            
            // Store profile in map
            if (profile) {
                socketIdToProfile[socket.id] = profile;
            } else if (username) {
                socketIdToProfile[socket.id] = { username: username };
            } else {
                socketIdToProfile[socket.id] = { username: 'Guest' };
            }

            // notify all existing clients of new user (with their profile)
            for (let a = 0; a < connections[path].length; a++) {
                if (connections[path][a] !== socket.id) {
                    // Send to existing users: new user joined with their profile
                    io.to(connections[path][a]).emit("user-joined", { 
                        socketId: socket.id, 
                        clients: connections[path], 
                        profile: profile || { username: username || 'Guest' }
                    })
                }
            }
            
            // Also notify the new user about themselves
            io.to(socket.id).emit("user-joined", { 
                socketId: socket.id, 
                clients: connections[path], 
                profile: profile || { username: username || 'Guest' }
            })

            // send current participants list (with full profiles) to the new socket
            const participants = connections[path].map(sid => {
                const profile = socketIdToProfile[sid];
                return {
                    socketId: sid,
                    profile: profile || { username: socketIdToUsername[sid] || 'Guest' }
                };
            });
            io.to(socket.id).emit("participants", participants);
            
            console.log(`Sent ${participants.length} participants to new user:`, participants.map(p => p.profile?.username));

            // send group chat history to the new socket
            if (messages[path] !== undefined) {
                for (let a = 0; a < messages[path].length; ++a) {
                    io.to(socket.id).emit("chat-message", messages[path][a]['data'],
                        messages[path][a]['sender'], messages[path][a]['socket-id-sender'])
                }
            }

            // send current room settings to the new socket
            io.to(socket.id).emit("room-settings", roomSettings[path])
        })

        socket.on("signal", (toId, message) => {
            io.to(toId).emit("signal", socket.id, message);
        })

        // Group chat (unchanged)
        socket.on("chat-message", (data, sender) => {
            const matchingRoom = findRoomBySocket(socket.id)
            if (matchingRoom) {
                if (!messages[matchingRoom]) messages[matchingRoom] = []
                messages[matchingRoom].push({ 'sender': sender, "data": data, "socket-id-sender": socket.id })
                console.log("message", matchingRoom, ":", sender, data)
                connections[matchingRoom].forEach((elem) => {
                    io.to(elem).emit("chat-message", data, sender, socket.id)
                })
            }
        })

        // Client requests current room settings explicitly
        socket.on("request-room-settings", () => {
            const room = findRoomBySocket(socket.id)
            if (room && roomSettings[room]) {
                io.to(socket.id).emit("room-settings", roomSettings[room])
            }
        })

        // Host sets room settings (currently only allowPrivateMessages)
        socket.on("set-room-settings", (settings) => {
            const room = findRoomBySocket(socket.id)
            if (!room) return
            const current = roomSettings[room]
            if (!current) return
            // only host can update
            if (current.hostId !== socket.id) return
            roomSettings[room] = { ...current, ...settings }
            // broadcast updated settings to room
            connections[room].forEach((sid) => io.to(sid).emit("room-settings", roomSettings[room]))
        })

        // Direct/private message between two sockets in the same room
        socket.on("dm-message", ({ toSocketId, text }) => {
            const room = findRoomBySocket(socket.id)
            if (!room) return
            const settings = roomSettings[room]
            if (!settings || !settings.allowPrivateMessages) {
                io.to(socket.id).emit("dm-error", { message: "Private messages are disabled by host." })
                return
            }
            // ensure both sockets are in the same room
            if (!connections[room].includes(toSocketId)) return
            const senderName = socketIdToUsername[socket.id] || 'Guest'
            const payload = { fromSocketId: socket.id, toSocketId, text, sender: senderName, timestamp: Date.now() }
            io.to(toSocketId).emit("dm-message", payload)
            io.to(socket.id).emit("dm-message", payload)
        })

        socket.on("disconnect", () => {
            const room = findRoomBySocket(socket.id)
            if (!room) return

            // notify peers
            for (let a = 0; a < connections[room].length; ++a) {
                io.to(connections[room][a]).emit('user-left', socket.id)
            }
            // remove from room
            const index = connections[room].indexOf(socket.id)
            if (index > -1) connections[room].splice(index, 1)
            // cleanup maps
            delete socketIdToUsername[socket.id]
            delete socketIdToProfile[socket.id]

            // if host left, reassign host
            if (roomSettings[room] && roomSettings[room].hostId === socket.id) {
                roomSettings[room].hostId = connections[room][0] || null
                connections[room].forEach((sid) => io.to(sid).emit("room-settings", roomSettings[room]))
            }

            if (connections[room].length === 0) {
                delete connections[room]
                delete messages[room]
                delete roomSettings[room]
            }
        })
    })

    return io;
}

export default connectToSocket;