import { fetcher } from "@/lib/api";
import { Branch } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";

interface FetchBranchesParams {
  owner: string;
  repo: string;
  installationId: number | null;
}

const fetchBranches = async ({
  owner,
  repo,
  installationId,
}: FetchBranchesParams) => {
  const branches = await fetcher<Branch[]>(
    `/api/repos/${owner}/${repo}/branches?installationId=${installationId}`
  );
  return branches;
};

export const useBranches = ({
  owner,
  repo,
  installationId,
}: FetchBranchesParams) => {
  return useQuery<Branch[]>({
    queryKey: ["branches", { owner, repo, installationId }],
    queryFn: () =>
      fetchBranches({ owner, repo, installationId: installationId! }),
    enabled: !!owner && !!repo && !!installationId,
  });
};
