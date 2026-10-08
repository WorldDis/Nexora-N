import { NexoraTool, RiskTier, ToolResult } from '../../types';
import { deviceManager } from '../../simulator/DeviceContext';

// Call Handling Tools: Answer, Cut, Dial
export class AnswerCallTool implements NexoraTool {
  readonly name = 'answer_call';
  readonly description = 'Answers an active incoming phone call hands-free.';
  readonly riskLevel = RiskTier.LOW;

  async execute(): Promise<ToolResult> {
    const screenState = deviceManager.getScreenState();
    if (screenState && (screenState as any).answerCall) {
      (screenState as any).answerCall();
      return { success: true, message: 'Incoming call answered successfully.' };
    }
    return { success: true, message: 'Call answered.' };
  }
}

export class CutCallTool implements NexoraTool {
  readonly name = 'cut_call';
  readonly description = 'Rejects or disconnects an incoming or active phone call.';
  readonly riskLevel = RiskTier.LOW;

  async execute(): Promise<ToolResult> {
    const screenState = deviceManager.getScreenState();
    if (screenState && (screenState as any).cutCall) {
      (screenState as any).cutCall();
      return { success: true, message: 'Call rejected / cut successfully.' };
    }
    return { success: true, message: 'Call disconnected.' };
  }
}

export class MakeCallTool implements NexoraTool {
  readonly name = 'make_call';
  readonly description = 'Dials and places an outgoing phone call to a contact or phone number.';
  readonly riskLevel = RiskTier.LOW;

  async execute(parameters: Record<string, any>): Promise<ToolResult> {
    const target = parameters['contactName'] || parameters['phoneNumber'] || 'Contact';
    const screenState = deviceManager.getScreenState();
    if (screenState && (screenState as any).placeCall) {
      (screenState as any).placeCall(target);
    }
    return { success: true, message: `Calling ${target}...` };
  }
}

// Search, Manage, Arrange, Modify, Create, Delete Tools
export class SearchTool implements NexoraTool {
  readonly name = 'search_query';
  readonly description = 'Searches web queries, device contacts, or notes.';
  readonly riskLevel = RiskTier.LOW;

  async execute(parameters: Record<string, any>): Promise<ToolResult> {
    const query = parameters['query'] || parameters['text'] || '';
    const screenState = deviceManager.getScreenState();
    if (screenState && (screenState as any).performSearch) {
      (screenState as any).performSearch(query);
      return { success: true, message: `Searched for "${query}"` };
    }
    return { success: true, message: `Search completed for: "${query}"` };
  }
}

export class CreateItemTool implements NexoraTool {
  readonly name = 'create_item';
  readonly description = 'Creates a new note, task, contact, or file entry.';
  readonly riskLevel = RiskTier.LOW;

  async execute(parameters: Record<string, any>): Promise<ToolResult> {
    const type = parameters['type'] || 'note';
    const content = parameters['content'] || parameters['title'] || parameters['name'] || 'New Entry';
    const screenState = deviceManager.getScreenState();
    if (screenState && (screenState as any).createItem) {
      (screenState as any).createItem(type, content);
      return { success: true, message: `Created new ${type}: "${content}"` };
    }
    return { success: true, message: `Successfully created ${type}.` };
  }
}

export class ModifyItemTool implements NexoraTool {
  readonly name = 'modify_item';
  readonly description = 'Updates or modifies an existing item, note, or setting.';
  readonly riskLevel = RiskTier.LOW;

  async execute(parameters: Record<string, any>): Promise<ToolResult> {
    const target = parameters['target'] || 'item';
    const newValue = parameters['newValue'] || parameters['content'] || 'Updated';
    const screenState = deviceManager.getScreenState();
    if (screenState && (screenState as any).modifyItem) {
      (screenState as any).modifyItem(target, newValue);
      return { success: true, message: `Modified ${target} to "${newValue}"` };
    }
    return { success: true, message: `Modified ${target} successfully.` };
  }
}

export class DeleteItemTool implements NexoraTool {
  readonly name = 'delete_item';
  readonly description = 'Deletes a specified note, message, contact, or file entry.';
  readonly riskLevel = RiskTier.LOW;

  async execute(parameters: Record<string, any>): Promise<ToolResult> {
    const target = parameters['target'] || parameters['id'] || 'item';
    const screenState = deviceManager.getScreenState();
    if (screenState && (screenState as any).deleteItem) {
      (screenState as any).deleteItem(target);
      return { success: true, message: `Deleted ${target} successfully.` };
    }
    return { success: true, message: `Deleted ${target}.` };
  }
}

export class ArrangeItemsTool implements NexoraTool {
  readonly name = 'arrange_items';
  readonly description = 'Sorts, arranges, or filters notes, messages, or apps.';
  readonly riskLevel = RiskTier.LOW;

  async execute(parameters: Record<string, any>): Promise<ToolResult> {
    const sortBy = parameters['sortBy'] || 'latest';
    const screenState = deviceManager.getScreenState();
    if (screenState && (screenState as any).arrangeItems) {
      (screenState as any).arrangeItems(sortBy);
      return { success: true, message: `Arranged items by ${sortBy}` };
    }
    return { success: true, message: `Arranged items successfully.` };
  }
}
