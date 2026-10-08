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

export const VirtualDevice: React.FC = () => {
  const [activePackage, setActivePackage] = useState<string>('com.whatsapp');
  const [highlightBox, setHighlightBox] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
    label: string;
  } | null>(null);

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
  const contacts: Contact[] = [
    { id: '1', name: 'Rahim Chowdhury', phone: '+880 1711-234567', lastMessage: 'Meeting ki ajke hobe?' },
    { id: '2', name: 'Fatima Begum', phone: '+880 1819-987654', lastMessage: 'Documents gulo pathiyechi.' },
    { id: '3', name: 'Tanvir Ahmed', phone: '+880 1912-345678', lastMessage: 'Nexora test shuru koro.' },
    { id: '4', name: 'Adil Khan', phone: '+880 1678-554433', lastMessage: 'Call me later.' },
  ];

  // Notes state
  const [notes, setNotes] = useState<Note[]>([
    { id: '1', title: 'Buy groceries: milk, tea, biscuits', date: 'Today, 10:30 AM' },
    { id: '2', title: 'Prepare Nexora v2 release notes', date: 'Yesterday' },
  ]);
  const [newNoteText, setNewNoteText] = useState('');

  // Browser state
  const [browserUrl, setBrowserUrl] = useState('https://nexora.agent/docs');
  const [browserSearch, setBrowserSearch] = useState('');

  // Calculator state
  const [calcDisplay, setCalcDisplay] = useState('0');

  const screenRef = useRef<HTMLDivElement>(null);

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
    });
  }, [activePackage]);

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

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative">
      {/* Device Top Chrome / Status Bar */}
      <div className="bg-slate-950 px-4 py-2 border-b border-slate-800/80 flex items-center justify-between text-xs text-slate-400 select-none">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-300">10:42 AM</span>
          <span className="px-1.5 py-0.5 rounded text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-800/50">
            NEXORA ACCESSIBILITY ACTIVE
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Signal className="w-3.5 h-3.5 text-slate-400" />
          <Wifi className="w-3.5 h-3.5 text-cyan-400" />
          <div className="flex items-center gap-1">
            <span className="text-[11px]">88%</span>
            <BatteryCharging className="w-4 h-4 text-emerald-400" />
          </div>
        </div>
      </div>

      {/* App Bar / Quick App Switcher */}
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
                    placeholder="Type a message or search..."
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

        {/* 4. QUICK NOTES APP */}
        {activePackage === 'com.nexora.notes' && (
          <div className="space-y-4">
            <div className="bg-amber-950/40 border border-amber-800/50 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-600 flex items-center justify-center font-bold text-white shadow">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-100">Nexora Quick Notes</h3>
                  <p className="text-xs text-amber-300">Fast memos & reminders</p>
                </div>
              </div>
            </div>

            {/* Add note input */}
            <div className="flex gap-2">
              <input
                type="text"
                id="notes-input"
                data-editable="true"
                placeholder="Type note title or memo here..."
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
                Add Note
              </button>
            </div>

            {/* Notes List */}
            <div className="space-y-2">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 flex items-center justify-between"
                >
                  <div>
                    <div className="font-medium text-slate-200 text-xs">{note.title}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{note.date}</div>
                  </div>
                  <button
                    onClick={() => setNotes(notes.filter((n) => n.id !== note.id))}
                    data-clickable="true"
                    aria-label="Delete note"
                    className="text-slate-500 hover:text-rose-400 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. BROWSER APP */}
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
                Go
              </button>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 text-xs space-y-3">
              <h4 className="font-bold text-sm text-cyan-300">NEXORA Web Documentation</h4>
              <p className="text-slate-300 leading-relaxed">
                NEXORA combines offline voice comprehension, semantic accessibility parsing,
                and zero-trust risk authorization to navigate Android and Web interfaces with AI accuracy.
              </p>
              <div className="flex gap-2 pt-2">
                <button
                  data-clickable="true"
                  className="px-3 py-1.5 rounded-lg bg-cyan-600 text-white font-medium hover:bg-cyan-500"
                >
                  Download Model
                </button>
                <button
                  data-clickable="true"
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 font-medium hover:bg-slate-700"
                >
                  Read Architecture
                </button>
              </div>
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
                          // Simple safe math
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
      </div>

      {/* Android System Navigation Bar (Bottom) */}
      <div className="bg-slate-950 px-6 py-2 border-t border-slate-800 flex items-center justify-around text-slate-400 select-none">
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
