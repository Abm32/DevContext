import { Router, type IRouter, type Request, type Response } from "express";
import jwt from "jsonwebtoken";
import { GetMeResponse, LogoutResponse } from "@workspace/api-zod";

const router: IRouter = Router();

const GITHUB_CLIENT_ID = process.env["GITHUB_CLIENT_ID"] ?? "";
const GITHUB_CLIENT_SECRET = process.env["GITHUB_CLIENT_SECRET"] ?? "";
const JWT_SECRET = process.env["JWT_SECRET"] ?? "devcontext-jwt-secret-change-in-prod";
const COOKIE_NAME = "dc_token";
const COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

interface GitHubUser {
  id: number;
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
}

interface TokenPayload {
  githubToken: string;
  githubUser: GitHubUser;
}

function getBaseUrl(req: Request): string {
  if (process.env["APP_BASE_URL"]) return process.env["APP_BASE_URL"];
  const proto = req.headers["x-forwarded-proto"] ?? "https";
  const host = req.headers["x-forwarded-host"] ?? req.headers["host"] ?? "localhost";
  return `${proto}://${host}`;
}

export function getTokenPayload(req: Request): TokenPayload | null {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

function setAuthCookie(res: Response, payload: TokenPayload): void {
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env["NODE_ENV"] === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE_MS,
    path: "/",
  });
}

router.get("/github", (req, res) => {
  if (!GITHUB_CLIENT_ID) {
    res.redirect("/?error=missing_client_id");
    return;
  }
  const baseUrl = getBaseUrl(req);
  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    redirect_uri: `${baseUrl}/api/auth/github/callback`,
    scope: "read:user repo read:org",
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

    const userData = (await userRes.json()) as GitHubUser;

    const payload: TokenPayload = {
      githubToken: tokenData.access_token,
      githubUser: {
        id: userData.id,
        login: userData.login,
        name: userData.name,
        avatar_url: userData.avatar_url,
        html_url: userData.html_url,
      },
    };

    setAuthCookie(res, payload);
    res.redirect("/dashboard");
  } catch (err) {
    req.log.error({ err }, "GitHub OAuth error");
    res.redirect("/?error=server_error");
  }
});

router.get("/me", (req, res) => {
  const payload = getTokenPayload(req);
  if (!payload) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  const data = GetMeResponse.parse(payload.githubUser);
  res.json(data);
});

router.post("/logout", (_req, res) => {
  res.clearCookie(COOKIE_NAME, { path: "/" });
  const data = LogoutResponse.parse({ success: true });
  res.json(data);
});

export default router;
