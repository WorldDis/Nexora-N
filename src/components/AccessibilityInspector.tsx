import React, { useState, useEffect } from 'react';
import { Eye, Layers, MousePointer, Edit3, Search, RefreshCw } from 'lucide-react';
import { UiNodeParser } from '../accessibility/UiNodeParser';
import { UiElement } from '../types';
import { deviceManager } from '../simulator/DeviceContext';

export const AccessibilityInspector: React.FC = () => {
  const [elements, setElements] = useState<UiElement[]>([]);
  const [searchFilter, setSearchFilter] = useState('');
  const parser = new UiNodeParser();

  const refreshNodes = () => {
    const screenState = deviceManager.getScreenState();
    const root = screenState?.screenRef || document.getElementById('nexora-virtual-screen');
    if (root) {
      const parsed = parser.parseTree(root);
      setElements(parsed);
    }
  };

  useEffect(() => {
    refreshNodes();
    const unsub = deviceManager.subscribe(refreshNodes);
    const interval = setInterval(refreshNodes, 1200);
    return () => {
      unsub();
      clearInterval(interval);
    };
  }, []);

  const filtered = elements.filter((el) => {
    const s = searchFilter.toLowerCase();
    return (
      (el.text && el.text.toLowerCase().includes(s)) ||
      (el.contentDescription && el.contentDescription.toLowerCase().includes(s)) ||
      (el.id && el.id.toLowerCase().includes(s)) ||
      (el.className && el.className.toLowerCase().includes(s))
    );
  });

  const handleInspect = (el: UiElement) => {
    const screenState = deviceManager.getScreenState();
    if (el.rawElement && screenState) {
      screenState.highlightElement(el.rawElement, el.text || el.contentDescription || 'Element');
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      {/* Header */}
      <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <h2 className="font-semibold text-xs tracking-wide text-slate-200 uppercase">
            Semantic Accessibility Tree
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400 font-mono">
            {elements.length} nodes
          </span>
          <button
            onClick={refreshNodes}
            title="Refresh Accessibility Nodes"
            className="p-1 rounded text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-2 border-b border-slate-800 bg-slate-950/60">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Filter nodes by text, ID, or description..."
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-2 py-1 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Nodes List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5 font-mono text-xs">
        {filtered.length === 0 ? (
          <div className="p-6 text-center text-slate-500 text-xs">
            No matching accessibility nodes found.
          </div>
        ) : (
          filtered.map((el, idx) => (
            <div
              key={idx}
              onClick={() => handleInspect(el)}
              className="p-2 rounded-lg bg-slate-950/70 border border-slate-800/80 hover:border-cyan-500/50 hover:bg-slate-800/40 cursor-pointer transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {el.isClickable && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800/60 flex items-center gap-1">
                      <MousePointer className="w-2.5 h-2.5" /> clickable
                    </span>
                  )}
                  {el.isEditable && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-950 text-amber-400 border border-amber-800/60 flex items-center gap-1">
                      <Edit3 className="w-2.5 h-2.5" /> editable
                    </span>
                  )}
                  {el.className && (
                    <span className="text-[10px] text-slate-500 font-sans">
                      &lt;{el.className}&gt;
                    </span>
                  )}
                </div>

                <Eye className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
              </div>

              {el.text && (
                <div className="text-slate-200 font-sans text-xs mt-1 truncate">
                  "{el.text}"
                </div>
              )}

              {el.contentDescription && (
                <div className="text-[11px] text-cyan-300/80 font-sans truncate">
                  desc: "{el.contentDescription}"
                </div>
              )}

              {el.id && (
                <div className="text-[10px] text-slate-500 truncate mt-0.5">
                  id: #{el.id}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
