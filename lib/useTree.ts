
import { fetcher } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

interface Tree {
  path?: string;
  mode?: string;
  type?: string;
  sha?: string;
  size?: number;
  url?: string;
}

interface FetchTreeParams {
  owner: string;
  repo: string;
  branch: string;
  installationId: number | null;
}

const fetchTree = async ({ owner, repo, branch, installationId }: FetchTreeParams) => {
  const tree = await fetcher<Tree[]>(`/api/repos/${owner}/${repo}/tree/${branch}?installationId=${installationId}`);
  return tree;
};

export const useTree = ({ owner, repo, branch, installationId }: FetchTreeParams) => {
  return useQuery<Tree[]>({
    queryKey: ["tree", { owner, repo, branch, installationId }],
    queryFn: () => fetchTree({ owner, repo, branch, installationId: installationId! }),
    enabled: !!owner && !!repo && !!branch && !!installationId,
  });
};
