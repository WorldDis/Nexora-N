import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Layers,
  Mic,
  PhoneCall,
  FolderLock,
  ChevronRight,
  Power,
  X,
  Lock,
} from 'lucide-react';

interface ActivationModalProps {
  isOpen: boolean;
  onActivate: () => void;
  onClose: () => void;
}

export const ActivationModal: React.FC<ActivationModalProps> = ({
  isOpen,
  onActivate,
  onClose,
}) => {
  const [step, setStep] = useState<'initial' | 'permissions'>('initial');

  const [permissions, setPermissions] = useState({
    accessibility: true,
    overlay: true,
    microphone: true,
    phoneCall: true,
    storage: true,
  });

  if (!isOpen) return null;

  const allGranted = Object.values(permissions).every(Boolean);

  const handleConfirmPermissions = () => {
    onActivate();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_60px_rgba(6,182,212,0.25)] relative overflow-hidden">
        {/* Futuristic glowing ambient accent */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

        {step === 'initial' ? (
          <div className="flex flex-col items-center text-center space-y-6">
            {/* Glowing Orb Logo */}
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-[0_0_40px_rgba(6,182,212,0.6)] animate-pulse">
                <Power className="w-10 h-10 text-white" />
              </div>
              <div className="absolute inset-0 rounded-full border-2 border-cyan-400/40 animate-ping"></div>
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-700/60 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>NEXORA v2.0 • AUTONOMOUS AGENT</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Activate NEXORA
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-sm mx-auto mt-2 font-bengali leading-relaxed">
                "শুধু এক ক্লিকে সক্রিয় করুন। পারমিশন দেওয়ার পর অ্যাপ স্বয়ংক্রিয়ভাবে বন্ধ হয়ে যাবে এবং ব্যাকগ্রাউন্ড ফ্লোটিং উইন্ডো সার্বক্ষণিক কাজ করবে।"
              </p>
            </div>

            {/* Quick Feature Badges */}
            <div className="grid grid-cols-2 gap-2.5 w-full text-left text-xs">
              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
                <div className="font-semibold text-cyan-300 flex items-center gap-1.5">
                  <PhoneCall className="w-3.5 h-3.5 text-cyan-400" />
                  Call Response & Cut
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">কল ধরা ও কাটার স্বয়ংক্রিয় ক্ষমতা</p>
              </div>

              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
                <div className="font-semibold text-cyan-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  Lockscreen Active
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">ডিভাইস লক থাকলেও ভয়েসে কাজ করবে</p>
              </div>

              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
                <div className="font-semibold text-cyan-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  Search, Manage & CRUD
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">Search, Create, Modify, Delete</p>
              </div>

              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
                <div className="font-semibold text-cyan-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  100% Free AI Engine
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">সবার জন্য সম্পূর্ণ বিনামূল্যে উন্মুক্ত</p>
              </div>
            </div>

            {/* Main Action Button */}
            <button
              onClick={() => setStep('permissions')}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm tracking-wide shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              <Power className="w-5 h-5 text-slate-950" />
              <span>ACTIVATE & GRANT PERMISSIONS</span>
              <ChevronRight className="w-4 h-4 text-slate-950" />
            </button>
          </div>
        ) : (
          /* STEP 2: PERMISSION AUTHORIZATION */
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="font-bold text-lg text-white">System Permission Consent</h3>
                <p className="text-xs text-slate-400 font-bengali">
                  ব্যাকগ্রাউন্ডে অটোমেটিক কাজ করতে এই পারমিশনগুলো প্রয়োজন
                </p>
              </div>
              <button
                onClick={() => setStep('initial')}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1 text-xs">
              {/* Permission 1: Accessibility */}
              <div
                onClick={() =>
                  setPermissions({ ...permissions, accessibility: !permissions.accessibility })
                }
                className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-cyan-500/50 flex items-center justify-between cursor-pointer transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-cyan-950 text-cyan-400 flex items-center justify-center">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-200">
                      Accessibility Service (অ্যাক্সেসিবিলিটি সার্ভিস)
                    </div>
                    <div className="text-[11px] text-slate-400">
                      স্ক্রিনের নোড পড়তে, ক্লিক করতে এবং টাইপ করতে সক্ষমতা
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={permissions.accessibility}
                  onChange={() => {}}
                  className="w-4 h-4 accent-cyan-500 rounded"
                />
              </div>

              {/* Permission 2: Overlay Window */}
              <div
                onClick={() => setPermissions({ ...permissions, overlay: !permissions.overlay })}
                className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-cyan-500/50 flex items-center justify-between cursor-pointer transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-950 text-blue-400 flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-200">
                      Floating Window Over Apps & Lockscreen (ফ্লোটিং উইন্ডো)
                    </div>
                    <div className="text-[11px] text-slate-400">
                      অন্যান্য সব অ্যাপ এবং লক স্ক্রিনের উপরে ভেসে থাকার অনুমতি
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={permissions.overlay}
                  onChange={() => {}}
                  className="w-4 h-4 accent-cyan-500 rounded"
                />
              </div>

              {/* Permission 3: Microphone */}
              <div
                onClick={() => setPermissions({ ...permissions, microphone: !permissions.microphone })}
                className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-cyan-500/50 flex items-center justify-between cursor-pointer transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-950 text-emerald-400 flex items-center justify-center">
                    <Mic className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-200">
                      Microphone & Voice Recognition (ভয়েস ইনপুট)
                    </div>
                    <div className="text-[11px] text-slate-400">
                      বাংলা ও ইংরেজিতে স্পষ্ট ভয়েস কমান্ড শোনার ক্ষমতা
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={permissions.microphone}
                  onChange={() => {}}
                  className="w-4 h-4 accent-cyan-500 rounded"
                />
              </div>

              {/* Permission 4: Phone & Call Management */}
              <div
                onClick={() => setPermissions({ ...permissions, phoneCall: !permissions.phoneCall })}
                className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-cyan-500/50 flex items-center justify-between cursor-pointer transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-purple-950 text-purple-400 flex items-center justify-center">
                    <PhoneCall className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-200">
                      Call Response & Call Cut (ফোন কল নিয়ন্ত্রণ)
                    </div>
                    <div className="text-[11px] text-slate-400">
                      ইনকামিং কল ধরা, কাটা ও স্বয়ংক্রিয় ডায়াল করার ব্যবস্থা
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={permissions.phoneCall}
                  onChange={() => {}}
                  className="w-4 h-4 accent-cyan-500 rounded"
                />
              </div>

              {/* Permission 5: Storage & CRUD */}
              <div
                onClick={() => setPermissions({ ...permissions, storage: !permissions.storage })}
                className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-cyan-500/50 flex items-center justify-between cursor-pointer transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-950 text-amber-400 flex items-center justify-center">
                    <FolderLock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-200">
                      Search, Manage, Create, Modify & Delete
                    </div>
                    <div className="text-[11px] text-slate-400">
                      নোট, ফাইল, কন্টাক্ট এবং অ্যাপ ডেটা তৈরি ও ম্যানেজ করা
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={permissions.storage}
                  onChange={() => {}}
                  className="w-4 h-4 accent-cyan-500 rounded"
                />
              </div>
            </div>

            {/* Confirmation & Auto-Close Button */}
            <button
              onClick={handleConfirmPermissions}
              disabled={!allGranted}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 disabled:opacity-40 text-slate-950 font-black text-xs tracking-wide shadow-lg shadow-emerald-950/50 transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-slate-950" />
              <span>ALLOW ALL & CLOSE WINDOW TO BACKGROUND</span>
            </button>
            <p className="text-[11px] text-center text-slate-400 font-bengali">
              কনফার্ম করার পর প্রধান উইন্ডো বন্ধ হবে এবং ব্যাকগ্রাউন্ড ফ্লোটিং অর্ব সক্রিয় থাকবে।
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
