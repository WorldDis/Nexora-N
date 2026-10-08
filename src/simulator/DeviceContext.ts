export interface VirtualScreenState {
  activeAppPackage: string;
  appName: string;
  screenRef: HTMLElement | null;
  launchApp: (packageName: string) => boolean;
  highlightElement: (element: HTMLElement | null, label?: string) => void;
  scrollElement: (direction: 'FORWARD' | 'BACKWARD') => boolean;
  answerCall?: () => void;
  cutCall?: () => void;
  placeCall?: (target: string) => void;
  createItem?: (type: string, content: string) => void;
  modifyItem?: (target: string, content: string) => void;
  deleteItem?: (target: string) => void;
  arrangeItems?: (sortBy: string) => void;
  performSearch?: (query: string) => void;
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
