
export interface FMEAPdfStrategy<T = unknown> {
  name: string;
  generate(data: T, t: (key: string) => string): Promise<Blob>;
}

export class FMEAPdfExporter {
  private strategies: Map<string, FMEAPdfStrategy> = new Map();

  registerStrategy(key: string, strategy: FMEAPdfStrategy) {
    this.strategies.set(key, strategy);
  }

  async export(key: string, data: unknown, t: (key: string) => string): Promise<Blob> {
    const strategy = this.strategies.get(key);
    if (!strategy) {
      throw new Error(`PDF Strategy '${key}' not registered.`);
    }
    return strategy.generate(data, t);
  }
}
