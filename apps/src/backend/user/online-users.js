"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = require("fastify");
const fastify_plugin_1 = __importDefault(require("fastify-plugin"));
const presence_1 = require("../websocket/presence");
const onlineUsersRoute = async (fastify) => {
    fastify.get('/online-users', async (req, res) => {
        const users = (0, presence_1.getPresenceUsers)().map(u => ({ id: u.id }));
        res.send(users);
    });
};
exports.default = (0, fastify_plugin_1.default)(onlineUsersRoute);
//# sourceMappingURL=online-users.js.map