import { request } from 'http';

/**
 * @param {string} containerName
 * @returns {Promise<Object.<string, string>>}
 */
export function getContainerStatus(containerName) {
  return new Promise((resolve, reject) => {
    const options = {
      socketPath: '/var/run/docker.sock',
      path: `/containers/${containerName}/json`,
      method: 'GET'
    };

    const req = request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const containerInfo = JSON.parse(data);
            resolve({
              name: containerInfo.Name.replace(/^\//, ''),
              id: containerInfo.Id,
              status: containerInfo.State.Status,
              running: containerInfo.State.Running,
              started: containerInfo.State.StartedAt,
              health: containerInfo.State.Health?.Status || 'N/A',
              exitCode: containerInfo.State.ExitCode
            });
          } catch (error) {
            reject(new Error(`Failed to parse Docker API response: ${error.message}`));
          }
        } else {
          reject(new Error(`Docker API returned status code ${res.statusCode}: ${res.statusMessage}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error(`Docker API request failed: ${error.message}`));
    });

    req.end();
  });
}
