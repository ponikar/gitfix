import { getItem, setItem } from "@/storage";
import { Storage } from "@/storage/keys";
import { create } from "zustand";

type FileRef = {
  path: string;
  sha: string;
};

type FileRefsState = {
  fileRefs: Record<string, FileRef[]>;
};

type FileRefsActions = {
  setFileRefs: (threadId: string, refs: FileRef[]) => void;
  getFileRefs: (threadId: string) => FileRef[];
  clearFileRefs: (threadId: string) => void;
  deleteThread: (threadId: string) => void;
};

const loadPersistedFileRefs = (): Record<string, FileRef[]> => {
  const stored = getItem(Storage.FILE_REFS);
  return stored ? JSON.parse(stored) : {};
};

const useFileRefsStore = create<{
  state: FileRefsState;
  actions: FileRefsActions;
}>()((set, get) => ({
  state: { fileRefs: loadPersistedFileRefs() },
  actions: {
    setFileRefs: (threadId, refs) => {
      const updated = { ...get().state.fileRefs, [threadId]: refs };
      setItem(Storage.FILE_REFS, JSON.stringify(updated));
      set((prev) => ({ ...prev, state: { fileRefs: updated } }));
    },
    getFileRefs: (threadId) => {
      return get().state.fileRefs[threadId] || [];
    },
    clearFileRefs: (threadId) => {
      const updated = { ...get().state.fileRefs };
      delete updated[threadId];
      setItem(Storage.FILE_REFS, JSON.stringify(updated));
      set((prev) => ({ ...prev, state: { fileRefs: updated } }));
    },
    deleteThread: (threadId) => {
      const updated = { ...get().state.fileRefs };
      delete updated[threadId];
      setItem(Storage.FILE_REFS, JSON.stringify(updated));
      set((prev) => ({ ...prev, state: { fileRefs: updated } }));
    },
  },
}));

export const useFileRefsState = () => useFileRefsStore((state) => state.state);
export const useFileRefsActions = () =>
  useFileRefsStore((state) => state.actions);
