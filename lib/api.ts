import { getItem } from "@/storage";
import { Storage } from "@/storage/keys";

export const API_URL = "http://localhost:8787";

export const fetcher = async <T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> => {
  const jwtToken = getItem(Storage.JWT_TOKEN);
  const headers: Record<string, string> = {};

  if (jwtToken) {
    headers["Authorization"] = `Bearer ${jwtToken}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...headers,
      ...(options?.headers || {}),
    },
  });

  if (!response.ok) {
    throw new Error("Network response was not ok");
  }

  return response.json();
};
