import fp from 'fastify-plugin';
import { WebSocket as WS } from 'ws';
import { getSafeTournamentData } from '../game/tournament/tournament-manager';
const presenceUsers = [];
const HEARTBEAT_INTERVAL = 10000;
function broadcastPresence(msg) {
    const data = JSON.stringify(msg);
    presenceUsers.forEach((user) => {
        if (user.socket.readyState === WS.OPEN) {
            user.socket.send(data);
        }
    });
}
export const getPresenceUsers = () => presenceUsers;
export const broadcastTournaments = () => {
    const tournaments = getSafeTournamentData();
    broadcastPresence({ type: 'tournamentUpdate', tournaments });
};
const presencePlugin = async (fastify) => {
    fastify.get('/presence', { websocket: true }, async (connection, req) => {
        const params = new URLSearchParams(req.url?.split('?')[1] || '');
        const token = params.get('token');
        if (!token) {
            connection.socket.close(4001, 'Missing token');
            return;
        }
        let userId;
        try {
            const payload = await fastify.jwt.verify(token);
            userId = payload.id;
        }
        catch {
            connection.socket.close(4002, 'Invalid token');
            return;
        }
        const socket = connection.socket;
        const user = { id: userId, socket, isAlive: true };
        const existing = presenceUsers.find(u => u.id === userId);
        if (existing) {
            console.warn(`🔁 [Presence WS] Replacing existing connection for: ${userId}`);
            existing.socket.close();
            presenceUsers.splice(presenceUsers.indexOf(existing), 1);
        }
        presenceUsers.push(user);
        console.log(`🟢 [Presence WS] Connected: ${userId}`);
        socket.send(JSON.stringify({
            type: 'tournamentUpdate',
            tournaments: getSafeTournamentData()
        }));
        socket.send(JSON.stringify({
            type: 'presenceUpdate',
            count: presenceUsers.length,
            users: presenceUsers.map(u => ({ id: u.id }))
        }));
        socket.on('message', (msg) => {
            if (msg.toString() === 'pong')
                user.isAlive = true;
        });
        socket.on('close', () => {
            const index = presenceUsers.findIndex(u => u.id === userId);
            if (index !== -1)
                presenceUsers.splice(index, 1);
            console.log(`🔴 [Presence WS] Disconnected: ${userId}`);
        });
    });
    setInterval(() => {
        presenceUsers.forEach((user, index) => {
            if (user.socket.readyState !== WS.OPEN)
                return;
            if (!user.isAlive) {
                user.socket.close();
                presenceUsers.splice(index, 1);
                return;
            }
            user.isAlive = false;
            user.socket.send('ping');
        });
    }, HEARTBEAT_INTERVAL);
};
export default fp(presencePlugin);
