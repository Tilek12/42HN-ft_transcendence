import Fastify from 'fastify'
import cors from '@fastify/cors'
import sqlite3 from 'sqlite3'

const server = Fastify()

await server.register(cors, {
  origin: '*'
})

const db = new sqlite3.Database('db.sqlite', (err) => {
  if (err) console.error('DB connection failed:', err.message)
  else console.log('Connected to SQLite DB')
})

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY, content TEXT)`)
})

server.get('/ping', async () => {
  return { pong: true, time: new Date().toISOString() }
})

server.listen({ port: 3000, host: '0.0.0.0' }, (err, addr) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`✅ Backend running at ${addr}`)
})
