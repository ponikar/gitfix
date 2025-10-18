import { type Message } from "@ai-sdk/react";
import { useMutation } from "@tanstack/react-query";
import { fetcher } from "./api";

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
  const result = await fetcher<{
    pullRequestUrl: any;
    error?: undefined;
  }>(`/api/apply-fix`, {
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

  return result;
};

export const useRaisePR = () => {
  return useMutation({
    mutationFn: raisePRFn,
  });
};
