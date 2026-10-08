import { UiNodeParser } from '../../accessibility/UiNodeParser';

export class VerificationEngine {
  private nodeParser = new UiNodeParser();

  /**
   * Checks whether the active screen or root element contains expected text after an action.
   */
  verifyScreenContainsText(rootElement: HTMLElement | null, expectedText: string): boolean {
    if (!rootElement) return false;
    const node = this.nodeParser.findNodeByText(rootElement, expectedText);
    return node !== null;
  }

  /**
   * Verifies if screen state has changed by comparing node counts.
   */
  verifyStateChanged(previousNodeCount: number, currentNodeCount: number): boolean {
    return previousNodeCount !== currentNodeCount;
  }
}
