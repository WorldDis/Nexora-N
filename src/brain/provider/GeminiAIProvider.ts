import { AIPlanResponse } from '../../types';
import { AIProvider } from './AIProvider';

export class GeminiAIProvider implements AIProvider {
  readonly providerId: string;
  private model: string;

  constructor(model: string = 'gemini-3.8-flash') {
    this.model = model;
    this.providerId = `GEMINI_${this.model.toUpperCase()}`;
  }

  async generatePlan(
    systemPrompt: string,
    userQuery: string,
    availableToolsJson: string,
    currentContextState: string
  ): Promise<AIPlanResponse> {
    try {
      const response = await fetch('/api/plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          systemPrompt,
          userQuery,
          availableToolsJson,
          currentContextState,
          model: this.model,
        }),
      });

      if (!response.ok) {
        return {
          reasoning: `HTTP ${response.status}`,
          selectedTool: null,
          toolParameters: null,
          isTaskComplete: true,
          finalResponseToUser: 'AI service-e somossa hocche.',
        };
      }

      const data = await response.json();
      return {
        reasoning: data.reasoning || '',
        selectedTool: data.selectedTool || null,
        toolParameters: data.toolParameters || {},
        isTaskComplete: Boolean(data.isTaskComplete),
        finalResponseToUser: data.finalResponseToUser || null,
      };
    } catch (e: any) {
      return {
        reasoning: `Network error: ${e.message}`,
        selectedTool: null,
        toolParameters: null,
        isTaskComplete: true,
        finalResponseToUser: 'Internet connection check koro.',
      };
    }
  }
}
