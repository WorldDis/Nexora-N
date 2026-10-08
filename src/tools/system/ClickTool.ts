import { NexoraTool, RiskTier, ToolResult } from '../../types';
import { UiNodeParser } from '../../accessibility/UiNodeParser';
import { deviceManager } from '../../simulator/DeviceContext';

export class ClickTool implements NexoraTool {
  readonly name = 'click_element';
  readonly description = 'Clicks on a UI element specified by its text or content description.';
  readonly riskLevel = RiskTier.LOW;

  private nodeParser = new UiNodeParser();

  async execute(parameters: Record<string, any>): Promise<ToolResult> {
    const targetText = parameters['targetText'] as string | undefined;
    if (!targetText) {
      return { success: false, message: 'Missing parameter: targetText' };
    }

    const screenState = deviceManager.getScreenState();
    const rootElement = screenState?.screenRef || document.getElementById('nexora-virtual-screen');
    if (!rootElement) {
      return { success: false, message: 'Active screen window not found.' };
    }

    const targetNode = this.nodeParser.findNodeByText(rootElement, targetText);
    if (!targetNode) {
      return {
        success: false,
        message: `Element containing text '${targetText}' not found on screen.`,
      };
    }

    // Visual accessibility highlight
    screenState?.highlightElement(targetNode, `Clicked: ${targetText}`);

    // Perform click action
    try {
      targetNode.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      targetNode.click();
      return { success: true, message: `Clicked on element: '${targetText}'` };
    } catch (e: any) {
      return {
        success: false,
        message: `Failed to perform click action on: '${targetText}' (${e.message})`,
      };
    }
  }
}
