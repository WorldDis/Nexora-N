import React from 'react';
import {
  Terminal,
  Cpu,
  CheckCircle2,
  XCircle,
  Play,
  RotateCw,
  Clock,
  Code2,
  ShieldAlert,
} from 'lucide-react';
import { TaskState, TaskStepLog } from '../types';

interface ReActConsoleProps {
  currentState: TaskState;
  stepLogs: TaskStepLog[];
  onClearLogs: () => void;
}

export const ReActConsole: React.FC<ReActConsoleProps> = ({
  currentState,
  stepLogs,
  onClearLogs,
}) => {
  const getStateColor = (state: TaskState) => {
    switch (state) {
      case TaskState.IDLE:
        return 'bg-slate-800 text-slate-300 border-slate-700';
      case TaskState.LISTENING:
        return 'bg-rose-950/80 text-rose-300 border-rose-700 animate-pulse';
      case TaskState.UNDERSTANDING:
        return 'bg-amber-950/80 text-amber-300 border-amber-700';
      case TaskState.PLANNING:
        return 'bg-purple-950/80 text-purple-300 border-purple-700 animate-pulse';
      case TaskState.EXECUTING:
        return 'bg-cyan-950/80 text-cyan-300 border-cyan-700';
      case TaskState.COMPLETED:
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-700';
      case TaskState.FAILED:
        return 'bg-red-950/80 text-red-300 border-red-700';
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      {/* Header */}
      <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <h2 className="font-semibold text-xs tracking-wide text-slate-200 uppercase">
            ReAct Planning & Execution Log
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <div
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border flex items-center gap-1.5 ${getStateColor(
              currentState
            )}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
            {currentState}
          </div>
          {stepLogs.length > 0 && (
            <button
              onClick={onClearLogs}
              className="text-[11px] text-slate-400 hover:text-slate-200 px-2 py-0.5 rounded hover:bg-slate-800 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Step Logs Body */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 font-mono text-xs">
        {stepLogs.length === 0 ? (
          <div className="h-full min-h-[220px] flex flex-col items-center justify-center text-center p-6 text-slate-500">
            <Cpu className="w-8 h-8 mb-2 opacity-40 text-cyan-400" />
            <p className="font-medium text-slate-400">ReAct Agent Ready</p>
            <p className="text-[11px] max-w-xs mt-1">
              Speak or pick a command prompt. The agent will observe the semantic screen elements, reason step-by-step, and actuate the UI.
            </p>
          </div>
        ) : (
          stepLogs.map((log) => (
            <div
              key={log.step}
              className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 space-y-2 hover:border-slate-700 transition-all"
            >
              <div className="flex items-center justify-between text-[11px] pb-1 border-b border-slate-800/80">
                <span className="text-cyan-400 font-bold flex items-center gap-1">
                  <Play className="w-3 h-3" /> Step {log.step}
                </span>
                <span className="text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {log.timestamp}
                </span>
              </div>

              {/* Thought / Reasoning */}
              <div>
                <span className="text-[10px] text-purple-400 font-semibold block uppercase">
                  Thought / Reasoning:
                </span>
                <p className="text-slate-300 font-sans text-xs mt-0.5 leading-relaxed">
                  {log.reasoning}
                </p>
              </div>

              {/* Action / Tool */}
              {log.toolName && (
                <div className="bg-slate-900/90 rounded-lg p-2 border border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-cyan-300 font-bold flex items-center gap-1">
                      <Code2 className="w-3 h-3" /> Action: {log.toolName}
                    </span>
                    {log.result ? (
                      log.result.success ? (
                        <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> SUCCESS
                        </span>
                      ) : (
                        <span className="text-[10px] text-rose-400 flex items-center gap-1">
                          <XCircle className="w-3 h-3" /> FAILED
                        </span>
                      )
                    ) : null}
                  </div>

                  {log.parameters && Object.keys(log.parameters).length > 0 && (
                    <div className="text-[11px] text-slate-400 mt-1 bg-slate-950 p-1.5 rounded font-mono overflow-x-auto">
                      {JSON.stringify(log.parameters)}
                    </div>
                  )}

                  {log.result && (
                    <div
                      className={`text-[11px] mt-1.5 font-sans ${
                        log.result.success ? 'text-emerald-300' : 'text-rose-300'
                      }`}
                    >
                      {log.result.message}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
