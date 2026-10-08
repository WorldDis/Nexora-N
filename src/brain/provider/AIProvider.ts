import { AIPlanResponse } from '../../types';

export interface AIProvider {
  readonly providerId: string;

  generatePlan(
    systemPrompt: string,
    userQuery: string,
    availableToolsJson: string,
    currentContextState: string
  ): Promise<AIPlanResponse>;
}
