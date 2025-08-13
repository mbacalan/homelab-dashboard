import { minecraftState, abioticState } from '../stores/stores.ts';
import type { Games, GameState, EventData } from '../types.js';
import type { Writable } from 'svelte/store';

export class MessageHandler {
  private readonly successRegex = /^(\[\d{2}:\d{2}:\d{2} INFO\]: Done \(\d+\.\d+s\)! For help, type "help"|Game server started successfully)\n$/;

  handleConnectionError(game: Games): void {
    const state = this.getStateStore(game);
    state.update(s => ({
      ...s,
      isLoading: false,
      statusText: "❌ Error checking server status",
      buttonDisabled: false,
      online: false,
      showDetails: false
    }));
  }

  handleMessage(game: Games, eventData: EventData): void {
    if (game === 'minecraft') {
      this.handleMinecraftMessage(eventData);
    } else {
      this.handleAbioticMessage(eventData);
    }
  }

  private handleMinecraftMessage(eventData: EventData): void {
    if (eventData.message === "start" && eventData.event === "spawn") {
      this.handleProcessSpawn('minecraft', eventData);
    } else if (eventData.message === "start" && eventData.event === "error") {
      this.handleProcessSpawnError('minecraft', eventData)
    } else if (eventData.message === "start" && eventData.event === "data") {
      this.handleProcessData('minecraft', eventData);
    } else if (eventData.message === "stop" || eventData.event === "exit") {
      this.handleProcessStop('minecraft', eventData);
    } else if (eventData.message === "status") {
      this.handleStatusCheck('minecraft', eventData);
    }
  }

  private handleAbioticMessage(eventData: EventData): void {
    if (eventData.message === "start" && eventData.event === "spawn") {
      this.handleProcessSpawn('abiotic', eventData);
    } else if (eventData.message === "start" && eventData.event === "error") {
      this.handleProcessSpawnError('abiotic', eventData)
    } else if (eventData.message === "start" && eventData.event === "data") {
      this.handleProcessData('abiotic', eventData);
    } else if (eventData.message === "stop") {
      this.handleProcessStop('abiotic', eventData);
    } else if (eventData.message === "status") {
      this.handleStatusCheck('abiotic', eventData);
    }
  }

  private handleProcessSpawn(game: Games, eventData: EventData): void {
    const state = this.getStateStore(game);

    if (eventData.success) {
      state.update(s => ({
        ...s,
        isLoading: true,
        statusText: "Starting server...",
        buttonDisabled: true,
        online: false,
        showDetails: game === 'minecraft' ? false : s.showDetails,
        logs: game === 'minecraft' ? [] : s.logs
      }));
    } else {
      state.update(s => ({
        ...s,
        isLoading: false,
        statusText: "❌ Error checking server status",
        buttonDisabled: false,
        online: false
      }));
    }
  }

  private handleProcessSpawnError(game: Games, eventData: EventData): void {
    const state = this.getStateStore(game);

    state.update((state) => ({
      ...state,
      isLoading: false,
      statusText: "❌ Error checking server status",
      error: eventData.error,
      buttonDisabled: false,
      online: false,
    }));

  }

  private handleProcessData(game: Games, eventData: EventData): void {
    if (game === 'minecraft' && eventData.data) {
      minecraftState.update(state => {
        const newLogs = [...(state.logs || []), eventData.data!];
        const isSuccess = this.successRegex.test(eventData.data!);

        return {
          ...state,
          showDetails: true,
          logs: newLogs,
          ...(isSuccess && {
            online: true,
            isLoading: false,
            statusText: "🟢 Server is running",
            buttonDisabled: false
          })
        };
      });
    } else if (eventData.data && this.successRegex.test(eventData.data)) {
      abioticState.update(state => ({
        ...state,
        online: true,
        isLoading: false,
        statusText: "🟢 Server is running",
        buttonDisabled: false
      }));
    }
  }

  private handleProcessStop(game: Games, eventData: EventData): void {
    const state = this.getStateStore(game);

    if (eventData.success) {
      state.update(s => ({
        ...s,
        online: false,
        isLoading: false,
        statusText: "🔴 Server is not running",
        buttonDisabled: false,
        showDetails: false,
        version: null,
        players: null,
        logs: []
      }));
    } else {
      state.update(s => ({
        ...s,
        isLoading: false,
        statusText: eventData?.error ? `❌ ${eventData.error}` : "❌ An error occurred on server!",
        buttonDisabled: false,
        online: false,
        showDetails: false
      }));
    }
  }

  private handleStatusCheck(game: Games, eventData: EventData): void {
    const state = this.getStateStore(game);

    if (eventData.event === "error") {
      state.update(s => ({
        ...s,
        isLoading: false,
        statusText: eventData?.error ? `❌ ${eventData.error}` : "❌ Error checking server status",
        buttonDisabled: false,
        online: false
      }));
      return;
    }

    if (eventData.online) {
      const updateData: Partial<GameState> = {
        online: true,
        isLoading: false,
        statusText: "🟢 Server is running",
        buttonDisabled: false
      };

      if (game === 'minecraft') {
        updateData.version = eventData.version || null;
        updateData.players = eventData.players || null;
      }

      state.update(s => ({ ...s, ...updateData }));
    } else {
      state.update(s => ({
        ...s,
        online: false,
        isLoading: false,
        statusText: "🔴 Server is not running",
        buttonDisabled: false
      }));
    }
  }

  private getStateStore(game: Games): Writable<GameState> {
    return game === 'minecraft' ? minecraftState : abioticState;
  }
}
