import { NexoraTool, RiskTier, ToolResult } from '../../types';

export class SendMessageTool implements NexoraTool {
  readonly name = 'send_message';
  readonly description = 'Sends an outgoing text message to a recipient phone number or contact.';
  readonly riskLevel = RiskTier.HIGH;

  async execute(parameters: Record<string, any>): Promise<ToolResult> {
    const recipient = parameters['recipient'] || 'Selected Contact';
    const message = parameters['message'] || 'Test Message';
    return {
      success: true,
      message: `Message sent to ${recipient}: "${message}"`,
    };
  }
}

export class ModifySettingTool implements NexoraTool {
  readonly name = 'modify_system_setting';
  readonly description = 'Changes system-level preferences such as network configuration or location.';
  readonly riskLevel = RiskTier.MEDIUM;

  async execute(parameters: Record<string, any>): Promise<ToolResult> {
    const settingKey = parameters['setting'] || 'airplane_mode';
    const value = parameters['value'] ?? 'enabled';
    return {
      success: true,
      message: `System setting '${settingKey}' updated to '${value}'`,
    };
  }
}

export class ClearAppDataTool implements NexoraTool {
  readonly name = 'clear_app_data';
  readonly description = 'Irreversibly deletes application storage and caches.';
  readonly riskLevel = RiskTier.CRITICAL;

  async execute(parameters: Record<string, any>): Promise<ToolResult> {
    const targetApp = parameters['packageName'] || 'all';
    return {
      success: true,
      message: `Cleared application data for ${targetApp}`,
    };
  }
}
