import type { EventData } from "./types.ts";
import { dom } from "./lib/dom.ts";
import { ServerHandler } from "./lib/server-handler.ts";
import { ProcessHandler } from "./lib/process-handler.ts";

const minecraftWs = new WebSocket(`wss://${import.meta.env.VITE_API_URL}/minecraft`);
const abioticWS = new WebSocket(`wss://${import.meta.env.VITE_API_URL}/abiotic`);

const minecraftServerHandler = new ServerHandler('minecraft', minecraftWs)
const abioticServerHandler = new ServerHandler('abiotic', abioticWS)

const minecraftProcessHandler = new ProcessHandler(minecraftServerHandler)
const abioticProcessHandler = new ProcessHandler(abioticServerHandler)

minecraftWs.onopen = () => {
  minecraftServerHandler.checkServerStatus()
};

minecraftWs.onclose = () => {
  minecraftServerHandler.handleStatusError()
}

abioticWS.onopen = () => {
  abioticServerHandler.checkServerStatus()
};

abioticWS.onclose = () => {
  abioticServerHandler.handleStatusError()
}

window.onload = async () => {
  dom.minecraft.serverStatusButton.addEventListener("click", () => minecraftServerHandler.checkServerStatus())
  dom.minecraft.serverStartButton.addEventListener("click", () => minecraftServerHandler.toggleServer())

  minecraftWs.onmessage = (event) => {
    const eventData: EventData = JSON.parse(event.data)

    if (eventData.message == "start" && eventData.event == "spawn") {
      minecraftProcessHandler.onProcessSpawn(eventData)
    }

    if (eventData.message == "start" && eventData.event == "data") {
      minecraftProcessHandler.onProcessStart(eventData)
    }

    if (eventData.message == "stop") {
      minecraftProcessHandler.onProcessStop(eventData)
    }

    if (eventData.message == "status") {
      minecraftProcessHandler.onProcessStatusCheck(eventData)
    }
  };

  dom.abiotic.serverStatusButton.addEventListener("click", () => abioticServerHandler.checkServerStatus())
  dom.abiotic.serverStartButton.addEventListener("click", () => abioticServerHandler.toggleServer())

  abioticWS.onmessage = (event) => {
    const eventData: EventData = JSON.parse(event.data)

    if (eventData.message == "start" && eventData.event == "spawn") {
      abioticProcessHandler.onProcessSpawn(eventData)
    }

    if (eventData.message == "start" && eventData.event == "data") {
      abioticProcessHandler.onProcessStart(eventData)
    }

    if (eventData.message == "stop") {
      abioticProcessHandler.onProcessStop(eventData)
    }

    if (eventData.message == "status") {
      abioticProcessHandler.onProcessStatusCheck(eventData)
    }
  };
}
