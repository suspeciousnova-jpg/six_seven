/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Check,
  Trash2,
  Edit3,
  Copy,
  Clock,
  Calendar,
} from 'lucide-react';
import { SixSevenBackground } from './components/SixSevenBackground';

export interface PointItem {
  id: string;
  text: string;
  time: string;
  date: string;
  createdAt: number;
}

function formatPointTime(d: Date): string {
  let hours = d.getHours();
  const minutes = d.getMinutes();
  const ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const minStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
  return `${hours}.${minStr}${ampm}`;
}

function formatPointDate(d: Date): string {
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

const STORAGE_KEY = 'pointglass_ledger_v2';

export default function App() {
  // Initially completely empty — points only show after being added by the user
  const [points, setPoints] = useState<PointItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch {
      // ignore storage error
    }
    return [];
  });

  // Composer text box state
  const [isComposerOpen, setIsComposerOpen] = useState<boolean>(false);
  const [pointInput, setPointInput] = useState<string>('');
  const [liveClock, setLiveClock] = useState<{ time: string; date: string }>(() => {
    const now = new Date();
    return { time: formatPointTime(now), date: formatPointDate(now) };
  });

  // Edit & Copy state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(points));
    } catch {
      // ignore
    }
  }, [points]);

  // Keep live time clock up to date
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setLiveClock({
        time: formatPointTime(now),
        date: formatPointDate(now),
      });
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  // Auto-focus input when composer opens
  useEffect(() => {
    if (isComposerOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isComposerOpen]);

  const handleOpenComposer = () => {
    const now = new Date();
    setLiveClock({
      time: formatPointTime(now),
      date: formatPointDate(now),
    });
    setIsComposerOpen(true);
  };

  const handleAddPoint = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = pointInput.trim();
    if (!trimmed) return;

    const now = new Date();
    const newPoint: PointItem = {
      id: `pt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      text: trimmed,
      time: formatPointTime(now),
      date: formatPointDate(now),
      createdAt: now.getTime(),
    };

    setPoints((prev) => [newPoint, ...prev]);
    setPointInput('');
    setIsComposerOpen(false);
  };

  const handleDelete = (id: string) => {
    setPoints((prev) => prev.filter((p) => p.id !== id));
  };

  const handleStartEdit = (point: PointItem) => {
    setEditingId(point.id);
    setEditingText(point.text);
  };

  const handleSaveEdit = (id: string) => {
    const trimmed = editingText.trim();
    if (!trimmed) return;
    setPoints((prev) =>
      prev.map((p) => (p.id === id ? { ...p, text: trimmed } : p))
    );
    setEditingId(null);
    setEditingText('');
  };

  const handleCopy = (point: PointItem) => {
    navigator.clipboard?.writeText(`${point.text} (${point.time} · ${point.date})`);
    setCopiedId(point.id);
    setTimeout(() => {
      setCopiedId((curr) => (curr === point.id ? null : curr));
    }, 1500);
  };

  return (
    <div className="min-h-screen relative flex flex-col selection:bg-indigo-500 selection:text-white text-slate-900">
      {/* Background always animating "six seven" */}
      <SixSevenBackground />

      {/* Top Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-8 px-6 md:px-12 py-4.5 backdrop-blur-xl bg-white/45 border-b border-white/70">
        <a
          href="/"
          className="font-display text-2xl font-extrabold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
        >
          ma points
        </a>

        <div className="flex items-center gap-4">
          <span className="text-xs font-semibold text-slate-600 font-mono-tabular">
            {points.length} {points.length === 1 ? 'Point' : 'Points'}
          </span>
          <button
            type="button"
            onClick={handleOpenComposer}
            className="px-4 py-2 text-xs md:text-sm font-semibold rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-all cursor-pointer shadow-sm flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Point</span>
          </button>
        </div>
      </header>

      {/* Main Screen */}
      <main className="relative z-10 flex-1 w-full max-w-3xl mx-auto px-4 sm:px-8 pt-8 pb-24 flex flex-col">
        {/* Points Stack (only displays when points are added) */}
        {points.length > 0 && (
          <section aria-label="Points list" className="space-y-4 mb-4">
            {points.map((item) => {
              const isEditing = editingId === item.id;

              return (
                <article
                  key={item.id}
                  className="group relative rounded-2xl px-6 sm:px-8 pt-6 pb-3.5 backdrop-blur-xl bg-white/55 hover:bg-white/70 border border-white/80 shadow-[0_10px_30px_rgba(15,23,42,0.06)] text-slate-900 transition-all duration-200"
                >
                  {/* Top-Right Quiet Actions (visible on hover) */}
                  <div className="absolute top-3 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(item)}
                      title="Edit point"
                      aria-label="Edit point"
                      className="p-1.5 rounded-lg opacity-70 hover:opacity-100 hover:bg-white/60 transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopy(item)}
                      title="Copy point"
                      aria-label="Copy point"
                      className="p-1.5 rounded-lg opacity-70 hover:opacity-100 hover:bg-white/60 transition-colors cursor-pointer"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      title="Delete point"
                      aria-label="Delete point"
                      className="p-1.5 rounded-lg opacity-70 hover:opacity-100 hover:text-rose-600 hover:bg-white/60 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Centered Point Text (matches wireframe) */}
                  <div className="min-h-[3rem] flex items-center justify-center text-center my-1 px-4">
                    {isEditing ? (
                      <div className="w-full max-w-lg flex items-center gap-2">
                        <input
                          type="text"
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit(item.id);
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                          autoFocus
                          className="flex-1 px-4 py-2 text-center font-display text-xl sm:text-2xl font-bold rounded-xl outline-none bg-white/85 text-slate-900 border border-slate-300"
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(item.id)}
                          className="px-3 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold cursor-pointer"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="px-3 py-2 rounded-xl bg-black/10 text-xs font-medium cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 break-words max-w-2xl leading-snug">
                        {item.text}
                      </h2>
                    )}
                  </div>

                  {/* Bottom Row: Left Time, Right Date */}
                  <div className="flex items-center justify-between pt-2 text-sm sm:text-base font-bold font-mono-tabular tracking-tight text-slate-900">
                    <span>{item.time}</span>
                    <span>{item.date}</span>
                  </div>
                </article>
              );
            })}
          </section>
        )}

        {/* Add Point Section (Text Box opens when clicking +) */}
        <div className="mt-6 flex flex-col items-start gap-4">
          {isComposerOpen && (
            <form
              onSubmit={handleAddPoint}
              className="w-full rounded-2xl p-6 backdrop-blur-xl bg-white/65 border border-white/90 shadow-[0_12px_36px_rgba(15,23,42,0.08)] transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-3">
                <label
                  htmlFor="point-input"
                  className="font-display text-base sm:text-lg font-bold tracking-tight text-slate-900"
                >
                  Enter your point
                </label>
                <div className="flex items-center gap-3 text-xs font-mono-tabular text-slate-600 font-medium">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {liveClock.time}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {liveClock.date}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <input
                  id="point-input"
                  ref={inputRef}
                  type="text"
                  value={pointInput}
                  onChange={(e) => setPointInput(e.target.value)}
                  placeholder="Type point (e.g. ma points)..."
                  className="flex-1 px-4 py-3.5 text-base sm:text-lg font-medium rounded-xl outline-none bg-white/90 focus:bg-white text-slate-900 placeholder:text-slate-400 border border-white shadow-inner transition-all"
                />

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="submit"
                    disabled={!pointInput.trim()}
                    className="flex-1 sm:flex-initial px-6 py-3.5 rounded-xl font-display font-bold text-sm sm:text-base bg-slate-900 text-white hover:bg-slate-800 transition-all cursor-pointer shadow-md disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap shrink-0"
                  >
                    Add Point
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsComposerOpen(false)}
                    className="px-4 py-3.5 rounded-xl text-sm font-medium bg-black/5 hover:bg-black/10 text-slate-700 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Bottom-left circular "+" button matching the user sketch */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => {
                if (isComposerOpen && pointInput.trim()) {
                  handleAddPoint();
                } else {
                  setIsComposerOpen((prev) => !prev);
                }
              }}
              aria-label="Add point"
              className="w-14 h-14 rounded-full flex items-center justify-center bg-slate-950 text-white hover:bg-slate-800 ring-4 ring-white/70 shadow-lg transition-transform duration-200 active:scale-95 cursor-pointer"
            >
              <Plus
                className={`w-8 h-8 stroke-[2.5] transition-transform duration-200 ${
                  isComposerOpen ? 'rotate-45' : 'rotate-0'
                }`}
              />
            </button>

            <button
              type="button"
              onClick={() => setIsComposerOpen((prev) => !prev)}
              className="text-sm font-semibold text-slate-700 hover:text-slate-950 transition-colors cursor-pointer"
            >
              {isComposerOpen ? 'Close text box' : 'Add point'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
