import { Storage } from "@/storage/keys";
import { type Message } from "@ai-sdk/react";
import { create } from "zustand";
import { getItem, setItem } from "../storage";

export type Thread = {
  id: string;
  owner: string;
  repo: string;
  branch: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
};

type ThreadState = {
  threads: Thread[];
};

type ThreadActions = {
  createThread: (
    thread: Omit<Thread, "id" | "createdAt" | "updatedAt">
  ) => Thread;
  updateThread: (
    id: string,
    updates: Partial<Omit<Thread, "id" | "createdAt">>
  ) => void;
  deleteThread: (id: string) => void;
  getThreadsByRepo: (owner: string, repo: string) => Thread[];
  getThread: (id: string) => Thread | undefined;
  addMessage: (threadId: string, message: Message) => void;
};

const loadThreads = (): Thread[] => {
  const threadsData = getItem(Storage.THREADS);
  return threadsData ? JSON.parse(threadsData) : [];
};

const saveThreads = (threads: Thread[]) => {
  setItem(Storage.THREADS, JSON.stringify(threads));
};

const initialState: ThreadState = {
  threads: loadThreads(),
};

const useThreadStore = create<{ state: ThreadState; actions: ThreadActions }>()(
  (set, get) => ({
    state: initialState,
    actions: {
      createThread: (thread) => {
        const newThread: Thread = {
          ...thread,
          id: `${thread.owner}-${thread.repo}-${Date.now()}`,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        set((prevState) => {
          const updatedThreads = [...prevState.state.threads, newThread];
          saveThreads(updatedThreads);
          return {
            ...prevState,
            state: { threads: updatedThreads },
          };
        });

        return newThread;
      },

      updateThread: (id, updates) => {
        set((prevState) => {
          const updatedThreads = prevState.state.threads.map((thread) =>
            thread.id === id
              ? { ...thread, ...updates, updatedAt: Date.now() }
              : thread
          );
          saveThreads(updatedThreads);
          return {
            ...prevState,
            state: { threads: updatedThreads },
          };
        });
      },

      deleteThread: (id) => {
        set((prevState) => {
          const updatedThreads = prevState.state.threads.filter(
            (thread) => thread.id !== id
          );
          saveThreads(updatedThreads);
          return {
            ...prevState,
            state: { threads: updatedThreads },
          };
        });
      },

      getThreadsByRepo: (owner, repo) => {
        return get().state.threads.filter(
          (thread) => thread.owner === owner && thread.repo === repo
        );
      },

      getThread: (id) => {
        return get().state.threads.find((thread) => thread.id === id);
      },

      addMessage: (threadId, message) => {
        set((prevState) => {
          const updatedThreads = prevState.state.threads.map((thread) =>
            thread.id === threadId
              ? {
                  ...thread,
                  messages: [...thread.messages, message],
                  updatedAt: Date.now(),
                }
              : thread
          );
          saveThreads(updatedThreads);
          return {
            ...prevState,
            state: { threads: updatedThreads },
          };
        });
      },
    },
  })
);

export const useThreadState = () => useThreadStore((state) => state.state);
export const useThreadActions = () => useThreadStore((state) => state.actions);
