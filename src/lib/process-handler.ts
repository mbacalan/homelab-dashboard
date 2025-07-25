import type { EventData, IServerHandler } from "../types.ts"
import { dom } from "./dom.ts"

const successRegex = /^(\[\d{2}:\d{2}:\d{2} INFO\]: Done \(\d+\.\d+s\)! For help, type "help"|Game server started successfully)\n$/;

export class ProcessHandler {
  serverHandler: IServerHandler

  constructor(serverHandler: IServerHandler) {
    this.serverHandler = serverHandler
  }

  onProcessStatusCheck(eventData: EventData) {
    if (eventData.event == "error") {
      this.serverHandler.handleServerError(eventData?.error)
      return
    }

    if (eventData.online) {
      if (this.serverHandler.game == 'minecraft') {
        this.serverHandler.showServerDetails(eventData)
      }
      this.serverHandler.handleOnline()
      return
    }

    this.serverHandler.handleOffline()
  }

  onProcessSpawn(eventData: EventData) {
    if (eventData.success) {
      this.serverHandler.handleStart()
      return
    }

    this.serverHandler.handleStatusError()
  }

  onProcessStart(eventData: EventData) {
    const node = document.createElement("p")

    dom.minecraft.serverStatusDetails.removeAttribute("hidden")
    node.innerText = eventData.data

    if (dom.minecraft.serverStatusLogEmpty) {
      dom.minecraft.serverStatusLogEmpty.remove()
    }

    dom.minecraft.serverStatusLog.appendChild(node)
    node.scrollIntoView({ behavior: "smooth" })

    if (successRegex.test(eventData.data)) {
      this.serverHandler.handleOnline()
    }
  }

  onProcessStop(eventData: EventData) {
    if (eventData.success) {
      this.serverHandler.handleOffline()
      this.serverHandler.clearServerDetails()
    }
  }
}
