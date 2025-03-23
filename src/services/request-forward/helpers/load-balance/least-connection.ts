export class LeastConnection {
  private servers: { url: string; weight: number; connections: 0 }[];

  constructor(servers: { url: string; weight: number }[]) {
    this.servers = servers.map((server) => ({
      ...server,
      connections: 0,
    }));
  }

  public getNextServer(): string {
    return this.servers.reduce((accumalator, element) => {
      return accumalator.connections / accumalator.weight <=
        element.connections / element.weight
        ? accumalator
        : element;
    }).url;
  }

  public releaseServer(serverUrl: string) {
    const server = this.servers.find((s) => s.url === serverUrl);
    if (server) server.connections--;
  }
}
