import { NexoraTool, RiskTier, ToolResult } from '../../types';
import { deviceManager } from '../../simulator/DeviceContext';

export class TypeTextTool implements NexoraTool {
  readonly name = 'type_text';
  readonly description = 'Types text into a targeted focused or labeled input field.';
  readonly riskLevel = RiskTier.LOW;

  async execute(parameters: Record<string, any>): Promise<ToolResult> {
    const textToType = parameters['text'] as string | undefined;
    if (!textToType) {
      return { success: false, message: 'Missing parameter: text' };
    }
    const fieldLabel = parameters['fieldLabel'] as string | undefined;

    const screenState = deviceManager.getScreenState();
    const rootElement = screenState?.screenRef || document.getElementById('nexora-virtual-screen');
    if (!rootElement) {
      return { success: false, message: 'Active screen window not found.' };
    }

    const targetInput = this.findEditable(rootElement, fieldLabel);
    if (!targetInput) {
      return { success: false, message: 'No suitable input field found to type text.' };
    }

    screenState?.highlightElement(targetInput, `Typed: ${textToType}`);

    try {
      targetInput.focus();
      targetInput.value = textToType;

      // Dispatch standard input and change events so React/HTML handles state update
      targetInput.dispatchEvent(new Event('input', { bubbles: true }));
      targetInput.dispatchEvent(new Event('change', { bubbles: true }));

      return {
        success: true,
        message: `Successfully typed '${textToType}'`,
      };
    } catch (e: any) {
      return {
        success: false,
        message: `Failed to type text into the targeted field: ${e.message}`,
      };
    }
  }

  private findEditable(root: HTMLElement, label?: string): HTMLInputElement | HTMLTextAreaElement | null {
    const inputs = Array.from(root.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input, textarea'));
    if (inputs.length === 0) return null;

    if (label) {
      const lower = label.toLowerCase();
      const matched = inputs.find((inp) => {
        const placeholder = inp.getAttribute('placeholder')?.toLowerCase() || '';
        const name = inp.getAttribute('name')?.toLowerCase() || '';
        const ariaLabel = inp.getAttribute('aria-label')?.toLowerCase() || '';
        const id = inp.id.toLowerCase();
        return (
          placeholder.includes(lower) ||
          name.includes(lower) ||
          ariaLabel.includes(lower) ||
          id.includes(lower)
        );
      });
      if (matched) return matched;
    }

    // If focused input exists
    const focused = document.activeElement;
    if (focused && inputs.includes(focused as any)) {
      return focused as HTMLInputElement;
    }

    // Default to first available visible input
    return inputs[0] || null;
  }
}
