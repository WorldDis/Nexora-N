import { NexoraTool } from '../types';
import { UserConfirmationCallback } from './UserConfirmationCallback';
import { NexoraEventBus } from '../core/eventbus/NexoraEventBus';

/**
 * Port of Android DenyAllConfirmation:
 * Rejects all elevated risk executions automatically.
 */
export class DenyAllConfirmation implements UserConfirmationCallback {
  async requestConfirmation(
    _tool: NexoraTool,
    _parameters: Record<string, any>,
    _explanation: string
  ): Promise<boolean> {
    NexoraEventBus.emit({
      type: 'SpeakFeedback',
      text: 'Ei kaaj-er jonno tomar confirmation lagbe, tai ami bondho korchi.',
    });
    return false;
  }
}
