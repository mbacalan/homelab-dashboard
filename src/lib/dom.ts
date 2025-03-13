function getElementById<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);

  if (!element) {
    throw new Error(`Missing DOM element: #${id}`);
  }

  return element as T;
}

export const dom = {
  minecraft: {
    serverStartButton: getElementById("server-start-button"),
    serverStatusButton: getElementById("server-status-button"),
    serverStatusText: getElementById("server-status-text"),
    serverStatusDetails: getElementById("server-status-details"),
    serverStatusVersion: getElementById("server-status-version"),
    serverStatusPlayers: getElementById("server-status-players"),
    serverStatusLog: getElementById("server-status-log"),
    serverStatusLogEmpty: getElementById("server-status-log-empty"),
  },
  abiotic: {
    serverStartButton: getElementById("server-start-button-abiotic"),
    serverStatusButton: getElementById("server-status-button-abiotic"),
    serverStatusText: getElementById("server-status-text-abiotic"),
  }
}

