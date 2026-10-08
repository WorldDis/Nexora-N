export interface VirtualScreenState {
  activeAppPackage: string;
  appName: string;
  screenRef: HTMLElement | null;
  launchApp: (packageName: string) => boolean;
  highlightElement: (element: HTMLElement | null, label?: string) => void;
  scrollElement: (direction: 'FORWARD' | 'BACKWARD') => boolean;
}

class DeviceManager {
  private state: VirtualScreenState | null = null;
  private listeners: (() => void)[] = [];

  setScreenState(state: VirtualScreenState): void {
    this.state = state;
    this.notify();
  }

  getScreenState(): VirtualScreenState | null {
    return this.state;
  }

  subscribe(fn: () => void): () => void {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }

  private notify(): void {
    this.listeners.forEach((fn) => fn());
  }
}

export const deviceManager = new DeviceManager();
