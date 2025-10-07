import { Hono } from "hono";
import { cors } from "hono/cors";
import { createOctokitApp } from "./octokit";

export type Bindings = {
  GITHUB_CLIENT_ID: string;
  GITHUB_SECRET_ID: string;
  APP_ID: string;
  PRIVATE_KEY: string;
  GOOGLE_API_KEY: string;
  OPENAI_API_KEY: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use("/api/*", cors());

app.get("/", (c) => {
  return c.text("Hello from Gitfix Backend!");
});

interface InstallationReposResponse {
  repositories: any[]; // You can define a more specific type for repository
}

app.get("/api/repos/:installationId", async (c) => {
  try {
    const installationIdParam = c.req.param("installationId");
    const installationId = Number(installationIdParam);
    const octokitApp = createOctokitApp(c.env);

    if (!installationId) {
      return c.json({ error: "Invalid installationId" }, 400);
    }

    const octokit = await octokitApp.getInstallationOctokit(installationId);

    const { data } = await octokit.request<InstallationReposResponse>({
      url: "/installation/repositories",
      method: "GET",
    });

    return c.json(data.repositories);
  } catch (err: any) {
    console.error(err);
    return c.json(
      { error: "Failed to fetch repos", message: err.message },
      500
    );
  }
});
app.get("/api/repos/:owner/:repo/branches", async (c) => {
  try {
    const { owner, repo } = c.req.param();
    const installationId = Number(c.req.query("installationId"));
    const octokitApp = createOctokitApp(c.env);

    if (!installationId) {
      return c.json({ error: "Invalid installationId" }, 400);
    }

    const octokit = await octokitApp.getInstallationOctokit(installationId);

    const { data } = await octokit.repos.listBranches({
      owner,
      repo,
    });

    return c.json(data);
  } catch (err: any) {
    console.error(err);
    return c.json(
      { error: "Failed to fetch branches", message: err.message },
      500
    );
  }
});

app.get("/api/repos/:owner/:repo/tree/:branch", async (c) => {
  try {
    const { owner, repo, branch } = c.req.param();
    const installationId = Number(c.req.query("installationId"));
    const octokitApp = createOctokitApp(c.env);

    if (!installationId) {
      return c.json({ error: "Invalid installationId" }, 400);
    }

    const octokit = await octokitApp.getInstallationOctokit(installationId);

    const { data: branchData } = await octokit.request(
      "GET /repos/{owner}/{repo}/branches/{branch}",
      {
        owner,
        repo,
        branch,
      }
    );

    const { data } = await octokit.request(
      "GET /repos/{owner}/{repo}/git/trees/{tree_sha}",
      {
        owner,
        repo,
        tree_sha: branchData.commit.sha,
        recursive: "true",
      }
    );

    return c.json(data);
  } catch (err: any) {
    console.error(err);
    return c.json({ error: "Failed to fetch tree", message: err.message }, 500);
  }
});

export default app;
