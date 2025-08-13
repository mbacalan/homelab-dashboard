#!/usr/bin/env node

import Fastify from "fastify";
import ws from '@fastify/websocket'
import { handleMinecraftWS } from "./minecraft.js";
import { handleAbioticWS } from "./abiotic.js";

const fastify = Fastify({
  logger: true
})

fastify.get('/', async () => {
  return { status: 'ok' }
})

await fastify.register(ws)

fastify.register(async function(fastify) {
  fastify.get("/minecraft", { websocket: true }, (socket) => {
    handleMinecraftWS(socket)
  })

  fastify.get('/abiotic', { websocket: true }, (socket) => {
    handleAbioticWS(socket)
  })
})

try {
  await fastify.listen({
    host: process.env.SERVER_HOST ?? '0.0.0.0',
    port: 3001
  })
} catch (err) {
  fastify.log.error(err)
  process.exit(1)
}
