import { NexoraEvent } from '../../types';

type EventListener = (event: NexoraEvent) => void;

class EventBus {
  private listeners: Set<EventListener> = new Set();
  private eventHistory: NexoraEvent[] = [];

  subscribe(listener: EventListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  emit(event: NexoraEvent): void {
    this.eventHistory.push(event);
    if (this.eventHistory.length > 200) {
      this.eventHistory.shift();
    }
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (err) {
        console.error('Error in NexoraEventBus listener:', err);
      }
    });
  }

  async publish(event: NexoraEvent): Promise<void> {
    this.emit(event);
  }

  getHistory(): readonly NexoraEvent[] {
    return this.eventHistory;
  }

  clearHistory(): void {
    this.eventHistory = [];
  }
}

export const NexoraEventBus = new EventBus();
