import { Context, Hono } from "hono";
import { cors } from "hono/cors";
import jwt from "jsonwebtoken";
import { Agent } from "./agents";
import { createOctokitApp } from "./octokit";

export type Bindings = {
  GITHUB_CLIENT_ID: string;
  GITHUB_SECRET_ID: string;
  APP_ID: string;
  PRIVATE_KEY: string;
  GOOGLE_API_KEY: string;
  OPENAI_API_KEY: string;
  SIGNING_KEY: string;
};

export type Variables = {
  user: {
    sub: number;
    login: string;
    email: string;
    iat: number;
    exp: number;
  };
};

async function verifyGitHubToken(token: string): Promise<any> {
  try {
    const response = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "gitfix-app",
      },
    });

    if (!response.ok) {
      console.error("GitHub API error:", response.status, response.statusText);
      return null;
    }

    const user = await response.json();

    // Check X-OAuth-Scopes header to verify token has necessary permissions
    const scopes = response.headers.get("x-oauth-scopes");
    console.log("Token scopes:", scopes);

    return user;
  } catch (error) {
    console.error("GitHub token verification error:", error);
    return null;
  }
}

// JWT verification middleware
const verifyJWT = async (c: Context, next: any) => {
  try {
    const authHeader = c.req.header("Authorization");

    console.log("AUTH HEADER", authHeader);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return c.json({ error: "Missing or invalid Authorization header" }, 401);
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, c.env.SIGNING_KEY, {
        algorithms: ["HS256"],
      }) as any;

      c.set("user", decoded);
      await next();
    } catch (err: any) {
      if (err.name === "TokenExpiredError") {
        return c.json({ error: "Token has expired" }, 401);
      }
      return c.json({ error: "Invalid token" }, 401);
    }
  } catch (error) {
    return c.json({ error: "Token verification failed" }, 500);
  }
};

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

app.use("/api/*", cors());
app.use("/api/*", verifyJWT);

app.get("/", (c) => {
  return c.text("Hello from Gitfix Backend!");
});

// Verify GitHub token and issue JWT
app.post("/verify-token", async (c) => {
  try {
    const { accessToken } = await c.req.json();

    if (!accessToken) {
      return c.json({ error: "Access token is required" }, 400);
    }

    // Verify the GitHub token is valid
    const user = await verifyGitHubToken(accessToken);

    if (!user) {
      return c.json({ error: "Invalid GitHub token" }, 401);
    }

    // Sign a new JWT with 1 month validity
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 1 month from now
    const jwtPayload = {
      sub: user.id,
      login: user.login,
      email: user.email,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(expiresAt.getTime() / 1000),
    };

    const jwtToken = jwt.sign(jwtPayload, c.env.SIGNING_KEY, {
      algorithm: "HS256",
    });

    return c.json({
      jwtToken,
      user: {
        id: user.id,
        login: user.login,
        email: user.email,
      },
      expiresAt: expiresAt.toISOString(),
    });
  } catch (err: any) {
    console.error(err);
    return c.json(
      { error: "Failed to verify token", message: err.message },
      500
    );
  }
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

// list of branches
app.get("/api/repos/:owner/:repo/branches", async (c) => {
  try {
    const { owner, repo } = c.req.param();
    const installationId = Number(c.req.query("installationId"));
    const octokitApp = createOctokitApp(c.env);

    if (!installationId) {
      return c.json({ error: "Invalid installationId" }, 400);
    }

    const octokit = await octokitApp.getInstallationOctokit(installationId);

    const { data } = await octokit.rest.repos.listBranches({
      owner,
      repo,
    });

    console.log("DATA", data);

    return c.json(data);
  } catch (err: any) {
    console.error(err);
    return c.json(
      { error: "Failed to fetch branches", message: err.message },
      500
    );
  }
});

// tree information of that particular repo
app.post("/api/repos/:owner/:repo/tree", async (c) => {
  try {
    const { owner, repo } = c.req.param();
    const body = await c.req.json();
    const { branch, installationId } = body;
    const octokitApp = createOctokitApp(c.env);

    if (!installationId) {
      return c.json({ error: "Invalid installationId" }, 400);
    }

    if (!branch) {
      return c.json({ error: "Branch is required" }, 400);
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

app.post("/api/suggest-fix", async (c) => {
  try {
    const installationId = c.req.header("x-installation-id");
    if (!installationId) {
      return c.json({ error: "x-installation-id header is required" }, 400);
    }

    const user = c.get("user");
    const body = await c.req.json();

    const agent = new Agent(installationId, c.env);

    const stream = await agent.suggestFix({
      owner: body.owner,
      repo: body.repo,
      userPrompt: body.userPrompt,
      files: body.files ?? [],
      messages: body.messages,
      activeChanges: body.activeChanges ?? {},
    });

    return stream;
  } catch (err: any) {
    console.error(err);
    return c.json(
      { error: "Failed to suggest fix", message: err.message },
      500
    );
  }
});

app.post("/api/apply-fix", async (c) => {
  try {
    const installationId = c.req.header("x-installation-id");
    if (!installationId) {
      return c.json({ error: "x-installation-id header is required" }, 400);
    }

    const user = c.get("user");
    const body = await c.req.json();

    const agent = new Agent(installationId, c.env);

    const result = await agent.applyFix({
      owner: body.owner,
      repo: body.repo,
      base: body.base,
      head: body.head,
      files: body.files,
    });

    return c.json(result);
  } catch (err: any) {
    console.error(err);
    return c.json({ error: "Failed to apply fix", message: err.message }, 500);
  }
});

export default app;
