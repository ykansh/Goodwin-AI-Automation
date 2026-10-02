import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Pin,
  CheckSquare,
  Square,
  Plus,
  Trash2,
  Copy,
  Check,
  Search,
  Palette,
  FileText,
  StickyNote,
  Clock,
  Sparkles,
  ExternalLink,
  Calendar
} from 'lucide-react';
import { useProjectNotesStore } from '../../lib/projectNotesStore';
import type {
  ProjectNote,
  NoteColor,
  ChecklistItem
} from '../../lib/projectNotesStore';
import type { Project } from '../../lib/operationsStore';
import { Button } from '../ui/Button';

interface ProjectNotepadModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
}

const COLOR_CONFIG: Record<
  NoteColor,
  { label: string; bg: string; border: string; text: string; subText: string; dot: string }
> = {
  default: {
    label: 'Clean White',
    bg: 'bg-white',
    border: 'border-canvas-variant hover:border-secondary-light/40',
    text: 'text-secondary-dark',
    subText: 'text-secondary-light',
    dot: 'bg-canvas-variant'
  },
  amber: {
    label: 'Warm Honey',
    bg: 'bg-[#fffbeb]',
    border: 'border-[#fde68a] hover:border-[#f59e0b]',
    text: 'text-[#78350f]',
    subText: 'text-[#b45309]',
    dot: 'bg-[#f59e0b]'
  },
  emerald: {
    label: 'Mint Green',
    bg: 'bg-[#f0fdf4]',
    border: 'border-[#bbf7d0] hover:border-[#22c55e]',
    text: 'text-[#14532d]',
    subText: 'text-[#16a34a]',
    dot: 'bg-[#22c55e]'
  },
  blue: {
    label: 'Sky Blue',
    bg: 'bg-[#eff6ff]',
    border: 'border-[#bfdbfe] hover:border-[#3b82f6]',
    text: 'text-[#1e3a8a]',
    subText: 'text-[#2563eb]',
    dot: 'bg-[#3b82f6]'
  },
  purple: {
    label: 'Royal Violet',
    bg: 'bg-[#faf5ff]',
    border: 'border-[#e9d5ff] hover:border-[#a855f7]',
    text: 'text-[#581c87]',
    subText: 'text-[#9333ea]',
    dot: 'bg-[#a855f7]'
  },
  rose: {
    label: 'Coral Rose',
    bg: 'bg-[#fff1f2]',
    border: 'border-[#fecdd3] hover:border-[#f43f5e]',
    text: 'text-[#881337]',
    subText: 'text-[#e11d48]',
    dot: 'bg-[#f43f5e]'
  },
  slate: {
    label: 'Deep Slate',
    bg: 'bg-[#1e293b]',
    border: 'border-[#334155] hover:border-[#64748b]',
    text: 'text-white',
    subText: 'text-slate-300',
    dot: 'bg-[#64748b]'
  }
};

const COLOR_KEYS: NoteColor[] = ['default', 'amber', 'emerald', 'blue', 'purple', 'rose', 'slate'];

const getNoteColor = (c?: string) => {
  if (c && c in COLOR_CONFIG) {
    return COLOR_CONFIG[c as NoteColor];
  }
  return COLOR_CONFIG.default;
};

const EMPTY_NOTES_LIST: ProjectNote[] = [];

export const ProjectNotepadModal: React.FC<ProjectNotepadModalProps> = ({
  isOpen,
  onClose,
  project
}) => {
  if (!isOpen || !project) return null;

  const projectId = String(project.id || '');
  const projectName = project.projectName || (project as any).project_name || 'Project Notepad';
  const companyName = project.companyName || (project as any).company_name || '';
  const projectPhase = project.phase || 'Planning';
  const projectStatus = project.status || 'Active';
  const assignedTo = project.assignedTo || (project as any).assigned_to || 'Team';

  // Store methods with stable selectors
  const allNotes = useProjectNotesStore((state) => state.notes);
  const allScratchpads = useProjectNotesStore((state) => state.scratchpads);

  const notes = (projectId && allNotes && allNotes[projectId]) ? allNotes[projectId] : EMPTY_NOTES_LIST;
  const initialScratchpad = (projectId && allScratchpads && typeof allScratchpads[projectId] === 'string') 
    ? allScratchpads[projectId] 
    : '';

  const fetchNotes = useProjectNotesStore((state) => state.fetchNotes);
  const addNote = useProjectNotesStore((state) => state.addNote);
  const updateNote = useProjectNotesStore((state) => state.updateNote);
  const deleteNote = useProjectNotesStore((state) => state.deleteNote);
  const togglePin = useProjectNotesStore((state) => state.togglePin);
  const saveScratchpad = useProjectNotesStore((state) => state.saveScratchpad);

  // Tabs & Views
  const [activeTab, setActiveTab] = useState<'cards' | 'scratchpad'>('cards');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedNoteId, setCopiedNoteId] = useState<string | null>(null);

  // New Note Input Box State (Google Keep style - always open and ready to type!)
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newColor, setNewColor] = useState<NoteColor>('default');
  const [newIsPinned, setNewIsPinned] = useState(false);
  const [newIsChecklist, setNewIsChecklist] = useState(false);
  const [newChecklistItems, setNewChecklistItems] = useState<ChecklistItem[]>([
    { id: '1', text: '', completed: false }
  ]);
  const [isSavingNote, setIsSavingNote] = useState(false);

  // Note Editing Modal State
  const [editingNote, setEditingNote] = useState<ProjectNote | null>(null);

  // Scratchpad state
  const isScratchpadFocusedRef = useRef(false);
  const [scratchpadText, setScratchpadText] = useState(initialScratchpad);
  const [scratchpadSavedNotice, setScratchpadSavedNotice] = useState(false);

  // Sync scratchpad when Supabase loads or store updates
  useEffect(() => {
    if (!isScratchpadFocusedRef.current) {
      setScratchpadText(initialScratchpad);
    }
  }, [initialScratchpad]);

  const DRAFT_STORAGE_KEY = `goodwin_note_draft_${projectId}`;

  // Restore draft note on mount
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (parsed.title) setNewTitle(parsed.title);
        if (parsed.content) setNewContent(parsed.content);
        if (parsed.color) setNewColor(parsed.color);
        if (parsed.isPinned !== undefined) setNewIsPinned(parsed.isPinned);
        if (parsed.isChecklist !== undefined) setNewIsChecklist(parsed.isChecklist);
        if (Array.isArray(parsed.checklistItems) && parsed.checklistItems.length > 0) {
          setNewChecklistItems(parsed.checklistItems);
        }
      }
    } catch (e) {}
  }, [projectId, DRAFT_STORAGE_KEY]);

  // Persist draft note as user types so reload never loses anything
  useEffect(() => {
    const hasText = newTitle.trim().length > 0 || newContent.trim().length > 0;
    const hasItems = newChecklistItems.some((i) => i.text.trim().length > 0);
    if (hasText || hasItems) {
      try {
        localStorage.setItem(
          DRAFT_STORAGE_KEY,
          JSON.stringify({
            title: newTitle,
            content: newContent,
            color: newColor,
            isPinned: newIsPinned,
            isChecklist: newIsChecklist,
            checklistItems: newChecklistItems
          })
        );
      } catch (e) {}
    } else {
      try {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      } catch (e) {}
    }
  }, [newTitle, newContent, newColor, newIsPinned, newIsChecklist, newChecklistItems, DRAFT_STORAGE_KEY]);

  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Initial load
  useEffect(() => {
    if (projectId) {
      fetchNotes(projectId);
    }
  }, [projectId]);

  // Add / Save New Note
  const handleSaveNewNote = async () => {
    const hasText = newTitle.trim().length > 0 || newContent.trim().length > 0;
    const validChecklist = newChecklistItems.filter((i) => i.text.trim().length > 0);
    const hasChecklist = newIsChecklist && validChecklist.length > 0;

    if (!hasText && !hasChecklist) {
      return;
    }

    setIsSavingNote(true);
    try {
      await addNote(projectId, {
        title: newTitle.trim(),
        content: newContent.trim(),
        color: newColor,
        isPinned: newIsPinned,
        isChecklist: newIsChecklist,
        checklistItems: validChecklist
      });

      // Clear draft from localStorage
      try {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      } catch (e) {}

      // Reset input fields
      setNewTitle('');
      setNewContent('');
      setNewColor('default');
      setNewIsPinned(false);
      setNewIsChecklist(false);
      setNewChecklistItems([{ id: '1', text: '', completed: false }]);
    } finally {
      setIsSavingNote(false);
    }
  };

  const handleSafeClose = async () => {
    const hasText = newTitle.trim().length > 0 || newContent.trim().length > 0;
    const validChecklist = newChecklistItems.filter((i) => i.text.trim().length > 0);
    const hasChecklist = newIsChecklist && validChecklist.length > 0;
    if (hasText || hasChecklist) {
      await handleSaveNewNote();
    }
    onClose();
  };

  const handleTabSwitch = async (tab: 'cards' | 'scratchpad') => {
    if (tab === activeTab) return;
    if (activeTab === 'cards') {
      const hasText = newTitle.trim().length > 0 || newContent.trim().length > 0;
      const validChecklist = newChecklistItems.filter((i) => i.text.trim().length > 0);
      if (hasText || (newIsChecklist && validChecklist.length > 0)) {
        await handleSaveNewNote();
      }
    }
    setActiveTab(tab);
  };

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (editingNote) {
          setEditingNote(null);
        } else {
          await handleSafeClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editingNote, newTitle, newContent, newColor, newIsPinned, newIsChecklist, newChecklistItems]);

  // Checklist Helpers for New Note
  const handleAddChecklistItem = () => {
    setNewChecklistItems((prev) => [
      ...prev,
      { id: `${Date.now()}_${Math.random()}`, text: '', completed: false }
    ]);
  };

  const handleUpdateChecklistItem = (id: string, text: string) => {
    setNewChecklistItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, text } : item))
    );
  };

  const handleRemoveChecklistItem = (id: string) => {
    setNewChecklistItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Toggle checklist in existing note
  const handleToggleNoteChecklist = async (
    noteId: string,
    itemId: string,
    completed: boolean
  ) => {
    const note = notes.find((n) => n.id === noteId);
    if (!note) return;
    const updatedItems = (note.checklistItems || []).map((item) =>
      item.id === itemId ? { ...item, completed } : item
    );
    await updateNote(projectId, noteId, { checklistItems: updatedItems });
  };

  // Copy Note Content
  const handleCopyNote = (note: ProjectNote) => {
    let textToCopy = '';
    if (note.title) textToCopy += `${note.title}\n`;
    if (note.isChecklist && note.checklistItems?.length) {
      textToCopy += note.checklistItems
        .map((i) => `[${i.completed ? 'x' : ' '}] ${i.text}`)
        .join('\n');
    } else {
      textToCopy += note.content || '';
    }

    navigator.clipboard.writeText(textToCopy);
    setCopiedNoteId(note.id);
    setTimeout(() => setCopiedNoteId(null), 2000);
  };

  // Scratchpad debounced save
  const handleScratchpadChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setScratchpadText(val);
    saveScratchpad(projectId, val);
    setScratchpadSavedNotice(true);
    setTimeout(() => setScratchpadSavedNotice(false), 2500);
  };

  const handleInsertTimestamp = () => {
    const now = new Date();
    const stamp = `\n--- [${now.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })} ${now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}] ---\n`;
    const newText = (scratchpadText || '') + stamp;
    setScratchpadText(newText);
    saveScratchpad(projectId, newText);
  };

  const handleInsertTodo = () => {
    const newText = (scratchpadText || '') + `\n- [ ] `;
    setScratchpadText(newText);
    saveScratchpad(projectId, newText);
  };

  // Filter notes based on search query
  const filteredNotes = notes.filter((n) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const titleMatch = n.title?.toLowerCase()?.includes(q);
    const contentMatch = n.content?.toLowerCase()?.includes(q);
    const checklistMatch = n.checklistItems?.some((i) => i.text?.toLowerCase().includes(q));
    return titleMatch || contentMatch || checklistMatch;
  });

  const pinnedNotes = filteredNotes.filter((n) => n.isPinned);
  const otherNotes = filteredNotes.filter((n) => !n.isPinned);

  // Linkifier helper
  const renderTextWithLinks = (text: string) => {
    if (!text || typeof text !== 'string') return text || '';
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-primary hover:underline font-medium break-all inline-flex items-center gap-0.5"
          >
            {part} <ExternalLink className="w-3 h-3 inline ml-0.5 opacity-70" />
          </a>
        );
      }
      return part;
    });
  };

  const activeColor = getNoteColor(newColor);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-secondary-dark/60 backdrop-blur-sm transition-opacity"
        onClick={handleSafeClose}
      />

      {/* Modal Dialog */}
      <div className="relative z-50 w-full max-w-5xl h-[92vh] max-h-[920px] bg-canvas rounded-2xl shadow-level-3 border border-canvas-variant flex flex-col overflow-hidden">
        {/* ── Top Header ── */}
        <div className="bg-canvas-surface px-4 sm:px-6 py-4 border-b border-canvas-variant flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-sm">
              <StickyNote className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold font-display text-secondary-dark leading-tight">
                  {projectName}
                </h2>
                {companyName && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-canvas-variant text-secondary-dark border border-canvas-variant">
                    {companyName}
                  </span>
                )}
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-primary/10 text-primary-dark border border-primary/20">
                  {projectPhase}
                </span>
              </div>
              <p className="text-xs text-secondary-light mt-0.5 flex items-center gap-2">
                <span>Assignee: <strong>{assignedTo}</strong></span>
                <span>•</span>
                <span>Status: <strong>{projectStatus}</strong></span>
                <span>•</span>
                <span className="text-primary font-medium flex items-center gap-1">
                  <Check className="w-3 h-3" /> Auto-saved
                </span>
              </p>
            </div>
          </div>

          {/* Mode Switcher & Close */}
          <div className="flex items-center gap-2">
            <div className="bg-canvas border border-canvas-variant p-0.5 rounded-lg flex items-center shadow-inner">
              <button
                onClick={() => handleTabSwitch('cards')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  activeTab === 'cards'
                    ? 'bg-canvas-surface text-secondary-dark shadow-sm'
                    : 'text-secondary-light hover:text-secondary-dark'
                }`}
              >
                <StickyNote className="w-3.5 h-3.5 text-primary" />
                Google Notes ({notes.length})
              </button>
              <button
                onClick={() => handleTabSwitch('scratchpad')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  activeTab === 'scratchpad'
                    ? 'bg-canvas-surface text-secondary-dark shadow-sm'
                    : 'text-secondary-light hover:text-secondary-dark'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-warning" />
                Freeform Scratchpad
              </button>
            </div>

            <button
              onClick={handleSafeClose}
              className="p-2 rounded-lg text-secondary-light hover:bg-canvas-variant hover:text-secondary-dark transition-colors"
              title="Close Notepad (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── Main Body ── */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-canvas">
          {activeTab === 'cards' ? (
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Search Bar & Helper */}
              <div className="flex items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-secondary-light" />
                  <input
                    type="text"
                    placeholder="Search notes, checklists, links in this project..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-canvas-surface border border-canvas-variant rounded-xl text-sm text-secondary-dark placeholder-secondary-light/70 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-sm transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-light hover:text-secondary-dark"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="text-xs text-secondary-light hidden sm:flex items-center gap-1">
                  <span>💡 Type anything below to store project info, links, or tasks.</span>
                </div>
              </div>

              {/* ── Google Notes Active Input Notepad (Always Open & Ready to Type!) ── */}
              <div
                className={`rounded-2xl shadow-level-1 border transition-all duration-200 overflow-hidden ${
                  activeColor.bg
                } ${activeColor.border} p-4 sm:p-5 space-y-3`}
              >
                {/* Title & Pin */}
                <div className="flex items-center justify-between gap-2">
                  <input
                    type="text"
                    placeholder="Title (optional, e.g. Client Brief, DB Credentials)"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                        e.preventDefault();
                        handleSaveNewNote();
                      }
                    }}
                    className={`w-full bg-transparent font-bold text-base placeholder-secondary-light/60 focus:outline-none ${activeColor.text}`}
                  />
                  <button
                    type="button"
                    onClick={() => setNewIsPinned(!newIsPinned)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      newIsPinned
                        ? 'text-primary bg-primary/10'
                        : 'text-secondary-light hover:bg-black/5'
                    }`}
                    title={newIsPinned ? 'Unpin note' : 'Pin note to top'}
                  >
                    <Pin className={`w-4 h-4 ${newIsPinned ? 'fill-primary' : ''}`} />
                  </button>
                </div>

                {/* Content or Checklist */}
                {newIsChecklist ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto py-1">
                    {newChecklistItems.map((item, idx) => (
                      <div key={item.id} className="flex items-center gap-2">
                        <Square className="w-4 h-4 text-secondary-light shrink-0" />
                        <input
                          type="text"
                          value={item.text}
                          placeholder={idx === 0 ? 'List item (e.g. Set up Supabase table)' : 'Add another item...'}
                          onChange={(e) => handleUpdateChecklistItem(item.id, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddChecklistItem();
                            }
                          }}
                          className={`flex-1 bg-transparent text-sm focus:outline-none ${activeColor.text}`}
                        />
                        {newChecklistItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveChecklistItem(item.id)}
                            className="text-secondary-light/60 hover:text-danger p-1"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={handleAddChecklistItem}
                      className="text-xs text-primary hover:underline font-semibold flex items-center gap-1 pt-1"
                    >
                      <Plus className="w-3 h-3" /> Add item
                    </button>
                  </div>
                ) : (
                  <textarea
                    ref={contentTextareaRef}
                    placeholder="Take a note... Type any project info, requirements, credentials, meeting notes, or paste links here. (Cmd+Enter to save)"
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    onKeyDown={(e) => {
                      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                        e.preventDefault();
                        handleSaveNewNote();
                      }
                    }}
                    rows={3}
                    className={`w-full bg-transparent text-sm placeholder-secondary-light/60 focus:outline-none resize-none leading-relaxed ${activeColor.text}`}
                  />
                )}

                {/* Toolbar: Color picker, Checklist switch, Save Button */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-black/5">
                  <div className="flex items-center space-x-2">
                    {/* Color Selector Pills */}
                    <div className="flex items-center space-x-1.5 pr-2 border-r border-black/10">
                      {COLOR_KEYS.map((c) => {
                        const style = getNoteColor(c);
                        return (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setNewColor(c)}
                            className={`w-5 h-5 rounded-full border transition-all ${
                              style.dot
                            } ${
                              newColor === c
                                ? 'ring-2 ring-primary ring-offset-1 scale-110'
                                : 'hover:scale-105 opacity-80 hover:opacity-100'
                            }`}
                            title={style.label}
                          />
                        );
                      })}
                    </div>

                    {/* Checklist Mode Toggle */}
                    <button
                      type="button"
                      onClick={() => setNewIsChecklist(!newIsChecklist)}
                      className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors ${
                        newIsChecklist
                          ? 'bg-primary/10 text-primary-dark font-bold'
                          : 'text-secondary-light hover:bg-black/5'
                      }`}
                      title="Toggle checklist"
                    >
                      <CheckSquare className="w-4 h-4" />
                      <span className="hidden sm:inline">Checklist</span>
                    </button>
                  </div>

                  <div className="flex items-center space-x-2">
                    {(newTitle.trim() || newContent.trim()) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setNewTitle('');
                          setNewContent('');
                          setNewColor('default');
                          setNewIsPinned(false);
                          setNewIsChecklist(false);
                          setNewChecklistItems([{ id: '1', text: '', completed: false }]);
                        }}
                      >
                        Clear
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      onClick={handleSaveNewNote}
                      disabled={isSavingNote || (!newTitle.trim() && !newContent.trim() && !newChecklistItems.some(i => i.text.trim()))}
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      Save Note
                    </Button>
                  </div>
                </div>
              </div>

              {/* ── PINNED NOTES SECTION ── */}
              {pinnedNotes.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-secondary-light">
                    <Pin className="w-3.5 h-3.5 text-primary fill-primary" />
                    <span>Pinned ({pinnedNotes.length})</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {pinnedNotes.map((note) => (
                      <NoteCard
                        key={note.id}
                        note={note}
                        projectId={projectId}
                        copiedNoteId={copiedNoteId}
                        onCopy={handleCopyNote}
                        onToggleChecklist={handleToggleNoteChecklist}
                        onTogglePin={togglePin}
                        onDelete={deleteNote}
                        onColorChange={(color) => updateNote(projectId, note.id, { color })}
                        onClick={() => setEditingNote(note)}
                        renderText={renderTextWithLinks}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* ── OTHER NOTES SECTION ── */}
              {otherNotes.length > 0 && (
                <div className="space-y-3">
                  {pinnedNotes.length > 0 && (
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-secondary-light">
                      <span>Other Notes ({otherNotes.length})</span>
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {otherNotes.map((note) => (
                      <NoteCard
                        key={note.id}
                        note={note}
                        projectId={projectId}
                        copiedNoteId={copiedNoteId}
                        onCopy={handleCopyNote}
                        onToggleChecklist={handleToggleNoteChecklist}
                        onTogglePin={togglePin}
                        onDelete={deleteNote}
                        onColorChange={(color) => updateNote(projectId, note.id, { color })}
                        onClick={() => setEditingNote(note)}
                        renderText={renderTextWithLinks}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* When no notes exist yet */}
              {notes.length === 0 && (
                <div className="bg-canvas-surface p-8 rounded-2xl border border-canvas-variant text-center space-y-2 shadow-sm my-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-semibold text-secondary-dark">
                    Your notepad for {projectName} is ready
                  </h3>
                  <p className="text-xs text-secondary-light max-w-sm mx-auto">
                    Type in the box above to store any notes, credentials, links, or tasks. Everything is saved automatically!
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* ── FREEFORM SCRATCHPAD (CONTINUOUS NOTEPAD) TAB ── */
            <div className="max-w-4xl mx-auto h-full flex flex-col space-y-3">
              {/* Scratchpad Action Bar */}
              <div className="bg-canvas-surface p-3 rounded-xl border border-canvas-variant flex flex-wrap items-center justify-between gap-3 shadow-sm">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleInsertTimestamp}
                    title="Insert current date & time"
                  >
                    <Calendar className="w-3.5 h-3.5 mr-1" />
                    Insert Date
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleInsertTodo}
                    title="Insert checklist checkbox"
                  >
                    <CheckSquare className="w-3.5 h-3.5 mr-1" />
                    Add Task
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(scratchpadText || '');
                      setScratchpadSavedNotice(true);
                      setTimeout(() => setScratchpadSavedNotice(false), 2000);
                    }}
                    title="Copy full notepad text"
                  >
                    <Copy className="w-3.5 h-3.5 mr-1" />
                    Copy All
                  </Button>
                </div>

                <div className="flex items-center space-x-3 text-xs text-secondary-light">
                  <span>
                    Words: <strong>{scratchpadText?.trim() ? scratchpadText.trim().split(/\s+/).length : 0}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Chars: <strong>{scratchpadText?.length || 0}</strong>
                  </span>
                  <span>•</span>
                  <span className="text-primary font-medium flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    {scratchpadSavedNotice ? 'Saved!' : 'Live auto-save'}
                  </span>
                </div>
              </div>

              {/* Scratchpad Textarea */}
              <div className="flex-1 bg-canvas-surface rounded-2xl border border-canvas-variant shadow-sm overflow-hidden flex flex-col p-4">
                <textarea
                  value={scratchpadText}
                  onChange={handleScratchpadChange}
                  onFocus={() => {
                    isScratchpadFocusedRef.current = true;
                  }}
                  onBlur={() => {
                    isScratchpadFocusedRef.current = false;
                  }}
                  placeholder={`Write or paste anything for ${projectName} here...\n\nExample:\n• Client kickoff notes\n• Server / API credentials & links\n• Feature scope & deliverables\n• Action items from meetings\n\n(Everything you type is automatically saved in real time!)`}
                  className="flex-1 w-full bg-transparent text-secondary-dark placeholder-secondary-light/50 text-sm leading-relaxed focus:outline-none resize-none font-mono"
                  style={{ minHeight: '380px' }}
                />
              </div>
            </div>
          )}
        </div>

        {/* ── Modal Footer ── */}
        <div className="bg-canvas-surface px-6 py-3 border-t border-canvas-variant flex items-center justify-between text-xs text-secondary-light shrink-0">
          <div>
            Project: <strong className="text-secondary-dark">{projectName}</strong> {companyName ? `(${companyName})` : ''}
          </div>
          <div className="flex items-center gap-3">
            <span>Press <kbd className="px-1.5 py-0.5 bg-canvas border border-canvas-variant rounded text-[10px] font-mono">Esc</kbd> to close</span>
            <Button size="sm" onClick={handleSafeClose}>
              Done
            </Button>
          </div>
        </div>
      </div>

      {/* ── Edit Note Modal ── */}
      {editingNote && (
        <EditNoteModal
          isOpen={!!editingNote}
          note={editingNote}
          projectId={projectId}
          onClose={() => setEditingNote(null)}
          onUpdate={updateNote}
          onDelete={deleteNote}
        />
      )}
    </div>
  );
};

// ──────────────────────────────────────────────
// Note Card Component (Google Keep Look & Feel)
// ──────────────────────────────────────────────
interface NoteCardProps {
  note: ProjectNote;
  projectId: string;
  copiedNoteId: string | null;
  onCopy: (note: ProjectNote) => void;
  onToggleChecklist: (noteId: string, itemId: string, completed: boolean) => void;
  onTogglePin: (projectId: string, noteId: string) => void;
  onDelete: (projectId: string, noteId: string) => void;
  onColorChange: (color: NoteColor) => void;
  onClick: () => void;
  renderText: (text: string) => React.ReactNode;
}

const NoteCard: React.FC<NoteCardProps> = ({
  note,
  projectId,
  copiedNoteId,
  onCopy,
  onToggleChecklist,
  onTogglePin,
  onDelete,
  onColorChange,
  onClick,
  renderText
}) => {
  const [showColorMenu, setShowColorMenu] = useState(false);
  const colorStyle = getNoteColor(note.color);

  return (
    <div
      onClick={onClick}
      className={`group relative rounded-2xl border p-4 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md flex flex-col justify-between ${colorStyle.bg} ${colorStyle.border}`}
    >
      <div>
        {/* Top Header: Title & Pin */}
        <div className="flex items-start justify-between gap-2 mb-2">
          {note.title ? (
            <h4 className={`font-bold text-sm leading-snug line-clamp-2 ${colorStyle.text}`}>
              {note.title}
            </h4>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onTogglePin(projectId, note.id);
            }}
            className={`p-1 rounded-lg transition-opacity ${
              note.isPinned
                ? 'opacity-100 text-primary'
                : 'opacity-0 group-hover:opacity-100 text-secondary-light hover:text-secondary-dark'
            }`}
            title={note.isPinned ? 'Unpin note' : 'Pin note'}
          >
            <Pin className={`w-3.5 h-3.5 ${note.isPinned ? 'fill-primary' : ''}`} />
          </button>
        </div>

        {/* Content Body */}
        {note.isChecklist && note.checklistItems?.length ? (
          <div className="space-y-1.5 my-2">
            {note.checklistItems.slice(0, 8).map((item) => (
              <div
                key={item.id}
                onClick={(e) => e.stopPropagation()}
                className="flex items-start gap-2 text-xs"
              >
                <button
                  type="button"
                  onClick={() => onToggleChecklist(note.id, item.id, !item.completed)}
                  className="mt-0.5 text-secondary-light hover:text-primary transition-colors"
                >
                  {item.completed ? (
                    <CheckSquare className="w-3.5 h-3.5 text-primary" />
                  ) : (
                    <Square className="w-3.5 h-3.5" />
                  )}
                </button>
                <span
                  className={`${colorStyle.text} ${
                    item.completed ? 'line-through opacity-50' : ''
                  } leading-relaxed`}
                >
                  {item.text}
                </span>
              </div>
            ))}
            {note.checklistItems.length > 8 && (
              <span className={`text-[11px] block mt-1 ${colorStyle.subText}`}>
                +{note.checklistItems.length - 8} more items...
              </span>
            )}
          </div>
        ) : (
          <p
            className={`text-xs whitespace-pre-wrap leading-relaxed line-clamp-8 ${colorStyle.text}`}
          >
            {renderText(note.content || '')}
          </p>
        )}
      </div>

      {/* Footer Toolbar (Appears on Hover) */}
      <div className="mt-4 pt-2 border-t border-black/5 flex items-center justify-between opacity-80 group-hover:opacity-100 transition-opacity">
        <span className={`text-[10px] ${colorStyle.subText} flex items-center gap-1`}>
          <Clock className="w-3 h-3" />
          {formatRelativeTime(note.updatedAt || note.createdAt)}
        </span>

        <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
          {/* Color Palette Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowColorMenu(!showColorMenu)}
              className="p-1 rounded-md text-secondary-light hover:text-secondary-dark hover:bg-black/5 transition-colors"
              title="Change note color"
            >
              <Palette className="w-3.5 h-3.5" />
            </button>

            {showColorMenu && (
              <div className="absolute bottom-full mb-1 left-0 z-20 bg-canvas-surface border border-canvas-variant p-1.5 rounded-xl shadow-level-2 flex space-x-1">
                {COLOR_KEYS.map((c) => {
                  const style = getNoteColor(c);
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => {
                        onColorChange(c);
                        setShowColorMenu(false);
                      }}
                      className={`w-4 h-4 rounded-full border ${style.dot} ${
                        note.color === c ? 'ring-2 ring-primary ring-offset-1' : ''
                      }`}
                      title={style.label}
                    />
                  );
                })}
              </div>
            )}
          </div>

          {/* Copy Button */}
          <button
            type="button"
            onClick={() => onCopy(note)}
            className="p-1 rounded-md text-secondary-light hover:text-secondary-dark hover:bg-black/5 transition-colors"
            title="Copy note text"
          >
            {copiedNoteId === note.id ? (
              <Check className="w-3.5 h-3.5 text-primary font-bold" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Delete Button */}
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Delete this note?')) {
                onDelete(projectId, note.id);
              }
            }}
            className="p-1 rounded-md text-secondary-light hover:text-danger hover:bg-danger/10 transition-colors"
            title="Delete note"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ──────────────────────────────────────────────
// Edit Note Modal (When Clicking a Note)
// ──────────────────────────────────────────────
interface EditNoteModalProps {
  isOpen: boolean;
  note: ProjectNote;
  projectId: string;
  onClose: () => void;
  onUpdate: (projectId: string, noteId: string, updates: Partial<ProjectNote>) => Promise<void>;
  onDelete: (projectId: string, noteId: string) => Promise<void>;
}

const EditNoteModal: React.FC<EditNoteModalProps> = ({
  isOpen,
  note,
  projectId,
  onClose,
  onUpdate,
  onDelete
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState(note.title || '');
  const [content, setContent] = useState(note.content || '');
  const [color, setColor] = useState<NoteColor>(note.color || 'default');
  const [isPinned, setIsPinned] = useState(!!note.isPinned);
  const [isChecklist, setIsChecklist] = useState(!!note.isChecklist);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>(
    note.checklistItems || []
  );

  const activeColor = getNoteColor(color);

  const handleSave = async () => {
    await onUpdate(projectId, note.id, {
      title: title.trim(),
      content: content.trim(),
      color,
      isPinned,
      isChecklist,
      checklistItems: isChecklist ? checklistItems.filter((i) => i.text.trim()) : []
    });
    onClose();
  };

  const handleAddChecklistItem = () => {
    setChecklistItems((prev) => [
      ...prev,
      { id: `${Date.now()}_${Math.random()}`, text: '', completed: false }
    ]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-secondary-dark/60 backdrop-blur-sm" onClick={handleSave} />
      <div
        className={`relative z-50 w-full max-w-lg rounded-2xl p-6 shadow-level-3 border flex flex-col space-y-4 ${activeColor.bg} ${activeColor.border}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-2">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={`w-full bg-transparent font-bold text-lg focus:outline-none ${activeColor.text}`}
          />
          <button
            type="button"
            onClick={() => setIsPinned(!isPinned)}
            className={`p-1.5 rounded-lg ${isPinned ? 'text-primary bg-primary/10' : 'text-secondary-light'}`}
            title={isPinned ? 'Unpin note' : 'Pin note'}
          >
            <Pin className={`w-4 h-4 ${isPinned ? 'fill-primary' : ''}`} />
          </button>
        </div>

        {/* Content */}
        {isChecklist ? (
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {checklistItems.map((item) => (
              <div key={item.id} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setChecklistItems((prev) =>
                      prev.map((i) =>
                        i.id === item.id ? { ...i, completed: !i.completed } : i
                      )
                    )
                  }
                  className="text-secondary-light hover:text-primary"
                >
                  {item.completed ? (
                    <CheckSquare className="w-4 h-4 text-primary" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                </button>
                <input
                  type="text"
                  value={item.text}
                  onChange={(e) =>
                    setChecklistItems((prev) =>
                      prev.map((i) =>
                        i.id === item.id ? { ...i, text: e.target.value } : i
                      )
                    )
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddChecklistItem();
                    }
                  }}
                  className={`flex-1 bg-transparent text-sm focus:outline-none ${activeColor.text} ${
                    item.completed ? 'line-through opacity-50' : ''
                  }`}
                />
                <button
                  type="button"
                  onClick={() =>
                    setChecklistItems((prev) => prev.filter((i) => i.id !== item.id))
                  }
                  className="text-secondary-light hover:text-danger p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddChecklistItem}
              className="text-xs text-primary hover:underline font-semibold flex items-center gap-1 pt-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add checklist item
            </button>
          </div>
        ) : (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Note content..."
            rows={6}
            className={`w-full bg-transparent text-sm focus:outline-none resize-none leading-relaxed ${activeColor.text}`}
          />
        )}

        {/* Toolbar & Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-black/5">
          <div className="flex items-center space-x-1.5">
            {COLOR_KEYS.map((c) => {
              const style = getNoteColor(c);
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-5 h-5 rounded-full border ${style.dot} ${
                    color === c ? 'ring-2 ring-primary ring-offset-1 scale-110' : ''
                  }`}
                  title={style.label}
                />
              );
            })}
            <button
              type="button"
              onClick={() => setIsChecklist(!isChecklist)}
              className="ml-2 p-1.5 rounded-lg text-secondary-light hover:bg-black/5"
              title="Toggle checklist mode"
            >
              <CheckSquare className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Delete this note?')) {
                  onDelete(projectId, note.id);
                  onClose();
                }
              }}
              className="p-2 text-danger hover:bg-danger/10 rounded-lg transition-colors"
              title="Delete note"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <Button size="sm" onClick={handleSave}>
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper for relative timestamps
function formatRelativeTime(dateString?: string) {
  try {
    if (!dateString) return 'Just now';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Recently';
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSeconds < 60) return 'Just now';
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return 'Recently';
  }
}
