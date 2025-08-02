import { FastifyPluginAsync } from 'fastify';
interface PresenceUser {
    id: string;
    socket: WebSocket;
    isAlive: boolean;
}
export declare const getPresenceUsers: () => PresenceUser[];
export declare const broadcastTournaments: () => void;
declare const _default: FastifyPluginAsync;
export default _default;
//# sourceMappingURL=presence.d.ts.map