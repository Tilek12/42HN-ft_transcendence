import { FastifyPluginAsync } from 'fastify';

const authRoutes: FastifyPluginAsync = async (fastify) => {
  // Basic login
  fastify.post('/api/login', async (req, res) => {
    const { username, password } = req.body as any;

    // TEMP logic
    if (username === 'admin' && password === 'admin') {
      return { message: 'Logged in', token: 'mock-token' };
    }

    return res.status(401).send({ message: 'Invalid credentials' });
  });

  // Register (no DB yet)
  fastify.post('/api/register', async (req, res) => {
    const { username, email, password } = req.body as any;

    if (!username || !email || !password) {
      return res.status(400).send({ message: 'All fields are required' });
    }

    // TODO: Check for existing user in DB
    // TODO: Hash password and save to DB

    console.log(`📝 Registered new user: ${username} (${email})`);
    return res.send({ message: 'User registered successfully' });
  });

  // Google login placeholder
  fastify.get('/api/auth/google', async (req, res) => {
    // Normally: redirect to Google OAuth
    return res.send({ message: 'Google login not yet implemented' });
  });
};

export default authRoutes;

