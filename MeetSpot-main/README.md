# 🎥 MeetSpot - Video Conferencing Application

<div align="center">

![MeetSpot Logo](frontend/public/mobile.png)

**A modern, full-stack video conferencing platform built with React, Node.js, WebRTC, and Socket.io**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v14+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green.svg)](https://www.mongodb.com/)

[Features](#features) • [Demo](#demo) • [Installation](#installation) • [Usage](#usage) • [Documentation](#documentation) • [Contributing](#contributing)

</div>

---

## 📋 Table of Contents

- [About](#about)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## 🎯 About

**MeetSpot** is a professional video conferencing web application inspired by Microsoft Teams, designed to facilitate seamless real-time communication. Built with cutting-edge technologies, MeetSpot provides HD video/audio streaming, group and private messaging, screen sharing, and comprehensive user management features.

### Why MeetSpot?

- ✅ **Zero Installation** - Browser-based, no downloads required
- ✅ **Professional UI** - Microsoft Teams-inspired dark theme
- ✅ **Secure** - End-to-end encrypted connections with bcrypt password hashing
- ✅ **Feature-Rich** - Video, audio, chat, screen sharing, and more
- ✅ **Free & Open Source** - No subscription fees
- ✅ **Responsive** - Works on desktop, tablet, and mobile devices

---

## ✨ Features

### 🎥 Video Conferencing
- **Multi-party video calls** (up to 16 participants)
- **HD video quality** (up to 1080p)
- **Camera & microphone controls** with toggle functionality
- **Screen sharing** with system audio support
- **Full-screen mode** for individual participants
- **Dynamic grid layout** that adjusts to participant count

### 💬 Communication
- **Group chat** - All participants can communicate
- **Private messaging (DM)** - One-on-one conversations
- **Real-time message delivery** via Socket.io
- **Message notifications** with fade animations
- **Unread message badges** on participant tiles
- **Conversation state management**

### 👤 User Management
- **Secure registration** with password strength validation
- **Login/Logout** functionality
- **Password recovery** with email-based reset (dual verification)
- **User profiles** with LinkedIn integration
- **Session management** with token-based authentication
- **Meeting history** tracking

### 🔒 Security Features
- **Password hashing** with bcrypt (10 salt rounds)
- **Token-based authentication** with crypto
- **Password reset tokens** (SHA-256 hashed, 1-hour expiry)
- **Dual verification** for password recovery (username + email)
- **Input validation** on both frontend and backend
- **Secure WebRTC** connections with DTLS-SRTP encryption

### 🎨 User Interface
- **Microsoft Teams-style** dark theme
- **Responsive design** for all screen sizes
- **Material-UI components** for professional look
- **Smooth animations** and transitions
- **Intuitive controls** and navigation
- **Profile dialogs** with participant information

---

## 🛠️ Technology Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React.js | 18.2.0 | UI Framework |
| Material-UI | 5.15.4 | Component Library |
| Socket.io Client | 4.7.3 | Real-time Communication |
| WebRTC API | Native | Video/Audio Streaming |
| React Router | 6.21.1 | Client-side Routing |
| Axios | 1.6.5 | HTTP Client |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | Latest LTS | Runtime Environment |
| Express.js | 4.18.2 | Web Framework |
| Socket.io | 4.7.3 | WebSocket Server |
| MongoDB | Latest | Database |
| Mongoose | 8.0.3 | ODM |
| Bcrypt | 5.1.1 | Password Hashing |
| Nodemailer | 7.0.10 | Email Service |

### DevOps & Tools
- **Git** - Version control
- **npm** - Package management
- **MongoDB Atlas** - Cloud database
- **Nodemon** - Development auto-restart

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Browser    │  │   Browser    │  │   Browser    │          │
│  │  (User 1)    │  │  (User 2)    │  │  (User 3)    │          │
│  │  React App   │  │  React App   │  │  React App   │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
└─────────┼──────────────────┼──────────────────┼─────────────────┘
          │                  │                  │
          │  WebRTC (P2P)    │                  │
          ├──────────────────┤                  │
          │                  ├──────────────────┤
          │                  │                  │
          │  Socket.io       │  Socket.io       │
          └──────────┬───────┴──────────┬───────┘
                     │                  │
┌────────────────────┼──────────────────┼─────────────────────────┐
│                    │   SERVER LAYER   │                          │
│            ┌───────▼──────────────────▼───────┐                 │
│            │     Node.js + Express.js         │                 │
│            │     Socket.io Server             │                 │
│            └───────┬──────────────────┬───────┘                 │
│                    │                  │                          │
│         ┌──────────▼────────┐  ┌─────▼────────────┐            │
│         │  Authentication   │  │  Socket Manager  │            │
│         │   Controllers     │  │   (WebRTC)       │            │
│         └──────────┬────────┘  └──────────────────┘            │
│                    │                                             │
│         ┌──────────▼────────┐                                   │
│         │  Email Service    │                                   │
│         └───────────────────┘                                   │
└────────────────────┼──────────────────────────────────────────┘
                     │
          ┌──────────▼──────────┐
          │   DATABASE LAYER    │
          │   MongoDB Atlas     │
          └─────────────────────┘
```

---

## 📦 Installation

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v14.0.0 or higher)
- **npm** (v6.0.0 or higher)
- **MongoDB Atlas account** (or local MongoDB)
- **Modern web browser** (Chrome 80+, Firefox 75+, Safari 13+, Edge 80+)

### Step 1: Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/meetspot.git
cd meetspot
```

### Step 2: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file from example
cp .env.example .env

# Edit .env file with your credentials
# nano .env  (or use your preferred editor)
```

### Step 3: Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Create .env file from example (optional)
cp .env.example .env
```

---

## ⚙️ Configuration

### Backend Configuration

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=8000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/YOUR_DATABASE

# Email Configuration (Gmail)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

#### Getting Gmail App Password:

1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Navigate to **Security** → **2-Step Verification**
3. Scroll to **App Passwords**
4. Generate password for "Mail" app
5. Copy the 16-character password to `.env`

### Frontend Configuration (Optional)

Create a `.env` file in the `frontend` directory:

```env
# API Configuration
REACT_APP_API_URL=http://localhost:8000
REACT_APP_SOCKET_URL=http://localhost:8000
```

---

## 🚀 Usage

### Development Mode

**Terminal 1 - Start Backend:**
```bash
cd backend
npm start
```

Backend will run on: `http://localhost:8000`

**Terminal 2 - Start Frontend:**
```bash
cd frontend
npm start
```

Frontend will run on: `http://localhost:3000`

Browser will automatically open to the landing page.

### Production Build

**Build Frontend:**
```bash
cd frontend
npm run build
```

This creates an optimized production build in the `build/` folder.

**Deploy Backend:**
```bash
cd backend
# Set NODE_ENV=production in your hosting environment
npm start
```

---

## 📖 User Guide

### Getting Started

1. **Register an Account**
   - Click "Get Started" or "Register"
   - Fill in: Name, Username, Email, Password
   - Optional: LinkedIn Profile, Designation
   - Password must be 8+ characters with 1 uppercase, 1 number, 1 special character

2. **Login**
   - Enter username and password
   - Click "Login"
   - Redirected to home page

3. **Start a Meeting**
   - Click "New Meeting"
   - Enter your username
   - Click "Connect"
   - Allow camera/microphone permissions
   - Share meeting URL with participants

4. **Join a Meeting**
   - Receive meeting URL from host
   - Open URL in browser
   - Enter your username
   - Click "Join"
   - Allow permissions

### During the Meeting

**Controls:**
- 🎥 **Camera** - Toggle video on/off
- 🎤 **Microphone** - Mute/unmute audio
- 🖥️ **Screen Share** - Share your screen
- 📞 **End Call** - Leave meeting
- 💬 **Chat** - Open/close chat panel

**Participant Interactions:**
- Click participant tile to view profile
- Start private chat from profile dialog
- View full-screen mode
- See message notifications on tiles

### Password Recovery

1. Click "Forgot password?" on login page
2. Enter username and registered email
3. Check email for reset link
4. Click link and enter new password
5. Login with new password

---

## 📡 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/v1/users/register
Content-Type: application/json

{
  "name": "John Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "linkedin": "https://linkedin.com/in/johndoe",
  "designation": "Software Engineer"
}
```

#### Login
```http
POST /api/v1/users/login
Content-Type: application/json

{
  "username": "johndoe",
  "password": "SecurePass123!"
}
```

#### Forgot Password
```http
POST /api/v1/users/forgot-password
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com"
}
```

#### Reset Password
```http
POST /api/v1/users/reset-password
Content-Type: application/json

{
  "token": "abc123...",
  "newPassword": "NewSecurePass123!"
}
```

#### Get User Profile
```http
GET /api/v1/users/profile/:username
```

### Socket.io Events

**Client → Server:**
- `join-call` - Join a meeting room
- `signal` - WebRTC signaling data
- `chat-message` - Send group message
- `dm-message` - Send private message

**Server → Client:**
- `user-joined` - New participant joined
- `user-left` - Participant left
- `participants` - List of all participants
- `chat-message` - Receive group message
- `dm-message` - Receive private message
- `room-settings` - Room configuration

---

## 📸 Screenshots

### Landing Page
![Landing Page](docs/screenshots/landing.png)

### Video Meeting
![Video Meeting](docs/screenshots/meeting.png)

### Chat Interface
![Chat Interface](docs/screenshots/chat.png)

### Profile Dialog
![Profile Dialog](docs/screenshots/profile.png)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/AmazingFeature
   ```
5. **Open a Pull Request**

### Development Guidelines

- Follow existing code style
- Write clear commit messages
- Add comments for complex logic
- Test thoroughly before submitting
- Update documentation as needed

---

## 🐛 Known Issues & Limitations

- **Participant Limit**: Recommended maximum of 16 participants (mesh topology)
- **Browser Compatibility**: Best performance on Chrome/Firefox
- **Mobile Support**: Limited features on mobile browsers
- **Network Requirements**: Minimum 2 Mbps upload/download

---

## 🔮 Future Enhancements

- [ ] Mobile applications (iOS/Android)
- [ ] Meeting recording functionality
- [ ] Virtual backgrounds
- [ ] Breakout rooms
- [ ] Calendar integration
- [ ] File sharing
- [ ] Whiteboard feature
- [ ] SFU architecture for 100+ participants
- [ ] End-to-end encryption
- [ ] Meeting analytics

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Authors

**Josna Fernandes**
- GitHub: github.com/kajalkamble0713-jpg
- LinkedIn: linkedin.com/in/kajal-kamble
- Email: kajalkamble0713@gmail.com

---

## 🙏 Acknowledgments

- **WebRTC** - For peer-to-peer communication technology
- **Socket.io** - For real-time bidirectional communication
- **Material-UI** - For beautiful React components
- **MongoDB** - For flexible database solution
- **Node.js Community** - For excellent packages and support

---

## 📞 Support

If you have any questions or need help, please:

1. Check the [Documentation](FINAL_PROJECT_REPORT.md)
3. Contact via email: kajalkamble0713@gmail.com

---

## ⭐ Star History

If you find this project useful, please consider giving it a star! ⭐

---

<div align="center">

**Made with ❤️ by Josna**

[⬆ Back to Top](#-meetspot---video-conferencing-application)

</div>
