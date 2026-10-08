import { NexoraTool } from '../types';

export class ToolRegistry {
  private tools: Map<string, NexoraTool> = new Map();

  registerTool(tool: NexoraTool): void {
    this.tools.set(tool.name, tool);
  }

  getTool(name: string): NexoraTool | undefined {
    return this.tools.get(name);
  }

  getAllTools(): NexoraTool[] {
    return Array.from(this.tools.values());
  }

  getToolsJsonSchema(): string {
    const list = Array.from(this.tools.values()).map((tool) => ({
      name: tool.name,
      description: tool.description,
      riskLevel: tool.riskLevel,
    }));
    return JSON.stringify(list, null, 2);
  }
}
