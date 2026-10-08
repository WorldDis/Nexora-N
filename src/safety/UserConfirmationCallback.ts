import { NexoraTool } from '../types';

export interface UserConfirmationCallback {
  requestConfirmation(
    tool: NexoraTool,
    parameters: Record<string, any>,
    explanation: string
  ): Promise<boolean>;
}
