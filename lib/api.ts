export const API_URL = "http://localhost:8787";

export const fetcher = async <T>(endpoint: string): Promise<T> => {
  const response = await fetch(`${API_URL}${endpoint}`);
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
};
