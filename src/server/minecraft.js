import { pingJava } from "@minescope/mineping";
import path from "node:path"
import { spawn } from "node:child_process"

/**
 * @param {import("@fastify/websocket").SocketStream} message
 * @param {any} serverProcess
 */
export function handleMinecraftWS(connection, serverProcess) {
  connection.socket.on("message", async message => {
    if (message == "start") {
      try {
        if (serverProcess) {
          connection.socket.send(JSON.stringify({
            message: "start",
            event: "error",
            error: "Server is already running"
          }))
          return
        }

        // Spawn the process and capture output directly
        serverProcess = spawn('bash', [
          path.join(process.env.MC_SERVER_DIR, 'start-server.sh')
        ], {
          cwd: process.env.MC_SERVER_DIR
        })

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

          if (output.includes("Done") && output.includes("For help, type")) {
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

        // Handle process exit
        serverProcess.on('exit', (code, signal) => {
          serverProcess = null
          connection.socket.send(JSON.stringify({
            message: "start",
            event: "exit",
            code,
            signal
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

      } catch (err) {
        connection.socket.send(JSON.stringify({
          message: "start",
          event: "error",
          error: err.message
        }))
      }
    }

    if (message == "stop") {
      if (!serverProcess) {
        connection.socket.send(JSON.stringify({
          message: "stop",
          event: "error",
          error: "Server is not running"
        }))
        return
      }

      try {
        // Send "stop" command to server's stdin
        serverProcess.stdin.write("stop\n")

        // Set a timeout for forced shutdown
        const forceStopTimeout = setTimeout(() => {
          if (serverProcess) {
            serverProcess.kill('SIGTERM')
          }
        }, 30000) // 30 seconds timeout

        // Wait for process to exit
        serverProcess.once('exit', (code, signal) => {
          clearTimeout(forceStopTimeout)
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

    if (message == "status") {
      if (!process.env.MC_SERVER_DIR || !process.env.MC_SERVER_URL || !process.env.MC_SERVER_PORT) {
        connection.socket.send(JSON.stringify({
          message: "status",
          event: "error",
          error: "Server environment vars are not set properly!"
        }))
        return
      }

      try {
        const status = await pingJava(process.env.MC_SERVER_URL, {
          ping: process.env.MC_SERVER_PORT
        })
        connection.socket.send(JSON.stringify({
          message: "status",
          online: true,
          ...status
        }))
      } catch (err) {
        connection.socket.send(JSON.stringify({
          message: "status",
          online: false,
          error: err.message
        }))
      }
    }
  })
}
