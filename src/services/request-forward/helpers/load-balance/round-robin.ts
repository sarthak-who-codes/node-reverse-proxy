export class RoundRobin {
  private servers: { url: string; weight: number }[];
  private currentIndex: number;
  private currentWeight: number;
  private maxWeight: number;
  private gcdWeight: number;
  private totalServers: number;

  constructor(servers: { url: string; weight: number }[]) {
    this.servers = servers;
    this.currentIndex = -1;
    this.currentWeight = 0;
    this.maxWeight = Math.max(...servers.map((server) => server.weight));
    this.gcdWeight = this.getGCDWeight(servers.map((server) => server.weight));
    this.totalServers = servers.length;

    if (this.maxWeight === 0) {
      throw new Error("All servers have zero weight.");
    }
  }

  private getGCDWeight(weights: number[]): number {
    const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

    //As there is no initial value, accumalator starts with the first element of array and elementValue with the second
    return weights.reduce((accumalator, elementValue) =>
      gcd(accumalator, elementValue)
    );
  }

  public getNextServer(): string | null {
    while (true) {
      this.currentIndex = (this.currentIndex + 1) % this.totalServers;

      if (this.currentIndex === 0) {
        this.currentWeight -= this.gcdWeight;

        if (this.currentWeight <= 0) {
          this.currentWeight = this.maxWeight;

          if (this.currentWeight === 0) return null;
        }
      }

      if (this.servers[this.currentIndex].weight >= this.currentWeight) {
        return this.servers[this.currentIndex].url;
      }
    }
  }
}
