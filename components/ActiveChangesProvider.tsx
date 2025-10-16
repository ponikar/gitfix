import React, { createContext, ReactNode, useContext, useRef } from "react";

interface FileChanges {
  [filePath: string]: string;
}

interface ChangesContextType {
  changes: { current: FileChanges };
  setChanges: (changes: FileChanges) => void;
  clearChanges: () => void;
}

const ChangesContext = createContext<ChangesContextType | undefined>(undefined);

interface ChangesProviderProps {
  children: ReactNode;
}

export function ChangesProvider({ children }: ChangesProviderProps) {
  const changes = useRef<FileChanges>({});

  const setChanges = (newChanges: FileChanges) => {
    changes.current = newChanges;
  };

  const clearChanges = () => {
    changes.current = {};
  };

  return (
    <ChangesContext.Provider value={{ changes, setChanges, clearChanges }}>
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
