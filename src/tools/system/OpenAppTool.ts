import { NexoraTool, RiskTier, ToolResult } from '../../types';
import { deviceManager } from '../../simulator/DeviceContext';

export class OpenAppTool implements NexoraTool {
  readonly name = 'open_app';
  readonly description = 'Launches an installed application using its package name.';
  readonly riskLevel = RiskTier.LOW;

  async execute(parameters: Record<string, any>): Promise<ToolResult> {
    const packageName = parameters['packageName'] as string | undefined;
    if (!packageName) {
      return { success: false, message: 'Missing parameter: packageName' };
    }

    const screenState = deviceManager.getScreenState();
    if (!screenState) {
      return { success: false, message: 'Virtual device environment is not ready.' };
    }

    const launched = screenState.launchApp(packageName);
    if (launched) {
      return {
        success: true,
        message: `Successfully launched application: ${packageName}`,
      };
    } else {
      return {
        success: false,
        message: `Application with package name '${packageName}' not found.`,
      };
    }
  }
}
