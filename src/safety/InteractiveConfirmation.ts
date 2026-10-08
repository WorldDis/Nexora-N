import { NexoraTool, RiskTier } from '../types';
import { UserConfirmationCallback } from './UserConfirmationCallback';

export interface PendingConfirmationRequest {
  id: string;
  tool: NexoraTool;
  parameters: Record<string, any>;
  explanation: string;
  resolve: (allowed: boolean) => void;
}

export class InteractiveConfirmation implements UserConfirmationCallback {
  private currentRequest: PendingConfirmationRequest | null = null;
  private listeners: ((req: PendingConfirmationRequest | null) => void)[] = [];

  requestConfirmation(
    tool: NexoraTool,
    parameters: Record<string, any>,
    explanation: string
  ): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.currentRequest = {
        id: Math.random().toString(36).substring(7),
        tool,
        parameters,
        explanation,
        resolve: (allowed: boolean) => {
          this.currentRequest = null;
          this.notify();
          resolve(allowed);
        },
      };
      this.notify();
    });
  }

  getCurrentRequest(): PendingConfirmationRequest | null {
    return this.currentRequest;
  }

  respond(allowed: boolean): void {
    if (this.currentRequest) {
      this.currentRequest.resolve(allowed);
    }
  }

  subscribe(fn: (req: PendingConfirmationRequest | null) => void): () => void {
    this.listeners.push(fn);
    fn(this.currentRequest);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }

  private notify(): void {
    this.listeners.forEach((fn) => fn(this.currentRequest));
  }
}

export const interactiveConfirmation = new InteractiveConfirmation();
