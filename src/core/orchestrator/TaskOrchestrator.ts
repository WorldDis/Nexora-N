import { NexoraEventBus } from '../eventbus/NexoraEventBus';
import { TaskStateManager } from '../state/TaskStateManager';
import { ReActPlanner } from '../../brain/planner/ReActPlanner';
import { ToolRegistry } from '../../tools/ToolRegistry';
import { RiskGateManager } from '../../safety/RiskGateManager';
import { UiNodeParser } from '../../accessibility/UiNodeParser';
import { deviceManager } from '../../simulator/DeviceContext';
import { TaskState, TaskStepLog } from '../../types';

export class TaskOrchestrator {
  private isCancelled = false;
  private currentTaskId: number = 0;
  private stepLogs: TaskStepLog[] = [];
  private stepLogListeners: ((logs: TaskStepLog[]) => void)[] = [];
  private nodeParser = new UiNodeParser();

  private static readonly MAX_STEPS = 8;
  private static readonly MAX_ELEMENTS = 60;
  private static readonly STEP_DELAY_MS = 800;

  constructor(
    private taskStateManager: TaskStateManager,
    private planner: ReActPlanner,
    private toolRegistry: ToolRegistry,
    private riskGate: RiskGateManager
  ) {
    this.initEventSubscriber();
  }

  private initEventSubscriber(): void {
    NexoraEventBus.subscribe((event) => {
      switch (event.type) {
        case 'UserSpokenInput':
          this.cancelCurrent();
          this.runTask(event.transcript);
          break;
        case 'StopRequested':
          this.cancelCurrent();
          this.taskStateManager.transitionTo(TaskState.IDLE);
          break;
      }
    });
  }

  cancelCurrent(): void {
    this.isCancelled = true;
  }

  getStepLogs(): TaskStepLog[] {
    return this.stepLogs;
  }

  onStepLogs(fn: (logs: TaskStepLog[]) => void): () => void {
    this.stepLogListeners.push(fn);
    return () => {
      this.stepLogListeners = this.stepLogListeners.filter((l) => l !== fn);
    };
  }

  private addStepLog(log: TaskStepLog): void {
    this.stepLogs = [...this.stepLogs, log];
    this.stepLogListeners.forEach((fn) => fn(this.stepLogs));
  }

  async runTask(query: string): Promise<void> {
    const taskId = ++this.currentTaskId;
    this.isCancelled = false;
    this.stepLogs = [];
    this.stepLogListeners.forEach((fn) => fn([]));

    this.taskStateManager.transitionTo(TaskState.PLANNING);
    const history: string[] = [];

    for (let step = 1; step <= TaskOrchestrator.MAX_STEPS; step++) {
      if (this.isCancelled || this.currentTaskId !== taskId) {
        return;
      }

      const screenDesc = this.describeScreen();
      const plan = await this.planner.planNextStep(
        query,
        this.toolRegistry.getToolsJsonSchema(),
        screenDesc,
        history
      );

      if (this.isCancelled || this.currentTaskId !== taskId) return;

      if (plan.finalResponseToUser && plan.finalResponseToUser.trim().length > 0) {
        NexoraEventBus.emit({
          type: 'SpeakFeedback',
          text: plan.finalResponseToUser,
        });
      }

      const toolName = plan.selectedTool?.trim() || null;

      if (!toolName) {
        this.addStepLog({
          step,
          reasoning: plan.reasoning,
          timestamp: new Date().toLocaleTimeString(),
          screenSummary: screenDesc.slice(0, 150),
        });
        this.taskStateManager.transitionTo(TaskState.COMPLETED);
        return;
      }

      const tool = this.toolRegistry.getTool(toolName);
      if (!tool) {
        const msg = `Tool '${toolName}' does not exist`;
        history.push(msg);
        this.addStepLog({
          step,
          reasoning: plan.reasoning,
          toolName,
          parameters: plan.toolParameters,
          result: { success: false, message: msg },
          timestamp: new Date().toLocaleTimeString(),
          screenSummary: screenDesc.slice(0, 150),
        });
        continue;
      }

      this.taskStateManager.transitionTo(TaskState.EXECUTING);

      const canExecute = await this.riskGate.evaluateAndCanExecute(tool, plan.toolParameters);
      if (this.isCancelled || this.currentTaskId !== taskId) return;

      if (!canExecute) {
        history.push(`User did not allow ${tool.name}`);
        this.addStepLog({
          step,
          reasoning: plan.reasoning,
          toolName: tool.name,
          parameters: plan.toolParameters,
          result: { success: false, message: `Blocked by RiskGate (${tool.riskLevel})` },
          timestamp: new Date().toLocaleTimeString(),
          screenSummary: screenDesc.slice(0, 150),
        });
        this.taskStateManager.transitionTo(TaskState.PLANNING);
        continue;
      }

      const result = await tool.execute(plan.toolParameters);
      history.push(result.success ? `${tool.name}: ${result.message}` : `${tool.name} failed: ${result.message}`);

      this.addStepLog({
        step,
        reasoning: plan.reasoning,
        toolName: tool.name,
        parameters: plan.toolParameters,
        result,
        timestamp: new Date().toLocaleTimeString(),
        screenSummary: screenDesc.slice(0, 150),
      });

      if (plan.isTaskComplete) {
        this.taskStateManager.transitionTo(TaskState.COMPLETED);
        return;
      }

      // Allow UI time to update after action
      await new Promise((resolve) => setTimeout(resolve, TaskOrchestrator.STEP_DELAY_MS));
      if (this.isCancelled || this.currentTaskId !== taskId) return;

      this.taskStateManager.transitionTo(TaskState.PLANNING);
    }

    NexoraEventBus.emit({
      type: 'SpeakFeedback',
      text: 'Kaaj-ta shesh korte parlam na.',
    });
    this.taskStateManager.transitionTo(TaskState.FAILED);
  }

  describeScreen(): string {
    const screenState = deviceManager.getScreenState();
    const root = screenState?.screenRef || document.getElementById('nexora-virtual-screen');
    if (!root) {
      return 'Accessibility service off / screen not loaded';
    }

    const elements = this.nodeParser.parseTree(root);
    return elements
      .slice(0, TaskOrchestrator.MAX_ELEMENTS)
      .map((el) => {
        const label = el.text || el.contentDescription || '(no label)';
        const kind = el.isClickable ? 'clickable' : el.isEditable ? 'editable' : 'text';
        return `- [${kind}] ${label}`;
      })
      .join('\n');
  }
}
