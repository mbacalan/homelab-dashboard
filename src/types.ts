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
