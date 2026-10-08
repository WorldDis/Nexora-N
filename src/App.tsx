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
  Power,
  Lock,
  Unlock,
  Maximize2,
  Minimize2,
  RotateCcw,
} from 'lucide-react';
import { TaskStateManager } from './core/state/TaskStateManager';
import { ToolRegistry } from './tools/ToolRegistry';
import { ClickTool } from './tools/system/ClickTool';
import { ScrollTool } from './tools/system/ScrollTool';
import { TypeTextTool } from './tools/system/TypeTextTool';
import { OpenAppTool } from './tools/system/OpenAppTool';
import {
  AnswerCallTool,
  CutCallTool,
  MakeCallTool,
  SearchTool,
  CreateItemTool,
  ModifyItemTool,
  DeleteItemTool,
  ArrangeItemsTool,
} from './tools/system/ExtendedTools';
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
import { ToolManager } from './components/ToolManager';
import { TestRunner } from './components/TestRunner';
import { ActivationModal } from './components/ActivationModal';
import { FloatingOrb } from './components/FloatingOrb';
import { InstallApkModal } from './components/InstallApkModal';

export const App: React.FC = () => {
  // Core Dependency Graph (Port of MainApplication.kt with Extended Tools)
  const {
    taskStateManager,
    toolRegistry,
    riskGateManager,
    orchestrator,
    voiceEngine,
  } = useMemo(() => {
    const stateManager = new TaskStateManager();

    const registry = new ToolRegistry();
    // Core Accessibility Tools
    registry.registerTool(new ClickTool());
    registry.registerTool(new ScrollTool());
    registry.registerTool(new TypeTextTool());
    registry.registerTool(new OpenAppTool());

    // Extended Autonomous Tools: Call, Search, CRUD, Manage
    registry.registerTool(new AnswerCallTool());
    registry.registerTool(new CutCallTool());
    registry.registerTool(new MakeCallTool());
    registry.registerTool(new SearchTool());
    registry.registerTool(new CreateItemTool());
    registry.registerTool(new ModifyItemTool());
    registry.registerTool(new DeleteItemTool());
    registry.registerTool(new ArrangeItemsTool());

    // Sample Risk Tools
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

  // UI Flow States
  const [isActivated, setIsActivated] = useState<boolean>(false);
  const [showActivationModal, setShowActivationModal] = useState<boolean>(false);
  const [showInstallApkModal, setShowInstallApkModal] = useState<boolean>(false);
  const [isAppWindowClosed, setIsAppWindowClosed] = useState<boolean>(false);
  const [isDeviceLocked, setIsDeviceLocked] = useState<boolean>(false);
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

  const handleActivationComplete = () => {
    setIsActivated(true);
    setShowActivationModal(false);
    // Automatic app window close into background floating orb as requested by user
    setIsAppWindowClosed(true);
  };

  const handleReopenDashboard = () => {
    setIsAppWindowClosed(false);
  };

  const handleToggleLock = () => {
    setIsDeviceLocked((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative overflow-x-hidden">
      {/* 1. INITIAL ULTRA-CLEAN SCREEN (Before Activation) */}
      {!isActivated ? (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none"></div>

          <div className="max-w-md w-full flex flex-col items-center space-y-8 z-10 animate-in fade-in zoom-in-95 duration-300">
            {/* Glowing Brand Icon */}
            <div className="relative">
              <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-[0_0_60px_rgba(6,182,212,0.6)]">
                <Power className="w-12 h-12 text-slate-950" />
              </div>
              <div className="absolute inset-0 rounded-full border-2 border-cyan-400/40 animate-ping"></div>
            </div>

            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold bg-cyan-950 text-cyan-300 border border-cyan-800/80 mb-3">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>NEXORA • AUTONOMOUS AGENT</span>
              </div>
              <h1 className="text-4xl font-extrabold text-white tracking-tight">
                NEXORA
              </h1>
              <p className="text-sm text-slate-400 mt-2 font-bengali">
                "You speak. Nexora understands. Nexora acts."
              </p>
              <p className="text-xs text-slate-500 mt-1 font-bengali">
                কল রেসপন্স, কল কাট, সার্চ, তৈরি, পরিবর্তন ও ডিলিট — সবকিছু হ্যান্ডস-ফ্রি।
              </p>
            </div>

            {/* Single Prominent Activate Action Button */}
            <button
              onClick={() => setShowActivationModal(true)}
              className="w-full py-4 px-8 rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black text-sm tracking-wider shadow-[0_0_40px_rgba(6,182,212,0.6)] transition-all hover:scale-105 flex items-center justify-center gap-2.5"
            >
              <Power className="w-5 h-5 text-slate-950" />
              <span>ACTIVATE NEXORA (সক্রিয় করুন)</span>
            </button>

            {/* Manual APK Mobile Test Trigger */}
            <button
              onClick={() => setShowInstallApkModal(true)}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-2 transition-colors"
            >
              <Smartphone className="w-4 h-4 text-cyan-400" />
              <span>মোবাইলে ম্যানুয়াল টেস্ট / Install APK</span>
            </button>

            <div className="text-[11px] text-slate-500 font-mono">
              Status: <span className="text-cyan-400">STANDBY (Awaiting Activation)</span>
            </div>
          </div>

          {/* Hidden VirtualDevice to ensure DeviceContext is initialized even before activation */}
          <div className="hidden">
            <VirtualDevice isLocked={isDeviceLocked} onToggleLock={handleToggleLock} />
          </div>

          {/* Activation & Permission Modal */}
          <ActivationModal
            isOpen={showActivationModal}
            onActivate={handleActivationComplete}
            onClose={() => setShowActivationModal(false)}
          />
        </div>
      ) : (
        /* 2. ACTIVATED APP ENVIRONMENT */
        <>
          {/* Header Bar */}
          <header className="bg-slate-900/90 border-b border-slate-800/80 sticky top-0 z-30 backdrop-blur-md px-4 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-black text-slate-950 shadow-lg shadow-cyan-500/20 text-lg">
                N
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-extrabold text-base tracking-tight text-white">NEXORA</h1>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/60 uppercase">
                    Active in Background
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-sans">
                  Background Sentinel & Lockscreen Active
                </p>
              </div>
            </div>

            {/* Navigation Tabs (when app window is open) */}
            {!isAppWindowClosed && (
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
                  Target Device
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
            )}

            {/* Control Bar Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowInstallApkModal(true)}
                title="Download or Install APK on Android Phone"
                className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Test APK</span>
              </button>

              <button
                onClick={handleToggleLock}
                title={isDeviceLocked ? 'Unlock device screen' : 'Simulate screen lock'}
                className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  isDeviceLocked
                    ? 'bg-amber-950 text-amber-300 border-amber-600/80 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                {isDeviceLocked ? <Lock className="w-3.5 h-3.5 text-amber-400" /> : <Unlock className="w-3.5 h-3.5 text-slate-400" />}
                <span>{isDeviceLocked ? 'Screen Locked' : 'Screen Unlocked'}</span>
              </button>

              <button
                onClick={() => setIsAppWindowClosed(!isAppWindowClosed)}
                title={isAppWindowClosed ? 'Show Developer Workspace' : 'Minimize Window to Background Orb'}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5"
              >
                {isAppWindowClosed ? <Maximize2 className="w-3.5 h-3.5 text-cyan-400" /> : <Minimize2 className="w-3.5 h-3.5 text-cyan-400" />}
                <span>{isAppWindowClosed ? 'Open Dashboard' : 'Minimize to Background'}</span>
              </button>
            </div>
          </header>

          {/* Main Workspace Body */}
          <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 pb-24">
            {isAppWindowClosed ? (
              /* MINIMIZED STATE: Focus purely on Target Device Screen with Lockscreen */
              <div className="max-w-2xl mx-auto flex flex-col items-center space-y-4">
                <div className="w-full flex items-center justify-between text-xs text-slate-400 px-1">
                  <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    Nexora Floating Window Running in Background
                  </span>
                  <button
                    onClick={handleReopenDashboard}
                    className="text-cyan-400 hover:text-cyan-300 underline font-medium"
                  >
                    Open Developer Console & Logs
                  </button>
                </div>

                <div className="w-full h-[620px]">
                  <VirtualDevice
                    isLocked={isDeviceLocked}
                    onToggleLock={handleToggleLock}
                  />
                </div>
              </div>
            ) : (
              /* FULL DEVELOPER WORKSPACE */
              <>
                {activeTab === 'workspace' && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    <div className="lg:col-span-7 flex flex-col space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                            <Smartphone className="w-4 h-4 text-cyan-400" />
                            Target Device Screen (Interactive)
                          </h2>
                          <p className="text-xs text-slate-400">
                            Calls, WhatsApp, Settings, Contacts, Notes & Browser
                          </p>
                        </div>
                      </div>

                      <div className="h-[580px]">
                        <VirtualDevice
                          isLocked={isDeviceLocked}
                          onToggleLock={handleToggleLock}
                        />
                      </div>
                    </div>

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
                      <VirtualDevice
                        isLocked={isDeviceLocked}
                        onToggleLock={handleToggleLock}
                      />
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
              </>
            )}
          </main>

          {/* Zero-Trust Safety Authorization Dialog */}
          <SafetyRiskModal riskGateManager={riskGateManager} />
        </>
      )}

      {/* 3. ALWAYS-ACTIVE FLOATING WINDOW / ORB (Even if device locked or on main landing) */}
      <FloatingOrb
        voiceEngine={voiceEngine}
        taskStateManager={taskStateManager}
        onOpenDashboard={handleReopenDashboard}
        isDeviceLocked={isDeviceLocked}
        onToggleDeviceLock={handleToggleLock}
      />

      {/* Android APK Installation & Testing Dialog */}
      <InstallApkModal
        isOpen={showInstallApkModal}
        onClose={() => setShowInstallApkModal(false)}
      />
    </div>
  );
};
