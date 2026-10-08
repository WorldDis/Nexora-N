export enum TaskState {
  IDLE = 'IDLE',
  LISTENING = 'LISTENING',
  UNDERSTANDING = 'UNDERSTANDING',
  PLANNING = 'PLANNING',
  EXECUTING = 'EXECUTING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export enum RiskTier {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export interface AIPlanResponse {
  reasoning: string;
  selectedTool: string | null;
  toolParameters: Record<string, any> | null;
  isTaskComplete: boolean;
  finalResponseToUser: string | null;
}

export interface PlannerResponse {
  reasoning: string;
  selectedTool: string | null;
  toolParameters: Record<string, any>;
  finalResponseToUser: string | null;
  isTaskComplete: boolean;
}

export type ToolResult = 
  | { success: true; message: string }
  | { success: false; message: string };

export interface NexoraTool {
  readonly name: string;
  readonly description: string;
  readonly riskLevel: RiskTier;
  execute(parameters: Record<string, any>): Promise<ToolResult>;
}

export interface UiElement {
  id?: string;
  text?: string;
  contentDescription?: string;
  className?: string;
  isClickable: boolean;
  isEditable?: boolean;
  bounds?: { x: number; y: number; width: number; height: number };
  selector?: string;
  rawElement?: any;
}

export type NexoraEvent =
  | { type: 'UserSpokenInput'; transcript: string }
  | { type: 'SpeakFeedback'; text: string }
  | { type: 'StateChanged'; oldState: TaskState; newState: TaskState }
  | { type: 'ErrorOccurred'; message: string }
  | { type: 'StopRequested'; reason?: string };

export interface TaskStepLog {
  step: number;
  reasoning: string;
  toolName?: string;
  parameters?: Record<string, any>;
  result?: ToolResult;
  timestamp: string;
  screenSummary: string;
}
