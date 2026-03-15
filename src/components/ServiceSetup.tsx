"use client";

import { useState, useEffect } from "react";
import { ServiceSegment } from "@/types";
import { useParseService } from "@/hooks/useParseService";

interface ServiceSetupProps {
  segments: ServiceSegment[];
  onAddSegment: (s: Omit<ServiceSegment, "id">) => void;
  onRemoveSegment: (id: string) => void;
  onUpdateSegment: (id: string, updates: Partial<Omit<ServiceSegment, "id">>) => void;
  onReorderSegments: (segments: ServiceSegment[]) => void;
  onSetSegments: (segments: ServiceSegment[]) => void;
  onStart: () => void;
  onClose: () => void;
  totalDuration: number;
}

type Tab = "manual" | "auto";

export default function ServiceSetup({
  segments,
  onAddSegment,
  onRemoveSegment,
  onUpdateSegment,
  onReorderSegments,
  onSetSegments,
  onStart,
  onClose,
  totalDuration,
}: ServiceSetupProps) {
  const [tab, setTab] = useState<Tab>("manual");
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("");
  const [person, setPerson] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDuration, setEditDuration] = useState("");
  const [editPerson, setEditPerson] = useState("");
  const [autoText, setAutoText] = useState("");
  const { parse, isLoading, error, clearError } = useParseService();

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleAdd = () => {
    const d = parseInt(duration) || 0;
    if (!title.trim() || d <= 0) return;
    onAddSegment({ title: title.trim(), duration: d, person: person.trim() || undefined });
    setTitle("");
    setDuration("");
    setPerson("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleAdd();
  };

  const startEdit = (seg: ServiceSegment) => {
    setEditingId(seg.id);
    setEditTitle(seg.title);
    setEditDuration(String(seg.duration));
    setEditPerson(seg.person || "");
  };

  const saveEdit = (id: string) => {
    const d = parseInt(editDuration) || 1;
    onUpdateSegment(id, {
      title: editTitle.trim() || "Untitled",
      duration: d,
      person: editPerson.trim() || undefined,
    });
    setEditingId(null);
  };

  const moveSegment = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= segments.length) return;
    const copy = [...segments];
    [copy[index], copy[target]] = [copy[target], copy[index]];
    onReorderSegments(copy);
  };

  const handleGenerate = async () => {
    if (!autoText.trim()) return;
    clearError();
    const parsed = await parse(autoText.trim());
    if (parsed.length > 0) {
      onSetSegments([...segments, ...parsed]);
      setAutoText("");
    }
  };

  const handleStart = () => {
    onStart();
    onClose();
  };

  const formatDuration = (mins: number) => {
    if (mins < 60) return `${mins}m`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  const inputClass =
    "bg-white/[0.06] text-white text-sm rounded-lg px-3 py-2 outline-none border border-white/[0.08] focus:border-white/30 transition-colors placeholder:text-white/30";

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Modal */}
      <div
        className="w-full max-w-lg max-h-[85vh] flex flex-col rounded-2xl bg-[#111] border border-white/[0.08] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.08]">
          <h2 className="text-base font-semibold text-white/90">Configure Service</h2>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white/70 transition-colors text-lg leading-none"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="flex flex-col gap-5">
            {/* Tab switcher */}
            <div className="flex gap-1 p-1 rounded-full bg-white/[0.06] border border-white/[0.08] self-center">
              <button
                onClick={() => setTab("manual")}
                className={`px-4 py-1.5 text-xs font-medium rounded-full transition-all ${
                  tab === "manual" ? "bg-white text-[#0a0a0a]" : "text-white/60 hover:text-white/90"
                }`}
              >
                Manual
              </button>
              <button
                onClick={() => setTab("auto")}
                className={`px-4 py-1.5 text-xs font-medium rounded-full transition-all ${
                  tab === "auto" ? "bg-white text-[#0a0a0a]" : "text-white/60 hover:text-white/90"
                }`}
              >
                Auto
              </button>
            </div>

            {tab === "manual" ? (
              <>
                {/* Segment list */}
                {segments.length > 0 && (
                  <div className="space-y-1.5">
                    {segments.map((seg, i) => (
                      <div
                        key={seg.id}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06] group"
                      >
                        {editingId === seg.id ? (
                          <div className="flex-1 flex flex-col gap-1.5">
                            <input
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              className={`${inputClass} py-1 text-xs`}
                              placeholder="Title"
                            />
                            <div className="flex gap-1.5">
                              <input
                                type="number"
                                value={editDuration}
                                onChange={(e) => setEditDuration(e.target.value)}
                                className={`${inputClass} py-1 text-xs w-20`}
                                placeholder="Min"
                                min={1}
                              />
                              <input
                                value={editPerson}
                                onChange={(e) => setEditPerson(e.target.value)}
                                className={`${inputClass} py-1 text-xs flex-1`}
                                placeholder="Person"
                              />
                              <button
                                onClick={() => saveEdit(seg.id)}
                                className="text-xs text-green-400 hover:text-green-300 px-2"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="text-xs text-white/40 hover:text-white/60 px-1"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            {/* Reorder buttons */}
                            <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => moveSegment(i, -1)}
                                className="text-white/30 hover:text-white/70 text-[10px] leading-none"
                                disabled={i === 0}
                              >
                                ▲
                              </button>
                              <button
                                onClick={() => moveSegment(i, 1)}
                                className="text-white/30 hover:text-white/70 text-[10px] leading-none"
                                disabled={i === segments.length - 1}
                              >
                                ▼
                              </button>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm text-white/80 truncate">{seg.title}</div>
                              <div className="text-xs text-white/40">
                                {seg.duration} min{seg.person ? ` · ${seg.person}` : ""}
                              </div>
                            </div>
                            <button
                              onClick={() => startEdit(seg)}
                              className="text-xs text-white/30 hover:text-white/60 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => onRemoveSegment(seg.id)}
                              className="text-xs text-white/30 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              ✕
                            </button>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Add segment form */}
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Segment title"
                      className={`${inputClass} flex-1`}
                    />
                    <input
                      type="number"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Min"
                      min={1}
                      className={`${inputClass} w-20`}
                    />
                  </div>
                  <div className="flex gap-2">
                    <input
                      value={person}
                      onChange={(e) => setPerson(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Person (optional)"
                      className={`${inputClass} flex-1`}
                    />
                    <button
                      onClick={handleAdd}
                      disabled={!title.trim() || !(parseInt(duration) > 0)}
                      className="w-20! px-4 py-2 bg-white/10 text-white/80 text-sm rounded-lg hover:bg-white/15 active:scale-95 transition-all border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* Auto tab */
              <div className="flex flex-col gap-3">
                <textarea
                  value={autoText}
                  onChange={(e) => setAutoText(e.target.value)}
                  placeholder={`Paste your service order here, e.g.:\n\nWorship Session (10:10am - 10:20am)\nBible Reading 5 Minutes - John Doe\nAnnouncements 7 Minutes (10:25am - 10:32am)\nSpecial Song 5 Mins - Choir\nWORD 60 Minutes - Pastor\nOffering 10 Minutes\nClosing 5 Minutes`}
                  rows={6}
                  className={`${inputClass} resize-none`}
                />
                {error && <p className="text-xs text-red-400">{error}</p>}
                <button
                  onClick={handleGenerate}
                  disabled={!autoText.trim() || isLoading}
                  className="px-6 py-2.5 bg-white/10 text-white/80 text-sm font-medium rounded-lg hover:bg-white/15 active:scale-95 transition-all border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white/80 rounded-full animate-spin" />
                      Generating...
                    </span>
                  ) : (
                    "Generate from Text"
                  )}
                </button>

                {/* Show parsed segments if any */}
                {segments.length > 0 && (
                  <div className="space-y-1">
                    {segments.map((seg) => (
                      <div
                        key={seg.id}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06]"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-white/80 truncate">{seg.title}</div>
                          <div className="text-xs text-white/40">
                            {seg.duration} min{seg.person ? ` · ${seg.person}` : ""}
                          </div>
                        </div>
                        <button
                          onClick={() => onRemoveSegment(seg.id)}
                          className="text-xs text-white/30 hover:text-red-400"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-white/[0.08]">
          <p className="text-xs text-white/40">
            {segments.length > 0
              ? `${segments.length} segment${segments.length !== 1 ? "s" : ""} · ${formatDuration(totalDuration)}`
              : "No segments added"}
          </p>
          <button
            onClick={handleStart}
            disabled={segments.length === 0}
            className="px-6 py-2.5 bg-white text-[#0a0a0a] font-semibold text-sm rounded-full hover:bg-white/90 active:scale-95 transition-all shadow-lg shadow-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Start Service
          </button>
        </div>
      </div>
    </div>
  );
}
