class DataStore {
  private static instance: DataStore;
  private data: Map<string, any> = new Map();

  private constructor() {}

  public static getInstance(): DataStore {
    if (!DataStore.instance) {
      DataStore.instance = new DataStore();
    }
    return DataStore.instance;
  }

  public set(key: string, value: any): void {
    this.data.set(key, value);
  }

  public get(key: string): any {
    return this.data.get(key);
  }
}

export default DataStore.getInstance()
