import { writable, type Writable } from 'svelte/store';
import type { GameState } from '../types.js';

export const minecraftState: Writable<GameState> = writable({
  online: false,
  statusText: 'Checking server status...',
  isLoading: true,
  buttonDisabled: false,
  showDetails: false,
  version: null,
  players: null,
  logs: [],
  error: null
});

export const abioticState: Writable<GameState> = writable({
  online: false,
  statusText: 'Checking server status...',
  isLoading: true,
  buttonDisabled: false,
  error: null
});
