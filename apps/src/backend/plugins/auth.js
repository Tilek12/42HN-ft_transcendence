"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = require("fastify");
const fastify_plugin_1 = __importDefault(require("fastify-plugin"));
const authPlugin = async (fastify) => {
    if (!fastify.hasRequestDecorator('user')) {
        fastify.decorateRequest('user', null);
    }
    fastify.addHook('onRequest', async (req, res) => {
        if (!req.url.startsWith('/api/private'))
            return;
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            return res.status(401).send({ message: 'Missing or invalid token' });
        }
        try {
            const decoded = await req.jwtVerify();
            req.user = decoded.id;
        }
        catch {
            return res.status(401).send({ message: 'Invalid or expired token' });
        }
    });
};
exports.default = (0, fastify_plugin_1.default)(authPlugin);
//# sourceMappingURL=auth.js.map