#!/usr/bin/env node

import Fastify from "fastify";
import ws from '@fastify/websocket'
import { handleMinecraftWS } from "./minecraft.js";
import { handleAbioticWS } from "./abiotic.js";

let minecraftProcess = null;
let abioticProcess = null;

const fastify = Fastify({
  logger: true
})

await fastify.register(ws)

fastify.register(async function(fastify) {
  fastify.get("/", { websocket: true }, (connection) => {
    handleMinecraftWS(connection, minecraftProcess)
  })

  fastify.get('/abiotic', { websocket: true }, (connection) => {
    handleAbioticWS(connection, abioticProcess)
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
