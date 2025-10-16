import React, { createContext, ReactNode, useContext, useRef } from "react";
import { getItem, setItem } from "../storage";
import { Storage } from "../storage/keys"; // Import Storage correctly

interface FileChanges {
  [filePath: string]: string;
}

interface State {
  activeChanges: FileChanges;
}

interface ChangesContextType {
  state: State;
  setActiveChanges: (changes: FileChanges) => void;
  clearActiveChanges: () => void;
}

const initialState: State = {
  activeChanges: {},
};

const ChangesContext = createContext<ChangesContextType | undefined>(undefined);

interface ChangesProviderProps {
  children: ReactNode;
}

export function ChangesProvider({ children }: ChangesProviderProps) {
  const state = useRef<State>({
    activeChanges: JSON.parse(getItem(Storage.ACTIVE_CHANGES) || "{}"),
  });

  const setActiveChanges = (newChanges: FileChanges) => {
    state.current.activeChanges = newChanges;
    setItem(Storage.ACTIVE_CHANGES, JSON.stringify(newChanges));
  };

  const clearActiveChanges = () => {
    state.current.activeChanges = {};
    setItem(Storage.ACTIVE_CHANGES, null);
  };

  return (
    <ChangesContext.Provider
      value={{ state: state.current, setActiveChanges, clearActiveChanges }}
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
