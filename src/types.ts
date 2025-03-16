export interface IProcessHandler {
  serverHandler: IServerHandler;
  onProcessStatusCheck(eventData: EventData): void;
  onProcessSpawn(eventData: EventData): void;
  onProcessStart(eventData: EventData): void;
  onProcessStop(eventData: EventData): void;
}

export interface IServerHandler {
  online: boolean;
  game: Games;
  ws: WebSocket;
  checkServerStatus(): void;
  showServerDetails(data: EventData): void;
  clearServerDetails(): void;
  toggleServer(): void;
  handleStart(): void;
  handleStatusError(): void;
  handleOffline(): void;
  handleOnline(): void;
  handleServerError(message: string): void;
}

export type Games = 'minecraft' | 'abiotic'

// Unused for now, can be used to dynamically bootstrap game listeners
export type GamesMap = {
  [K in Games]: {
    serverHandler: IServerHandler,
    processHandler: IProcessHandler
  }
}

export type EventData = {
  message: string
  event: string
  data: string
  error: string
  success: boolean
  online: boolean
  // from minecraft server response
  players: {
    online: number
  }
  version: {
    name: string
  }
}

