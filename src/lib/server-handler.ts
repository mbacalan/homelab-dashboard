import { dom } from "./dom.ts"

export class ServerStatusHandler {
  online: boolean

  constructor() {
    this.online = false
  }

  handleStart() {
    dom.serverStatusText.setAttribute("aria-busy", "true")
    dom.serverStatusText.innerText = "Starting server..."
    dom.serverStartButton.innerText = "Start Server"
    this._disableServerStartButton();
    this._hideServerStatusDetails();
    this.online = false
  }

  handleStatusError() {
    dom.serverStatusText.setAttribute("aria-busy", "false")
    dom.serverStatusText.innerText = "❌ Error checking server status"
    dom.serverStartButton.innerText = "Start Server"
    this._hideServerStatusDetails();
    this._disableServerStartButton();
    this.online = false
  }

  handleOffline() {
    dom.serverStatusText.setAttribute("aria-busy", "false")
    dom.serverStatusText.innerText = "🔴 Server is not running"
    dom.serverStartButton.innerText = "Start Server"
    this._hideServerStatusDetails();
    this._enableServerStartButton();
    this.online = false
  }

  handleOnline() {
    dom.serverStatusText.setAttribute("aria-busy", "false")
    dom.serverStatusText.innerText = "🟢 Server is running"
    dom.serverStartButton.innerText = "Stop Server"
    this._enableServerStartButton();
    this.online = true
  }

  handleServerError(message: string) {
    dom.serverStatusText.setAttribute("aria-busy", "false")
    dom.serverStatusText.innerText = message ? `❌ ${message}` : "❌ An error occured on server!"
    dom.serverStartButton.innerText = "Start Server"
    this._hideServerStatusDetails();
    this._disableServerStartButton();
    this.online = false
  }

  _hideServerStatusDetails() {
    dom.serverStatusDetails.setAttribute("hidden", "true")
  }

  _disableServerStartButton() {
    dom.serverStartButton.setAttribute("disabled", "true")
  }

  _enableServerStartButton() {
    dom.serverStartButton.removeAttribute("disabled")
  }
}

