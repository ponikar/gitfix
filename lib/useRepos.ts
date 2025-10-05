import { fetcher } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

interface Repo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
}

const fetchRepos = async (installationId: number) => {
  const repos = await fetcher<Repo[]>(`/api/repos/${installationId}`);
  return repos;
};

export const useRepos = (installationId: number | null) => {
  return useQuery<Repo[]>({
    queryKey: ["repos", installationId],
    queryFn: () => fetchRepos(installationId!),
    enabled: !!installationId,
  });
};
