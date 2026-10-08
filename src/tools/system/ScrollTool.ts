import { NexoraTool, RiskTier, ToolResult } from '../../types';
import { deviceManager } from '../../simulator/DeviceContext';

export class ScrollTool implements NexoraTool {
  readonly name = 'scroll_screen';
  readonly description = 'Scrolls the current screen directionally (FORWARD/BACKWARD).';
  readonly riskLevel = RiskTier.LOW;

  async execute(parameters: Record<string, any>): Promise<ToolResult> {
    const rawDir = (parameters['direction'] as string | undefined)?.toUpperCase() || 'FORWARD';
    const direction = (rawDir === 'FORWARD' || rawDir === 'DOWN') ? 'FORWARD' : 'BACKWARD';

    const screenState = deviceManager.getScreenState();
    if (!screenState) {
      return { success: false, message: 'Accessibility device environment is not ready.' };
    }

    const success = screenState.scrollElement(direction);
    if (success) {
      return {
        success: true,
        message: `Successfully scrolled screen: ${direction}`,
      };
    } else {
      // Fallback try scroll the virtual screen container
      const container = screenState.screenRef || document.getElementById('nexora-virtual-screen');
      if (container) {
        const delta = direction === 'FORWARD' ? 260 : -260;
        container.scrollBy({ top: delta, behavior: 'smooth' });
        return {
          success: true,
          message: `Successfully scrolled screen: ${direction}`,
        };
      }
      return { success: false, message: 'Failed to perform scroll action.' };
    }
  }
}
