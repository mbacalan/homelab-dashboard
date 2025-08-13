import { spawn } from "node:child_process"
import { getContainerStatus } from "./docker.js";

let serverProcess = null

/**
 * @param {import("@fastify/websocket").WebSocket} socket
 */
export async function handleAbioticWS(socket) {
  socket.on("message", async message => {
    if (message == 'status') {
      try {
        const containerStatus = await getContainerStatus('abiotic-server');

        socket.send(JSON.stringify({
          message: "status",
          online: true,
          ...containerStatus
        }))
      } catch (error) {
        socket.send(JSON.stringify({
          message: "status",
          online: false,
          error: error.message
        }))
      }
    }

    if (message == "start") {
      serverProcess = spawn('bash', [
        './start-abiotic.sh'
      ])

      // Handle process startup
      serverProcess.once('spawn', () => {
        socket.send(JSON.stringify({
          message: "start",
          event: "spawn",
          success: true
        }))
      })

      // Handle stdout
      serverProcess.stdout.on('data', (data) => {
        const output = data.toString()
        socket.send(JSON.stringify({
          message: "start",
          event: "data",
          data: output
        }))

        if (output.includes("started successfully")) {
          socket.send(JSON.stringify({
            message: "start",
            event: "ready",
            success: true
          }))
        }
      })

      // Handle stderr
      serverProcess.stderr.on('data', (data) => {
        socket.send(JSON.stringify({
          message: "start",
          event: "error",
          error: data.toString()
        }))
      })

      // Handle process errors
      serverProcess.on('error', (err) => {
        serverProcess = null
        socket.send(JSON.stringify({
          message: "start",
          event: "error",
          error: err.message
        }))
      })
    }

    if (message == "stop") {
      try {
        serverProcess = spawn('bash', [
          './stop-abiotic.sh'
        ])

        // Wait for process to exit
        serverProcess.on('exit', (code, signal) => {
          serverProcess = null
          socket.send(JSON.stringify({
            message: "stop",
            event: "exit",
            success: true,
            code,
            signal
          }))
        })
      } catch (err) {
        socket.send(JSON.stringify({
          message: "stop",
          event: "error",
          error: err.message
        }))
      }
    }
  })
}
