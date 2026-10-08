import React, { useState, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  PhoneCall,
  PhoneOff,
  Search,
  Plus,
  Trash2,
  Maximize2,
  Lock,
  Unlock,
  Radio,
  Sparkles,
  ChevronUp,
  ChevronDown,
  Layers,
  ArrowUpDown,
  Send,
} from 'lucide-react';
import { VoiceEngine } from '../voice/VoiceEngine';
import { TaskStateManager } from '../core/state/TaskStateManager';
import { TaskState } from '../types';
import { NexoraEventBus } from '../core/eventbus/NexoraEventBus';

interface FloatingOrbProps {
  voiceEngine: VoiceEngine;
  taskStateManager: TaskStateManager;
  onOpenDashboard: () => void;
  isDeviceLocked: boolean;
  onToggleDeviceLock: () => void;
}

export const FloatingOrb: React.FC<FloatingOrbProps> = ({
  voiceEngine,
  taskStateManager,
  onOpenDashboard,
  isDeviceLocked,
  onToggleDeviceLock,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback] = useState('');
  const [currentState, setCurrentState] = useState<TaskState>(TaskState.IDLE);
  const [isExpanded, setIsExpanded] = useState(false);
  const [language, setLanguage] = useState<'bn-IN' | 'en-US'>('bn-IN');
  const [customInput, setCustomInput] = useState('');

  useEffect(() => {
    const unsubVoice = voiceEngine.subscribe((state) => {
      setIsListening(state.isListening);
      if (state.transcript) setTranscript(state.transcript);
      if (state.feedback) setFeedback(state.feedback);
    });

    const unsubState = taskStateManager.onStateChange((state) => {
      setCurrentState(state);
    });

    return () => {
      unsubVoice();
      unsubState();
    };
  }, [voiceEngine, taskStateManager]);

  const handleToggleListening = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (isListening) {
      voiceEngine.stopListening();
    } else {
      voiceEngine.startListening();
      // If closed, also open the action drawer so user sees everything clearly
      setIsExpanded(true);
    }
  };

  const executeVoiceCommand = (cmdText: string) => {
    voiceEngine.handleSpokenTranscript(cmdText);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;
    executeVoiceCommand(customInput.trim());
    setCustomInput('');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-auto select-none">
      {/* Speech Output Monologue / Feedback Pill */}
      {(feedback || transcript || isListening) && (
        <div className="mb-3 max-w-sm w-80 sm:w-96 bg-slate-900/95 border-2 border-cyan-500/70 backdrop-blur-xl rounded-2xl p-3.5 shadow-[0_0_40px_rgba(6,182,212,0.35)] animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center justify-between text-[11px] mb-2 pb-1.5 border-b border-slate-800">
            <span className="flex items-center gap-2 font-bold text-cyan-400">
              <span className={`w-2.5 h-2.5 rounded-full ${isListening ? 'bg-rose-500 animate-ping' : 'bg-cyan-400'}`}></span>
              {isListening ? 'Shunchhi... (Listening to Voice)' : 'Nexora AI Voice Sentinel'}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-950 text-cyan-300 font-mono font-bold">
              {currentState}
            </span>
          </div>

          {transcript && (
            <div className="text-xs text-slate-200 mb-2 font-bengali bg-slate-950/70 p-2 rounded-lg border border-slate-800">
              <span className="text-[10px] text-cyan-400 font-bold block uppercase tracking-wider">User Spoke:</span>
              "{transcript}"
            </div>
          )}

          {feedback && (
            <div className="text-xs text-cyan-200 bg-cyan-950/70 border border-cyan-700/50 rounded-lg p-2.5 font-bengali flex items-start gap-2">
              <Volume2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>{feedback}</div>
            </div>
          )}

          {isListening && !transcript && (
            <div className="text-[11px] text-cyan-300 font-bengali animate-pulse flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              কথা বলুন বা নিচের অ্যাকশন সিলেক্ট করুন...
            </div>
          )}
        </div>
      )}

      {/* Expanded Quick Action Control Card */}
      {isExpanded && (
        <div className="mb-3 w-80 sm:w-96 bg-slate-900/95 border border-cyan-500/40 backdrop-blur-xl rounded-3xl p-4 shadow-2xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-white">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Nexora Background Actions</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  const next = language === 'bn-IN' ? 'en-US' : 'bn-IN';
                  setLanguage(next);
                  voiceEngine.setLanguage(next);
                }}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold cursor-pointer"
              >
                {language === 'bn-IN' ? 'EN' : 'বাংলা'}
              </button>
              <button
                type="button"
                onClick={onOpenDashboard}
                title="Expand Full App & Device Dashboard"
                className="p-1 rounded bg-slate-800 hover:bg-cyan-900 text-cyan-300 cursor-pointer"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Voice Command Grid (Call response, cut, search, manage, arrange, modify, create, delete) */}
          <div className="text-[11px] font-semibold text-slate-400">Autonomous Voice Shortcuts:</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* 1. Answer Call */}
            <button
              type="button"
              onClick={() => executeVoiceCommand('Call dhoro')}
              className="p-2.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-700/50 text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
                <PhoneCall className="w-3.5 h-3.5" />
                Call Answer
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5 font-bengali">"কল ধরো / Receive"</p>
            </button>

            {/* 2. Cut Call */}
            <button
              type="button"
              onClick={() => executeVoiceCommand('Call kete dao')}
              className="p-2.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 border border-rose-700/50 text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-1.5 text-rose-400 font-bold text-[11px]">
                <PhoneOff className="w-3.5 h-3.5" />
                Call Cut
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5 font-bengali">"কল কেটে দাও / Reject"</p>
            </button>

            {/* 3. Search Anything */}
            <button
              type="button"
              onClick={() => executeVoiceCommand('Search weather forecast')}
              className="p-2.5 rounded-xl bg-blue-950/60 hover:bg-blue-900/80 border border-blue-700/50 text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-1.5 text-blue-400 font-bold text-[11px]">
                <Search className="w-3.5 h-3.5" />
                Search Web
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5 font-bengali">"খোঁজ / Search anything"</p>
            </button>

            {/* 4. Create Note */}
            <button
              type="button"
              onClick={() => executeVoiceCommand('Create note: Meeting today at 5 PM')}
              className="p-2.5 rounded-xl bg-amber-950/60 hover:bg-amber-900/80 border border-amber-700/50 text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[11px]">
                <Plus className="w-3.5 h-3.5" />
                Create Note
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5 font-bengali">"নতুন নোট লিখো"</p>
            </button>

            {/* 5. Modify Note */}
            <button
              type="button"
              onClick={() => executeVoiceCommand('Modify note to: Updated meeting agenda')}
              className="p-2.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/80 border border-purple-700/50 text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-1.5 text-purple-400 font-bold text-[11px]">
                <Sparkles className="w-3.5 h-3.5" />
                Modify Note
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5 font-bengali">"নোট পরিবর্তন করো"</p>
            </button>

            {/* 6. Arrange Items */}
            <button
              type="button"
              onClick={() => executeVoiceCommand('Arrange all notes')}
              className="p-2.5 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-700/50 text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-1.5 text-cyan-400 font-bold text-[11px]">
                <ArrowUpDown className="w-3.5 h-3.5" />
                Arrange Items
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5 font-bengali">"সব সাজাও / Arrange"</p>
            </button>

            {/* 7. Delete Item */}
            <button
              type="button"
              onClick={() => executeVoiceCommand('Delete note')}
              className="p-2.5 rounded-xl bg-red-950/60 hover:bg-red-900/80 border border-red-700/50 text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-1.5 text-rose-400 font-bold text-[11px]">
                <Trash2 className="w-3.5 h-3.5" />
                Delete Item
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5 font-bengali">"মুছে ফেলো / Delete"</p>
            </button>

            {/* 8. Toggle Lockscreen */}
            <button
              type="button"
              onClick={onToggleDeviceLock}
              className={`p-2.5 rounded-xl text-left transition-all border cursor-pointer ${
                isDeviceLocked
                  ? 'bg-amber-950/80 border-amber-600/80 text-amber-300'
                  : 'bg-slate-950/80 border-slate-800 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold text-[11px]">
                {isDeviceLocked ? <Lock className="w-3.5 h-3.5 text-amber-400" /> : <Unlock className="w-3.5 h-3.5 text-slate-400" />}
                {isDeviceLocked ? 'Screen Locked' : 'Screen Unlocked'}
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5 font-bengali">লক অবস্থায় ভয়েস টেস্ট</p>
            </button>
          </div>

          {/* Quick Voice / Text command input */}
          <form onSubmit={handleCustomSubmit} className="pt-2 border-t border-slate-800 flex gap-1.5">
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="Type any command (e.g. 'call dhoro')..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs flex items-center justify-center cursor-pointer"
            >
              <Send className="w-3.5 h-3.5 text-slate-950" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Circular Action Orb */}
      <div className="flex items-center gap-3">
        {/* Toggle Expand / Minimize Drawer */}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-3 rounded-full bg-slate-900 hover:bg-slate-800 border-2 border-slate-700 text-slate-300 shadow-xl transition-all cursor-pointer"
          title="Toggle Nexora Floating Actions"
        >
          {isExpanded ? <ChevronDown className="w-4 h-4 text-cyan-400" /> : <ChevronUp className="w-4 h-4 text-cyan-400" />}
        </button>

        {/* Floating "Bolo" (Speak) Trigger Orb */}
        <button
          type="button"
          onClick={handleToggleListening}
          aria-label="Nexora voice command"
          className={`relative group flex items-center gap-3 px-5 py-3.5 rounded-full font-black text-sm tracking-wide shadow-[0_0_40px_rgba(6,182,212,0.6)] cursor-pointer transition-all duration-300 active:scale-95 ${
            isListening
              ? 'bg-gradient-to-r from-rose-600 via-red-500 to-amber-500 text-white ring-4 ring-rose-500/50 animate-pulse scale-105'
              : 'bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 hover:from-cyan-300 hover:to-blue-400 text-slate-950 ring-2 ring-cyan-400/50 hover:scale-105'
          }`}
        >
          {/* Animated sound ripple */}
          {isListening ? (
            <>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-3.5 bg-white rounded-full animate-bounce"></span>
                <span className="w-1.5 h-5 bg-white rounded-full animate-bounce delay-75"></span>
                <span className="w-1.5 h-2.5 bg-white rounded-full animate-bounce delay-150"></span>
              </div>
              <MicOff className="w-5 h-5 text-white" />
              <span>Shunchhi... (Listening)</span>
            </>
          ) : (
            <>
              <div className="relative">
                <Mic className="w-5 h-5 text-slate-950" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
              </div>
              <span>Bolo (Nexora Active)</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
