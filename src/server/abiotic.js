import { spawn } from "node:child_process"

/**
 * @param {import("@fastify/websocket").SocketStream} message
 * @param {any} serverProcess
 */
export async function handleAbioticWS(connection, serverProcess) {
  connection.socket.on("message", async message => {
    if (message == "start") {
      serverProcess = spawn('bash', [
        './start-abiotic.sh'
      ])

      // Handle process startup
      serverProcess.once('spawn', () => {
        connection.socket.send(JSON.stringify({
          message: "start",
          event: "spawn",
          success: true
        }))
      })

      // Handle stdout
      serverProcess.stdout.on('data', (data) => {
        const output = data.toString()
        connection.socket.send(JSON.stringify({
          message: "start",
          event: "data",
          data: output
        }))

        if (output.includes("started successfully")) {
          connection.socket.send(JSON.stringify({
            message: "start",
            event: "ready",
            success: true
          }))
        }
      })

      // Handle stderr
      serverProcess.stderr.on('data', (data) => {
        connection.socket.send(JSON.stringify({
          message: "start",
          event: "error",
          error: data.toString()
        }))
      })

      // Handle process errors
      serverProcess.on('error', (err) => {
        serverProcess = null
        connection.socket.send(JSON.stringify({
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
          connection.socket.send(JSON.stringify({
            message: "stop",
            event: "exit",
            success: true,
            code,
            signal
          }))
        })
      } catch (err) {
        connection.socket.send(JSON.stringify({
          message: "stop",
          event: "error",
          error: err.message
        }))
      }
    }
  })
}
