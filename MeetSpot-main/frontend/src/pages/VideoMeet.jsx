import React, { useEffect, useRef, useState } from 'react'
import io from "socket.io-client";
import { Badge, IconButton, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Button as MUIButton, Typography, Link as MUILink } from '@mui/material';
import { Button } from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff'
import styles from "../styles/videoComponent.module.css";
import CallEndIcon from '@mui/icons-material/CallEnd'
import MicIcon from '@mui/icons-material/Mic'
import MicOffIcon from '@mui/icons-material/MicOff'
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare'
import ChatIcon from '@mui/icons-material/Chat'
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import CloseIcon from '@mui/icons-material/Close';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import ShareIcon from '@mui/icons-material/Share';
import server from '../environment';

const server_url = server;

var connections = {};

const peerConfigConnections = {
    "iceServers": [
        { "urls": "stun:stun.l.google.com:19302" }
    ]
}

export default function VideoMeetComponent() {

    var socketRef = useRef();
    let socketIdRef = useRef();

    let localVideoref = useRef();

    let [videoAvailable, setVideoAvailable] = useState(true);

    let [audioAvailable, setAudioAvailable] = useState(true);

    let [video, setVideo] = useState(false); // Start with video OFF

    let [audio, setAudio] = useState(false); // Start with audio OFF

    let [screen, setScreen] = useState(false);

    let [showModal, setModal] = useState(true); // Chat visible by default

    let [screenAvailable, setScreenAvailable] = useState();

    let [messages, setMessages] = useState([])

    let [message, setMessage] = useState("");

    let [newMessages, setNewMessages] = useState(3);

    let [askForUsername, setAskForUsername] = useState(true);

    let [username, setUsername] = useState("");

    const videoRef = useRef([])

    let [videos, setVideos] = useState([])
    let [participants, setParticipants] = useState([])
    let [selectedParticipant, setSelectedParticipant] = useState(null)
    let [profileOpen, setProfileOpen] = useState(false)

    let [allowPrivateMessages, setAllowPrivateMessages] = useState(false)
    let [isHost, setIsHost] = useState(false)
    let [dmTarget, setDmTarget] = useState(null)
    let [dmMessages, setDmMessages] = useState({})
    let [dmInput, setDmInput] = useState("")
    let [askHostDM, setAskHostDM] = useState(false)
    
    // New state for conversation tracking and notifications
    let [conversationStates, setConversationStates] = useState({}) // 'accepted', 'declined', or undefined
    let [tileNotifications, setTileNotifications] = useState({}) // { socketId: { text, timestamp, fading } }
    let [unreadCounts, setUnreadCounts] = useState({}) // { socketId: count }
    let [conversationPromptData, setConversationPromptData] = useState(null) // { socketId, username, position }
    let tileRefs = useRef({}) // Store refs to video tile containers for positioning
    
    // State for chat visibility and full-screen mode
    let [isChatOpen, setIsChatOpen] = useState(true); // Chat open by default
    let [fullScreenParticipant, setFullScreenParticipant] = useState(null); // { socketId, stream, username }

    useEffect(() => {
        getPermissions();
    }, []) // Run only once on mount

    let getDislayMedia = () => {
        if (screen) {
            if (navigator.mediaDevices.getDisplayMedia) {
                navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
                    .then(getDislayMediaSuccess)
                    .then((stream) => { })
                    .catch((e) => console.log(e))
            }
        }
    }

    const getPermissions = async () => {
        try {
            // Check video permission
            const videoPermission = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoPermission) {
                setVideoAvailable(true);
                // Stop the test stream immediately
                videoPermission.getTracks().forEach(track => track.stop());
            } else {
                setVideoAvailable(false);
            }

            // Check audio permission
            const audioPermission = await navigator.mediaDevices.getUserMedia({ audio: true });
            if (audioPermission) {
                setAudioAvailable(true);
                // Stop the test stream immediately
                audioPermission.getTracks().forEach(track => track.stop());
            } else {
                setAudioAvailable(false);
            }

            // Check screen share availability
            if (navigator.mediaDevices.getDisplayMedia) {
                setScreenAvailable(true);
            } else {
                setScreenAvailable(false);
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        if (video !== undefined && audio !== undefined) {
            getUserMedia();
        }
    }, [video, audio])

    let getMedia = () => {
        // Keep video and audio OFF by default (already set to false in state)
        // Don't change them here - let user turn them on manually
        connectToSocketServer();
    }

    let getUserMediaSuccess = (stream) => {
        try {
            window.localStream.getTracks().forEach(track => track.stop())
        } catch (e) { console.log(e) }

        window.localStream = stream
        localVideoref.current.srcObject = stream

        for (let id in connections) {
            if (id === socketIdRef.current) continue

            connections[id].addStream(window.localStream)

            connections[id].createOffer().then((description) => {
                connections[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                    })
                    .catch(e => console.log(e))
            })
        }

        stream.getTracks().forEach(track => track.onended = () => {
            setVideo(false);
            setAudio(false);

            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { console.log(e) }

            let blackSilence = (...args) => new MediaStream([black(...args), silence()])
            window.localStream = blackSilence()
            localVideoref.current.srcObject = window.localStream

            for (let id in connections) {
                connections[id].addStream(window.localStream)

                connections[id].createOffer().then((description) => {
                    connections[id].setLocalDescription(description)
                        .then(() => {
                            socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                        })
                        .catch(e => console.log(e))
                })
            }
        })
    }

    let getUserMedia = () => {
        if ((video && videoAvailable) || (audio && audioAvailable)) {
            navigator.mediaDevices.getUserMedia({ video: video, audio: audio })
                .then(getUserMediaSuccess)
                .then((stream) => { })
                .catch((e) => console.log(e))
        } else {
            // Both video and audio are OFF - create black video + silent audio stream
            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { }
            
            // Create black video and silent audio stream
            let blackSilence = (...args) => new MediaStream([black(...args), silence()])
            window.localStream = blackSilence()
            if (localVideoref.current) {
                localVideoref.current.srcObject = window.localStream
            }
            
            // Update all peer connections with the black/silent stream
            for (let id in connections) {
                if (id === socketIdRef.current) continue
                
                try {
                    connections[id].addStream(window.localStream)
                    
                    connections[id].createOffer().then((description) => {
                        connections[id].setLocalDescription(description)
                            .then(() => {
                                socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                            })
                            .catch(e => console.log(e))
                    })
                } catch (e) { console.log(e) }
            }
        }
    }

    let getDislayMediaSuccess = (stream) => {
        try {
            window.localStream.getTracks().forEach(track => track.stop())
        } catch (e) { console.log(e) }

        window.localStream = stream
        localVideoref.current.srcObject = stream

        for (let id in connections) {
            if (id === socketIdRef.current) continue

            connections[id].addStream(window.localStream)

            connections[id].createOffer().then((description) => {
                connections[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                    })
                    .catch(e => console.log(e))
            })
        }

        stream.getTracks().forEach(track => track.onended = () => {
            setScreen(false)

            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { console.log(e) }

            let blackSilence = (...args) => new MediaStream([black(...args), silence()])
            window.localStream = blackSilence()
            localVideoref.current.srcObject = window.localStream

            getUserMedia()
        })
    }

    let gotMessageFromServer = (fromId, message) => {
        var signal = JSON.parse(message)

        if (fromId !== socketIdRef.current) {
            if (signal.sdp) {
                connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
                    if (signal.sdp.type === 'offer') {
                        connections[fromId].createAnswer().then((description) => {
                            connections[fromId].setLocalDescription(description).then(() => {
                                socketRef.current.emit('signal', fromId, JSON.stringify({ 'sdp': connections[fromId].localDescription }))
                            }).catch(e => console.log(e))
                        }).catch(e => console.log(e))
                    }
                }).catch(e => console.log(e))
            }

            if (signal.ice) {
                connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e))
            }
        }
    }

    const ensureMeetingAccess = async () => {
        const meetingId = (window.location.pathname || '').replace(/^\//, '');
        if (!meetingId) return false;
        let pw = sessionStorage.getItem(`meetingPassword:${meetingId}`);
        if (!pw) {
            // lightweight prompt to avoid large UI changes
            pw = window.prompt('Enter meeting password to join');
            if (!pw) return false;
            try {
                const res = await fetch(`${server_url}/api/v1/meetings/join`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ meetingId, password: pw })
                });
                if (!res.ok) return false;
                sessionStorage.setItem(`meetingPassword:${meetingId}`, pw);
            } catch (e) {
                return false;
            }
        }
        return true;
    }

    let connectToSocketServer = async () => {
        const ok = await ensureMeetingAccess();
        if (!ok) {
            alert('Invalid or missing meeting password');
            window.location.href = '/';
            return;
        }
        socketRef.current = io.connect(server_url, { secure: false })

        socketRef.current.on('signal', gotMessageFromServer)

        socketRef.current.on('connect', () => {
            socketRef.current.emit('join-call', { path: window.location.href, username })
            socketIdRef.current = socketRef.current.id

            socketRef.current.on('chat-message', addMessage)

            socketRef.current.on('user-left', (id) => {
                setVideos((videos) => videos.filter((video) => video.socketId !== id))
                setParticipants(prev => prev.filter(p => p.socketId !== id))
                setDmMessages(prev => {
                    const copy = { ...prev }
                    delete copy[id]
                    return copy
                })
                if (dmTarget && dmTarget.socketId === id) setDmTarget(null)
            })

            socketRef.current.on('user-joined', (id, clients) => {
                let payload = id;
                let clientsList = clients;
                if (typeof id === 'object' && id !== null) {
                    payload = id.socketId;
                    clientsList = id.clients;
                    const profile = id.profile;
                    if (profile) {
                        setParticipants(prev => {
                            const exists = prev.find(p => p.socketId === payload);
                            if (exists) return prev.map(p => p.socketId === payload ? { ...p, profile } : p);
                            return [...prev, { socketId: payload, profile }]
                        })
                    }
                }
                clientsList.forEach((socketListId) => {

                    connections[socketListId] = new RTCPeerConnection(peerConfigConnections)
                    connections[socketListId].onicecandidate = function (event) {
                        if (event.candidate != null) {
                            socketRef.current.emit('signal', socketListId, JSON.stringify({ 'ice': event.candidate }))
                        }
                    }

                    connections[socketListId].onaddstream = (event) => {
                        let videoExists = videoRef.current.find(video => video.socketId === socketListId);

                        if (videoExists) {
                            setVideos(videos => {
                                const updatedVideos = videos.map(video =>
                                    video.socketId === socketListId ? { ...video, stream: event.stream } : video
                                );
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            });
                        } else {
                            let newVideo = {
                                socketId: socketListId,
                                stream: event.stream,
                                autoplay: true,
                                playsinline: true
                            };

                            setVideos(videos => {
                                const updatedVideos = [...videos, newVideo];
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            });
                        }
                    };

                    if (window.localStream !== undefined && window.localStream !== null) {
                        connections[socketListId].addStream(window.localStream)
                    } else {
                        let blackSilence = (...args) => new MediaStream([black(...args), silence()])
                        window.localStream = blackSilence()
                        connections[socketListId].addStream(window.localStream)
                    }
                })

                if ((typeof id === 'string' ? id : (id && id.socketId)) === socketIdRef.current) {
                    for (let id2 in connections) {
                        if (id2 === socketIdRef.current) continue

                        try {
                            connections[id2].addStream(window.localStream)
                        } catch (e) { }

                        connections[id2].createOffer().then((description) => {
                            connections[id2].setLocalDescription(description)
                                .then(() => {
                                    socketRef.current.emit('signal', id2, JSON.stringify({ 'sdp': connections[id2].localDescription }))
                                })
                                .catch(e => console.log(e))
                        })
                    }
                }
            })

            socketRef.current.on('participants', (list) => {
                setParticipants(list || [])
            })

            socketRef.current.on('room-settings', (settings) => {
                setAllowPrivateMessages(!!settings.allowPrivateMessages)
                const amHost = settings.hostId === socketIdRef.current
                setIsHost(amHost)
                if (amHost) {
                    setAskHostDM(true)
                }
            })

            socketRef.current.on('dm-message', (payload) => {
                const otherId = payload.fromSocketId === socketIdRef.current ? payload.toSocketId : payload.fromSocketId
                setDmMessages(prev => {
                    const list = prev[otherId] ? [...prev[otherId]] : []
                    list.push(payload)
                    return { ...prev, [otherId]: list }
                })
                const isIncoming = payload.fromSocketId !== socketIdRef.current
                
                // New notification logic
                if (isIncoming) {
                    const senderId = payload.fromSocketId;
                    
                    // If chat is already open with this person, do nothing (message goes to chat window)
                    if (dmTarget && dmTarget.socketId === senderId) {
                        return;
                    }
                    
                    // Show notification on tile
                    const notificationTimestamp = Date.now();
                    setTileNotifications(prev => ({
                        ...prev,
                        [senderId]: {
                            text: payload.text,
                            timestamp: notificationTimestamp,
                            fading: false
                        }
                    }));
                    
                    // Start fade after 4 seconds
                    setTimeout(() => {
                        setTileNotifications(prev => {
                            if (prev[senderId] && prev[senderId].timestamp === notificationTimestamp) {
                                return {
                                    ...prev,
                                    [senderId]: { ...prev[senderId], fading: true }
                                };
                            }
                            return prev;
                        });
                    }, 4000);
                    
                    // Remove notification and show badge after 13 seconds
                    setTimeout(() => {
                        setTileNotifications(prev => {
                            // Only increment unread if notification still exists (wasn't clicked)
                            if (prev[senderId] && prev[senderId].timestamp === notificationTimestamp) {
                                // Notification expired without being clicked
                                setConversationStates(prevStates => {
                                    if (prevStates[senderId] !== 'accepted') {
                                        setUnreadCounts(prevCounts => ({
                                            ...prevCounts,
                                            [senderId]: (prevCounts[senderId] || 0) + 1
                                        }));
                                    }
                                    return prevStates;
                                });
                                
                                const newNotifications = { ...prev };
                                delete newNotifications[senderId];
                                return newNotifications;
                            }
                            return prev;
                        });
                    }, 13000);
                }
            })

            socketRef.current.on('dm-error', (err) => {
                alert(err?.message || 'DM error')
            })

            socketRef.current.emit('request-room-settings')
        })
    }

    const getInitials = (name) => {
        if (!name) return '?';
        const words = name.trim().split(' ');
        if (words.length === 1) {
            return words[0].substring(0, 2).toUpperCase();
        }
        return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    }

    let silence = () => {
        let ctx = new AudioContext()
        let oscillator = ctx.createOscillator()
        let dst = oscillator.connect(ctx.createMediaStreamDestination())
        oscillator.start()
        ctx.resume()
        return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false })
    }
    let black = ({ width = 640, height = 480 } = {}) => {
        let canvas = Object.assign(document.createElement("canvas"), { width, height })
        canvas.getContext('2d').fillRect(0, 0, width, height)
        let stream = canvas.captureStream()
        return Object.assign(stream.getVideoTracks()[0], { enabled: false })
    }

    let handleVideo = () => {
        setVideo(!video);
    }
    let handleAudio = () => {
        setAudio(!audio)
    }

    useEffect(() => {
        if (screen !== undefined) {
            getDislayMedia();
        }
    }, [screen])
    let handleScreen = () => {
        setScreen(!screen);
    }

    let handleEndCall = () => {
        try {
            let tracks = localVideoref.current.srcObject.getTracks()
            tracks.forEach(track => track.stop())
        } catch (e) { }
        window.location.href = "/"
    }

    const copyMeetingDetails = async () => {
        const meetingId = (window.location.pathname || '').replace(/^\//, '');
        const pw = sessionStorage.getItem(`meetingPassword:${meetingId}`);
        if (!meetingId) {
            alert('No meeting ID found');
            return;
        }
        if (!pw) {
            alert('Meeting password not available to share on this device');
            return;
        }
        try {
            await navigator.clipboard.writeText(`Meeting ID: ${meetingId}\nPassword: ${pw}`);
            alert('Meeting details copied to clipboard');
        } catch (e) {
            alert('Failed to copy');
        }
    }

    let openChat = () => {
        setModal(true);
        setIsChatOpen(true);
        setNewMessages(0);
    }
    let closeChat = () => {
        setModal(false);
        setIsChatOpen(false);
    }
    
    let toggleChat = () => {
        if (showModal) {
            closeChat();
        } else {
            openChat();
        }
    }
    
    const handleFullScreen = (socketId, stream, username) => {
        setFullScreenParticipant({ socketId, stream, username });
        setProfileOpen(false);
    }
    
    const exitFullScreen = () => {
        setFullScreenParticipant(null);
    }
    let handleMessage = (e) => {
        setMessage(e.target.value);
    }

    const addMessage = (data, sender, socketIdSender) => {
        setMessages((prevMessages) => [
            ...prevMessages,
            { sender: sender, data: data }
        ]);
        if (socketIdSender !== socketIdRef.current) {
            setNewMessages((prevNewMessages) => prevNewMessages + 1);
        }
    };

    let sendMessage = () => {
        socketRef.current.emit('chat-message', message, username)
        setMessage("");
    }

    let connect = () => {
        setAskForUsername(false);
        getMedia();
    }

    const startDMWith = (targetSocketId) => {
        const target = participants.find(p => p.socketId === targetSocketId)
        if (!target) return
        setDmTarget({ socketId: targetSocketId, profile: target.profile })
        setProfileOpen(false)
        setModal(true)
        
        // Clear notifications and unread count when opening chat
        setTileNotifications(prev => {
            const newNotifications = { ...prev };
            delete newNotifications[targetSocketId];
            return newNotifications;
        });
        setUnreadCounts(prev => {
            const newCounts = { ...prev };
            delete newCounts[targetSocketId];
            return newCounts;
        });
    }
    
    const handleNotificationClick = (socketId, event) => {
        event.stopPropagation();
        
        const conversationState = conversationStates[socketId];
        
        // If already accepted, open chat directly
        if (conversationState === 'accepted') {
            startDMWith(socketId);
            return;
        }
        
        // If first time or previously declined, show conversation prompt
        if (!conversationState || conversationState === 'declined') {
            const participant = participants.find(p => p.socketId === socketId);
            const tileElement = tileRefs.current[socketId];
            
            if (tileElement) {
                const rect = tileElement.getBoundingClientRect();
                setConversationPromptData({
                    socketId,
                    username: participant?.profile?.username || 'Guest',
                    position: { top: rect.bottom + 10, left: rect.left }
                });
            }
            
            // Clear the notification
            setTileNotifications(prev => {
                const newNotifications = { ...prev };
                delete newNotifications[socketId];
                return newNotifications;
            });
        }
    }
    
    const handleConversationResponse = (accept) => {
        if (!conversationPromptData) return;
        
        const socketId = conversationPromptData.socketId;
        
        if (accept) {
            setConversationStates(prev => ({ ...prev, [socketId]: 'accepted' }));
            startDMWith(socketId);
        } else {
            setConversationStates(prev => ({ ...prev, [socketId]: 'declined' }));
            // Keep the unread count visible
        }
        
        setConversationPromptData(null);
    }
    
    const handleUnreadBadgeClick = (socketId, event) => {
        event.stopPropagation();
        
        const conversationState = conversationStates[socketId];
        
        // If already accepted, open chat directly
        if (conversationState === 'accepted') {
            startDMWith(socketId);
            return;
        }
        
        // Show conversation prompt
        const participant = participants.find(p => p.socketId === socketId);
        const tileElement = tileRefs.current[socketId];
        
        if (tileElement) {
            const rect = tileElement.getBoundingClientRect();
            setConversationPromptData({
                socketId,
                username: participant?.profile?.username || 'Guest',
                position: { top: rect.bottom + 10, left: rect.left }
            });
        }
    }

    const sendDM = () => {
        if (!dmTarget || !dmInput.trim()) return
        socketRef.current.emit('dm-message', { toSocketId: dmTarget.socketId, text: dmInput })
        setDmInput("")
    }

    const closeDM = () => {
        const previousTargetId = dmTarget?.socketId;
        setDmTarget(null);
        
        // Mark conversation as accepted (so they can chat again easily)
        // but allow notifications to show again when chat is closed
        if (previousTargetId && conversationStates[previousTargetId] === 'accepted') {
            // Keep the accepted state so next notification click goes straight to chat
        }
    }

    const handleHostDecision = (allow) => {
        setAskHostDM(false)
        socketRef.current.emit('set-room-settings', { allowPrivateMessages: !!allow })
    }

    const renderChatBody = () => {
        if (dmTarget) {
            const msgs = dmMessages[dmTarget.socketId] || []
            const targetName = dmTarget.profile?.username || 'Guest';
            const targetInitials = getInitials(targetName);
            
            return (
                <div className={styles.chatContainer}>
                    <div className={styles.chatHeader}>
                        {/* Initials circle */}
                        <div className={styles.chatHeaderInitials}>
                            {targetInitials}
                        </div>
                        
                        {/* Name and status */}
                        <div className={styles.chatHeaderInfo}>
                            <div className={styles.chatHeaderName}>{targetName}</div>
                            <div className={styles.chatHeaderStatus}>
                                <div className={styles.statusDot}></div>
                                <span>Available</span>
                            </div>
                        </div>
                        
                        {/* Action buttons */}
                        <div className={styles.chatHeaderActions}>
                            <IconButton size="small" onClick={closeDM} title="Back to group chat">
                                <ChatIcon style={{ fontSize: 20, color: '#CCCCCC' }} />
                            </IconButton>
                            <IconButton size="small" onClick={closeChat} className={styles.chatCloseButton} title="Close chat">
                                <CloseIcon style={{ fontSize: 20, color: '#CCCCCC' }} />
                            </IconButton>
                        </div>
                    </div>
                    <div className={styles.chattingDisplay}>
                        {msgs.length !== 0 ? msgs.map((m, idx) => {
                            const isSent = m.fromSocketId === socketIdRef.current;
                            return (
                                <div 
                                    key={idx} 
                                    className={`${styles.messageBubble} ${isSent ? styles.sent : styles.received}`}
                                >
                                    {!isSent && <div className={styles.messageSender}>{m.sender}</div>}
                                    <div className={styles.messageText}>{m.text}</div>
                                    <div className={styles.messageTimestamp}>
                                        {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            )
                        }) : <p style={{ textAlign: 'center', color: '#888' }}>No messages yet. Start the conversation!</p>}
                    </div>
                    <div className={styles.chattingArea}>
                        <TextField value={dmInput} onChange={(e)=>setDmInput(e.target.value)} id="dm-input" label="Type a message" variant="outlined" />
                        <Button variant='contained' onClick={sendDM} disabled={!allowPrivateMessages}>Send</Button>
                    </div>
                </div>
            )
        }
        return (
            <div className={styles.chatContainer}>
                <div className={styles.chatHeader}>
                    <div className={styles.chatHeaderInfo}>
                        <div className={styles.chatHeaderName}>Group Chat</div>
                        <div className={styles.chatHeaderStatus}>
                            <span>{videos.length + 1} participant{videos.length + 1 !== 1 ? 's' : ''}</span>
                        </div>
                    </div>
                    <IconButton size="small" onClick={closeChat} className={styles.chatCloseButton} title="Close chat">
                        <CloseIcon style={{ fontSize: 20, color: '#CCCCCC' }} />
                    </IconButton>
                </div>
                <div className={styles.chattingDisplay}>
                    {messages.length !== 0 ? messages.map((item, index) => {
                        return (
                            <div style={{ marginBottom: "20px" }} key={index}>
                                <p style={{ fontWeight: "bold" }}>{item.sender}</p>
                                <p>{item.data}</p>
                            </div>
                        )
                    }) : <p>No Messages Yet</p>}
                </div>
                <div className={styles.chattingArea}>
                    <TextField value={message} onChange={(e) => setMessage(e.target.value)} id="outlined-basic" label="Enter Your chat" variant="outlined" />
                    <Button variant='contained' onClick={sendMessage}>Send</Button>
                </div>
            </div>
        )
    }

    return (
        <div>
            {askForUsername === true ?
                <div>
                    <h2>Enter into Lobby </h2>
                    <TextField id="outlined-basic" label="Username" value={username} onChange={e => setUsername(e.target.value)} variant="outlined" />
                    <Button variant="contained" onClick={connect}>Connect</Button>
                    <div>
                        <video ref={localVideoref} autoPlay muted></video>
                    </div>
                </div> :
                <div className={styles.meetVideoContainer}>
                    {/* Bottom Control Bar */}
                    {!fullScreenParticipant && (
                        <div className={styles.buttonContainers}>
                            <IconButton onClick={handleVideo} style={{ color: "white" }}>
                                {(video === true) ? <VideocamIcon /> : <VideocamOffIcon />}
                            </IconButton>
                            <IconButton onClick={handleEndCall} style={{ color: "red" }}>
                                <CallEndIcon />
                            </IconButton>
                            <IconButton onClick={handleAudio} style={{ color: "white" }}>
                                {audio === true ? <MicIcon /> : <MicOffIcon />}
                            </IconButton>
                            {screenAvailable === true ?
                                <IconButton onClick={handleScreen} style={{ color: "white" }}>
                                    {screen === true ? <ScreenShareIcon /> : <StopScreenShareIcon />}
                                </IconButton> : null}
                            <IconButton onClick={copyMeetingDetails} style={{ color: "white" }} title="Share meeting details">
                                <ShareIcon />
                            </IconButton>
                            <Badge badgeContent={newMessages} max={999} color='orange'>
                                <IconButton onClick={toggleChat} style={{ color: "white" }}>
                                    <ChatIcon />
                                </IconButton>
                            </Badge>
                        </div>
                    )}

                    {/* Local video (small self-view) */}
                    {!fullScreenParticipant && <video className={styles.meetUserVideo} ref={localVideoref} autoPlay muted></video>}

                    {/* Participant Grid - Takes remaining space */}
                    {!fullScreenParticipant && (
                    <div className={styles.conferenceView}>
                        {videos.map((video, index) => {
                            const participant = participants.find(p => p.socketId === video.socketId);
                            const displayName = participant?.profile?.username || 'Guest';
                            const notification = tileNotifications[video.socketId];
                            const unreadCount = unreadCounts[video.socketId];
                            const initials = getInitials(displayName);
                            
                            // Determine notification position (check if tile might overlap with chatbox)
                            const notificationPosition = showModal && isChatOpen ? 'bottomLeft' : 'topRight';
                            
                            return (
                                <div 
                                    key={video.socketId} 
                                    className={styles.videoTileContainer}
                                    ref={el => tileRefs.current[video.socketId] = el}
                                    onClick={() => { 
                                        setSelectedParticipant(participant?.profile || null); 
                                        setProfileOpen(true); 
                                    }}
                                >
                                    {/* Background video (if available) */}
                                    <video
                                        data-socket={video.socketId}
                                        ref={ref => {
                                            if (ref && video.stream) {
                                                ref.srcObject = video.stream;
                                            }
                                        }}
                                        autoPlay
                                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                                    >
                                    </video>
                                    
                                    {/* Initials circle overlay */}
                                    <div className={styles.initialsCircle}>
                                        {initials}
                                    </div>
                                    
                                    {/* Participant name below initials */}
                                    <div className={styles.participantName}>
                                        {displayName}
                                    </div>
                                    
                                    {/* Message notification */}
                                    {notification && (
                                        <div 
                                            className={`${styles.messageNotification} ${styles[notificationPosition]} ${notification.fading ? styles.messageFading : ''}`}
                                            onClick={(e) => handleNotificationClick(video.socketId, e)}
                                        >
                                            {notification.text}
                                        </div>
                                    )}
                                    
                                    {/* Unread badge */}
                                    {!notification && unreadCount > 0 && (
                                        <div 
                                            className={`${styles.unreadBadge} ${styles[notificationPosition]}`}
                                            onClick={(e) => handleUnreadBadgeClick(video.socketId, e)}
                                        >
                                            {unreadCount}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                    )}

                    {/* Right-side Chat Panel */}
                    {!fullScreenParticipant && (
                        <div className={`${styles.chatRoom} ${isChatOpen ? styles.open : ''}`}>
                            {renderChatBody()}
                        </div>
                    )}

                    {/* Full-screen participant view */}
                    {fullScreenParticipant && (
                        <div className={styles.fullScreenContainer}>
                            <video
                                className={`${styles.fullScreenVideo} ${isChatOpen ? styles.withChat : ''}`}
                                ref={ref => {
                                    if (ref && fullScreenParticipant.stream) {
                                        ref.srcObject = fullScreenParticipant.stream;
                                    }
                                }}
                                autoPlay
                            />
                            <div className={styles.fullScreenControls}>
                                <IconButton 
                                    onClick={toggleChat} 
                                    style={{ color: "white", background: 'rgba(0,0,0,0.5)' }}
                                    title="Toggle Chat"
                                >
                                    <ChatIcon />
                                </IconButton>
                                <IconButton 
                                    onClick={exitFullScreen} 
                                    style={{ color: "white", background: 'rgba(0,0,0,0.5)' }}
                                    title="Exit Full Screen"
                                >
                                    <FullscreenExitIcon />
                                </IconButton>
                            </div>
                            
                            {/* Chat in full-screen mode */}
                            <div className={`${styles.chatRoom} ${isChatOpen ? styles.open : ''}`}>
                                {renderChatBody()}
                            </div>
                        </div>
                    )}

                    <Dialog open={profileOpen} onClose={() => setProfileOpen(false)}>
                        <DialogTitle>Participant Profile</DialogTitle>
                        <DialogContent dividers>
                            {selectedParticipant ? (
                                <div>
                                    <Typography><strong>Name</strong>: {selectedParticipant.username}</Typography>
                                    {selectedParticipant.email ? <Typography><strong>Email</strong>: {selectedParticipant.email}</Typography> : null}
                                    {selectedParticipant.designation ? <Typography><strong>Designation</strong>: {selectedParticipant.designation}</Typography> : null}
                                    {selectedParticipant.linkedin ? (
                                        <Typography>
                                            <strong>LinkedIn</strong>: <MUILink href={selectedParticipant.linkedin} target="_blank" rel="noopener noreferrer">{selectedParticipant.linkedin}</MUILink>
                                        </Typography>
                                    ) : null}
                                </div>
                            ) : (
                                <Typography>No profile available.</Typography>
                            )}
                        </DialogContent>
                        <DialogActions>
                            <IconButton color="primary" onClick={() => {
                                const target = participants.find(p => p.profile?.username === selectedParticipant?.username)
                                if (target) {
                                    const video = videos.find(v => v.socketId === target.socketId);
                                    if (video) {
                                        handleFullScreen(target.socketId, video.stream, target.profile?.username || 'Guest');
                                    }
                                }
                            }} title="Full Screen">
                                <FullscreenIcon />
                            </IconButton>
                            {allowPrivateMessages ? (
                                <IconButton color="primary" onClick={() => {
                                    const target = participants.find(p => p.profile?.username === selectedParticipant?.username)
                                    if (target) startDMWith(target.socketId)
                                }} title="Start Chat">
                                    <ChatBubbleIcon />
                                </IconButton>
                            ) : (
                                <IconButton disabled title="Chat disabled">
                                    <ChatBubbleIcon />
                                </IconButton>
                            )}
                            <IconButton onClick={() => setProfileOpen(false)} title="Close">
                                <CloseIcon />
                            </IconButton>
                        </DialogActions>
                    </Dialog>

                    {/* Conversation prompt - positioned near video tile */}
                    {conversationPromptData && (
                        <div 
                            className={styles.conversationPrompt}
                            style={{
                                top: conversationPromptData.position.top,
                                left: conversationPromptData.position.left
                            }}
                        >
                            <p>Do you want to start conversation with {conversationPromptData.username}?</p>
                            <MUIButton 
                                variant="outlined" 
                                size="small"
                                onClick={() => handleConversationResponse(false)}
                            >
                                No
                            </MUIButton>
                            <MUIButton 
                                variant="contained" 
                                size="small"
                                onClick={() => handleConversationResponse(true)}
                            >
                                Yes
                            </MUIButton>
                        </div>
                    )}

                    <Dialog open={askHostDM && isHost} onClose={() => setAskHostDM(false)}>
                        <DialogTitle>Allow private messages?</DialogTitle>
                        <DialogActions>
                            <MUIButton onClick={() => handleHostDecision(false)}>No</MUIButton>
                            <MUIButton variant='contained' onClick={() => handleHostDecision(true)}>Yes</MUIButton>
                        </DialogActions>
                    </Dialog>
                </div>
            }
        </div>
    )
}