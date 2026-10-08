import React, { useState } from 'react';
import { PlayCircle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { TaskStateManager } from '../core/state/TaskStateManager';
import { TaskState, RiskTier, NexoraTool, ToolResult, AIPlanResponse } from '../types';
import { ReActPlanner } from '../brain/planner/ReActPlanner';
import { AIProvider } from '../brain/provider/AIProvider';
import { RiskGateManager } from '../safety/RiskGateManager';
import { UserConfirmationCallback } from '../safety/UserConfirmationCallback';
import { DenyAllConfirmation } from '../safety/DenyAllConfirmation';

interface TestResult {
  suite: string;
  name: string;
  passed: boolean;
  message?: string;
}

export const TestRunner: React.FC = () => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runAllTests = async () => {
    setIsRunning(true);
    const res: TestResult[] = [];

    // --- Suite 1: TaskStateManagerTest ---
    try {
      const manager = new TaskStateManager();
      if (manager.getCurrentState() === TaskState.IDLE) {
        res.push({ suite: 'TaskStateManagerTest', name: 'startsIdle', passed: true });
      } else {
        res.push({
          suite: 'TaskStateManagerTest',
          name: 'startsIdle',
          passed: false,
          message: `Expected IDLE, got ${manager.getCurrentState()}`,
        });
      }

      manager.transitionTo(TaskState.PLANNING);
      const isPlanning = manager.getCurrentState() === TaskState.PLANNING;
      manager.transitionTo(TaskState.EXECUTING);
      const isExecuting = manager.getCurrentState() === TaskState.EXECUTING;
      if (isPlanning && isExecuting) {
        res.push({ suite: 'TaskStateManagerTest', name: 'transitionUpdatesState', passed: true });
      } else {
        res.push({
          suite: 'TaskStateManagerTest',
          name: 'transitionUpdatesState',
          passed: false,
          message: 'State transitions failed',
        });
      }

      manager.transitionTo(TaskState.FAILED);
      manager.reset();
      if (manager.getCurrentState() === TaskState.IDLE) {
        res.push({ suite: 'TaskStateManagerTest', name: 'resetReturnsToIdle', passed: true });
      } else {
        res.push({
          suite: 'TaskStateManagerTest',
          name: 'resetReturnsToIdle',
          passed: false,
          message: 'Reset did not return to IDLE',
        });
      }
    } catch (e: any) {
      res.push({ suite: 'TaskStateManagerTest', name: 'Execution Error', passed: false, message: e.message });
    }

    // --- Suite 2: ReActPlannerTest ---
    try {
      class FakeProvider implements AIProvider {
        readonly providerId = 'FAKE';
        lastContext = '';
        constructor(private response: AIPlanResponse) {}

        async generatePlan(
          _sys: string,
          _query: string,
          _tools: string,
          context: string
        ): Promise<AIPlanResponse> {
          this.lastContext = context;
          return this.response;
        }
      }

      // Test 1: mapsProviderToolChoiceToPlannerResponse
      const fake1 = new FakeProvider({
        reasoning: 'Open WhatsApp',
        selectedTool: 'open_app',
        toolParameters: { packageName: 'com.whatsapp' },
        isTaskComplete: false,
        finalResponseToUser: 'WhatsApp kholchi',
      });
      const planner1 = new ReActPlanner(fake1);
      const res1 = await planner1.planNextStep(
        'whatsapp khol',
        '[]',
        '- [clickable] Chats',
        []
      );

      if (
        res1.selectedTool === 'open_app' &&
        res1.toolParameters['packageName'] === 'com.whatsapp' &&
        res1.finalResponseToUser === 'WhatsApp kholchi' &&
        res1.isTaskComplete === false
      ) {
        res.push({ suite: 'ReActPlannerTest', name: 'mapsProviderToolChoiceToPlannerResponse', passed: true });
      } else {
        res.push({
          suite: 'ReActPlannerTest',
          name: 'mapsProviderToolChoiceToPlannerResponse',
          passed: false,
          message: 'Provider mapping failed',
        });
      }

      // Test 2: nullToolParametersBecomeEmptyMap
      const fake2 = new FakeProvider({
        reasoning: 'done',
        selectedTool: null,
        toolParameters: null,
        isTaskComplete: true,
        finalResponseToUser: 'Hoye gechhe',
      });
      const res2 = await new ReActPlanner(fake2).planNextStep('q', '[]', '', []);
      if (res2.selectedTool === null && Object.keys(res2.toolParameters).length === 0 && res2.isTaskComplete === true) {
        res.push({ suite: 'ReActPlannerTest', name: 'nullToolParametersBecomeEmptyMap', passed: true });
      } else {
        res.push({
          suite: 'ReActPlannerTest',
          name: 'nullToolParametersBecomeEmptyMap',
          passed: false,
          message: 'Null tool parameters handling failed',
        });
      }

      // Test 3: includesStepHistoryInContext
      const fake3 = new FakeProvider({
        reasoning: '',
        selectedTool: null,
        toolParameters: null,
        isTaskComplete: true,
        finalResponseToUser: null,
      });
      const planner3 = new ReActPlanner(fake3);
      await planner3.planNextStep('scroll koro', '[]', '- [clickable] Settings', ['scroll_screen: Successfully scrolled']);
      if (
        fake3.lastContext.includes('Steps already done') &&
        fake3.lastContext.includes('scroll_screen: Successfully scrolled') &&
        fake3.lastContext.includes('- [clickable] Settings')
      ) {
        res.push({ suite: 'ReActPlannerTest', name: 'includesStepHistoryInContext', passed: true });
      } else {
        res.push({
          suite: 'ReActPlannerTest',
          name: 'includesStepHistoryInContext',
          passed: false,
          message: 'History not found in context',
        });
      }
    } catch (e: any) {
      res.push({ suite: 'ReActPlannerTest', name: 'Execution Error', passed: false, message: e.message });
    }

    // --- Suite 3: RiskGateManagerTest ---
    try {
      class FakeTool implements NexoraTool {
        readonly name: string;
        readonly description = 'test tool';
        constructor(readonly riskLevel: RiskTier) {
          this.name = `fake_${riskLevel}`;
        }
        async execute(): Promise<ToolResult> {
          return { success: true, message: 'ok' };
        }
      }

      class RecordingConfirmation implements UserConfirmationCallback {
        asked = 0;
        constructor(private answer: boolean) {}
        async requestConfirmation(): Promise<boolean> {
          this.asked++;
          return this.answer;
        }
      }

      // Test 1: lowRiskToolRunsWithoutAsking
      const conf1 = new RecordingConfirmation(false);
      const gate1 = new RiskGateManager(conf1);
      const lowResult = await gate1.evaluateAndCanExecute(new FakeTool(RiskTier.LOW), {});
      if (lowResult === true && conf1.asked === 0) {
        res.push({ suite: 'RiskGateManagerTest', name: 'lowRiskToolRunsWithoutAsking', passed: true });
      } else {
        res.push({
          suite: 'RiskGateManagerTest',
          name: 'lowRiskToolRunsWithoutAsking',
          passed: false,
          message: 'Low risk tool prompted unnecessarily',
        });
      }

      // Test 2: highRiskToolAsksAndHonoursDenial
      const conf2 = new RecordingConfirmation(false);
      const gate2 = new RiskGateManager(conf2);
      const highResult = await gate2.evaluateAndCanExecute(new FakeTool(RiskTier.HIGH), {});
      if (highResult === false && conf2.asked === 1) {
        res.push({ suite: 'RiskGateManagerTest', name: 'highRiskToolAsksAndHonoursDenial', passed: true });
      } else {
        res.push({
          suite: 'RiskGateManagerTest',
          name: 'highRiskToolAsksAndHonoursDenial',
          passed: false,
          message: 'High risk tool did not honor denial',
        });
      }

      // Test 3: denyAllConfirmationBlocksMediumRiskTools
      const gate3 = new RiskGateManager(new DenyAllConfirmation());
      const medResult = await gate3.evaluateAndCanExecute(new FakeTool(RiskTier.MEDIUM), {});
      const critResult = await gate3.evaluateAndCanExecute(new FakeTool(RiskTier.CRITICAL), {});
      if (medResult === false && critResult === false) {
        res.push({ suite: 'RiskGateManagerTest', name: 'denyAllConfirmationBlocksMediumRiskTools', passed: true });
      } else {
        res.push({
          suite: 'RiskGateManagerTest',
          name: 'denyAllConfirmationBlocksMediumRiskTools',
          passed: false,
          message: 'DenyAll allowed high risk tool',
        });
      }
    } catch (e: any) {
      res.push({ suite: 'RiskGateManagerTest', name: 'Execution Error', passed: false, message: e.message });
    }

    setResults(res);
    setIsRunning(false);
  };

  const totalPassed = results.filter((r) => r.passed).length;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
            <PlayCircle className="w-4 h-4 text-emerald-400" />
            Kotlin Unit Test Suite (React Port Verification)
          </h3>
          <p className="text-xs text-slate-400">
            Executes ports of ReActPlannerTest, TaskStateManagerTest & RiskGateManagerTest
          </p>
        </div>

        <button
          onClick={runAllTests}
          disabled={isRunning}
          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
          Run All Tests
        </button>
      </div>

      {results.length > 0 && (
        <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl text-xs font-mono">
          <span className="text-slate-300">
            Results: {totalPassed} / {results.length} Passed
          </span>
          <span
            className={`font-bold ${
              totalPassed === results.length ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {totalPassed === results.length ? 'ALL SUITES PASSED (100%)' : 'SOME TESTS FAILED'}
          </span>
        </div>
      )}

      <div className="space-y-1.5 max-h-60 overflow-y-auto">
        {results.map((r, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs font-mono"
          >
            <div className="flex items-center gap-2 truncate">
              {r.passed ? (
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span className="text-slate-400 text-[11px] font-sans">[{r.suite}]</span>
              <span className="text-slate-200 font-medium truncate">{r.name}</span>
            </div>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                r.passed
                  ? 'bg-emerald-950 text-emerald-300'
                  : 'bg-rose-950 text-rose-300'
              }`}
            >
              {r.passed ? 'PASS' : 'FAIL'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
