import { create } from 'zustand';
import { supabase } from './supabase';

export type NoteColor = 'default' | 'amber' | 'emerald' | 'blue' | 'purple' | 'rose' | 'slate';

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface ProjectNote {
  id: string;
  projectId: string;
  title: string;
  content: string;
  color: NoteColor;
  isPinned: boolean;
  isChecklist: boolean;
  checklistItems: ChecklistItem[];
  createdAt: string;
  updatedAt: string;
}

interface ProjectNotesState {
  notes: Record<string, ProjectNote[]>; // Keyed by projectId
  scratchpads: Record<string, string>; // Keyed by projectId
  isSyncing: boolean;
  lastSavedAt: string | null;

  // Actions
  fetchNotes: (projectId: string) => Promise<void>;
  fetchAllNotes: () => Promise<void>;
  addNote: (projectId: string, note: Partial<ProjectNote>) => Promise<ProjectNote>;
  updateNote: (projectId: string, noteId: string, updates: Partial<ProjectNote>) => Promise<void>;
  deleteNote: (projectId: string, noteId: string) => Promise<void>;
  togglePin: (projectId: string, noteId: string) => Promise<void>;
  saveScratchpad: (projectId: string, text: string) => void;
  getNotesForProject: (projectId: string) => ProjectNote[];
  getScratchpadForProject: (projectId: string) => string;
  getNoteCountForProject: (projectId: string) => number;
}

const STORAGE_NOTES_KEY = 'goodwin_project_notes_v1';
const STORAGE_SCRATCHPAD_KEY = 'goodwin_project_scratchpads_v1';

// Generate valid RFC4122 v4 UUID for database compatibility
const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// Initial local storage load
const loadLocalNotes = (): Record<string, ProjectNote[]> => {
  try {
    const raw = localStorage.getItem(STORAGE_NOTES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (err) {
    console.error('Failed to parse local project notes', err);
    return {};
  }
};

const loadLocalScratchpads = (): Record<string, string> => {
  try {
    const raw = localStorage.getItem(STORAGE_SCRATCHPAD_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (err) {
    console.error('Failed to parse local project scratchpads', err);
    return {};
  }
};

const saveLocalNotes = (notes: Record<string, ProjectNote[]>) => {
  try {
    localStorage.setItem(STORAGE_NOTES_KEY, JSON.stringify(notes));
  } catch (err) {
    console.error('Failed to save local project notes', err);
  }
};

const saveLocalScratchpads = (scratchpads: Record<string, string>) => {
  try {
    localStorage.setItem(STORAGE_SCRATCHPAD_KEY, JSON.stringify(scratchpads));
  } catch (err) {
    console.error('Failed to save local scratchpads', err);
  }
};

export const useProjectNotesStore = create<ProjectNotesState>((set, get) => ({
  notes: loadLocalNotes(),
  scratchpads: loadLocalScratchpads(),
  isSyncing: false,
  lastSavedAt: null,

  fetchAllNotes: async () => {
    try {
      const { data, error } = await supabase
        .from('project_notes')
        .select('*')
        .order('is_pinned', { ascending: false })
        .order('updated_at', { ascending: false });

      if (!error && Array.isArray(data)) {
        const notesByProject: Record<string, ProjectNote[]> = {};
        const scratchpadsByProject: Record<string, string> = {};

        data.forEach((item: any) => {
          const pid = item.project_id;
          if (!pid) return;

          if (item.title === '__PROJECT_SCRATCHPAD__') {
            scratchpadsByProject[pid] = item.content || '';
          } else {
            if (!notesByProject[pid]) notesByProject[pid] = [];
            notesByProject[pid].push({
              id: item.id,
              projectId: pid,
              title: item.title || '',
              content: item.content || '',
              color: (item.color as NoteColor) || 'default',
              isPinned: !!item.is_pinned,
              isChecklist: !!item.is_checklist,
              checklistItems: Array.isArray(item.checklist_items) ? item.checklist_items : [],
              createdAt: item.created_at || new Date().toISOString(),
              updatedAt: item.updated_at || new Date().toISOString(),
            });
          }
        });

        set((state) => {
          const mergedNotes: Record<string, ProjectNote[]> = { ...state.notes };

          Object.keys(notesByProject).forEach((pid) => {
            const remoteList = notesByProject[pid] || [];
            const localList = state.notes[pid] || [];
            const remoteIds = new Set(remoteList.map((n) => n.id));
            const unsyncedLocal = localList.filter((n) => !remoteIds.has(n.id));
            mergedNotes[pid] = [...unsyncedLocal, ...remoteList];
          });

          // Also preserve projects that have local notes not present on remote at all
          Object.keys(state.notes).forEach((pid) => {
            if (!mergedNotes[pid]) {
              mergedNotes[pid] = state.notes[pid];
            }
          });

          const mergedScratchpads = { ...state.scratchpads, ...scratchpadsByProject };
          saveLocalNotes(mergedNotes);
          saveLocalScratchpads(mergedScratchpads);
          return { notes: mergedNotes, scratchpads: mergedScratchpads };
        });
      }
    } catch (err) {
      console.error('fetchAllNotes error:', err);
    }
  },

  fetchNotes: async (projectId: string) => {
    if (!projectId) return;

    try {
      const { data, error } = await supabase
        .from('project_notes')
        .select('*')
        .eq('project_id', projectId)
        .order('is_pinned', { ascending: false })
        .order('updated_at', { ascending: false });

      if (!error && Array.isArray(data)) {
        // Extract scratchpad if present
        const scratchpadRow = data.find((d: any) => d.title === '__PROJECT_SCRATCHPAD__');
        if (scratchpadRow) {
          set((state) => {
            const updated = { ...state.scratchpads, [projectId]: scratchpadRow.content || '' };
            saveLocalScratchpads(updated);
            return { scratchpads: updated };
          });
        }

        // Regular notes (exclude scratchpad row)
        const remoteNotes: ProjectNote[] = data
          .filter((item: any) => item.title !== '__PROJECT_SCRATCHPAD__')
          .map((item: any) => ({
            id: item.id,
            projectId: item.project_id,
            title: item.title || '',
            content: item.content || '',
            color: (item.color as NoteColor) || 'default',
            isPinned: !!item.is_pinned,
            isChecklist: !!item.is_checklist,
            checklistItems: Array.isArray(item.checklist_items) ? item.checklist_items : [],
            createdAt: item.created_at || new Date().toISOString(),
            updatedAt: item.updated_at || new Date().toISOString(),
          }));

        set((state) => {
          const currentLocal = state.notes[projectId] || [];

          if (remoteNotes.length > 0) {
            // Check if any local notes were created while offline that aren't in remote
            const remoteIds = new Set(remoteNotes.map((n) => n.id));
            const unsyncedLocal = currentLocal.filter((n) => !remoteIds.has(n.id));

            // Upload unsynced local notes to Supabase in background
            if (unsyncedLocal.length > 0) {
              unsyncedLocal.forEach(async (n) => {
                try {
                  await supabase.from('project_notes').insert([{
                    id: n.id,
                    project_id: projectId,
                    title: n.title,
                    content: n.content,
                    color: n.color,
                    is_pinned: n.isPinned,
                    is_checklist: n.isChecklist,
                    checklist_items: n.checklistItems,
                    created_at: n.createdAt,
                    updated_at: n.updatedAt
                  }]);
                } catch (e) {
                  // ignore
                }
              });
            }

            const combined = [...unsyncedLocal, ...remoteNotes];
            const updated = { ...state.notes, [projectId]: combined };
            saveLocalNotes(updated);
            return { notes: updated };
          } else if (currentLocal.length > 0) {
            // Local notes exist but Supabase is empty -> upload local notes to Supabase
            currentLocal.forEach(async (n) => {
              try {
                await supabase.from('project_notes').insert([{
                  id: n.id,
                  project_id: projectId,
                  title: n.title,
                  content: n.content,
                  color: n.color,
                  is_pinned: n.isPinned,
                  is_checklist: n.isChecklist,
                  checklist_items: n.checklistItems,
                  created_at: n.createdAt,
                  updated_at: n.updatedAt
                }]);
              } catch (e) {
                // ignore
              }
            });
            return state;
          } else {
            const updated = { ...state.notes, [projectId]: [] };
            saveLocalNotes(updated);
            return { notes: updated };
          }
        });
      }
    } catch (err) {
      console.error('fetchNotes error:', err);
    }
  },

  addNote: async (projectId: string, noteInput: Partial<ProjectNote>) => {
    const now = new Date().toISOString();
    const newNote: ProjectNote = {
      id: generateUUID(),
      projectId,
      title: noteInput.title?.trim() || '',
      content: noteInput.content || '',
      color: noteInput.color || 'default',
      isPinned: !!noteInput.isPinned,
      isChecklist: !!noteInput.isChecklist,
      checklistItems: noteInput.checklistItems || [],
      createdAt: now,
      updatedAt: now,
    };

    set((state) => {
      const existing = state.notes[projectId] || [];
      const updatedList = [newNote, ...existing];
      const updatedNotes = { ...state.notes, [projectId]: updatedList };
      saveLocalNotes(updatedNotes);
      return { notes: updatedNotes, lastSavedAt: now };
    });

    // Cloud sync to Supabase
    try {
      const { error } = await supabase.from('project_notes').insert([{
        id: newNote.id,
        project_id: projectId,
        title: newNote.title,
        content: newNote.content,
        color: newNote.color,
        is_pinned: newNote.isPinned,
        is_checklist: newNote.isChecklist,
        checklist_items: newNote.checklistItems,
        created_at: newNote.createdAt,
        updated_at: newNote.updatedAt,
      }]);
      if (error) {
        console.error('Supabase note insert error:', error);
      }
    } catch (err) {
      console.error('Failed to sync note to Supabase:', err);
    }

    return newNote;
  },

  updateNote: async (projectId: string, noteId: string, updates: Partial<ProjectNote>) => {
    const now = new Date().toISOString();

    set((state) => {
      const existing = state.notes[projectId] || [];
      const updatedList = existing.map((n) =>
        n.id === noteId ? { ...n, ...updates, updatedAt: now } : n
      );
      const updatedNotes = { ...state.notes, [projectId]: updatedList };
      saveLocalNotes(updatedNotes);
      return { notes: updatedNotes, lastSavedAt: now };
    });

    // Background sync to Supabase with only defined fields
    try {
      const dbPayload: any = { updated_at: now };
      if (updates.title !== undefined) dbPayload.title = updates.title;
      if (updates.content !== undefined) dbPayload.content = updates.content;
      if (updates.color !== undefined) dbPayload.color = updates.color;
      if (updates.isPinned !== undefined) dbPayload.is_pinned = updates.isPinned;
      if (updates.isChecklist !== undefined) dbPayload.is_checklist = updates.isChecklist;
      if (updates.checklistItems !== undefined) dbPayload.checklist_items = updates.checklistItems;

      const { error } = await supabase
        .from('project_notes')
        .update(dbPayload)
        .eq('id', noteId);

      if (error) {
        console.error('Supabase note update error:', error);
      }
    } catch (err) {
      console.error('Failed to sync note update to Supabase:', err);
    }
  },

  deleteNote: async (projectId: string, noteId: string) => {
    set((state) => {
      const existing = state.notes[projectId] || [];
      const updatedList = existing.filter((n) => n.id !== noteId);
      const updatedNotes = { ...state.notes, [projectId]: updatedList };
      saveLocalNotes(updatedNotes);
      return { notes: updatedNotes };
    });

    try {
      const { error } = await supabase.from('project_notes').delete().eq('id', noteId);
      if (error) console.error('Supabase note delete error:', error);
    } catch (err) {
      console.error('Failed to sync delete to Supabase:', err);
    }
  },

  togglePin: async (projectId: string, noteId: string) => {
    const state = get();
    const existing = state.notes[projectId] || [];
    const target = existing.find((n) => n.id === noteId);
    if (!target) return;

    await get().updateNote(projectId, noteId, { isPinned: !target.isPinned });
  },

  saveScratchpad: async (projectId: string, text: string) => {
    const now = new Date().toISOString();
    set((state) => {
      const updated = { ...state.scratchpads, [projectId]: text };
      saveLocalScratchpads(updated);
      return { scratchpads: updated, lastSavedAt: now };
    });

    // Cloud sync scratchpad to Supabase
    try {
      const { data } = await supabase
        .from('project_notes')
        .select('id')
        .eq('project_id', projectId)
        .eq('title', '__PROJECT_SCRATCHPAD__')
        .maybeSingle();

      if (data?.id) {
        await supabase
          .from('project_notes')
          .update({ content: text, updated_at: now })
          .eq('id', data.id);
      } else {
        await supabase
          .from('project_notes')
          .insert([{
            id: generateUUID(),
            project_id: projectId,
            title: '__PROJECT_SCRATCHPAD__',
            content: text,
            color: 'default',
            is_pinned: false,
            is_checklist: false,
            checklist_items: [],
            created_at: now,
            updated_at: now
          }]);
      }
    } catch (err) {
      console.error('Failed to sync scratchpad to Supabase:', err);
    }
  },

  getNotesForProject: (projectId: string) => {
    const state = get();
    return state.notes[projectId] || [];
  },

  getScratchpadForProject: (projectId: string) => {
    const state = get();
    return state.scratchpads[projectId] || '';
  },

  getNoteCountForProject: (projectId: string) => {
    const state = get();
    const notes = state.notes[projectId] || [];
    const hasScratchpad = (state.scratchpads[projectId] || '').trim().length > 0;
    return notes.length + (hasScratchpad ? 1 : 0);
  },
}));
