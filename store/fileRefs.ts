import { getItem, setItem } from "@/storage";
import { Storage } from "@/storage/keys";
import { create } from "zustand";

type FileRef = {
  path: string;
  sha: string;
};

type FileRefsState = {
  fileRefs: FileRef[];
};

type FileRefsActions = {
  setFileRefs: (refs: FileRef[]) => void;
  clearFileRefs: () => void;
};

const loadPersistedFileRefs = (): FileRef[] => {
  const stored = getItem(Storage.FILE_REFS);
  return stored ? JSON.parse(stored) : [];
};

const useFileRefsStore = create<{
  state: FileRefsState;
  actions: FileRefsActions;
}>()((set) => ({
  state: { fileRefs: loadPersistedFileRefs() },
  actions: {
    setFileRefs: (refs) => {
      setItem(Storage.FILE_REFS, JSON.stringify(refs));
      set((prev) => ({ ...prev, state: { fileRefs: refs } }));
    },
    clearFileRefs: () => {
      setItem(Storage.FILE_REFS, null);
      set((prev) => ({ ...prev, state: { fileRefs: [] } }));
    },
  },
}));

export const useFileRefsState = () => useFileRefsStore((state) => state.state);
export const useFileRefsActions = () =>
  useFileRefsStore((state) => state.actions);
