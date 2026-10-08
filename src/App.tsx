import React, { useState, useEffect, useMemo } from 'react';
import {
  Smartphone,
  Terminal,
  Layers,
  Wrench,
  CheckCircle,
  ShieldAlert,
  Sparkles,
  Volume2,
  FileCheck2,
  Cpu,
} from 'lucide-react';
import { TaskStateManager } from './core/state/TaskStateManager';
import { ToolRegistry } from './tools/ToolRegistry';
import { ClickTool } from './tools/system/ClickTool';
import { ScrollTool } from './tools/system/ScrollTool';
import { TypeTextTool } from './tools/system/TypeTextTool';
import { OpenAppTool } from './tools/system/OpenAppTool';
import {
  SendMessageTool,
  ModifySettingTool,
  ClearAppDataTool,
} from './tools/system/SampleRiskTools';
import { RiskGateManager } from './safety/RiskGateManager';
import { interactiveConfirmation } from './safety/InteractiveConfirmation';
import { GeminiAIProvider } from './brain/provider/GeminiAIProvider';
import { ReActPlanner } from './brain/planner/ReActPlanner';
import { TaskOrchestrator } from './core/orchestrator/TaskOrchestrator';
import { VoiceEngine } from './voice/VoiceEngine';
import { TaskState, TaskStepLog } from './types';
import { VirtualDevice } from './simulator/VirtualDevice';
import { ReActConsole } from './components/ReActConsole';
import { AccessibilityInspector } from './components/AccessibilityInspector';
import { SafetyRiskModal } from './components/SafetyRiskModal';
import { VoiceOverlay } from './components/VoiceOverlay';
import { ToolManager } from './components/ToolManager';
import { TestRunner } from './components/TestRunner';

export const App: React.FC = () => {
  // Core Dependency Graph (Port of MainApplication.kt)
  const {
    taskStateManager,
    toolRegistry,
    riskGateManager,
    orchestrator,
    voiceEngine,
  } = useMemo(() => {
    const stateManager = new TaskStateManager();

    const registry = new ToolRegistry();
    registry.registerTool(new ClickTool());
    registry.registerTool(new ScrollTool());
    registry.registerTool(new TypeTextTool());
    registry.registerTool(new OpenAppTool());
    registry.registerTool(new SendMessageTool());
    registry.registerTool(new ModifySettingTool());
    registry.registerTool(new ClearAppDataTool());

    const riskGate = new RiskGateManager(interactiveConfirmation);
    const provider = new GeminiAIProvider('gemini-3.8-flash');
    const planner = new ReActPlanner(provider);

    const orch = new TaskOrchestrator(stateManager, planner, registry, riskGate);
    const voice = new VoiceEngine(stateManager);

    return {
      taskStateManager: stateManager,
      toolRegistry: registry,
      riskGateManager: riskGate,
      orchestrator: orch,
      voiceEngine: voice,
    };
  }, []);

  const [activeTab, setActiveTab] = useState<'workspace' | 'tree' | 'tools' | 'tests'>('workspace');
  const [currentState, setCurrentState] = useState<TaskState>(TaskState.IDLE);
  const [stepLogs, setStepLogs] = useState<TaskStepLog[]>([]);

  useEffect(() => {
    const unsubState = taskStateManager.onStateChange((state) => {
      setCurrentState(state);
    });

    const unsubLogs = orchestrator.onStepLogs((logs) => {
      setStepLogs(logs);
    });

    return () => {
      unsubState();
      unsubLogs();
    };
  }, [taskStateManager, orchestrator]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans pb-20">
      {/* Top Header */}
      <header className="bg-slate-900/90 border-b border-slate-800/80 sticky top-0 z-30 backdrop-blur-md px-4 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-black text-slate-950 shadow-lg shadow-cyan-500/20 text-lg">
            N
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-base tracking-tight text-white">NEXORA</h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-cyan-950 text-cyan-400 border border-cyan-800/60 uppercase">
                v2.0 Action Agent
              </span>
            </div>
            <p className="text-xs text-slate-400 font-sans">
              "You speak. Nexora understands. Nexora acts."
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 p-1 rounded-xl text-xs">
          <button
            onClick={() => setActiveTab('workspace')}
            className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-all ${
              activeTab === 'workspace'
                ? 'bg-cyan-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            Live Device & Agent
          </button>
          <button
            onClick={() => setActiveTab('tree')}
            className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-all ${
              activeTab === 'tree'
                ? 'bg-cyan-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Accessibility Tree
          </button>
          <button
            onClick={() => setActiveTab('tools')}
            className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-all ${
              activeTab === 'tools'
                ? 'bg-cyan-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            Tools & Safety
          </button>
          <button
            onClick={() => setActiveTab('tests')}
            className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-all ${
              activeTab === 'tests'
                ? 'bg-cyan-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            Unit Tests
          </button>
        </div>

        {/* Global Agent State Pill */}
        <div className="flex items-center gap-2">
          <div className="text-right hidden sm:block">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">Agent State</div>
            <div className="text-xs font-bold text-cyan-300 font-mono">{currentState}</div>
          </div>
          <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse"></div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6">
        {activeTab === 'workspace' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Virtual Android Screen Environment */}
            <div className="lg:col-span-7 flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-cyan-400" />
                    Android Device Screen (Target UI)
                  </h2>
                  <p className="text-xs text-slate-400">
                    Nexora inspects this active semantic node hierarchy to click, type, and navigate.
                  </p>
                </div>
              </div>

              <div className="h-[580px]">
                <VirtualDevice />
              </div>
            </div>

            {/* Right Column: ReAct Console & Planning Log */}
            <div className="lg:col-span-5 h-[580px] flex flex-col">
              <ReActConsole
                currentState={currentState}
                stepLogs={stepLogs}
                onClearLogs={() => setStepLogs([])}
              />
            </div>
          </div>
        )}

        {activeTab === 'tree' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 h-[600px]">
              <VirtualDevice />
            </div>
            <div className="lg:col-span-6 h-[600px]">
              <AccessibilityInspector />
            </div>
          </div>
        )}

        {activeTab === 'tools' && (
          <div className="max-w-4xl mx-auto">
            <ToolManager toolRegistry={toolRegistry} riskGateManager={riskGateManager} />
          </div>
        )}

        {activeTab === 'tests' && (
          <div className="max-w-3xl mx-auto">
            <TestRunner />
          </div>
        )}
      </main>

      {/* Floating Voice Overlay (Bolo Button + Feedback HUD) */}
      <VoiceOverlay
        voiceEngine={voiceEngine}
        taskStateManager={taskStateManager}
      />

      {/* Zero-Trust Safety Authorization Dialog */}
      <SafetyRiskModal riskGateManager={riskGateManager} />
    </div>
  );
};
