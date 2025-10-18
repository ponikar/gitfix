import { Tree } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { fetcher } from "./api";

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
  const tree = await fetcher<Tree>(`/api/repos/${owner}/${repo}/tree`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      branch,
      installationId,
    }),
  });
  return tree;
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
