import { Storage } from "@/storage/keys";
import { create } from "zustand";
import { getItem, removeItem, setItem } from "../storage";

type AuthState = {
  accessToken: string | null;
  githubState: string | null;
  code: string | null;
};

type AuthActions = {
  setAccessToken: (token: string | null) => void;
  setGithubState: (state: string | null) => void;
  setCode: (code: string | null) => void;
  logout: () => void;
};

const initialState: AuthState = {
  accessToken: getItem(Storage.ACCESS_TOKEN),
  githubState: getItem(Storage.GITHUB_STATE),
  code: getItem(Storage.CODE),
};

const useAuthStore = create<{ state: AuthState; actions: AuthActions }>()(
  (set) => ({
    state: initialState,
    actions: {
      setAccessToken: (token) => {
        setItem(Storage.ACCESS_TOKEN, token);
        set((prevState) => ({
          ...prevState,
          state: { ...prevState.state, accessToken: token },
        }));
      },
      setGithubState: (state) => {
        setItem(Storage.GITHUB_STATE, state);
        set((prevState) => ({
          ...prevState,
          state: { ...prevState.state, githubState: state },
        }));
      },
      setCode: (code) => {
        setItem(Storage.CODE, code);
        set((prevState) => ({
          ...prevState,
          state: { ...prevState.state, code: code },
        }));
      },
      logout: () => {
        removeItem(Storage.ACCESS_TOKEN);
        removeItem(Storage.GITHUB_STATE);
        removeItem(Storage.CODE);
        removeItem(Storage.INSTALLATION_ID);
        removeItem(Storage.ACTIVE_CHANGES);
        removeItem(Storage.PR_LINKS);
        removeItem(Storage.THREADS);
        removeItem(Storage.FILE_REFS);
        set({ state: { accessToken: null, githubState: null, code: null } });
      },
    },
  })
);

export const useAuthState = () => useAuthStore((state) => state.state);
export const useAuthActions = () => useAuthStore((state) => state.actions);
