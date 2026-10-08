import React, { useState, useEffect } from 'react';
import {
  Download,
  Smartphone,
  CheckCircle2,
  ExternalLink,
  X,
  Sparkles,
  GitBranch,
  Terminal,
  HelpCircle,
  Share2,
} from 'lucide-react';

interface InstallApkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallApkModal: React.FC<InstallApkModalProps> = ({ isOpen, onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [activeTab, setActiveTab] = useState<'direct' | 'github' | 'local'>('direct');

  useEffect(() => {
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  if (!isOpen) return null;

  const handleInstallPwa = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
      }
    } else {
      // Guide user to Chrome menu
      alert(
        'আপনার অ্যান্ড্রয়েড ফোনের Chrome ব্রাউজারে উপরে ৩-ডট (⋮) মেনুতে চাপ দিন এবং "Install App" বা "Add to Home screen" নির্বাচন করুন। এটি সরাসরি অ্যাপ হিসেবে ফোনে ইনস্টল হয়ে যাবে!'
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border border-cyan-500/50 rounded-3xl p-6 shadow-[0_0_60px_rgba(6,182,212,0.3)] space-y-5 relative">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 text-cyan-400 flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                Android APK & Mobile Testing (ম্যানুয়াল টেস্ট)
              </h3>
              <p className="text-xs text-slate-400 font-bengali">
                ফোনে সরাসরি ইনস্টল ও টেস্ট করার বিকল্পসমূহ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="flex p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('direct')}
            className={`flex-1 py-2 rounded-lg font-semibold transition-all ${
              activeTab === 'direct'
                ? 'bg-cyan-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ১. ডিরেক্ট মোবাইল ইনস্টল (WebAPK)
          </button>
          <button
            onClick={() => setActiveTab('github')}
            className={`flex-1 py-2 rounded-lg font-semibold transition-all ${
              activeTab === 'github'
                ? 'bg-cyan-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ২. GitHub Actions APK
          </button>
          <button
            onClick={() => setActiveTab('local')}
            className={`flex-1 py-2 rounded-lg font-semibold transition-all ${
              activeTab === 'local'
                ? 'bg-cyan-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ৩. Android Studio
          </button>
        </div>

        {/* Tab 1: Instant Mobile WebAPK Installation */}
        {activeTab === 'direct' && (
          <div className="space-y-4 text-xs">
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                <Sparkles className="w-4 h-4" />
                <span>অ্যান্ড্রয়েড ফোনে এক ক্লিকে ইনস্টল (WebAPK)</span>
              </div>
              <p className="text-slate-300 leading-relaxed font-bengali">
                Google Chrome যেকোনো অ্যান্ড্রয়েড ফোনে এই অ্যাপটিকে সরাসরি <strong>Native Standalone APK</strong> হিসেবে ইনস্টল করে দেয়। এতে ফোনের হোমস্ক্রিনে অ্যাপ আইকন, স্প্ল্যাশ স্ক্রিন, ফুলস্ক্রিন ও ফুল ব্যাকগ্রাউন্ড মাইক্রোফোন সাপোর্ট পাবেন।
              </p>

              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-2 font-bengali">
                <div className="font-semibold text-slate-200">কীভাবে ফোনে টেস্ট করবেন:</div>
                <ol className="list-decimal list-inside text-slate-400 space-y-1">
                  <li>আপনার অ্যান্ড্রয়েড ফোনের Chrome ব্রাউজারে লিংকটি খুলুন।</li>
                  <li>নিচের <strong>"Install App to Android"</strong> বাটনে ট্যাপ করুন।</li>
                  <li>অথবা Chrome ব্রাউজারের উপরে ৩-ডট (⋮) মেনু থেকে <strong>"Install App"</strong> বা <strong>"Add to Home screen"</strong> চাপুন।</li>
                </ol>
              </div>

              <button
                onClick={handleInstallPwa}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs tracking-wide shadow-lg shadow-cyan-950/50 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
              >
                <Download className="w-4 h-4 text-slate-950" />
                <span>INSTALL APP TO ANDROID PHONE (ইনস্টল করুন)</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: GitHub Actions .apk download */}
        {activeTab === 'github' && (
          <div className="space-y-4 text-xs font-bengali">
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <GitBranch className="w-4 h-4" />
                <span>GitHub Actions থেকে Raw .apk ডাউনলোড</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                আপনার রিপোজিটরিতে <code>.github/workflows/build.yml</code> কনফিগার করা আছে। কোড পুশ করার পর GitHub সার্ভার স্বয়ংক্রিয়ভাবে <code>app-debug.apk</code> বিল্ড করে আপলোড করে।
              </p>

              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-2 text-slate-400 font-mono text-[11px]">
                <div>1. GitHub-এ আপনার রিপোজিটরি ওপেন করুন (WorldDis/Naxora-2.O)</div>
                <div>2. উপরের <strong>Actions</strong> ট্যাবে ক্লিক করুন।</div>
                <div>3. <strong>"Build Android APK"</strong> রান-এ ক্লিক করুন।</div>
                <div>4. নিচে <strong>Artifacts</strong> সেকশন থেকে <strong>nexora-debug-apk</strong> ডাউনলোড করুন!</div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Local Android Studio Build */}
        {activeTab === 'local' && (
          <div className="space-y-4 text-xs font-bengali">
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
                <Terminal className="w-4 h-4" />
                <span>Android Studio / Gradle দিয়ে সরাসরি বিল্ড</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                আপনার কম্পিউটারে বা টার্মিনালে অ্যান্ড্রয়েড প্রজেক্ট বিল্ড করতে এই কমান্ডটি চালান:
              </p>

              <pre className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-cyan-300 font-mono text-xs overflow-x-auto">
                ./gradlew assembleDebug
              </pre>

              <p className="text-slate-400 text-[11px]">
                বিল্ড শেষ হলে APK ফাইলটি তৈরি হবে:
                <br />
                <code className="text-slate-300 font-mono">
                  app/build/outputs/apk/debug/app-debug.apk
                </code>
              </p>
            </div>
          </div>
        )}

        <div className="pt-1 text-center">
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            বন্ধ করুন (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
