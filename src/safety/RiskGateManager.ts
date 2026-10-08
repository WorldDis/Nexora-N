import { NexoraTool, RiskTier } from '../types';
import { UserConfirmationCallback } from './UserConfirmationCallback';

export class RiskGateManager {
  constructor(private confirmationCallback: UserConfirmationCallback) {}

  setConfirmationCallback(callback: UserConfirmationCallback): void {
    this.confirmationCallback = callback;
  }

  getConfirmationCallback(): UserConfirmationCallback {
    return this.confirmationCallback;
  }

  /**
   * Evaluates risk level prior to executing a tool.
   * LOW passes freely; MEDIUM, HIGH, and CRITICAL require authorization.
   */
  async evaluateAndCanExecute(
    tool: NexoraTool,
    parameters: Record<string, any>
  ): Promise<boolean> {
    switch (tool.riskLevel) {
      case RiskTier.LOW:
        return true;
      case RiskTier.MEDIUM:
      case RiskTier.HIGH:
      case RiskTier.CRITICAL: {
        const explanation = `Tool '${tool.name}' requires authorization due to elevated risk tier (${tool.riskLevel}).`;
        return await this.confirmationCallback.requestConfirmation(tool, parameters, explanation);
      }
    }
  }
}
