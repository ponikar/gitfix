import { useMutation } from "@tanstack/react-query";

interface SuggestFixParams {
  userPrompt: string;
  fileRefs: { path: string; sha: string }[];
  installationId: number;
  repo: string;
  owner: string;
}

const suggestFixFn = async (params: SuggestFixParams) => {
  const response = await fetch("/api/suggest-fix", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error("Failed to suggest fix");
  }

  return response.json();
};

export const useSuggestFix = () => {
  return useMutation({
    mutationFn: suggestFixFn,
  });
};
