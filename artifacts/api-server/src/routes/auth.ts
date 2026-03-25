import { Router, type IRouter } from "express";
import { GetMeResponse, LogoutResponse } from "@workspace/api-zod";

const router: IRouter = Router();

const GITHUB_CLIENT_ID = process.env["GITHUB_CLIENT_ID"] ?? "";
const GITHUB_CLIENT_SECRET = process.env["GITHUB_CLIENT_SECRET"] ?? "";

function getBaseUrl(req: import("express").Request): string {
  // Use env var if set, otherwise derive from the request host
  if (process.env["APP_BASE_URL"]) return process.env["APP_BASE_URL"];
  const proto = req.headers["x-forwarded-proto"] ?? "https";
  const host = req.headers["x-forwarded-host"] ?? req.headers["host"] ?? "localhost";
  return `${proto}://${host}`;
}

declare module "express-session" {
  interface SessionData {
    githubToken?: string;
    githubUser?: {
      id: number;
      login: string;
      name: string | null;
      avatar_url: string;
      html_url: string;
    };
  }
}

router.get("/github", (req, res) => {
  if (!GITHUB_CLIENT_ID) {
    res.redirect("/?error=missing_client_id");
    return;
  }
  const baseUrl = getBaseUrl(req);
  const state = Math.random().toString(36).substring(2);
  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    redirect_uri: `${baseUrl}/api/auth/github/callback`,
    scope: "read:user repo",
    state,
  });
  res.redirect(`https://github.com/login/oauth/authorize?${params}`);
});

router.get("/github/callback", async (req, res) => {
  const { code } = req.query;

  if (!code || typeof code !== "string") {
    res.redirect("/?error=missing_code");
    return;
  }

  try {
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: `${getBaseUrl(req)}/api/auth/github/callback`,
      }),
    });

    const tokenData = (await tokenRes.json()) as {
      access_token?: string;
      error?: string;
    };

    if (tokenData.error || !tokenData.access_token) {
      req.log.error({ error: tokenData.error }, "GitHub OAuth token error");
      res.redirect("/?error=oauth_failed");
      return;
    }

    const userRes = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        Accept: "application/vnd.github+json",
      },
    });

    const userData = (await userRes.json()) as {
      id: number;
      login: string;
      name: string | null;
      avatar_url: string;
      html_url: string;
    };

    req.session.githubToken = tokenData.access_token;
    req.session.githubUser = {
      id: userData.id,
      login: userData.login,
      name: userData.name,
      avatar_url: userData.avatar_url,
      html_url: userData.html_url,
    };

    req.session.save(() => {
      res.redirect("/dashboard");
    });
  } catch (err) {
    req.log.error({ err }, "GitHub OAuth error");
    res.redirect("/?error=server_error");
  }
});

router.get("/me", (req, res) => {
  if (!req.session.githubUser) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  const data = GetMeResponse.parse(req.session.githubUser);
  res.json(data);
});

router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    const data = LogoutResponse.parse({ success: true });
    res.json(data);
  });
});

export default router;
