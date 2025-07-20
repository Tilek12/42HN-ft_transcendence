# 🕹️ Ft_transcendence – Multiplayer Pong Game
A full-stack, real-time Pong game with solo, 1v1, and tournament modes. Built as a modern SPA with JWT authentication, live player presence and WebSocket-based gameplay.


## :cd: Operating System
This project was tested on **MacOS Catalina (ver. 10.15.7)** with **Docker Desktop (ver. 4.4.2.)**


## :green_circle: How to run
:exclamation: **`Don't forget to run Docker first`**
Use Makefile commands to work with the program.

### Usage:
  **make \<target\>**

### Targets:
- **start** -         🚀 Full start process (setup + run)
- **stop** -          🛑 Stop all services (graceful shutdown)
- **re** -            🔄 Restart everything
- **up** -            🐳 Start containers with build
- **down** -          🛑 Stop containers
- **clean** -         🧹 Clean everything (volumes, images, orphans)
- **setup-local** -   🌐 Setup local environment (IP, certs, etc.)
- **setup-ngrok** -   🚪 Setup ngrok tunnel
- **logs** -          📄 View container logs
- **ps** -            📊 Show container status
- **env-check** -     🔍 Verify environment files exist
- **help** -          🆘 Display this help message

:exclamation: **`By default "make" uses <help> target`**


## :green_circle: Modules
To achieve 100% project completion, a minimum of **7 major modules is required**.

:warning: **`1 Major Module = 2 Minor Modules`**

### Modules to include definitely:
\# | Module | Point | Description
|:---|:---|:---|:---|
**1** | Major | (1)   |	**Use a framework to build the backend.**
**2** | Minor | (0,5) |	**Use a framework or a toolkit to build the frontend.**
**3** | Minor | (0,5) | **Use a database for the backend.**
**4** | Major | (1)   |	**Standard user management, authentication, users across tournaments.**
**5** | Major | (1)   |	**Remote players.**
**6** | Major | (1)   |	**Implement Two-Factor Authentication (2FA) and JWT.**
**7** | Major | (1)   |	**Replace basic Pong with server-side Pong and implement an API.**
| | **Total Major Modules:** | **(6)** | |

### Modules to choose:
Module | Point | Description
|:---|:---|:---|
Major | (1)   |	**Use advanced 3D techniques.**
Minor | (0,5) |	**Support on all devices.**
Minor | (0,5) |	**Expanding browser compatibility.**
Minor | (0,5) |	**Supports multiple languages.**
Minor | (0,5) |	**Game customization options.**


## 🔧 Tech Stack
**Frontend**
- Vite + TypeScript
- Tailwind CSS
- Canvas for rendering the game
- WebSocket for real-time updates

**Backend**
- Fastify (Node.js)
- TypeScript
- SQLite (via better-sqlite3)
- WebSocket (ws module)
- JWT Auth (fastify-jwt)


## 🧠 Architecture Overview
```
User → [Frontend SPA] → API (HTTP) + WebSocket
                            ↓
               [Fastify Backend with SQLite DB]
                            ↓
            Game Logic + Matchmaking + Tournaments
```

## ✨ Features
- 👤 Secure login and registration with JWT
- 🧍 Real-time online user tracking
- 🕹️ Game modes: Solo, 1v1, Tournament (4 or 8 players)
- 📡 Live tournament list and updates
- 🧠 Auto-matchmaking and bracket logic
- 🖼️ Canvas-rendered game with keyboard controls
- 🔐 Protected SPA routes (profile, settings, game, tournaments)


## 🌐 Routing
### HTTP API
**Public**
- **POST /api/register**
- **POST /api/login**
- **GET /api/ping**

**Private (/api/private/*)**
- **GET /me** – Auth user info
- **GET /online-users** – List of online players
- **GET /tournaments/available** – Tournaments waiting to start

### WebSocket Endpoints
Endpoint	| Purpose
|:---|:---|
**/ws/presence**	| Tracks online users, tournaments
**/ws?mode=solo**	| Solo game connection
**/ws?mode=duel**	| 1v1 game connection


## 🧠 Game & Tournament Logic
- Users join tournaments via a central pool
- Matches start automatically when full
- Tournament bracket progresses until a winner
- Tournament updates are broadcasted to all users via /ws/presence


## ✅ Authentication Flow
- User registers/logs in → receives JWT
- JWT is saved in localStorage
- Every protected request or WebSocket uses JWT
- Token verified on backend via fastify-jwt


## 🧪 Planned Features
- 🏅 Tournament history & leaderboard
- 👥 Friend system & invitations
- 🧠 AI bot opponent for solo mode
- 🖼️ Spectator view for ongoing tournaments
- 📊 Admin stats panel

