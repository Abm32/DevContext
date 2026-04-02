import { Router, type IRouter } from "express";
import { getTokenPayload } from "./auth";

const router: IRouter = Router();

// ─── Types ───────────────────────────────────────────────────────────────────

type Ecosystem = "npm" | "pypi" | "cargo" | "rubygems" | "go";

interface RawDep {
  name: string;
  version: string;
  dep_type: "prod" | "dev";
}

interface DepStaleness {
  name: string;
  ecosystem: Ecosystem;
  current_version: string;
  latest_version: string | null;
  severity: "major" | "minor" | "patch" | "ok";
  dep_type: "prod" | "dev";
  registry_url: string;
  in_work_area: boolean;
  teammate_changed: boolean;
}

interface DepsReport {
  ecosystem: Ecosystem | null;
  manifest_file: string | null;
  deps: DepStaleness[];
  manifest_changed: boolean;
  total_stale: number;
  summary: { major: number; minor: number; patch: number };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function stripVersionConstraint(v: string): string {
  const cleaned = v.replace(/^[^0-9]*/, "").split(/\s+/)[0] ?? "";
  return cleaned || v;
}

function parseSemver(v: string): [number, number, number] {
  const parts = v
    .replace(/^[^0-9]*/, "")
    .split(".")
    .map((s) => parseInt(s, 10));
  return [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0];
}

function getSeverity(current: string, latest: string): "major" | "minor" | "patch" | "ok" {
  const [cMaj, cMin, cPat] = parseSemver(current);
  const [lMaj, lMin, lPat] = parseSemver(latest);
  if (lMaj > cMaj) return "major";
  if (lMaj === cMaj && lMin > cMin) return "minor";
  if (lMaj === cMaj && lMin === cMin && lPat > cPat) return "patch";
  return "ok";
}

function registryUrl(ecosystem: Ecosystem, name: string): string {
  if (ecosystem === "npm") return `https://www.npmjs.com/package/${name}`;
  if (ecosystem === "pypi") return `https://pypi.org/project/${name}/`;
  if (ecosystem === "cargo") return `https://crates.io/crates/${name}`;
  if (ecosystem === "rubygems") return `https://rubygems.org/gems/${name}`;
  if (ecosystem === "go") return `https://pkg.go.dev/${name}`;
  return "#";
}

// ─── Manifest Parsers ─────────────────────────────────────────────────────────

function parsePackageJson(content: string): RawDep[] {
  try {
    const pkg = JSON.parse(content) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };
    const deps: RawDep[] = [];
    for (const [name, ver] of Object.entries(pkg.dependencies ?? {})) {
      if (typeof ver === "string" && !name.startsWith("//")) {
        deps.push({ name, version: stripVersionConstraint(ver), dep_type: "prod" });
      }
    }
    for (const [name, ver] of Object.entries(pkg.devDependencies ?? {})) {
      if (typeof ver === "string" && !name.startsWith("//")) {
        deps.push({ name, version: stripVersionConstraint(ver), dep_type: "dev" });
      }
    }
    return deps;
  } catch {
    return [];
  }
}

function parseRequirementsTxt(content: string): RawDep[] {
  const deps: RawDep[] = [];
  for (const rawLine of content.split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#") || line.startsWith("-") || line.startsWith("git+")) continue;
    const match = line.match(/^([A-Za-z0-9_.-]+)\s*(?:[=!<>~]+\s*([0-9][0-9a-zA-Z._-]*))?/);
    if (match?.[1] && match[2]) {
      deps.push({ name: match[1], version: match[2], dep_type: "prod" });
    }
  }
  return deps;
}

function parsePyprojectToml(content: string): RawDep[] {
  const deps: RawDep[] = [];
  const depsSection = content.match(/\[tool\.poetry\.dependencies\]([\s\S]*?)(?:\[|$)/)?.[1] ?? "";
  for (const line of depsSection.split("\n")) {
    const match = line.match(/^([a-zA-Z0-9_-]+)\s*=\s*"([^"]+)"/);
    if (match?.[1] && match[2] && match[1].toLowerCase() !== "python") {
      deps.push({ name: match[1], version: stripVersionConstraint(match[2]), dep_type: "prod" });
    }
  }
  // Also try PEP 621 style
  const pep621 = content.match(/\[project\][\s\S]*?dependencies\s*=\s*\[([\s\S]*?)\]/)?.[1] ?? "";
  for (const line of pep621.split("\n")) {
    const match = line.match(/["']([A-Za-z0-9_.-]+)\s*(?:[=!<>~]+\s*([0-9][0-9a-zA-Z._-]*))?["']/);
    if (match?.[1] && match[2]) {
      deps.push({ name: match[1], version: match[2], dep_type: "prod" });
    }
  }
  return deps;
}

function parseCargoToml(content: string): RawDep[] {
  const deps: RawDep[] = [];
  let isDevSection = false;
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (trimmed === "[dependencies]") { isDevSection = false; continue; }
    if (trimmed === "[dev-dependencies]") { isDevSection = true; continue; }
    if (trimmed.startsWith("[") && trimmed !== "[dependencies]" && trimmed !== "[dev-dependencies]") {
      isDevSection = false; continue;
    }
    // name = "version"
    const simple = trimmed.match(/^([a-zA-Z0-9_-]+)\s*=\s*"([0-9][^"]*)"/);
    if (simple?.[1] && simple[2]) {
      deps.push({ name: simple[1], version: simple[2], dep_type: isDevSection ? "dev" : "prod" });
      continue;
    }
    // name = { version = "version", ... }
    const table = trimmed.match(/^([a-zA-Z0-9_-]+)\s*=\s*\{[^}]*version\s*=\s*"([0-9][^"]*)"/);
    if (table?.[1] && table[2]) {
      deps.push({ name: table[1], version: table[2], dep_type: isDevSection ? "dev" : "prod" });
    }
  }
  return deps;
}

function parseGoMod(content: string): RawDep[] {
  const deps: RawDep[] = [];
  let inRequire = false;
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (trimmed.startsWith("require (")) { inRequire = true; continue; }
    if (inRequire && trimmed === ")") { inRequire = false; continue; }
    const pattern = inRequire
      ? trimmed.match(/^([^\s]+)\s+v([0-9][^\s]*)/)
      : trimmed.match(/^require\s+([^\s]+)\s+v([0-9][^\s]*)/);
    if (pattern?.[1] && pattern[2] && !pattern[1].startsWith("//")) {
      deps.push({ name: pattern[1], version: pattern[2], dep_type: "prod" });
    }
  }
  return deps;
}

function parseGemfile(content: string): RawDep[] {
  const deps: RawDep[] = [];
  for (const line of content.split("\n")) {
    const match = line.match(/^\s*gem\s+['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]/);
    if (match?.[1] && match[2]) {
      deps.push({ name: match[1], version: stripVersionConstraint(match[2]), dep_type: "prod" });
    }
  }
  return deps;
}

// ─── Registry Fetchers ────────────────────────────────────────────────────────

const REGISTRY_TIMEOUT = 4500;

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), ms));
  return Promise.race([promise, timeout]);
}

async function getLatestNpm(name: string): Promise<string | null> {
  try {
    const res = await withTimeout(
      fetch(`https://registry.npmjs.org/${encodeURIComponent(name)}/latest`),
      REGISTRY_TIMEOUT
    );
    if (!res?.ok) return null;
    const data = (await res.json()) as { version?: string };
    return data.version ?? null;
  } catch { return null; }
}

async function getLatestPypi(name: string): Promise<string | null> {
  try {
    const res = await withTimeout(
      fetch(`https://pypi.org/pypi/${encodeURIComponent(name)}/json`),
      REGISTRY_TIMEOUT
    );
    if (!res?.ok) return null;
    const data = (await res.json()) as { info?: { version?: string } };
    return data.info?.version ?? null;
  } catch { return null; }
}

async function getLatestCargo(name: string): Promise<string | null> {
  try {
    const res = await withTimeout(
      fetch(`https://crates.io/api/v1/crates/${encodeURIComponent(name)}`, {
        headers: { "User-Agent": "devcontext/1.0 (https://github.com/devcontext)" },
      }),
      REGISTRY_TIMEOUT
    );
    if (!res?.ok) return null;
    const data = (await res.json()) as { crate?: { max_stable_version?: string; newest_version?: string } };
    return data.crate?.max_stable_version ?? data.crate?.newest_version ?? null;
  } catch { return null; }
}

async function getLatestRubyGems(name: string): Promise<string | null> {
  try {
    const res = await withTimeout(
      fetch(`https://rubygems.org/api/v1/gems/${encodeURIComponent(name)}.json`),
      REGISTRY_TIMEOUT
    );
    if (!res?.ok) return null;
    const data = (await res.json()) as { version?: string };
    return data.version ?? null;
  } catch { return null; }
}

async function getLatestGo(modulePath: string): Promise<string | null> {
  try {
    const encoded = modulePath.split("/").map(encodeURIComponent).join("/");
    const res = await withTimeout(
      fetch(`https://proxy.golang.org/${encoded}/@latest`),
      REGISTRY_TIMEOUT
    );
    if (!res?.ok) return null;
    const data = (await res.json()) as { Version?: string };
    return data.Version ? data.Version.replace(/^v/, "") : null;
  } catch { return null; }
}

type RegistryFetcher = (name: string) => Promise<string | null>;

const FETCHERS: Record<Ecosystem, RegistryFetcher> = {
  npm: getLatestNpm,
  pypi: getLatestPypi,
  cargo: getLatestCargo,
  rubygems: getLatestRubyGems,
  go: getLatestGo,
};

// ─── Ecosystem detection from file extensions ─────────────────────────────────

const ECOSYSTEM_EXTENSIONS: Record<Ecosystem, string[]> = {
  npm: [".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs"],
  pypi: [".py", ".pyi"],
  cargo: [".rs"],
  rubygems: [".rb", ".rake"],
  go: [".go"],
};

/**
 * Determine the ecosystem from a list of recently changed file paths by
 * looking at which ecosystem's file extensions appear most frequently.
 */
function ecosystemFromFiles(files: string[]): Ecosystem | null {
  const counts: Partial<Record<Ecosystem, number>> = {};
  for (const file of files) {
    const ext = file.slice(file.lastIndexOf("."));
    for (const [eco, exts] of Object.entries(ECOSYSTEM_EXTENSIONS) as [Ecosystem, string[]][]) {
      if (exts.includes(ext)) {
        counts[eco] = (counts[eco] ?? 0) + 1;
      }
    }
  }
  let best: Ecosystem | null = null;
  let bestCount = 0;
  for (const [eco, count] of Object.entries(counts) as [Ecosystem, number][]) {
    if (count > bestCount) { best = eco; bestCount = count; }
  }
  return best;
}

// ─── GitHub Contents API ──────────────────────────────────────────────────────

async function fetchGitHubFile(
  owner: string,
  repo: string,
  path: string,
  branch: string | undefined,
  token: string
): Promise<string | null> {
  const url = branch
    ? `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${encodeURIComponent(branch)}`
    : `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { content?: string; encoding?: string };
    if (!data.content || data.encoding !== "base64") return null;
    return Buffer.from(data.content.replace(/\n/g, ""), "base64").toString("utf-8");
  } catch { return null; }
}

// ─── Manifest Detection ───────────────────────────────────────────────────────

interface ManifestResult {
  ecosystem: Ecosystem;
  file: string;
  deps: RawDep[];
}

const MANIFEST_CANDIDATES: Array<{
  file: string;
  ecosystem: Ecosystem;
  parser: (content: string) => RawDep[];
}> = [
  { file: "package.json", ecosystem: "npm", parser: parsePackageJson },
  { file: "requirements.txt", ecosystem: "pypi", parser: parseRequirementsTxt },
  { file: "pyproject.toml", ecosystem: "pypi", parser: parsePyprojectToml },
  { file: "Cargo.toml", ecosystem: "cargo", parser: parseCargoToml },
  { file: "go.mod", ecosystem: "go", parser: parseGoMod },
  { file: "Gemfile", ecosystem: "rubygems", parser: parseGemfile },
];


async function detectManifest(
  owner: string,
  repo: string,
  branch: string | undefined,
  token: string
): Promise<ManifestResult | null> {
  const results = await Promise.all(
    MANIFEST_CANDIDATES.map(async ({ file, ecosystem, parser }) => {
      const content = await fetchGitHubFile(owner, repo, file, branch, token);
      if (!content) return null;
      const deps = parser(content);
      return deps.length > 0 ? { ecosystem, file, deps } : null;
    })
  );
  return results.find(Boolean) ?? null;
}

// ─── Route ────────────────────────────────────────────────────────────────────

router.get("/repos/:owner/:repo/deps", async (req, res) => {
  const payload = getTokenPayload(req);
  if (!payload) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const { owner, repo } = req.params;
  const branch = req.query["branch"] as string | undefined;
  // Comma-separated list of recently-changed filenames from commits (used for
  // in_work_area via file-extension frequency and teammate_changed via manifest path)
  const filesParam = req.query["files"] as string | undefined;
  const recentFiles = filesParam ? filesParam.split(",").map((f) => f.trim()).filter(Boolean) : [];

  const token = payload.githubToken;

  try {
    const manifest = await detectManifest(owner, repo, branch, token);

    if (!manifest) {
      const report: DepsReport = {
        ecosystem: null,
        manifest_file: null,
        deps: [],
        manifest_changed: false,
        total_stale: 0,
        summary: { major: 0, minor: 0, patch: 0 },
      };
      res.json(report);
      return;
    }

    const { ecosystem, file: manifestFile, deps: rawDeps } = manifest;
    const fetcher = FETCHERS[ecosystem];

    // Detect if a teammate recently changed THIS ecosystem's specific manifest file
    // (not just any manifest — scoped to the detected manifest file path)
    const manifestChanged = recentFiles.some(
      (f) => f === manifestFile || f.endsWith(`/${manifestFile}`)
    );

    // Determine if the dev's recent work is in this ecosystem by file extension frequency
    const activeEcosystem = recentFiles.length > 0 ? ecosystemFromFiles(recentFiles) : null;
    const inWorkArea = activeEcosystem === ecosystem;

    // Limit: prod deps first (always), dev deps only when manifest was recently changed
    const prodDeps = rawDeps.filter((d) => d.dep_type === "prod").slice(0, 35);
    const devDeps = manifestChanged
      ? rawDeps.filter((d) => d.dep_type === "dev").slice(0, Math.max(0, 40 - prodDeps.length))
      : [];
    const depsToCheck = [...prodDeps, ...devDeps];

    // Fan out to registry in parallel (each dep has its own timeout via withTimeout)
    const latestVersions = await Promise.all(
      depsToCheck.map((d) => fetcher(d.name))
    );

    const staleDeps: DepStaleness[] = [];
    for (let i = 0; i < depsToCheck.length; i++) {
      const dep = depsToCheck[i]!;
      const latest = latestVersions[i] ?? null;
      const severity = latest ? getSeverity(dep.version, latest) : "ok";

      staleDeps.push({
        name: dep.name,
        ecosystem,
        current_version: dep.version,
        latest_version: latest,
        severity,
        dep_type: dep.dep_type,
        registry_url: registryUrl(ecosystem, dep.name),
        in_work_area: inWorkArea,
        teammate_changed: manifestChanged,
      });
    }

    // Sort: major first, then minor, then patch, then ok
    const severityOrder = { major: 0, minor: 1, patch: 2, ok: 3 };
    staleDeps.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

    const summary = {
      major: staleDeps.filter((d) => d.severity === "major").length,
      minor: staleDeps.filter((d) => d.severity === "minor").length,
      patch: staleDeps.filter((d) => d.severity === "patch").length,
    };

    const report: DepsReport = {
      ecosystem,
      manifest_file: manifestFile,
      deps: staleDeps,
      manifest_changed: manifestChanged,
      total_stale: summary.major + summary.minor + summary.patch,
      summary,
    };

    res.json(report);
  } catch (err) {
    req.log.error({ err }, "Error fetching dep report");
    res.status(500).json({ error: "Failed to fetch dependency report" });
  }
});

export default router;
