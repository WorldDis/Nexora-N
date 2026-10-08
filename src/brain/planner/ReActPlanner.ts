import { AIProvider } from '../provider/AIProvider';
import { PlannerResponse } from '../../types';

export class ReActPlanner {
  constructor(private provider: AIProvider) {}

  setProvider(provider: AIProvider): void {
    this.provider = provider;
  }

  getProvider(): AIProvider {
    return this.provider;
  }

  async planNextStep(
    userQuery: string,
    availableToolsJson: string,
    screenContext: string,
    history: string[]
  ): Promise<PlannerResponse> {
    let context = 'Screen elements:\n' + screenContext + '\n';
    if (history.length > 0) {
      context += 'Steps already done:\n';
      history.forEach((h) => {
        context += `- ${h}\n`;
      });
    }

    const plan = await this.provider.generatePlan(
      ReActPlanner.SYSTEM_PROMPT,
      userQuery,
      availableToolsJson,
      context
    );

    return {
      reasoning: plan.reasoning,
      selectedTool: plan.selectedTool,
      toolParameters: plan.toolParameters || {},
      finalResponseToUser: plan.finalResponseToUser,
      isTaskComplete: plan.isTaskComplete,
    };
  }

  static readonly SYSTEM_PROMPT = `
You are NEXORA, a voice-controlled accessibility agent.
Each turn you get the user's goal, the list of tools, the current screen elements and the steps already done.
Pick at most ONE tool per turn. Use only tool names from the tool list.
For click_element and type_text, use text that appears exactly in the screen elements.
When the goal is finished, set isTaskComplete to true, selectedTool to null and give a short finalResponseToUser.
Reply to the user in the same language they used (Bengali or English).
`.trim();
}
