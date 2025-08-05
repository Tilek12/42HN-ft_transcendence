"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const fs_1 = __importDefault(require("fs"));
const websocket_1 = __importDefault(require("@fastify/websocket"));
const jwt_1 = __importDefault(require("@fastify/jwt"));
const dotenv_1 = __importDefault(require("dotenv"));
const client_1 = require("./database/client");
const routes_1 = __importDefault(require("./auth/routes"));
const routes_2 = __importDefault(require("./user/routes"));
const auth_1 = __importDefault(require("./plugins/auth"));
const online_users_1 = __importDefault(require("./user/online-users"));
const routes_3 = __importDefault(require("./game/tournament/routes"));
const presence_1 = __importDefault(require("./websocket/presence"));
const game_1 = __importDefault(require("./websocket/game"));
const tournament_1 = __importDefault(require("./websocket/tournament"));
dotenv_1.default.config();
// Environment
const LOCAL_IP = process.env.LOCAL_IP || '127.0.0.1';
const PORT = parseInt(process.env.BACKEND_PORT || '3000');
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    console.error('❌ Missing JWT_SECRET in .env');
    process.exit(1);
}
// Create server instance
const server = (0, fastify_1.default)({
    logger: true,
    https: {
        key: fs_1.default.readFileSync('./cert/key.pem'),
        cert: fs_1.default.readFileSync('./cert/cert.pem')
    }
});
// App setup
async function main() {
    await (0, client_1.connectToDB)(); // ✅ Init DB tables
    await server.register(jwt_1.default, { secret: JWT_SECRET }); // ✅ Create JWT
    await server.register(websocket_1.default); // ✅ Add WebSocket support
    // Public auth routes                                   // 👈 Public routes: /api/login
    await server.register(routes_1.default, { prefix: '/api' }); // 👈 Public routes: /api/register
    // Protected scope of routes
    await server.register(async (protectedScope) => {
        await protectedScope.register(auth_1.default); // 👈 Middleware checking token
        await protectedScope.register(routes_2.default); // 👈 Protected routes: /api/private/me
        await protectedScope.register(online_users_1.default); // 👈 Protected routes: /api/private/online-users
        await protectedScope.register(routes_3.default); // 👈 Protected routes: /api/private/tournaments
    }, { prefix: '/api/private' });
    // WebSocket scope of routes
    await server.register(async (websocketScope) => {
        await websocketScope.register(game_1.default); // 🕹️ Game-only socket:  /ws/game
        await websocketScope.register(presence_1.default); // 🔁 Persistent socket: /ws/presence
        await websocketScope.register(tournament_1.default); // 🏆 Tournament socket: /ws/tournament
    }, { prefix: '/ws' });
    // Simple health check
    server.get('/ping', async () => {
        return { pong: true, time: new Date().toISOString() };
    });
    // Start listening
    try {
        await server.listen({ port: PORT, host: '0.0.0.0' });
        console.log('✅ Server running on:');
        console.log(`     Local: https://localhost:${PORT}`);
        console.log(`   Network: https://${LOCAL_IP}:${PORT}`);
    }
    catch (err) {
        server.log.error(err, '❌ Failed to start server');
        process.exit(1);
    }
    // Graceful shutdown
    const shutdown = async () => {
        console.log('\n🛑 Gracefully shutting down...');
        try {
            await server.close();
            console.log('❎ Server closed');
            process.exit(0);
        }
        catch (err) {
            console.error('❌ Error during shutdown:', err);
            process.exit(1);
        }
    };
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
}
main();
//# sourceMappingURL=server.js.map