export type Games = 'minecraft' | 'abiotic';

export interface EventData {
  message: string;
  event?: string;
  success?: boolean;
  online?: boolean;
  error?: string;
  data?: string;
  version?: {
    name: string;
  };
  players?: {
    online: number;
  };
}

export interface GameState {
  online: boolean;
  statusText: string;
  isLoading: boolean;
  buttonDisabled: boolean;
  showDetails?: boolean;
  version?: {
    name: string;
  } | null;
  players?: {
    online: number;
  } | null;
  logs?: string[];
  error?: string | null;
}

export interface LinkData {
  label: string;
  name: string;
  url: string;
}
