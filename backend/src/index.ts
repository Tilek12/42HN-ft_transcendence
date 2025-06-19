import Fastify from 'fastify'
import fastifyEnv from '@fastify/env'
import fastifyAutoload from '@fastify/autoload'
import path from 'path'
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'

// Environment schema validation
const envSchema = Type.Object({
  NODE_ENV: Type.String({ default: 'development' }),
  DATABASE_URL: Type.String(),
  JWT_SECRET: Type.String({ default: 'your-secret-key' }),
  PORT: Type.Number({ default: 3000 }),
})

// Create Fastify instance with TypeBox support
const server = Fastify({
  logger: true
}).withTypeProvider<TypeBoxTypeProvider>()

// Register plugins
async function setupServer() {
  // Load environment variables
  await server.register(fastifyEnv, {
    schema: envSchema,
    dotenv: true
  })

  // Auto-load routes
  await server.register(fastifyAutoload, {
    dir: path.join(__dirname, 'routes'),
    routeParams: true,
    options: { prefix: '/api' }
  })

  // Health check endpoint
  server.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() }
  })

  // Start server
  try {
    const address = await server.listen({
      port: server.config.PORT,
      host: '0.0.0.0'
    })
    server.log.info(`Server listening at ${address}`)
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}

setupServer()

export default server
