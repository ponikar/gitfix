import { Tree } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { API_URL } from "./api";

interface FetchTreeParams {
  owner: string;
  repo: string;
  branch: string;
  installationId: number | null;
}

const fetchTree = async ({
  owner,
  repo,
  branch,
  installationId,
}: FetchTreeParams) => {
  const response = await fetch(`${API_URL}/api/repos/${owner}/${repo}/tree`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      branch,
      installationId,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch tree");
  }

  const tree = await response.json();
  return tree as Tree;
};

export const useTree = ({
  owner,
  repo,
  branch,
  installationId,
}: FetchTreeParams) => {
  return useQuery<Tree>({
    queryKey: ["tree", owner, repo, branch, installationId],
    queryFn: () =>
      fetchTree({ owner, repo, branch, installationId: installationId! }),
    enabled: !!owner && !!repo && !!branch && !!installationId,
  });
};
