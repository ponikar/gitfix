import { fetcher } from "@/lib/api";
import { useAuthState } from "@/store/auth";
import { useQuery } from "@tanstack/react-query";

interface Repo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
}

const fetchRepos = async (token: string) => {
  // 1. Fetch installation ID
  const instRes = await fetch("https://api.github.com/user/installations", {
    headers: {
      Authorization: `token ${token}`,
      Accept: "application/vnd.github+json",
    },
  });
  if (!instRes.ok) {
    throw new Error("Failed to fetch installations");
  }
  const instData = await instRes.json();
  const installationId = instData.installations?.[0]?.id;
  if (!installationId) {
    throw new Error("No installation found");
  }

  // 2. Fetch repos using installation ID
  const repos = await fetcher<Repo[]>(`/api/repos/${installationId}`);
  return repos;
};

export const useRepos = () => {
  const { accessToken } = useAuthState();

  return useQuery<Repo[]>({
    queryKey: ["repos", accessToken],
    queryFn: () => fetchRepos(accessToken!),
    enabled: !!accessToken,
  });
};
