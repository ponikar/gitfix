import { MMKV } from "react-native-mmkv";
import { Storage } from "./keys";

export const storage = new MMKV({
  id: "gitfix-storage",
  encryptionKey: process.env.EXPO_PUBLIC_STORAGE_ENCRYPTION_KEY || "storage_enc_key",
});

export function getItem(key: keyof typeof Storage): string | null {
  const value = storage.getString(key);
  return value ?? null;
}

export function setItem(key: keyof typeof Storage, value: string | null) {
  if (value === null) {
    storage.delete(key);
  } else {
    storage.set(key, value);
  }
}

export function removeItem(key: keyof typeof Storage) {
  storage.delete(key);
}
