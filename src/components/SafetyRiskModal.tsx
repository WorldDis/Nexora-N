import React, { useState, useEffect } from 'react';
import { ShieldAlert, ShieldCheck, Check, X, AlertTriangle, Lock } from 'lucide-react';
import {
  interactiveConfirmation,
  PendingConfirmationRequest,
} from '../safety/InteractiveConfirmation';
import { RiskTier } from '../types';
import { RiskGateManager } from '../safety/RiskGateManager';
import { DenyAllConfirmation } from '../safety/DenyAllConfirmation';

interface SafetyRiskModalProps {
  riskGateManager: RiskGateManager;
}

export const SafetyRiskModal: React.FC<SafetyRiskModalProps> = ({ riskGateManager }) => {
  const [request, setRequest] = useState<PendingConfirmationRequest | null>(null);
  const [mode, setMode] = useState<'interactive' | 'denyAll'>('interactive');

  useEffect(() => {
    const unsub = interactiveConfirmation.subscribe((req) => {
      setRequest(req);
    });
    return unsub;
  }, []);

  const handleToggleMode = (newMode: 'interactive' | 'denyAll') => {
    setMode(newMode);
    if (newMode === 'denyAll') {
      riskGateManager.setConfirmationCallback(new DenyAllConfirmation());
    } else {
      riskGateManager.setConfirmationCallback(interactiveConfirmation);
    }
  };

  const getRiskBadge = (risk: RiskTier) => {
    switch (risk) {
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

  return (
    <>
      {/* Active Authorization Prompt Modal */}
      {request && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-slate-900 border-2 border-rose-500/80 rounded-2xl p-5 shadow-[0_0_50px_rgba(244,63,94,0.3)] space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-100 text-sm">
                  Zero-Trust Safety Gate Authorization
                </h3>
                <p className="text-xs text-rose-300">
                  Elevated action requires explicit user permission
                </p>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Target Tool:</span>
                <span className="font-mono font-bold text-slate-200">{request.tool.name}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Risk Classification:</span>
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-bold border ${getRiskBadge(
                    request.tool.riskLevel
                  )}`}
                >
                  {request.tool.riskLevel}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block mb-1">Execution Parameters:</span>
                <pre className="bg-slate-900 p-2 rounded text-[11px] font-mono text-cyan-300 overflow-x-auto">
                  {JSON.stringify(request.parameters, null, 2)}
                </pre>
              </div>

              <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                {request.explanation}
              </div>
            </div>

            <div className="flex gap-2.5 pt-1">
              <button
                onClick={() => interactiveConfirmation.respond(false)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <X className="w-4 h-4 text-rose-400" />
                Deny Action
              </button>
              <button
                onClick={() => interactiveConfirmation.respond(true)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-lg shadow-rose-900/40 transition-colors"
              >
                <Check className="w-4 h-4" />
                Approve & Execute
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
