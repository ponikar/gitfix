import React, { createContext, ReactNode, useContext, useRef } from "react";
import { getItem, setItem } from "../storage";
import { Storage } from "../storage/keys"; // Import Storage correctly

interface FileChanges {
  [filePath: string]: string;
}

interface State {
  activeChanges: { [threadId: string]: FileChanges };
  prLinks: Map<string, string>;
}

interface ChangesContextType {
  state: State;
  setActiveChanges: (threadId: string, changes: FileChanges) => void;
  getActiveChanges: (threadId: string) => FileChanges;
  clearActiveChanges: (threadId: string) => void;
  setPrLink: (messageId: string, prLink: string) => void;
}

const initialState: State = {
  activeChanges: {},
  prLinks: new Map<string, string>(),
};

const ChangesContext = createContext<ChangesContextType | undefined>(undefined);

interface ChangesProviderProps {
  children: ReactNode;
}

export function ChangesProvider({ children }: ChangesProviderProps) {
  const prLinksData = getItem(Storage.PR_LINKS);
  const state = useRef<State>({
    activeChanges: JSON.parse(getItem(Storage.ACTIVE_CHANGES) || "{}"),
    prLinks: new Map(JSON.parse(prLinksData || "[]")),
  });

  const setActiveChanges = (threadId: string, newChanges: FileChanges) => {
    state.current.activeChanges[threadId] = newChanges;
    setItem(
      Storage.ACTIVE_CHANGES,
      JSON.stringify(state.current.activeChanges)
    );
  };

  const getActiveChanges = (threadId: string): FileChanges => {
    return state.current.activeChanges[threadId] || {};
  };

  const clearActiveChanges = (threadId: string) => {
    delete state.current.activeChanges[threadId];
    setItem(
      Storage.ACTIVE_CHANGES,
      JSON.stringify(state.current.activeChanges)
    );
  };

  function setPrLink(messageId: string, prLink: string) {
    state.current.prLinks.set(messageId, prLink);
    setItem(
      Storage.PR_LINKS,
      JSON.stringify(Array.from(state.current.prLinks.entries()))
    );
  }

  return (
    <ChangesContext.Provider
      value={{
        state: state.current,
        setActiveChanges,
        getActiveChanges,
        clearActiveChanges,
        setPrLink,
      }}
    >
      {children}
    </ChangesContext.Provider>
  );
}

export function useChanges() {
  const context = useContext(ChangesContext);
  if (context === undefined) {
    throw new Error("useChanges must be used within a ChangesProvider");
  }
  return context;
}
