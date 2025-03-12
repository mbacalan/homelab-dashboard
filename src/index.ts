import type { EventData } from "./types";

function getElementById<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);

  if (!element) {
    throw new Error(`Missing DOM element: #${id}`);
  }

  return element as T;
}

const dom = {
  serverStartButton: getElementById("server-start-button"),
  abioticStartButton: getElementById("server-start-button-abiotic"),
  serverStatusButton: getElementById("server-status-button"),
  serverStatusText: getElementById("server-status-text"),
  abioticServerStatusText: getElementById("server-status-text-abiotic"),
  serverStatusDetails: getElementById("server-status-details"),
  serverStatusVersion: getElementById("server-status-version"),
  serverStatusPlayers: getElementById("server-status-players"),
  serverStatusLog: getElementById("server-status-log"),
  serverStatusLogEmpty: getElementById("server-status-log-empty"),
}

const serverUpRegex = /^\[\d{2}:\d{2}:\d{2} INFO\]: Done \(\d+\.\d+s\)! For help, type "help"\n$/;

const ws = new WebSocket(`wss://${import.meta.env.VITE_API_URL}`);
const abioticWS = new WebSocket(`wss://${import.meta.env.VITE_API_URL}/abiotic`);

ws.onopen = () => {
  checkServerStatus()
};

ws.onclose = () => {
  serverStatusHandler.handleStatusError()
}

window.onload = async () => {
  dom.serverStatusButton.addEventListener("click", checkServerStatus)
  dom.serverStartButton.addEventListener("click", toggleServer)

  dom.abioticStartButton.addEventListener("click", toggleServerAbiotic)

  ws.onmessage = (event) => {
    const eventData: EventData = JSON.parse(event.data)

    if (eventData.message == "start" && eventData.event == "spawn") {
      onProcessSpawn(eventData)
    }

    if (eventData.message == "start" && eventData.event == "data") {
      onProcessStart(eventData)
    }

    if (eventData.message == "stop") {
      onProcessStop(eventData)
    }

    if (eventData.message == "status") {
      onProcessStatusCheck(eventData)
    }
  };
}

class ServerStatusHandler {
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

const serverStatusHandler = new ServerStatusHandler()

function checkServerStatus() {
  dom.serverStatusText.innerText = "Checking server status..."
  dom.serverStatusText.setAttribute("aria-busy", "true")

  ws.send("status")
}

function onProcessStatusCheck(eventData: EventData) {
  if (eventData.event == "error") {
    serverStatusHandler.handleServerError(eventData?.error)
    return
  }

  if (eventData.online) {
    showServerDetails(eventData)
    serverStatusHandler.handleOnline()
    return
  }

  serverStatusHandler.handleOffline()
}

function onProcessSpawn(eventData: EventData) {
  if (eventData.success) {
    serverStatusHandler.handleStart()
    return
  }

  serverStatusHandler.handleStatusError()
}

function onProcessStart(eventData: EventData) {
  const node = document.createElement("p")

  dom.serverStatusDetails.removeAttribute("hidden")
  node.innerText = eventData.data

  if (dom.serverStatusLogEmpty) {
    dom.serverStatusLogEmpty.remove()
  }

  dom.serverStatusLog.appendChild(node)
  node.scrollIntoView({ behavior: "smooth" })

  if (serverUpRegex.test(eventData.data)) {
    serverStatusHandler.handleOnline()
  }
}

function onProcessStop(eventData: EventData) {
  if (eventData.success) {
    serverStatusHandler.handleOffline()
    clearServerDetails()
  }
}

function showServerDetails(data: EventData) {
  dom.serverStatusDetails.removeAttribute("hidden")
  dom.serverStatusVersion.innerHTML = `<p>Version: ${data.version.name || "-"}</p>`
  dom.serverStatusPlayers.innerHTML = `<p>Online: ${data.players.online || "0"}</p>`
}

function clearServerDetails() {
  dom.serverStatusDetails.setAttribute("hidden", "true")
  dom.serverStatusVersion.innerHTML = ""
  dom.serverStatusPlayers.innerHTML = ""

  while (dom.serverStatusLog.firstChild) {
    dom.serverStatusLog.removeChild(dom.serverStatusLog.firstChild)
  }
}

function toggleServer() {
  if (ws.readyState != ws.OPEN) {
    dom.serverStatusText.innerText = "WS connection failed, refresh and try again"
  }

  if (!serverStatusHandler.online) {
    dom.serverStatusText.innerText = "Starting server..."
    dom.serverStatusText.setAttribute("aria-busy", "true")
    ws.send("start")
  }

  if (serverStatusHandler.online) {
    dom.serverStatusText.innerText = "Stopping server..."
    dom.serverStatusText.setAttribute("aria-busy", "true")
    ws.send("stop")
  }
}

function toggleServerAbiotic() {
  if (ws.readyState != ws.OPEN) {
    dom.serverStatusText.innerText = "WS connection failed, refresh and try again"
  }

  abioticWS.send("start")
}
