import React, { useState } from 'react';
import { Wrench, Shield, Check, Plus, Code, Eye } from 'lucide-react';
import { ToolRegistry } from '../tools/ToolRegistry';
import { RiskTier, NexoraTool } from '../types';
import { RiskGateManager } from '../safety/RiskGateManager';
import { DenyAllConfirmation } from '../safety/DenyAllConfirmation';
import { interactiveConfirmation } from '../safety/InteractiveConfirmation';

interface ToolManagerProps {
  toolRegistry: ToolRegistry;
  riskGateManager: RiskGateManager;
}

export const ToolManager: React.FC<ToolManagerProps> = ({
  toolRegistry,
  riskGateManager,
}) => {
  const [tools, setTools] = useState<NexoraTool[]>(toolRegistry.getAllTools());
  const [showJsonSchema, setShowJsonSchema] = useState(false);
  const [mode, setMode] = useState<'interactive' | 'denyAll'>('interactive');

  const getRiskColor = (tier: RiskTier) => {
    switch (tier) {
      case RiskTier.LOW:
        return 'bg-emerald-950 text-emerald-400 border-emerald-800';
      case RiskTier.MEDIUM:
        return 'bg-amber-950 text-amber-400 border-amber-800';
      case RiskTier.HIGH:
        return 'bg-rose-950 text-rose-400 border-rose-800';
      case RiskTier.CRITICAL:
        return 'bg-purple-950 text-purple-400 border-purple-800';
    }
  };

  const handleTogglePolicy = (newMode: 'interactive' | 'denyAll') => {
    setMode(newMode);
    if (newMode === 'denyAll') {
      riskGateManager.setConfirmationCallback(new DenyAllConfirmation());
    } else {
      riskGateManager.setConfirmationCallback(interactiveConfirmation);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
            <Wrench className="w-4 h-4 text-cyan-400" />
            Nexora Tool Registry & Safety Gates
          </h3>
          <p className="text-xs text-slate-400">
            Registered system tools, execution handlers and risk gates
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowJsonSchema(!showJsonSchema)}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono flex items-center gap-1.5"
          >
            <Code className="w-3.5 h-3.5" />
            {showJsonSchema ? 'Hide Schema' : 'View Schema'}
          </button>
        </div>
      </div>

      {/* Safety Policy Selector */}
      <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-amber-400" />
          <div>
            <span className="font-semibold text-slate-200">Zero-Trust Authorization Mode:</span>
            <p className="text-[11px] text-slate-400">
              {mode === 'interactive'
                ? 'Prompts user with interactive dialog on MEDIUM/HIGH risk tools'
                : 'Automatically cancels all elevated risk tools (DenyAllConfirmation default)'}
            </p>
          </div>
        </div>

        <div className="flex gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => handleTogglePolicy('interactive')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              mode === 'interactive'
                ? 'bg-cyan-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Interactive
          </button>
          <button
            onClick={() => handleTogglePolicy('denyAll')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              mode === 'denyAll'
                ? 'bg-rose-700 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            DenyAll
          </button>
        </div>
      </div>

      {/* JSON Schema Preview */}
      {showJsonSchema && (
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
          <div className="text-[11px] font-mono text-cyan-400 mb-1">
            Schema passed to ReAct Planner (availableToolsJson):
          </div>
          <pre className="text-[11px] font-mono text-slate-300 overflow-x-auto max-h-48">
            {toolRegistry.getToolsJsonSchema()}
          </pre>
        </div>
      )}

      {/* Registered Tools List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {tools.map((t) => (
          <div
            key={t.name}
            className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-xs text-cyan-300">{t.name}</span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getRiskColor(
                  t.riskLevel
                )}`}
              >
                {t.riskLevel} RISK
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{t.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
