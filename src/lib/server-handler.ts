import type { EventData, Games, IServerHandler } from "../types.ts"
import { dom } from "./dom.ts"

export class ServerHandler implements IServerHandler {
  online: boolean
  game: Games
  ws: WebSocket

  constructor(game: Games, ws: WebSocket) {
    this.online = false
    this.game = game
    this.ws = ws
  }

  checkServerStatus() {
    dom[this.game].serverStatusText.innerText = "Checking server status..."
    dom[this.game].serverStatusText.setAttribute("aria-busy", "true")

    this.ws.send("status")
  }

  showServerDetails(data: EventData) {
    if (this.game == 'minecraft') {
      dom.minecraft.serverStatusDetails.removeAttribute("hidden")
      dom.minecraft.serverStatusVersion.innerHTML = `<p>Version: ${data.version.name || "-"}</p>`
      dom.minecraft.serverStatusPlayers.innerHTML = `<p>Online: ${data.players.online || "0"}</p>`
    }
  }

  clearServerDetails() {
    if (this.game == 'minecraft') {
      dom.minecraft.serverStatusDetails.setAttribute("hidden", "true")
      dom.minecraft.serverStatusVersion.innerHTML = ""
      dom.minecraft.serverStatusPlayers.innerHTML = ""

      while (dom.minecraft.serverStatusLog.firstChild) {
        dom.minecraft.serverStatusLog.removeChild(dom.minecraft.serverStatusLog.firstChild)
      }
    }
  }

  toggleServer() {
    if (this.ws.readyState != this.ws.OPEN) {
      dom[this.game].serverStatusText.innerText = "WS connection failed, refresh and try again"
    }

    if (!this.online) {
      dom[this.game].serverStatusButton.setAttribute("disabled", "true")
      dom[this.game].serverStatusText.innerText = "Starting server..."
      dom[this.game].serverStatusText.setAttribute("aria-busy", "true")
      this.ws.send("start")
    }

    if (this.online) {
      dom[this.game].serverStatusButton.setAttribute("disabled", "true")
      dom[this.game].serverStatusText.innerText = "Stopping server..."
      dom[this.game].serverStatusText.setAttribute("aria-busy", "true")
      this.ws.send("stop")
    }
  }

  handleStart() {
    dom[this.game].serverStatusText.setAttribute("aria-busy", "true")
    dom[this.game].serverStatusText.innerText = "Starting server..."
    dom[this.game].serverStatusButton.setAttribute("disabled", "true")
    dom[this.game].serverStartButton.innerText = "Start Server"
    this._disableServerStartButton();
    this._hideServerStatusDetails();
    this.online = false
  }

  handleStatusError() {
    dom[this.game].serverStatusText.setAttribute("aria-busy", "false")
    dom[this.game].serverStatusText.innerText = "❌ Error checking server status"
    dom[this.game].serverStatusButton.removeAttribute("disabled")
    dom[this.game].serverStartButton.innerText = "Start Server"
    this._disableServerStartButton();
    this._hideServerStatusDetails();
    this.online = false
  }

  handleOffline() {
    dom[this.game].serverStatusText.setAttribute("aria-busy", "false")
    dom[this.game].serverStatusText.innerText = "🔴 Server is not running"
    dom[this.game].serverStatusButton.removeAttribute("disabled")
    dom[this.game].serverStartButton.innerText = "Start Server"
    this._enableServerStartButton();
    this._hideServerStatusDetails();
    this.online = false
  }

  handleOnline() {
    dom[this.game].serverStatusText.setAttribute("aria-busy", "false")
    dom[this.game].serverStatusText.innerText = "🟢 Server is running"
    dom[this.game].serverStatusButton.removeAttribute("disabled")
    dom[this.game].serverStartButton.innerText = "Stop Server"
    this._enableServerStartButton();
    this.online = true
  }

  handleServerError(message: string) {
    dom[this.game].serverStatusText.setAttribute("aria-busy", "false")
    dom[this.game].serverStatusText.innerText = message ? `❌ ${message}` : "❌ An error occured on server!"
    dom[this.game].serverStatusButton.removeAttribute("disabled")
    dom[this.game].serverStartButton.innerText = "Start Server"
    this._disableServerStartButton();
    this._hideServerStatusDetails();
    this.online = false
  }

  _hideServerStatusDetails() {
    if (this.game == 'minecraft') {
      dom[this.game].serverStatusDetails.setAttribute("hidden", "true")
    }
  }

  _disableServerStartButton() {
    dom[this.game].serverStartButton.setAttribute("disabled", "true")
  }

  _enableServerStartButton() {
    dom[this.game].serverStartButton.removeAttribute("disabled")
  }
}

