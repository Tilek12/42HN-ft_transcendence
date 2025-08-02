"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = require("fastify");
const utils_1 = require("./utils");
const schemas_1 = require("./schemas");
const user_1 = require("../database/user");
const authRoutes = async (fastify) => {
    // Register
    fastify.post('/register', { schema: schemas_1.registerSchema }, async (req, res) => {
        const { username, email, password } = req.body;
        if (await (0, user_1.findUserByUsername)(username)) {
            return res.status(400).send({ message: 'Username already taken' });
        }
        if (await (0, user_1.findUserByEmail)(email)) {
            return res.status(400).send({ message: 'Email already registered' });
        }
        const hashed = await (0, utils_1.hashPassword)(password);
        await (0, user_1.createUser)(username, email, hashed);
        res.send({ message: 'User registered successfully' });
    });
    // Login
    fastify.post('/login', { schema: schemas_1.loginSchema }, async (req, res) => {
        const { username, password } = req.body;
        const user = await (0, user_1.findUserByUsername)(username);
        if (!user || !(await (0, utils_1.verifyPassword)(password, user.password))) {
            return res.status(401).send({ message: 'Invalid credentials' });
        }
        const token = fastify.jwt.sign({ id: user.id }, { expiresIn: '2h' });
        res.send({ token });
    });
};
exports.default = authRoutes;
//# sourceMappingURL=routes.js.map