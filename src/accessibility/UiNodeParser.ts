import { UiElement } from '../types';

export class UiNodeParser {
  /**
   * Traverses a root DOM element or virtual accessibility tree container
   * and extracts semantic UI elements matching Android's AccessibilityNodeInfo tree.
   */
  parseTree(rootElement: HTMLElement | null): UiElement[] {
    const elements: UiElement[] = [];
    if (!rootElement) return elements;

    this.traverseNode(rootElement, elements);
    return elements;
  }

  private traverseNode(element: HTMLElement, list: UiElement[]): void {
    const text = element.innerText?.trim() || (element as HTMLInputElement).value?.trim() || '';
    const desc = element.getAttribute('aria-label') || element.getAttribute('alt') || element.getAttribute('title') || '';
    const viewId = element.id || element.getAttribute('data-node-id') || element.getAttribute('name') || undefined;
    const tagName = element.tagName.toLowerCase();
    const role = element.getAttribute('role') || tagName;
    
    const isClickable =
      tagName === 'button' ||
      tagName === 'a' ||
      element.onclick !== null ||
      element.getAttribute('role') === 'button' ||
      element.classList.contains('clickable-node') ||
      element.dataset.clickable === 'true';

    const isEditable =
      tagName === 'input' ||
      tagName === 'textarea' ||
      element.isContentEditable ||
      element.dataset.editable === 'true';

    // Only include elements that have text, description, or are interactive
    if (text || desc || isClickable || isEditable) {
      const rect = element.getBoundingClientRect();
      const bounds = {
        x: Math.round(rect.left),
        y: Math.round(rect.top),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      };

      list.push({
        id: viewId,
        text: text.length > 120 ? text.slice(0, 120) + '...' : text,
        contentDescription: desc || undefined,
        className: role,
        isClickable,
        isEditable,
        bounds,
        rawElement: element,
      });
    }

    // Traverse children
    for (let i = 0; i < element.children.length; i++) {
      const child = element.children[i] as HTMLElement;
      this.traverseNode(child, list);
    }
  }

  findNodeByText(rootElement: HTMLElement | null, targetText: string): HTMLElement | null {
    if (!rootElement) return null;
    const elements = this.parseTree(rootElement);
    const target = targetText.toLowerCase().trim();

    const matched = elements.find((el) => {
      const t = el.text?.toLowerCase() || '';
      const d = el.contentDescription?.toLowerCase() || '';
      return t.includes(target) || d.includes(target) || (el.id && el.id.toLowerCase().includes(target));
    });

    return matched?.rawElement || null;
  }
}
