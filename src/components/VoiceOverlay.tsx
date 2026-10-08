import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, Square, Globe } from 'lucide-react';
import { VoiceEngine } from '../voice/VoiceEngine';
import { TaskState } from '../types';
import { TaskStateManager } from '../core/state/TaskStateManager';
import { NexoraEventBus } from '../core/eventbus/NexoraEventBus';

interface VoiceOverlayProps {
  voiceEngine: VoiceEngine;
  taskStateManager: TaskStateManager;
}

export const VoiceOverlay: React.FC<VoiceOverlayProps> = ({
  voiceEngine,
  taskStateManager,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback] = useState('');
  const [currentState, setCurrentState] = useState<TaskState>(TaskState.IDLE);
  const [language, setLanguage] = useState<'bn-IN' | 'en-US'>('bn-IN');
  const [manualInput, setManualInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

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

  const toggleListening = () => {
    if (isListening) {
      voiceEngine.stopListening();
    } else {
      voiceEngine.startListening();
    }
  };

  const handleStopTask = () => {
    NexoraEventBus.emit({ type: 'StopRequested', reason: 'User pressed stop button' });
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    voiceEngine.handleSpokenTranscript(manualInput.trim());
    setManualInput('');
  };

  // Quick preset voice queries in Bengali and English
  const samplePrompts = [
    { label: 'হোয়াটসঅ্যাপ খোলো (Open WhatsApp)', text: 'Open WhatsApp' },
    { label: 'রহিমকে লিখো: মিটিং কয়টায়? (Type in Chat)', text: 'Type "Meeting koytay?" in WhatsApp' },
    { label: 'সেটিংস খোলো (Open Settings)', text: 'Settings kholo' },
    { label: 'ওয়াইফাই বন্ধ করো (Toggle Wi-Fi)', text: 'Toggle Wi-Fi' },
    { label: 'নোট লিখো: বাজার তালিকা (Add Quick Note)', text: 'Open notes and type "Buy vegetables and milk"' },
    { label: 'নিচে স্ক্রোল করো (Scroll Down)', text: 'Scroll down screen' },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      {/* Speech Output Monologue / Feedback Pill */}
      {(feedback || transcript || isListening) && (
        <div className="mb-3 max-w-sm w-full bg-slate-900/95 border border-cyan-500/40 backdrop-blur-md rounded-2xl p-3 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between text-[11px] mb-1.5 pb-1 border-b border-slate-800">
            <span className="flex items-center gap-1.5 font-semibold text-cyan-400">
              <span className={`w-2 h-2 rounded-full ${isListening ? 'bg-rose-500 animate-ping' : 'bg-cyan-400'}`}></span>
              {isListening ? 'Shunchhi... (Listening)' : 'Nexora Voice Engine'}
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300">
              {language === 'bn-IN' ? 'বাংলা (Bengali)' : 'English'}
            </span>
          </div>

          {transcript && (
            <div className="text-xs text-slate-300 mb-2 font-bengali">
              <span className="text-[10px] text-slate-500 block">User Spoke:</span>
              "{transcript}"
            </div>
          )}

          {feedback && (
            <div className="text-xs text-cyan-200 bg-cyan-950/60 border border-cyan-800/40 rounded-lg p-2 font-bengali flex items-start gap-2">
              <Volume2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
              <div>{feedback}</div>
            </div>
          )}
        </div>
      )}

      {/* Expanded Quick Action & Language Control Drawer */}
      {isExpanded && (
        <div className="mb-3 w-80 bg-slate-900/95 border border-slate-700 backdrop-blur-md rounded-2xl p-3 shadow-2xl">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs">
            <span className="font-bold text-slate-200">Voice Overlay Controls</span>
            <button
              onClick={() => {
                const next = language === 'bn-IN' ? 'en-US' : 'bn-IN';
                setLanguage(next);
                voiceEngine.setLanguage(next);
              }}
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px]"
            >
              <Globe className="w-3 h-3 text-cyan-400" />
              {language === 'bn-IN' ? 'Switch to English' : 'বাংলায় সুইচ করুন'}
            </button>
          </div>

          {/* Quick Preset Commands */}
          <div className="text-[11px] text-slate-400 mb-1.5 font-medium">Quick Spoken Commands:</div>
          <div className="grid grid-cols-1 gap-1.5 max-h-44 overflow-y-auto pr-1">
            {samplePrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  voiceEngine.handleSpokenTranscript(p.text);
                }}
                className="text-left px-2.5 py-1.5 rounded-lg bg-slate-950/80 hover:bg-cyan-950/50 hover:border-cyan-600/40 border border-slate-800 text-xs text-slate-200 transition-colors flex items-center justify-between group"
              >
                <span className="truncate">{p.label}</span>
                <span className="text-[10px] text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  Run
                </span>
              </button>
            ))}
          </div>

          {/* Direct Text Prompt Input */}
          <form onSubmit={handleManualSubmit} className="mt-2.5 pt-2 border-t border-slate-800 flex gap-1.5">
            <input
              type="text"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="Or type voice command here..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              className="px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold"
            >
              Send
            </button>
          </form>
        </div>
      )}

      {/* Floating Action Buttons / Bolo (Speak) Trigger */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          title="Toggle Voice Commands & Language"
          className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 shadow-lg flex items-center gap-1.5"
        >
          <Globe className="w-3.5 h-3.5 text-cyan-400" />
          {isExpanded ? 'Hide' : 'Prompts'}
        </button>

        {currentState !== TaskState.IDLE && currentState !== TaskState.COMPLETED && currentState !== TaskState.FAILED && (
          <button
            onClick={handleStopTask}
            title="Stop Current Task"
            className="p-3 rounded-full bg-rose-600 hover:bg-rose-500 text-white shadow-lg transition-transform hover:scale-105"
          >
            <Square className="w-4 h-4 fill-current" />
          </button>
        )}

        {/* Floating "Bolo" (Speak) Button mimicking Android VoiceOverlayService */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleListening();
          }}
          aria-label="Voice command shuru koro"
          className={`relative flex items-center gap-2 px-5 py-3 rounded-full font-bold text-sm shadow-2xl cursor-pointer transition-all duration-300 active:scale-95 ${
            isListening
              ? 'bg-gradient-to-r from-rose-600 to-red-500 text-white ring-4 ring-rose-500/40 animate-pulse'
              : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white ring-2 ring-cyan-400/40 hover:scale-105'
          }`}
        >
          {isListening ? (
            <>
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
              </span>
              <MicOff className="w-4 h-4" />
              <span>Shunchhi...</span>
            </>
          ) : (
            <>
              <Mic className="w-4 h-4" />
              <span>Bolo (Speak)</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
