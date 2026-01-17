# ft_transcendence - Real-Time Multiplayer Pong Platform

_This project has been created as part of the 42 curriculum by pstrohal, tnakas, ryusupov, tkubanyc, llacsivy._

## Description

**ft_transcendence** is a modern, full-stack web application that reimagines the classic Pong game with real-time multiplayer capabilities, tournament systems, and comprehensive user management. Built with cutting-edge web technologies, the platform provides a seamless gaming experience with advanced features including two-factor authentication, live tournaments, social features, and multi-language support.

### Key Features

- **Real-time Multiplayer Pong**: Server-side game logic with WebSocket-based real-time gameplay
- **Tournament System**: Both online and local tournament modes with bracket management
- **User Management**: Complete authentication system with JWT, 2FA, and OAuth integration
- **Social Features**: Friend system, match history, leaderboards, and user profiles
- **Multi-language Support**: Interface available in multiple languages (EN, DE, RU, FR)
- **Responsive Design**: Full support across devices with modern UI/UX
- **Security**: Helmet.js, CSRF protection, secure cookie handling, and SSL/TLS support

## Team Members

### Project Roles & Responsibilities

| Team Member | Role(s) | Responsibilities |
|-------------|---------|------------------|
| **Philipp Strohal** (pstrohal) | <!-- TODO: need to add role --> | <!-- TODO: Add responsibilities --> |
| **Thomas Nakas** (tnakas) | <!-- TODO: need to add role --> | <!-- TODO: Add responsibilities --> |
| **Rustamjon Yusupov** (ryusupov) | <!-- TODO: need to add role --> | <!-- TODO: Add responsibilities --> |
| **Tilek Kubanychbekov** (tkubanyc) | <!-- TODO: need to add role --> | <!-- TODO: Add responsibilities --> |
| **Linda Lacsivy** (llacsivy) | <!-- TODO: need to add role --> | <!-- TODO: Add responsibilities --> |

## Project Management

### Team Organization

- **Task Distribution**: <!-- TODO: Describe how tasks were distributed -->
- **Communication Channels**: <!-- TODO: List channels used (Discord, Slack, etc.) -->
- **Meeting Schedule**: <!-- TODO: Describe meeting frequency and format -->
- **Version Control**: Git with feature branch workflow and pull request reviews
- **Project Management Tools**: <!-- TODO: List tools used (GitHub Issues, Trello, etc.) -->

### Development Workflow

1. Feature planning and task assignment
2. Individual development on feature branches
3. Code review process via pull requests
4. Integration and testing
5. Deployment to staging/production

## Technical Stack

### Frontend Technologies

- **Core**: TypeScript, Vite
- **UI Framework**: Vanilla TypeScript with custom routing system
- **Styling**: Tailwind CSS v4.1.17
- **Real-time Communication**: WebSocket API
- **Build Tool**: Vite v7.2.4 for fast development and optimized builds

**Justification**: We chose vanilla TypeScript with Vite for maximum performance and minimal bundle size, avoiding framework overhead while maintaining type safety and modern development experience.

### Backend Technologies

- **Framework**: Fastify v5.6.1 (Node.js)
- **Language**: TypeScript v5.9.3
- **Authentication**: @fastify/jwt with JWT tokens
- **Security**: @fastify/helmet, @fastify/csrf-protection
- **Real-time**: @fastify/websocket for game and presence
- **File Upload**: @fastify/multipart with Sharp for image processing
- **API Documentation**: @fastify/swagger + swagger-ui

**Justification**: Fastify was selected for its exceptional performance (up to 30% faster than Express), native TypeScript support, schema-based validation, and extensive plugin ecosystem. Its low overhead makes it ideal for real-time gaming applications.

### Database

- **Database**: SQLite3 v5.1.7
- **Query Interface**: sqlite (async wrapper)
- **ORM Approach**: Custom query layer for fine-tuned control

**Justification**: SQLite provides a lightweight, serverless database solution perfect for this project's scale. It requires no separate database server, simplifies deployment, offers ACID compliance, and provides sufficient performance for concurrent users while maintaining data integrity.

### Additional Technologies

- **Password Hashing**: bcrypt v6.0.0
- **2FA/OTP**: otpauth v9.4.1, qrcode v1.5.4
- **Development**: tsx (TypeScript executor), concurrently (parallel processes)
- **Image Processing**: Sharp v0.34.5
- **Environment Management**: dotenv
- **Containerization**: Docker with Docker Compose
- **SSL/TLS**: Self-signed certificates for local development

## Database Schema

### Entity Relationship Overview

The database consists of 8 interconnected tables managing users, authentication, social features, games, and tournaments.

### Core Tables

#### 1. **users**
Primary user authentication and account information.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique user identifier |
| username | TEXT | UNIQUE, NOT NULL | User's unique username |
| password | TEXT | NOT NULL | Bcrypt hashed password |
| is_logged_in | TEXT | DEFAULT NULL | Session tracking |
| role | TEXT | NOT NULL, CHECK(role IN ('admin', 'user')) | User role |
| created_at | TEXT | DEFAULT CURRENT_TIMESTAMP | Account creation date |
| tfa | BOOLEAN | DEFAULT FALSE | 2FA enabled status |
| tfa_secret | TEXT | | TOTP secret for 2FA |

#### 2. **profiles**
Extended user profile information and statistics.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, FK → users(id) | User ID (one-to-one) |
| image_blob | BLOB | | Profile picture data |
| wins | INTEGER | DEFAULT 0 | Total wins count |
| losses | INTEGER | DEFAULT 0 | Total losses count |
| trophies | INTEGER | DEFAULT 0 | Trophy count |

#### 3. **matches**
Individual game match records.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTOINCREMENT | Match identifier |
| player1_id | INTEGER | NOT NULL, FK → users(id) | First player |
| player2_id | INTEGER | NOT NULL, FK → users(id) | Second player |
| player1_score | INTEGER | NOT NULL | Player 1 final score |
| player2_score | INTEGER | NOT NULL | Player 2 final score |
| winner_id | INTEGER | FK → users(id) | Winning player ID |
| is_tie | BOOLEAN | DEFAULT 0 | Tie game flag |
| is_tournament_match | BOOLEAN | DEFAULT 0 | Tournament match flag |
| played_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | Match timestamp |

#### 4. **tournaments**
Tournament metadata and status.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTOINCREMENT | Tournament ID |
| name | TEXT | NOT NULL | Tournament name |
| created_by_user_id | INTEGER | NOT NULL, FK → users(id) | Creator user ID |
| status | TEXT | CHECK(status IN ('waiting', 'ongoing', 'completed')) | Current status |
| start_time | DATETIME | | Tournament start time |
| end_time | DATETIME | | Tournament end time |

#### 5. **tournament_participants**
Links users to tournaments (many-to-many).

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTOINCREMENT | Participant entry ID |
| tournament_id | INTEGER | NOT NULL, FK → tournaments(id) | Tournament reference |
| user_id | INTEGER | NOT NULL, FK → users(id) | Participant user |
| | | UNIQUE(tournament_id, user_id) | Prevent duplicate entries |

#### 6. **tournament_matches**
Links matches to tournaments.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | INTEGER | PRIMARY KEY, AUTOINCREMENT | Entry ID |
| tournament_id | INTEGER | NOT NULL, FK → tournaments(id) | Tournament reference |
| match_id | INTEGER | NOT NULL, FK → matches(id) | Match reference |

#### 7. **friends**
User friendship relationships (bidirectional).

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| user_id | INTEGER | PRIMARY KEY (composite), FK → users(id) | First user |
| friend_id | INTEGER | PRIMARY KEY (composite), FK → users(id) | Second user |

#### 8. **friends_requests**
Pending friend requests.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| sender_id | INTEGER | PRIMARY KEY (composite), FK → users(id) | Request sender |
| receiver_id | INTEGER | PRIMARY KEY (composite), FK → users(id) | Request receiver |
| sent_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | Request timestamp |

#### 9. **blocked_list**
User blocking functionality.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| user_id | INTEGER | PRIMARY KEY (composite), FK → users(id) | Blocking user |
| blocked_id | INTEGER | PRIMARY KEY (composite), FK → users(id) | Blocked user |

### Relationships

- **Users ↔ Profiles**: One-to-one relationship (CASCADE delete)
- **Users ↔ Matches**: Many-to-many (users can participate in multiple matches)
- **Users ↔ Tournaments**: Many-to-many via tournament_participants
- **Tournaments ↔ Matches**: Many-to-many via tournament_matches
- **Users ↔ Friends**: Self-referencing many-to-many with symmetric relationship
- **Users ↔ Friend Requests**: Self-referencing with sender/receiver roles

## Features List

### Core Features

| Feature | Team Member(s) | Description |
|---------|---------------|-------------|
| **User Authentication** | <!-- TODO: Add member --> | JWT-based authentication with secure password hashing (bcrypt), session management, and logout functionality |
| **Two-Factor Authentication (2FA)** | <!-- TODO: Add member --> | TOTP-based 2FA with QR code generation, secret storage, and verification system |
| **User Registration** | <!-- TODO: Add member --> | Account creation with username/password validation, automatic profile creation |
| **User Profiles** | <!-- TODO: Add member --> | Profile management with statistics (wins/losses/trophies), custom profile pictures, match history |
| **Real-time Pong Game** | <!-- TODO: Add member --> | Server-authoritative game logic, WebSocket-based real-time gameplay, collision detection, score tracking |
| **Online Multiplayer** | <!-- TODO: Add member --> | Matchmaking system, real-time remote player support, game state synchronization |
| **Local Multiplayer** | <!-- TODO: Add member --> | Same-device two-player mode with shared controls |
| **Online Tournaments** | <!-- TODO: Add member --> | Tournament creation, participant management, bracket system, automatic match scheduling |
| **Local Tournaments** | <!-- TODO: Add member --> | Offline tournament mode with manual progression and result tracking |
| **Friend System** | <!-- TODO: Add member --> | Send/accept/decline friend requests, friends list management, remove friends |
| **User Blocking** | <!-- TODO: Add member --> | Block/unblock users, prevent interaction with blocked users |
| **Leaderboard** | <!-- TODO: Add member --> | Global rankings based on wins/losses/trophies, real-time updates |
| **Match History** | <!-- TODO: Add member --> | Complete game history with scores, opponents, timestamps, and outcomes |
| **User Search** | <!-- TODO: Add member --> | Search users by username, view public profiles |
| **Live Presence System** | <!-- TODO: Add member --> | WebSocket-based online/offline status, real-time user activity tracking |
| **Multi-language Support** | <!-- TODO: Add member --> | Interface translation (EN, DE, RU, FR), persistent language preference |
| **Game Customization** | <!-- TODO: Add member --> | Customizable game settings (ball speed, paddle size, etc.) |
| **Responsive Design** | <!-- TODO: Add member --> | Mobile-friendly UI, cross-browser compatibility, touch support |
| **Admin Panel** | <!-- TODO: Add member --> | Admin user management, system monitoring, user role management |
| **Profile Picture Upload** | <!-- TODO: Add member --> | Image upload with Sharp processing, size optimization, format validation |
| **Settings Management** | <!-- TODO: Add member --> | Password change, username update, 2FA toggle, language preferences |
| **API Documentation** | <!-- TODO: Add member --> | Swagger/OpenAPI documentation for all API endpoints |
| **Security Features** | <!-- TODO: Add member --> | Helmet.js security headers, CSRF protection, XSS prevention, rate limiting |

### WebSocket Features

| Feature | Team Member(s) | Description |
|---------|---------------|-------------|
| **Game WebSocket** | <!-- TODO: Add member --> | Real-time game state updates, player actions, ball physics |
| **Presence WebSocket** | <!-- TODO: Add member --> | User online/offline status, real-time presence updates |
| **Tournament WebSocket** | <!-- TODO: Add member --> | Live tournament updates, bracket changes, match notifications |

## Instructions

### Prerequisites

#### Required Software

- **Docker**: Version 20.10+ 
- **Docker Compose**: Version 1.29+
- **Node.js**: Version 18+ (for local development without Docker)
- **npm**: Version 8+ (comes with Node.js)

#### Supported Operating Systems

- macOS (tested on Catalina 10.15.7+)
- Linux (Ubuntu 20.04+, Debian 11+)
- Windows 10/11 (with WSL2 for Docker)

### Installation & Setup

#### 1. Clone the Repository

```bash
git clone <repository-url>
cd 42HN-ft_transcendence
```

#### 2. Environment Configuration

Create a `.env` file in the project root (or use the existing one):

```bash
# .env
NODE_ENV=development
BACKEND_PORT=3000
FRONTEND_PORT=8080
JWT_SECRET=your-secure-jwt-secret-here
```

**Important**: Never commit real secrets to version control. Use strong, randomly generated values for production.

#### 3. SSL Certificates Setup

The setup script will automatically generate self-signed SSL certificates and required secrets:

```bash
make setup-local
```

This creates:
- `cert/cert.pem` - SSL certificate
- `cert/key.pem` - SSL private key
- `cert/jwt_secret.txt` - JWT signing secret
- `cert/cookie_secret.txt` - Cookie encryption secret
- `cert/admin_password.txt` - Admin account password

#### 4. Start the Application

**Development Mode** (with hot reload):
```bash
make dev
```

**Production Mode**:
```bash
make start
```

The application will be available at:
- Frontend: `https://localhost:8080` (or configured FRONTEND_PORT)
- Backend API: `https://localhost:3000` (or configured BACKEND_PORT)
- API Documentation: `https://localhost:3000/documentation`

### Available Make Commands

| Command | Description |
|---------|-------------|
| `make` or `make help` | Display help information |
| `make start` | Full start (setup + production build) |
| `make dev` | Start in development mode with hot reload |
| `make stop` | Stop all services and clean up |
| `make re` | Restart everything (clean + start) |
| `make up` | Start containers (production mode) |
| `make updev` | Start containers (development mode) |
| `make down` | Stop containers |
| `make clean` | Remove all containers, volumes, and images |
| `make logs` | View container logs |
| `make ps` | Show container status |
| `make setup-local` | Setup local environment and certificates |

### First-Time Setup

1. **Run setup**: `make setup-local`
2. **Start application**: `make dev`
3. **Access in browser**: Navigate to `https://localhost:8080`
4. **Accept SSL warning**: Since we use self-signed certificates for development, accept the browser security warning
5. **Create account**: Register a new user account
6. **Admin access**: Use credentials from `cert/admin_password.txt` to log in as admin

### Troubleshooting

**Port conflicts**: 
- Check if ports 3000 and 8080 are available
- Modify `BACKEND_PORT` and `FRONTEND_PORT` in `.env` if needed

**Docker issues**:
- Ensure Docker daemon is running: `docker ps`
- Reset Docker: `make clean` then `make dev`

**SSL certificate errors**:
- Regenerate certificates: `./scripts/setup-local.sh`
- Ensure `cert/` directory exists with proper permissions

**Database issues**:
- Database is automatically created on first run
- Reset database: `make clean` (warning: deletes all data)

## Module Implementation

### Mandatory Modules (14 points total)

| Module | Type | Points | Status | Implementation |
|--------|------|--------|--------|----------------|
| Backend Framework | Major | 2 | ✅ | Fastify with TypeScript |
| Frontend Framework | Minor | 1 | ✅ | Vite + TypeScript |
| Database (ORM) | Minor | 1 | ✅ | SQLite3 with custom query layer |
| Standard User Management | Major | 2 | ✅ | JWT + sessions + user profiles |
| Remote Players | Major | 2 | ✅ | WebSocket real-time multiplayer |
| 2FA & JWT | Major | 2 | ✅ | TOTP-based 2FA + JWT auth |
| Server-side Pong + API | Major | 2 | ✅ | Fastify API + server game logic |
| Multi-language Support | Minor | 1 | ✅ | EN, DE, RU, FR translations |
| Game Customization | Minor | 1 | ✅ | Configurable game settings |
| **Total** | | **14** | ✅ | |

### Architecture Highlights

- **Server-authoritative game logic**: All game physics run on server to prevent cheating
- **Real-time communication**: WebSocket connections for game, presence, and tournaments
- **Security-first design**: Multiple layers of security (Helmet, CSRF, JWT, 2FA)
- **Scalable database design**: Normalized schema with proper foreign key relationships
- **Type-safe codebase**: Full TypeScript implementation across frontend and backend

## Resources

### Documentation

- [Fastify Official Documentation](https://www.fastify.io/docs/latest/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [Vite Guide](https://vitejs.dev/guide/)
- [WebSocket API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [JWT.io](https://jwt.io/introduction)
- [TOTP RFC 6238](https://datatracker.ietf.org/doc/html/rfc6238)

### Tutorials & Articles

- [Building Real-time Applications with WebSockets](https://web.dev/websockets-basics/)
- [Fastify vs Express Performance](https://www.fastify.io/benchmarks/)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)
- [Secure Authentication Best Practices (OWASP)](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

### AI Usage

AI tools (GitHub Copilot, ChatGPT, Claude) were used throughout this project to assist with:

#### Code Generation & Implementation
- Boilerplate code for API routes and database queries
- TypeScript type definitions and interfaces
- WebSocket connection handling patterns
- Security middleware configuration (Helmet, CSRF)

#### Problem Solving & Debugging
- Troubleshooting WebSocket connection issues
- Debugging TypeScript compilation errors
- Resolving Docker container networking problems
- Fixing database query optimization issues

#### Documentation & Learning
- Understanding Fastify plugin architecture
- Learning SQLite best practices and query optimization
- Researching 2FA implementation with TOTP
- Understanding JWT token refresh strategies
- Tailwind CSS utility class suggestions

#### Code Review & Optimization
- Identifying potential security vulnerabilities
- Suggesting performance optimizations
- Refactoring suggestions for better code organization
- TypeScript type safety improvements

**Important Note**: All AI-generated code was thoroughly reviewed, tested, and modified by team members. AI served as a productivity tool and learning aid, not a replacement for understanding. Every feature was validated for correctness, security, and alignment with project requirements.

### Additional References

- [Pong Game Physics](https://en.wikipedia.org/wiki/Pong)
- [Real-time Game Networking](https://gafferongames.com/post/what_every_programmer_needs_to_know_about_game_networking/)
- [42 Evaluation Guidelines](https://github.com/42School)

---

**Project Status**: ✅ Completed and ready for evaluation

**Last Updated**: January 2026




