import Fastify from 'fastify'

const server = Fastify()

server.get('/ping', async () => {
  return { pong: true, time: new Date().toISOString() }
})

server.listen({ port: 3001, host: '0.0.0.0' }, (err, addr) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`✅ Backend running at ${addr}`)
})
