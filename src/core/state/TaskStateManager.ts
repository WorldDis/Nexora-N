import { TaskState } from '../../types';
import { NexoraEventBus } from '../eventbus/NexoraEventBus';

export class TaskStateManager {
  private currentState: TaskState = TaskState.IDLE;
  private stateChangeListeners: ((state: TaskState) => void)[] = [];

  transitionTo(state: TaskState): void {
    const old = this.currentState;
    if (old === state) return;
    this.currentState = state;
    NexoraEventBus.emit({
      type: 'StateChanged',
      oldState: old,
      newState: state,
    });
    this.stateChangeListeners.forEach((fn) => fn(state));
  }

  getCurrentState(): TaskState {
    return this.currentState;
  }

  reset(): void {
    this.transitionTo(TaskState.IDLE);
  }

  onStateChange(fn: (state: TaskState) => void): () => void {
    this.stateChangeListeners.push(fn);
    return () => {
      this.stateChangeListeners = this.stateChangeListeners.filter((l) => l !== fn);
    };
  }
}
