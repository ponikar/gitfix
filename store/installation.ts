import { Storage } from "@/storage/keys";
import { create } from "zustand";
import { getItem, setItem } from "../storage";

type InstallationState = {
  installationId: number | null;
};

type InstallationActions = {
  setInstallationId: (id: number | null) => void;
};

const initialState: InstallationState = {
  installationId: getItem(Storage.INSTALLATION_ID)
    ? Number.parseInt(getItem(Storage.INSTALLATION_ID) ?? "0")
    : null,
};

const useInstallationStore = create<{
  state: InstallationState;
  actions: InstallationActions;
}>()((set) => ({
  state: initialState,
  actions: {
    setInstallationId: (id) => {
      if (id) {
        setItem(Storage.INSTALLATION_ID, id.toString());
      }
      set((prevState) => ({
        ...prevState,
        state: { ...prevState.state, installationId: id },
      }));
    },
  },
}));

export const useInstallationState = () =>
  useInstallationStore((state) => state.state);
export const useInstallationActions = () =>
  useInstallationStore((state) => state.actions);
