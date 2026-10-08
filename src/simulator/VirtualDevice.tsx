import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Settings as SettingsIcon,
  Users,
  FileText,
  Globe,
  Calculator,
  Search,
  Send,
  Wifi,
  BatteryCharging,
  Signal,
  CheckCircle,
  Plus,
  Trash2,
  PhoneCall,
  Volume2,
  Shield,
  ArrowLeft,
  Lock,
  Unlock,
  PhoneIncoming,
  PhoneOff,
  Flame,
  ArrowUpDown,
  Edit2,
  Check,
} from 'lucide-react';
import { deviceManager } from './DeviceContext';

interface Contact {
  id: string;
  name: string;
  phone: string;
  lastMessage: string;
}

interface Note {
  id: string;
  title: string;
  date: string;
}

interface VirtualDeviceProps {
  isLocked?: boolean;
  onToggleLock?: () => void;
}

export const VirtualDevice: React.FC<VirtualDeviceProps> = ({
  isLocked: externalLocked,
  onToggleLock: externalToggleLock,
}) => {
  const [internalLocked, setInternalLocked] = useState(false);
  const isLocked = externalLocked !== undefined ? externalLocked : internalLocked;
  const toggleLock = externalToggleLock || (() => setInternalLocked((prev) => !prev));

  const [activePackage, setActivePackage] = useState<string>('com.whatsapp');
  const [highlightBox, setHighlightBox] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
    label: string;
  } | null>(null);

  // Incoming Call State
  const [incomingCall, setIncomingCall] = useState<{
    caller: string;
    number: string;
    isActive: boolean;
    isAnswered: boolean;
  } | null>({
    caller: 'Rahim Chowdhury',
    number: '+880 1711-234567',
    isActive: false,
    isAnswered: false,
  });

  // Active call duration timer
  const [callDuration, setCallDuration] = useState(0);

  // WhatsApp state
  const [activeChat, setActiveChat] = useState<string | null>('Rahim Chowdhury');
  const [chatInput, setChatInput] = useState<string>('');
  const [messages, setMessages] = useState<Record<string, string[]>>({
    'Rahim Chowdhury': ['Kemon acho?', 'Meeting ki ajke hobe?'],
    'Fatima Begum': ['Documents gulo pathiyechi.'],
    'Tanvir Ahmed': ['Nexora test shuru koro.'],
  });

  // Settings state
  const [wifiEnabled, setWifiEnabled] = useState(true);
  const [bluetoothEnabled, setBluetoothEnabled] = useState(false);
  const [airplaneMode, setAirplaneMode] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(80);

  // Contacts state
  const [contactsSearch, setContactsSearch] = useState('');
  const [contacts, setContacts] = useState<Contact[]>([
    { id: '1', name: 'Rahim Chowdhury', phone: '+880 1711-234567', lastMessage: 'Meeting ki ajke hobe?' },
    { id: '2', name: 'Fatima Begum', phone: '+880 1819-987654', lastMessage: 'Documents gulo pathiyechi.' },
    { id: '3', name: 'Tanvir Ahmed', phone: '+880 1912-345678', lastMessage: 'Nexora test shuru koro.' },
    { id: '4', name: 'Adil Khan', phone: '+880 1678-554433', lastMessage: 'Call me later.' },
  ]);

  // Notes state (Manage, Arrange, Create, Modify, Delete)
  const [notes, setNotes] = useState<Note[]>([
    { id: '1', title: 'Buy groceries: milk, tea, biscuits', date: 'Today, 10:30 AM' },
    { id: '2', title: 'Prepare Nexora v2 release notes', date: 'Yesterday' },
    { id: '3', title: 'Meeting agenda with engineering team', date: '2 days ago' },
  ]);
  const [newNoteText, setNewNoteText] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteText, setEditingNoteText] = useState('');

  // Browser state
  const [browserUrl, setBrowserUrl] = useState('https://nexora.agent/docs');
  const [searchQuery, setSearchQuery] = useState('');

  // Calculator state
  const [calcDisplay, setCalcDisplay] = useState('0');

  const screenRef = useRef<HTMLDivElement>(null);

  // Call duration counter
  useEffect(() => {
    let interval: any;
    if (incomingCall?.isActive && incomingCall.isAnswered) {
      interval = setInterval(() => setCallDuration((c) => c + 1), 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(interval);
  }, [incomingCall?.isActive, incomingCall?.isAnswered]);

  // Register deviceManager capabilities
  useEffect(() => {
    deviceManager.setScreenState({
      activeAppPackage: activePackage,
      appName: getAppName(activePackage),
      screenRef: screenRef.current,
      launchApp: (pkg: string) => {
        const valid = [
          'com.whatsapp',
          'com.android.settings',
          'com.google.android.contacts',
          'com.nexora.notes',
          'com.android.browser',
          'com.android.calculator',
        ].includes(pkg);
        if (valid) {
          setActivePackage(pkg);
          return true;
        }
        return false;
      },
      highlightElement: (el: HTMLElement | null, label?: string) => {
        if (!el || !screenRef.current) {
          setHighlightBox(null);
          return;
        }
        const screenRect = screenRef.current.getBoundingClientRect();
        const elRect = el.getBoundingClientRect();
        setHighlightBox({
          x: elRect.left - screenRect.left,
          y: elRect.top - screenRect.top,
          width: elRect.width,
          height: elRect.height,
          label: label || el.innerText || 'Selected Element',
        });
        setTimeout(() => setHighlightBox(null), 2500);
      },
      scrollElement: (direction: 'FORWARD' | 'BACKWARD') => {
        if (screenRef.current) {
          const delta = direction === 'FORWARD' ? 220 : -220;
          screenRef.current.scrollBy({ top: delta, behavior: 'smooth' });
          return true;
        }
        return false;
      },
      // Extended Actions for Autonomous Voice Agent:
      answerCall: () => {
        setIncomingCall((prev) =>
          prev ? { ...prev, isActive: true, isAnswered: true } : null
        );
      },
      cutCall: () => {
        setIncomingCall((prev) =>
          prev ? { ...prev, isActive: false, isAnswered: false } : null
        );
      },
      placeCall: (target: string) => {
        setIncomingCall({
          caller: target,
          number: '+880 1711-000000',
          isActive: true,
          isAnswered: true,
        });
      },
      createItem: (type: string, content: string) => {
        if (type === 'note') {
          setNotes((prev) => [
            { id: Date.now().toString(), title: content, date: 'Just now (via Voice)' },
            ...prev,
          ]);
          setActivePackage('com.nexora.notes');
        } else if (type === 'contact') {
          setContacts((prev) => [
            { id: Date.now().toString(), name: content, phone: '+880 1800-000000', lastMessage: 'Added' },
            ...prev,
          ]);
          setActivePackage('com.google.android.contacts');
        }
      },
      modifyItem: (target: string, content: string) => {
        setNotes((prev) =>
          prev.map((n, i) => (i === 0 ? { ...n, title: content } : n))
        );
      },
      deleteItem: (target: string) => {
        setNotes((prev) => prev.slice(1));
      },
      arrangeItems: (sortBy: string) => {
        setNotes((prev) => [...prev].reverse());
      },
      performSearch: (query: string) => {
        setActivePackage('com.android.browser');
        setSearchQuery(query);
        setBrowserUrl(`https://google.com/search?q=${encodeURIComponent(query)}`);
      },
    } as any);
  }, [activePackage, isLocked]);

  function getAppName(pkg: string): string {
    switch (pkg) {
      case 'com.whatsapp':
        return 'WhatsApp';
      case 'com.android.settings':
        return 'Settings';
      case 'com.google.android.contacts':
        return 'Contacts';
      case 'com.nexora.notes':
        return 'Quick Notes';
      case 'com.android.browser':
        return 'Browser';
      case 'com.android.calculator':
        return 'Calculator';
      default:
        return 'System Home';
    }
  }

  const handleSendMessage = () => {
    if (!chatInput.trim() || !activeChat) return;
    setMessages((prev) => ({
      ...prev,
      [activeChat]: [...(prev[activeChat] || []), chatInput],
    }));
    setChatInput('');
  };

  const handleAddNote = () => {
    if (!newNoteText.trim()) return;
    setNotes((prev) => [
      { id: Date.now().toString(), title: newNoteText, date: 'Just now' },
      ...prev,
    ]);
    setNewNoteText('');
  };

  const triggerMockCall = () => {
    setIncomingCall({
      caller: 'Rahim Chowdhury',
      number: '+880 1711-234567',
      isActive: true,
      isAnswered: false,
    });
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative select-none">
      {/* Device Top Chrome / Status Bar */}
      <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-300">10:45 AM</span>
          <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800/60 font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
            NEXORA SENTINEL BACKGROUND ACTIVE
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick Lock / Unlock Simulation Toggle */}
          <button
            onClick={toggleLock}
            title={isLocked ? 'Unlock device screen' : 'Simulate screen lock'}
            className={`px-2 py-0.5 rounded flex items-center gap-1 text-[11px] font-semibold transition-all ${
              isLocked
                ? 'bg-amber-950 text-amber-300 border border-amber-700/60'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {isLocked ? (
              <>
                <Lock className="w-3 h-3 text-amber-400" />
                Locked
              </>
            ) : (
              <>
                <Unlock className="w-3 h-3 text-slate-400" />
                Unlocked
              </>
            )}
          </button>

          {/* Test Incoming Call Trigger */}
          <button
            onClick={triggerMockCall}
            title="Simulate incoming call to test hands-free voice response/cut"
            className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700/60 hover:bg-emerald-900 text-[11px] font-semibold flex items-center gap-1"
          >
            <PhoneIncoming className="w-3 h-3 text-emerald-400" />
            Simulate Call
          </button>

          <div className="flex items-center gap-1.5 text-slate-400">
            <Signal className="w-3.5 h-3.5" />
            <Wifi className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[11px]">88%</span>
            <BatteryCharging className="w-4 h-4 text-emerald-400" />
          </div>
        </div>
      </div>

      {/* App Bar / Quick App Switcher (when not locked) */}
      {!isLocked && (
        <div className="bg-slate-950/70 border-b border-slate-800 px-3 py-1.5 flex items-center justify-between overflow-x-auto gap-1 text-xs">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActivePackage('com.whatsapp')}
              data-clickable="true"
              aria-label="Switch to WhatsApp"
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all text-xs font-medium ${
                activePackage === 'com.whatsapp'
                  ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50'
                  : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              WhatsApp
            </button>
            <button
              onClick={() => setActivePackage('com.android.settings')}
              data-clickable="true"
              aria-label="Switch to Settings"
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all text-xs font-medium ${
                activePackage === 'com.android.settings'
                  ? 'bg-blue-600/30 text-blue-300 border border-blue-500/50'
                  : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <SettingsIcon className="w-3.5 h-3.5" />
              Settings
            </button>
            <button
              onClick={() => setActivePackage('com.google.android.contacts')}
              data-clickable="true"
              aria-label="Switch to Contacts"
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all text-xs font-medium ${
                activePackage === 'com.google.android.contacts'
                  ? 'bg-purple-600/30 text-purple-300 border border-purple-500/50'
                  : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Contacts
            </button>
            <button
              onClick={() => setActivePackage('com.nexora.notes')}
              data-clickable="true"
              aria-label="Switch to Notes"
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all text-xs font-medium ${
                activePackage === 'com.nexora.notes'
                  ? 'bg-amber-600/30 text-amber-300 border border-amber-500/50'
                  : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Notes
            </button>
            <button
              onClick={() => setActivePackage('com.android.browser')}
              data-clickable="true"
              aria-label="Switch to Browser"
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all text-xs font-medium ${
                activePackage === 'com.android.browser'
                  ? 'bg-cyan-600/30 text-cyan-300 border border-cyan-500/50'
                  : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              Browser
            </button>
            <button
              onClick={() => setActivePackage('com.android.calculator')}
              data-clickable="true"
              aria-label="Switch to Calculator"
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all text-xs font-medium ${
                activePackage === 'com.android.calculator'
                  ? 'bg-rose-600/30 text-rose-300 border border-rose-500/50'
                  : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              Calculator
            </button>
          </div>

          <div className="text-[11px] font-mono text-slate-500 shrink-0">
            pkg: <span className="text-cyan-400">{activePackage}</span>
          </div>
        </div>
      )}

      {/* Screen Body Container */}
      <div
        id="nexora-virtual-screen"
        ref={screenRef}
        className="flex-1 overflow-y-auto p-4 bg-slate-900/90 relative min-h-[460px]"
      >
        {/* Dynamic Highlight Box for Accessibility Inspection */}
        {highlightBox && (
          <div
            style={{
              position: 'absolute',
              left: `${highlightBox.x - 3}px`,
              top: `${highlightBox.y - 3}px`,
              width: `${highlightBox.width + 6}px`,
              height: `${highlightBox.height + 6}px`,
              pointerEvents: 'none',
              zIndex: 50,
            }}
            className="border-2 border-cyan-400 rounded bg-cyan-400/10 shadow-[0_0_15px_rgba(6,182,212,0.6)] animate-pulse transition-all"
          >
            <span className="absolute -top-6 left-0 bg-cyan-500 text-slate-950 font-bold text-[10px] px-1.5 py-0.5 rounded shadow">
              {highlightBox.label}
            </span>
          </div>
        )}

        {/* INCOMING OR ACTIVE PHONE CALL OVERLAY */}
        {incomingCall && incomingCall.isActive && (
          <div className="mb-4 bg-gradient-to-r from-emerald-950/90 via-slate-950 to-emerald-950/90 border-2 border-emerald-500/80 rounded-2xl p-4 shadow-[0_0_30px_rgba(16,185,129,0.3)] animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg text-white shadow-lg ${
                  incomingCall.isAnswered ? 'bg-emerald-600 animate-pulse' : 'bg-emerald-500 animate-bounce'
                }`}>
                  <PhoneCall className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700/50 inline-block mb-1">
                    {incomingCall.isAnswered ? `Call in Progress (${callDuration}s)` : 'Incoming Phone Call...'}
                  </span>
                  <h4 className="font-bold text-base text-white">{incomingCall.caller}</h4>
                  <p className="text-xs text-slate-400 font-mono">{incomingCall.number}</p>
                </div>
              </div>

              {/* Call Controls */}
              <div className="flex items-center gap-2">
                {!incomingCall.isAnswered ? (
                  <>
                    <button
                      onClick={() => setIncomingCall({ ...incomingCall, isAnswered: true })}
                      data-clickable="true"
                      aria-label="Answer Call"
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-900/50"
                    >
                      <PhoneCall className="w-4 h-4" />
                      Answer ("Call dhoro")
                    </button>
                    <button
                      onClick={() => setIncomingCall({ ...incomingCall, isActive: false })}
                      data-clickable="true"
                      aria-label="Cut Call"
                      className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-rose-900/50"
                    >
                      <PhoneOff className="w-4 h-4" />
                      Cut ("Call kete dao")
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIncomingCall({ ...incomingCall, isActive: false, isAnswered: false })}
                    data-clickable="true"
                    aria-label="End Call"
                    className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-rose-900/50"
                  >
                    <PhoneOff className="w-4 h-4" />
                    Disconnect Call
                  </button>
                )}
              </div>
            </div>
            <div className="mt-2 text-[11px] text-cyan-300/80 bg-cyan-950/40 p-2 rounded-lg border border-cyan-800/40 flex items-center justify-between">
              <span>🎤 Nexora Voice command: "Call dhoro" (Answer) or "Call kete dao" (Cut)</span>
              <span className="font-mono text-emerald-400">Hands-free</span>
            </div>
          </div>
        )}

        {/* DEVICE LOCK SCREEN VIEW */}
        {isLocked ? (
          <div className="flex flex-col items-center justify-center py-10 space-y-6 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-amber-400 shadow-xl">
              <Lock className="w-8 h-8" />
            </div>

            <div>
              <div className="text-5xl font-extralight tracking-tight text-white font-mono">
                10:45
              </div>
              <div className="text-sm text-slate-400 font-medium mt-1">
                Wednesday, October 8 • Device Screen Locked
              </div>
            </div>

            {/* Lockscreen Sentinel Status Badge */}
            <div className="max-w-md w-full bg-slate-950/90 border border-cyan-500/50 rounded-2xl p-4 text-left shadow-2xl backdrop-blur-md">
              <div className="flex items-center gap-2.5 text-cyan-400 text-xs font-bold mb-2 pb-1.5 border-b border-slate-800">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
                <span>NEXORA LOCKSCREEN SENTINEL IS ACTIVE</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Device is locked, but Nexora's floating background window is actively listening.
                You can answer/cut calls, create notes, search, or control settings without touching the screen!
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={triggerMockCall}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 text-xs font-medium border border-emerald-500/40"
                >
                  Test Call While Locked
                </button>
                <button
                  onClick={toggleLock}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                >
                  Swipe to Unlock
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* UNLOCKED APP VIEWS */
          <>
            {/* 1. WHATSAPP APP */}
            {activePackage === 'com.whatsapp' && (
              <div className="flex flex-col h-full space-y-4">
                <div className="bg-emerald-900/40 border border-emerald-700/50 rounded-xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-white shadow">
                      WA
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-100 flex items-center gap-2">
                        WhatsApp Messenger
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-normal">
                          Online
                        </span>
                      </h3>
                      <p className="text-xs text-emerald-300">Chats & Direct Messaging</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setActiveChat('Rahim Chowdhury')}
                      data-clickable="true"
                      className="px-2.5 py-1 text-xs rounded bg-emerald-700/50 hover:bg-emerald-700 text-white"
                    >
                      Chats
                    </button>
                    <button
                      data-clickable="true"
                      className="px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                    >
                      Status
                    </button>
                  </div>
                </div>

                {/* Chat List / Active Conversation */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 flex-1">
                  <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-2 space-y-1">
                    <div className="text-[11px] font-semibold text-slate-400 px-2 py-1 uppercase tracking-wider">
                      Recent Conversations
                    </div>
                    {['Rahim Chowdhury', 'Fatima Begum', 'Tanvir Ahmed'].map((name) => (
                      <button
                        key={name}
                        onClick={() => setActiveChat(name)}
                        data-clickable="true"
                        aria-label={`Open chat with ${name}`}
                        className={`w-full text-left p-2 rounded-lg flex items-center gap-2.5 transition-all ${
                          activeChat === name
                            ? 'bg-emerald-950/70 border border-emerald-600/50 text-emerald-200'
                            : 'text-slate-300 hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-200">
                          {name[0]}
                        </div>
                        <div className="truncate flex-1">
                          <div className="text-xs font-medium">{name}</div>
                          <div className="text-[10px] text-slate-400 truncate">
                            {messages[name]?.[messages[name].length - 1] || 'Tap to chat'}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Chat View */}
                  <div className="md:col-span-2 bg-slate-950/60 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
                    <div>
                      <div className="pb-2 border-b border-slate-800 flex items-center justify-between">
                        <span className="font-semibold text-sm text-slate-200">
                          {activeChat || 'Select a chat'}
                        </span>
                        <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                          Active
                        </span>
                      </div>

                      <div className="py-3 space-y-2 min-h-[140px] max-h-[220px] overflow-y-auto">
                        {activeChat &&
                          messages[activeChat]?.map((msg, idx) => (
                            <div
                              key={idx}
                              className={`flex ${idx % 2 === 0 ? 'justify-start' : 'justify-end'}`}
                            >
                              <div
                                className={`max-w-[80%] rounded-xl px-3 py-1.5 text-xs ${
                                  idx % 2 === 0
                                    ? 'bg-slate-800 text-slate-200 border border-slate-700'
                                    : 'bg-emerald-600 text-white shadow'
                                }`}
                              >
                                {msg}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* Chat Input Field */}
                    <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
                      <input
                        type="text"
                        id="whatsapp-chat-input"
                        data-editable="true"
                        placeholder="Type a message..."
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        onClick={handleSendMessage}
                        data-clickable="true"
                        aria-label="Send message"
                        className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. SETTINGS APP */}
            {activePackage === 'com.android.settings' && (
              <div className="space-y-4">
                <div className="bg-blue-950/40 border border-blue-800/50 rounded-xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white shadow">
                      <SettingsIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-100">Android System Settings</h3>
                      <p className="text-xs text-blue-300">Accessibility, Network & Hardware</p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950/60 border border-slate-800 rounded-xl divide-y divide-slate-800 text-xs">
                  {/* Wi-Fi Setting */}
                  <div className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Wifi className="w-4 h-4 text-cyan-400" />
                      <div>
                        <div className="font-medium text-slate-200">Wi-Fi Network</div>
                        <div className="text-[11px] text-slate-400">
                          {wifiEnabled ? 'Connected to Nexora-HighSpeed-5G' : 'Disconnected'}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setWifiEnabled(!wifiEnabled)}
                      data-clickable="true"
                      aria-label="Toggle Wi-Fi"
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                        wifiEnabled ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {wifiEnabled ? 'ON' : 'OFF'}
                    </button>
                  </div>

                  {/* Bluetooth */}
                  <div className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Signal className="w-4 h-4 text-purple-400" />
                      <div>
                        <div className="font-medium text-slate-200">Bluetooth</div>
                        <div className="text-[11px] text-slate-400">
                          {bluetoothEnabled ? 'Visible to nearby devices' : 'Turned off'}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setBluetoothEnabled(!bluetoothEnabled)}
                      data-clickable="true"
                      aria-label="Toggle Bluetooth"
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                        bluetoothEnabled ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {bluetoothEnabled ? 'ON' : 'OFF'}
                    </button>
                  </div>

                  {/* Nexora Accessibility Service Status */}
                  <div className="p-3 flex items-center justify-between bg-cyan-950/30">
                    <div className="flex items-center gap-2.5">
                      <Shield className="w-4 h-4 text-cyan-400" />
                      <div>
                        <div className="font-medium text-cyan-200 flex items-center gap-1.5">
                          NEXORA Accessibility Service
                          <span className="text-[10px] px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded font-normal">
                            Granted
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Full semantic node tree inspection & click dispatch
                        </div>
                      </div>
                    </div>
                    <button
                      data-clickable="true"
                      aria-label="Accessibility Settings"
                      className="px-3 py-1 rounded bg-cyan-900/60 hover:bg-cyan-800 text-cyan-200 text-xs font-medium"
                    >
                      Configured
                    </button>
                  </div>

                  {/* Volume */}
                  <div className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Volume2 className="w-4 h-4 text-amber-400" />
                      <div>
                        <div className="font-medium text-slate-200">Media & Voice Output Volume</div>
                        <div className="text-[11px] text-slate-400">{volumeLevel}% Level</div>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={volumeLevel}
                      onChange={(e) => setVolumeLevel(Number(e.target.value))}
                      data-editable="true"
                      aria-label="Volume level"
                      className="w-28 accent-amber-500 cursor-pointer"
                    />
                  </div>

                  {/* Airplane Mode */}
                  <div className="p-3 flex items-center justify-between">
                    <div>
                      <div className="font-medium text-slate-200">Airplane Mode</div>
                      <div className="text-[11px] text-slate-400">
                        Disables cellular, Wi-Fi and Bluetooth
                      </div>
                    </div>
                    <button
                      onClick={() => setAirplaneMode(!airplaneMode)}
                      data-clickable="true"
                      aria-label="Toggle Airplane Mode"
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                        airplaneMode ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {airplaneMode ? 'ON' : 'OFF'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 3. CONTACTS APP */}
            {activePackage === 'com.google.android.contacts' && (
              <div className="space-y-4">
                <div className="bg-purple-950/40 border border-purple-800/50 rounded-xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center font-bold text-white shadow">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-100">Contacts Phonebook</h3>
                      <p className="text-xs text-purple-300">Synchronized device contacts</p>
                    </div>
                  </div>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    id="contacts-search-input"
                    data-editable="true"
                    placeholder="Search contacts..."
                    value={contactsSearch}
                    onChange={(e) => setContactsSearch(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* Contacts List */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl divide-y divide-slate-800 text-xs">
                  {contacts
                    .filter((c) => c.name.toLowerCase().includes(contactsSearch.toLowerCase()))
                    .map((contact) => (
                      <div
                        key={contact.id}
                        className="p-3 flex items-center justify-between hover:bg-slate-800/40"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-purple-700/60 text-purple-200 flex items-center justify-center font-bold">
                            {contact.name[0]}
                          </div>
                          <div>
                            <div className="font-medium text-slate-200">{contact.name}</div>
                            <div className="text-[11px] text-slate-400 font-mono">{contact.phone}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setActivePackage('com.whatsapp');
                              setActiveChat(contact.name);
                            }}
                            data-clickable="true"
                            aria-label={`Message ${contact.name}`}
                            className="px-2.5 py-1 rounded bg-emerald-900/60 hover:bg-emerald-800 text-emerald-300 text-xs flex items-center gap-1"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            Chat
                          </button>
                          <button
                            onClick={() => {
                              setIncomingCall({
                                caller: contact.name,
                                number: contact.phone,
                                isActive: true,
                                isAnswered: true,
                              });
                            }}
                            data-clickable="true"
                            aria-label={`Call ${contact.name}`}
                            className="px-2.5 py-1 rounded bg-purple-900/60 hover:bg-purple-800 text-purple-300 text-xs flex items-center gap-1"
                          >
                            <PhoneCall className="w-3.5 h-3.5" />
                            Call
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* 4. QUICK NOTES APP (Manage, Arrange, Create, Modify, Delete) */}
            {activePackage === 'com.nexora.notes' && (
              <div className="space-y-4">
                <div className="bg-amber-950/40 border border-amber-800/50 rounded-xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-600 flex items-center justify-center font-bold text-white shadow">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-100">Nexora Quick Notes</h3>
                      <p className="text-xs text-amber-300">Create, Arrange, Modify & Delete</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setNotes([...notes].reverse())}
                    data-clickable="true"
                    aria-label="Arrange Notes"
                    className="px-2.5 py-1 rounded-lg bg-amber-800/60 hover:bg-amber-700 text-amber-200 text-xs flex items-center gap-1 font-medium"
                  >
                    <ArrowUpDown className="w-3.5 h-3.5" />
                    Arrange
                  </button>
                </div>

                {/* Add note input (Create) */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="notes-input"
                    data-editable="true"
                    placeholder="Type note title (e.g. 'Meeting at 4pm')..."
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    onClick={handleAddNote}
                    data-clickable="true"
                    aria-label="Add Note"
                    className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Create
                  </button>
                </div>

                {/* Notes List (Modify, Delete) */}
                <div className="space-y-2">
                  {notes.map((note) => (
                    <div
                      key={note.id}
                      className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 flex items-center justify-between"
                    >
                      {editingNoteId === note.id ? (
                        <div className="flex items-center gap-2 flex-1 mr-2">
                          <input
                            type="text"
                            value={editingNoteText}
                            onChange={(e) => setEditingNoteText(e.target.value)}
                            className="flex-1 bg-slate-900 border border-amber-500 rounded px-2 py-1 text-xs text-slate-100 focus:outline-none"
                          />
                          <button
                            onClick={() => {
                              setNotes(
                                notes.map((n) =>
                                  n.id === note.id ? { ...n, title: editingNoteText } : n
                                )
                              );
                              setEditingNoteId(null);
                            }}
                            className="p-1 text-emerald-400 hover:bg-slate-800 rounded"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div>
                          <div className="font-medium text-slate-200 text-xs">{note.title}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">{note.date}</div>
                        </div>
                      )}

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingNoteId(note.id);
                            setEditingNoteText(note.title);
                          }}
                          data-clickable="true"
                          aria-label="Modify Note"
                          className="text-slate-500 hover:text-amber-300 p-1 rounded"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setNotes(notes.filter((n) => n.id !== note.id))}
                          data-clickable="true"
                          aria-label="Delete note"
                          className="text-slate-500 hover:text-rose-400 p-1 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. BROWSER APP (Search anything) */}
            {activePackage === 'com.android.browser' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs">
                  <Globe className="w-4 h-4 text-cyan-400 shrink-0" />
                  <input
                    type="text"
                    id="browser-url-bar"
                    data-editable="true"
                    value={browserUrl}
                    onChange={(e) => setBrowserUrl(e.target.value)}
                    className="flex-1 bg-transparent text-slate-200 focus:outline-none font-mono text-xs"
                  />
                  <button
                    data-clickable="true"
                    className="px-2 py-0.5 rounded bg-cyan-700/60 text-cyan-200 text-xs font-medium"
                  >
                    Search
                  </button>
                </div>

                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 text-xs space-y-3">
                  <h4 className="font-bold text-sm text-cyan-300">Google Search Results</h4>
                  {searchQuery ? (
                    <div className="p-3 bg-cyan-950/40 border border-cyan-800/40 rounded-lg">
                      <div className="font-semibold text-slate-200">Query: "{searchQuery}"</div>
                      <p className="text-slate-400 mt-1">
                        Top result: Real-time information and web search answers generated for your voice query.
                      </p>
                    </div>
                  ) : (
                    <p className="text-slate-300 leading-relaxed">
                      Say "Search latest weather" or "Search artificial intelligence" to search hands-free.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* 6. CALCULATOR APP */}
            {activePackage === 'com.android.calculator' && (
              <div className="max-w-xs mx-auto space-y-3">
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-right">
                  <span className="text-2xl font-mono font-bold text-rose-300">{calcDisplay}</span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-xs font-bold">
                  {['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', 'C', '0', '=', '+'].map(
                    (btn) => (
                      <button
                        key={btn}
                        onClick={() => {
                          if (btn === 'C') setCalcDisplay('0');
                          else if (btn === '=') {
                            try {
                              setCalcDisplay(String(Function(`'use strict'; return (${calcDisplay})`)()));
                            } catch {
                              setCalcDisplay('Error');
                            }
                          } else {
                            setCalcDisplay(calcDisplay === '0' ? btn : calcDisplay + btn);
                          }
                        }}
                        data-clickable="true"
                        aria-label={`Calculator key ${btn}`}
                        className={`py-3 rounded-lg text-center font-mono ${
                          btn === 'C'
                            ? 'bg-rose-950/80 text-rose-300 border border-rose-800/60'
                            : ['/', '*', '-', '+', '='].includes(btn)
                            ? 'bg-amber-600/30 text-amber-300 border border-amber-600/50'
                            : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                        }`}
                      >
                        {btn}
                      </button>
                    )
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Android System Navigation Bar (Bottom) */}
      <div className="bg-slate-950 px-6 py-2 border-t border-slate-800 flex items-center justify-around text-slate-400">
        <button
          onClick={() => {
            const historyPackages = ['com.whatsapp', 'com.android.settings', 'com.google.android.contacts'];
            const idx = historyPackages.indexOf(activePackage);
            const prev = historyPackages[(idx + 1) % historyPackages.length];
            setActivePackage(prev);
          }}
          data-clickable="true"
          aria-label="Back button"
          className="p-1 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => setActivePackage('com.whatsapp')}
          data-clickable="true"
          aria-label="Home button"
          className="w-3.5 h-3.5 rounded-full border-2 border-slate-400 hover:border-slate-200 transition-colors"
        />
        <button
          onClick={() => setActivePackage('com.android.settings')}
          data-clickable="true"
          aria-label="Recents button"
          className="w-3.5 h-3.5 rounded-sm border-2 border-slate-400 hover:border-slate-200 transition-colors"
        />
      </div>
    </div>
  );
};
