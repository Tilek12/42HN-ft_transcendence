"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = require("fastify");
const user_1 = require("../database/user");
const userRoutes = async (fastify) => {
    fastify.get('/me', async (req, res) => {
        const user = await (0, user_1.findUserById)(req.user);
        if (!user)
            return res.status(404).send({ message: 'User not found' });
        const { password, ...safeUser } = user;
        res.send(safeUser);
    });
};
exports.default = userRoutes;
//# sourceMappingURL=routes.js.map