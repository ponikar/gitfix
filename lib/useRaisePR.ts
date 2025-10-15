import { type Message } from "@ai-sdk/react";
import { useMutation } from "@tanstack/react-query";
import { API_URL } from "./api";

interface RaisePRParams {
  owner: string;
  repo: string;
  base: string;
  head: string;
  files: { path: string; content: string }[];
  installationId: number;
  messages: Message[];
}

const raisePRFn = async (params: RaisePRParams) => {
  const response = await fetch(`${API_URL}/api/apply-fix`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-installation-id": String(params.installationId),
    },
    body: JSON.stringify({
      owner: params.owner,
      repo: params.repo,
      base: params.base,
      head: params.head,
      files: params.files,
      messages: params.messages,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to raise PR");
  }

  return (await response.json()) as {
    pullRequestUrl: any;
    error?: undefined;
  };
};

export const useRaisePR = () => {
  return useMutation({
    mutationFn: raisePRFn,
  });
};
