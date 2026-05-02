const now = new Date();
const h = (hours: number) => new Date(now.getTime() - hours * 3600_000).toISOString();

export const MOCK_REPOS = [
  {
    id: 900001,
    name: "taskflow-web",
    full_name: "demo-user/taskflow-web",
    description: "React + Vite frontend for TaskFlow project management",
    private: false,
    html_url: "https://github.com/demo-user/taskflow-web",
    updated_at: h(1),
    language: "TypeScript",
    stargazers_count: 48,
    default_branch: "main",
  },
  {
    id: 900002,
    name: "taskflow-api",
    full_name: "demo-user/taskflow-api",
    description: "Express + PostgreSQL backend API for TaskFlow",
    private: false,
    html_url: "https://github.com/demo-user/taskflow-api",
    updated_at: h(3),
    language: "TypeScript",
    stargazers_count: 32,
    default_branch: "main",
  },
  {
    id: 900003,
    name: "infra-scripts",
    full_name: "demo-user/infra-scripts",
    description: "Deployment scripts, CI/CD configs, and monitoring dashboards",
    private: true,
    html_url: "https://github.com/demo-user/infra-scripts",
    updated_at: h(18),
    language: "Python",
    stargazers_count: 5,
    default_branch: "main",
  },
];

export const MOCK_BRANCHES: Record<string, Array<{ name: string; is_default: boolean }>> = {
  "demo-user/taskflow-web": [
    { name: "main", is_default: true },
    { name: "feat/kanban-board", is_default: false },
    { name: "fix/auth-redirect", is_default: false },
    { name: "chore/upgrade-deps", is_default: false },
  ],
  "demo-user/taskflow-api": [
    { name: "main", is_default: true },
    { name: "feat/webhooks", is_default: false },
    { name: "fix/rate-limiter", is_default: false },
  ],
  "demo-user/infra-scripts": [
    { name: "main", is_default: true },
    { name: "feat/alerting", is_default: false },
  ],
};

export const MOCK_COMMITS: Record<string, Array<{
  sha: string;
  message: string;
  author_name: string;
  author_email: string;
  author_date: string;
  html_url: string;
}>> = {
  "demo-user/taskflow-web": [
    {
      sha: "wip0000000000000000000000000000000000000a",
      message: "wip",
      author_name: "Demo User",
      author_email: "demo@devcontext.io",
      author_date: h(0.5),
      html_url: "https://github.com/demo-user/taskflow-web/commit/wip0000",
    },
    {
      sha: "checkpoint000000000000000000000000000000b",
      message: "checkpoint before refactor",
      author_name: "Demo User",
      author_email: "demo@devcontext.io",
      author_date: h(1),
      html_url: "https://github.com/demo-user/taskflow-web/commit/checkpoint000",
    },
    {
      sha: "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2",
      message: "feat(kanban): add drag-and-drop column reordering",
      author_name: "Demo User",
      author_email: "demo@devcontext.io",
      author_date: h(2),
      html_url: "https://github.com/demo-user/taskflow-web/commit/a1b2c3d",
    },
    {
      sha: "b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3",
      message: "fix(auth): prevent redirect loop on token expiry",
      author_name: "Demo User",
      author_email: "demo@devcontext.io",
      author_date: h(5),
      html_url: "https://github.com/demo-user/taskflow-web/commit/b2c3d4e",
    },
    {
      sha: "c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4",
      message: "feat(dashboard): add task burndown chart with Recharts",
      author_name: "Demo User",
      author_email: "demo@devcontext.io",
      author_date: h(8),
      html_url: "https://github.com/demo-user/taskflow-web/commit/c3d4e5f",
    },
    {
      sha: "d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5",
      message: "refactor: extract useTaskMutation hook from BoardColumn",
      author_name: "Demo User",
      author_email: "demo@devcontext.io",
      author_date: h(12),
      html_url: "https://github.com/demo-user/taskflow-web/commit/d4e5f6a",
    },
    {
      sha: "e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6",
      message: "style: update card hover states and shadow tokens",
      author_name: "Demo User",
      author_email: "demo@devcontext.io",
      author_date: h(20),
      html_url: "https://github.com/demo-user/taskflow-web/commit/e5f6a1b",
    },
    {
      sha: "f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1",
      message: "feat(notifications): add toast system for task updates",
      author_name: "Demo User",
      author_email: "demo@devcontext.io",
      author_date: h(26),
      html_url: "https://github.com/demo-user/taskflow-web/commit/f6a1b2c",
    },
    {
      sha: "a7b8c9d0e1f2a7b8c9d0e1f2a7b8c9d0e1f2a7b8",
      message: "test: add integration tests for Kanban drag handlers",
      author_name: "Demo User",
      author_email: "demo@devcontext.io",
      author_date: h(30),
      html_url: "https://github.com/demo-user/taskflow-web/commit/a7b8c9d",
    },
  ],
  "demo-user/taskflow-api": [
    {
      sha: "1a2b3c4d5e6f1a2b3c4d5e6f1a2b3c4d5e6f1a2b",
      message: "feat(webhooks): add Slack notification on task completion",
      author_name: "Demo User",
      author_email: "demo@devcontext.io",
      author_date: h(4),
      html_url: "https://github.com/demo-user/taskflow-api/commit/1a2b3c4",
    },
    {
      sha: "2b3c4d5e6f1a2b3c4d5e6f1a2b3c4d5e6f1a2b3c",
      message: "fix(rate-limit): switch from in-memory to Redis-backed limiter",
      author_name: "Demo User",
      author_email: "demo@devcontext.io",
      author_date: h(7),
      html_url: "https://github.com/demo-user/taskflow-api/commit/2b3c4d5",
    },
    {
      sha: "3c4d5e6f1a2b3c4d5e6f1a2b3c4d5e6f1a2b3c4d",
      message: "feat(api): add PATCH /tasks/:id/assign endpoint",
      author_name: "Demo User",
      author_email: "demo@devcontext.io",
      author_date: h(10),
      html_url: "https://github.com/demo-user/taskflow-api/commit/3c4d5e6",
    },
    {
      sha: "4d5e6f1a2b3c4d5e6f1a2b3c4d5e6f1a2b3c4d5e",
      message: "chore(deps): bump express to 5.1, patch jsonwebtoken CVE",
      author_name: "Demo User",
      author_email: "demo@devcontext.io",
      author_date: h(16),
      html_url: "https://github.com/demo-user/taskflow-api/commit/4d5e6f1",
    },
    {
      sha: "5e6f1a2b3c4d5e6f1a2b3c4d5e6f1a2b3c4d5e6f",
      message: "refactor(db): migrate from raw SQL to Drizzle ORM queries",
      author_name: "Demo User",
      author_email: "demo@devcontext.io",
      author_date: h(24),
      html_url: "https://github.com/demo-user/taskflow-api/commit/5e6f1a2",
    },
    {
      sha: "6f1a2b3c4d5e6f1a2b3c4d5e6f1a2b3c4d5e6f1a",
      message: "test: add e2e tests for webhook delivery pipeline",
      author_name: "Demo User",
      author_email: "demo@devcontext.io",
      author_date: h(30),
      html_url: "https://github.com/demo-user/taskflow-api/commit/6f1a2b3",
    },
  ],
  "demo-user/infra-scripts": [
    {
      sha: "7a8b9c0d1e2f7a8b9c0d1e2f7a8b9c0d1e2f7a8b",
      message: "feat(monitoring): add Prometheus alerts for API latency p99",
      author_name: "Demo User",
      author_email: "demo@devcontext.io",
      author_date: h(20),
      html_url: "https://github.com/demo-user/infra-scripts/commit/7a8b9c0",
    },
    {
      sha: "8b9c0d1e2f7a8b9c0d1e2f7a8b9c0d1e2f7a8b9c",
      message: "fix(ci): correct Docker build cache invalidation in GitHub Actions",
      author_name: "Demo User",
      author_email: "demo@devcontext.io",
      author_date: h(36),
      html_url: "https://github.com/demo-user/infra-scripts/commit/8b9c0d1",
    },
    {
      sha: "9c0d1e2f7a8b9c0d1e2f7a8b9c0d1e2f7a8b9c0d",
      message: "chore: update terraform provider versions",
      author_name: "Demo User",
      author_email: "demo@devcontext.io",
      author_date: h(48),
      html_url: "https://github.com/demo-user/infra-scripts/commit/9c0d1e2",
    },
  ],
};

export const MOCK_ENHANCED_MESSAGES: Record<string, string> = {
  "wip0000000000000000000000000000000000000a":
    "feat(kanban): add real-time task card drag indicator with ghost preview and drop-zone highlighting",
  "checkpoint000000000000000000000000000000b":
    "refactor(board): extract BoardColumn into standalone component and move drag state to useKanbanStore hook",
  a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2:
    "feat(kanban): implement drag-and-drop column reordering via useDragReorder hook with optimistic UI update (+212 lines across 4 files)",
  b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3:
    "fix(auth): resolve infinite redirect loop in useAuth hook when JWT token expires mid-session by adding expiry grace-period check",
  c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4:
    "feat(dashboard): add BurndownChart component using Recharts with configurable sprint date range and velocity annotations (+206 lines)",
};

export function getMockEnhancedMessage(sha: string): string {
  return (
    MOCK_ENHANCED_MESSAGES[sha] ??
    "refactor: extract reusable hook, improve error handling, and add inline comments for maintainability"
  );
}

export const MOCK_COMMIT_DETAILS: Record<string, {
  sha: string;
  message: string;
  author_name: string;
  author_date: string;
  html_url: string;
  files: Array<{ filename: string; status: string; additions: number; deletions: number; changes: number; patch: string | null }>;
  stats: { additions: number; deletions: number; total: number };
}> = {
  "wip0000000000000000000000000000000000000a": {
    sha: "wip0000000000000000000000000000000000000a",
    message: "wip",
    author_name: "Demo User",
    author_date: h(0.5),
    html_url: "https://github.com/demo-user/taskflow-web/commit/wip0000",
    files: [
      { filename: "src/components/TaskCard.tsx", status: "modified", additions: 34, deletions: 8, changes: 42, patch: null },
      { filename: "src/hooks/useDragIndicator.ts", status: "added", additions: 28, deletions: 0, changes: 28, patch: null },
    ],
    stats: { additions: 62, deletions: 8, total: 70 },
  },
  "checkpoint000000000000000000000000000000b": {
    sha: "checkpoint000000000000000000000000000000b",
    message: "checkpoint before refactor",
    author_name: "Demo User",
    author_date: h(1),
    html_url: "https://github.com/demo-user/taskflow-web/commit/checkpoint000",
    files: [
      { filename: "src/components/BoardColumn.tsx", status: "modified", additions: 18, deletions: 3, changes: 21, patch: null },
      { filename: "src/store/kanban.ts", status: "added", additions: 45, deletions: 0, changes: 45, patch: null },
    ],
    stats: { additions: 63, deletions: 3, total: 66 },
  },
  a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2: {
    sha: "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2",
    message: "feat(kanban): add drag-and-drop column reordering",
    author_name: "Demo User",
    author_date: h(2),
    html_url: "https://github.com/demo-user/taskflow-web/commit/a1b2c3d",
    files: [
      { filename: "src/components/KanbanBoard.tsx", status: "modified", additions: 87, deletions: 12, changes: 99, patch: null },
      { filename: "src/components/BoardColumn.tsx", status: "modified", additions: 45, deletions: 8, changes: 53, patch: null },
      { filename: "src/hooks/useDragReorder.ts", status: "added", additions: 62, deletions: 0, changes: 62, patch: null },
      { filename: "src/lib/kanban-utils.ts", status: "modified", additions: 18, deletions: 3, changes: 21, patch: null },
    ],
    stats: { additions: 212, deletions: 23, total: 235 },
  },
  b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3: {
    sha: "b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3",
    message: "fix(auth): prevent redirect loop on token expiry",
    author_name: "Demo User",
    author_date: h(5),
    html_url: "https://github.com/demo-user/taskflow-web/commit/b2c3d4e",
    files: [
      { filename: "src/hooks/useAuth.ts", status: "modified", additions: 14, deletions: 6, changes: 20, patch: null },
      { filename: "src/middleware/authGuard.ts", status: "modified", additions: 8, deletions: 3, changes: 11, patch: null },
    ],
    stats: { additions: 22, deletions: 9, total: 31 },
  },
  c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4: {
    sha: "c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4",
    message: "feat(dashboard): add task burndown chart with Recharts",
    author_name: "Demo User",
    author_date: h(8),
    html_url: "https://github.com/demo-user/taskflow-web/commit/c3d4e5f",
    files: [
      { filename: "src/components/BurndownChart.tsx", status: "added", additions: 134, deletions: 0, changes: 134, patch: null },
      { filename: "src/pages/Dashboard.tsx", status: "modified", additions: 22, deletions: 4, changes: 26, patch: null },
      { filename: "src/lib/chart-utils.ts", status: "added", additions: 48, deletions: 0, changes: 48, patch: null },
      { filename: "package.json", status: "modified", additions: 2, deletions: 0, changes: 2, patch: null },
    ],
    stats: { additions: 206, deletions: 4, total: 210 },
  },
  d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5: {
    sha: "d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5",
    message: "refactor: extract useTaskMutation hook from BoardColumn",
    author_name: "Demo User",
    author_date: h(12),
    html_url: "https://github.com/demo-user/taskflow-web/commit/d4e5f6a",
    files: [
      { filename: "src/hooks/useTaskMutation.ts", status: "added", additions: 56, deletions: 0, changes: 56, patch: null },
      { filename: "src/components/BoardColumn.tsx", status: "modified", additions: 8, deletions: 42, changes: 50, patch: null },
      { filename: "src/components/TaskCard.tsx", status: "modified", additions: 12, deletions: 5, changes: 17, patch: null },
    ],
    stats: { additions: 76, deletions: 47, total: 123 },
  },
  e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6: {
    sha: "e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6",
    message: "style: update card hover states and shadow tokens",
    author_name: "Demo User",
    author_date: h(20),
    html_url: "https://github.com/demo-user/taskflow-web/commit/e5f6a1b",
    files: [
      { filename: "src/styles/tokens.css", status: "modified", additions: 12, deletions: 8, changes: 20, patch: null },
      { filename: "src/components/TaskCard.tsx", status: "modified", additions: 6, deletions: 4, changes: 10, patch: null },
    ],
    stats: { additions: 18, deletions: 12, total: 30 },
  },
  f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1: {
    sha: "f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1",
    message: "feat(notifications): add toast system for task updates",
    author_name: "Demo User",
    author_date: h(26),
    html_url: "https://github.com/demo-user/taskflow-web/commit/f6a1b2c",
    files: [
      { filename: "src/components/Toast.tsx", status: "added", additions: 78, deletions: 0, changes: 78, patch: null },
      { filename: "src/providers/ToastProvider.tsx", status: "added", additions: 45, deletions: 0, changes: 45, patch: null },
      { filename: "src/hooks/useToast.ts", status: "added", additions: 22, deletions: 0, changes: 22, patch: null },
    ],
    stats: { additions: 145, deletions: 0, total: 145 },
  },
  a7b8c9d0e1f2a7b8c9d0e1f2a7b8c9d0e1f2a7b8: {
    sha: "a7b8c9d0e1f2a7b8c9d0e1f2a7b8c9d0e1f2a7b8",
    message: "test: add integration tests for Kanban drag handlers",
    author_name: "Demo User",
    author_date: h(30),
    html_url: "https://github.com/demo-user/taskflow-web/commit/a7b8c9d",
    files: [
      { filename: "src/__tests__/KanbanBoard.test.tsx", status: "added", additions: 98, deletions: 0, changes: 98, patch: null },
      { filename: "src/__tests__/useDragReorder.test.ts", status: "added", additions: 64, deletions: 0, changes: 64, patch: null },
    ],
    stats: { additions: 162, deletions: 0, total: 162 },
  },
  "1a2b3c4d5e6f1a2b3c4d5e6f1a2b3c4d5e6f1a2b": {
    sha: "1a2b3c4d5e6f1a2b3c4d5e6f1a2b3c4d5e6f1a2b",
    message: "feat(webhooks): add Slack notification on task completion",
    author_name: "Demo User",
    author_date: h(4),
    html_url: "https://github.com/demo-user/taskflow-api/commit/1a2b3c4",
    files: [
      { filename: "src/services/SlackNotifier.ts", status: "added", additions: 92, deletions: 0, changes: 92, patch: null },
      { filename: "src/routes/webhooks.ts", status: "modified", additions: 38, deletions: 6, changes: 44, patch: null },
      { filename: "src/config/integrations.ts", status: "modified", additions: 14, deletions: 2, changes: 16, patch: null },
      { filename: "src/types/webhook.ts", status: "added", additions: 28, deletions: 0, changes: 28, patch: null },
    ],
    stats: { additions: 172, deletions: 8, total: 180 },
  },
  "2b3c4d5e6f1a2b3c4d5e6f1a2b3c4d5e6f1a2b3c": {
    sha: "2b3c4d5e6f1a2b3c4d5e6f1a2b3c4d5e6f1a2b3c",
    message: "fix(rate-limit): switch from in-memory to Redis-backed limiter",
    author_name: "Demo User",
    author_date: h(7),
    html_url: "https://github.com/demo-user/taskflow-api/commit/2b3c4d5",
    files: [
      { filename: "src/middleware/rateLimiter.ts", status: "modified", additions: 34, deletions: 18, changes: 52, patch: null },
      { filename: "src/lib/redis.ts", status: "added", additions: 26, deletions: 0, changes: 26, patch: null },
      { filename: "package.json", status: "modified", additions: 2, deletions: 0, changes: 2, patch: null },
    ],
    stats: { additions: 62, deletions: 18, total: 80 },
  },
  "3c4d5e6f1a2b3c4d5e6f1a2b3c4d5e6f1a2b3c4d": {
    sha: "3c4d5e6f1a2b3c4d5e6f1a2b3c4d5e6f1a2b3c4d",
    message: "feat(api): add PATCH /tasks/:id/assign endpoint",
    author_name: "Demo User",
    author_date: h(10),
    html_url: "https://github.com/demo-user/taskflow-api/commit/3c4d5e6",
    files: [
      { filename: "src/routes/tasks.ts", status: "modified", additions: 42, deletions: 0, changes: 42, patch: null },
      { filename: "src/db/schema/tasks.ts", status: "modified", additions: 6, deletions: 1, changes: 7, patch: null },
      { filename: "src/validators/task.ts", status: "modified", additions: 12, deletions: 0, changes: 12, patch: null },
    ],
    stats: { additions: 60, deletions: 1, total: 61 },
  },
  "4d5e6f1a2b3c4d5e6f1a2b3c4d5e6f1a2b3c4d5e": {
    sha: "4d5e6f1a2b3c4d5e6f1a2b3c4d5e6f1a2b3c4d5e",
    message: "chore(deps): bump express to 5.1, patch jsonwebtoken CVE",
    author_name: "Demo User",
    author_date: h(16),
    html_url: "https://github.com/demo-user/taskflow-api/commit/4d5e6f1",
    files: [
      { filename: "package.json", status: "modified", additions: 3, deletions: 3, changes: 6, patch: null },
      { filename: "pnpm-lock.yaml", status: "modified", additions: 142, deletions: 98, changes: 240, patch: null },
    ],
    stats: { additions: 145, deletions: 101, total: 246 },
  },
  "5e6f1a2b3c4d5e6f1a2b3c4d5e6f1a2b3c4d5e6f": {
    sha: "5e6f1a2b3c4d5e6f1a2b3c4d5e6f1a2b3c4d5e6f",
    message: "refactor(db): migrate from raw SQL to Drizzle ORM queries",
    author_name: "Demo User",
    author_date: h(24),
    html_url: "https://github.com/demo-user/taskflow-api/commit/5e6f1a2",
    files: [
      { filename: "src/db/queries/tasks.ts", status: "modified", additions: 86, deletions: 124, changes: 210, patch: null },
      { filename: "src/db/queries/users.ts", status: "modified", additions: 42, deletions: 68, changes: 110, patch: null },
      { filename: "src/db/schema/index.ts", status: "modified", additions: 18, deletions: 4, changes: 22, patch: null },
      { filename: "src/db/raw-queries.sql", status: "removed", additions: 0, deletions: 186, changes: 186, patch: null },
    ],
    stats: { additions: 146, deletions: 382, total: 528 },
  },
  "6f1a2b3c4d5e6f1a2b3c4d5e6f1a2b3c4d5e6f1a": {
    sha: "6f1a2b3c4d5e6f1a2b3c4d5e6f1a2b3c4d5e6f1a",
    message: "test: add e2e tests for webhook delivery pipeline",
    author_name: "Demo User",
    author_date: h(30),
    html_url: "https://github.com/demo-user/taskflow-api/commit/6f1a2b3",
    files: [
      { filename: "tests/webhooks.e2e.test.ts", status: "added", additions: 128, deletions: 0, changes: 128, patch: null },
      { filename: "tests/fixtures/webhook-payloads.ts", status: "added", additions: 45, deletions: 0, changes: 45, patch: null },
    ],
    stats: { additions: 173, deletions: 0, total: 173 },
  },
  "7a8b9c0d1e2f7a8b9c0d1e2f7a8b9c0d1e2f7a8b": {
    sha: "7a8b9c0d1e2f7a8b9c0d1e2f7a8b9c0d1e2f7a8b",
    message: "feat(monitoring): add Prometheus alerts for API latency p99",
    author_name: "Demo User",
    author_date: h(20),
    html_url: "https://github.com/demo-user/infra-scripts/commit/7a8b9c0",
    files: [
      { filename: "monitoring/alerts/api-latency.yml", status: "added", additions: 52, deletions: 0, changes: 52, patch: null },
      { filename: "monitoring/dashboards/api-overview.json", status: "modified", additions: 34, deletions: 8, changes: 42, patch: null },
      { filename: "scripts/deploy-alerts.sh", status: "modified", additions: 12, deletions: 2, changes: 14, patch: null },
    ],
    stats: { additions: 98, deletions: 10, total: 108 },
  },
  "8b9c0d1e2f7a8b9c0d1e2f7a8b9c0d1e2f7a8b9c": {
    sha: "8b9c0d1e2f7a8b9c0d1e2f7a8b9c0d1e2f7a8b9c",
    message: "fix(ci): correct Docker build cache invalidation in GitHub Actions",
    author_name: "Demo User",
    author_date: h(36),
    html_url: "https://github.com/demo-user/infra-scripts/commit/8b9c0d1",
    files: [
      { filename: ".github/workflows/build.yml", status: "modified", additions: 18, deletions: 8, changes: 26, patch: null },
      { filename: "docker/Dockerfile.api", status: "modified", additions: 6, deletions: 4, changes: 10, patch: null },
    ],
    stats: { additions: 24, deletions: 12, total: 36 },
  },
  "9c0d1e2f7a8b9c0d1e2f7a8b9c0d1e2f7a8b9c0d": {
    sha: "9c0d1e2f7a8b9c0d1e2f7a8b9c0d1e2f7a8b9c0d",
    message: "chore: update terraform provider versions",
    author_name: "Demo User",
    author_date: h(48),
    html_url: "https://github.com/demo-user/infra-scripts/commit/9c0d1e2",
    files: [
      { filename: "terraform/providers.tf", status: "modified", additions: 4, deletions: 4, changes: 8, patch: null },
      { filename: "terraform/.terraform.lock.hcl", status: "modified", additions: 22, deletions: 22, changes: 44, patch: null },
    ],
    stats: { additions: 26, deletions: 26, total: 52 },
  },
};

export const MOCK_SUMMARIES: Record<string, {
  next_steps: {
    what_you_were_doing: string;
    key_changes: string[];
    suggested_next_steps: string[];
    standup_update: null;
    generated_at: string;
  };
  standup: {
    what_you_were_doing: string;
    key_changes: string[];
    suggested_next_steps: string[];
    standup_update: string;
    generated_at: string;
  };
}> = {
  "demo-user/taskflow-web": {
    next_steps: {
      what_you_were_doing: "You were building the Kanban board feature for TaskFlow — specifically implementing drag-and-drop column reordering in KanbanBoard.tsx (+212 lines) with a new useDragReorder hook. You also fixed a token expiry redirect loop in the auth layer and added a burndown chart component using Recharts (+206 lines).",
      key_changes: [
        "New drag-and-drop column reordering with useDragReorder hook (KanbanBoard.tsx, BoardColumn.tsx — 235 lines changed)",
        "Fixed auth redirect loop that occurred when JWT tokens expired mid-session (useAuth.ts, authGuard.ts — 31 lines)",
        "Added BurndownChart.tsx (+134 lines) with Recharts for sprint progress visualization",
        "Extracted useTaskMutation hook from BoardColumn to reduce component complexity (-42/+56 lines)",
        "New toast notification system for real-time task update feedback (Toast.tsx, ToastProvider.tsx)",
      ],
      suggested_next_steps: [
        "Open src/components/KanbanBoard.tsx and verify the column reorder persists to the API after drag completes",
        "Add optimistic updates to the drag handler — right now reordering waits for the server round-trip",
        "Wire the BurndownChart into the sprint settings so it uses real milestone data instead of mock data",
        "Test the auth redirect fix by manually expiring a JWT cookie and navigating between routes",
        "Add keyboard accessibility (arrow keys) to the Kanban column drag — currently mouse/touch only",
      ],
      standup_update: null,
      generated_at: new Date().toISOString(),
    },
    standup: {
      what_you_were_doing: "You were building the Kanban board feature for TaskFlow — specifically implementing drag-and-drop column reordering in KanbanBoard.tsx (+212 lines) with a new useDragReorder hook. You also fixed a token expiry redirect loop in the auth layer and added a burndown chart component using Recharts (+206 lines).",
      key_changes: [
        "New drag-and-drop column reordering with useDragReorder hook (KanbanBoard.tsx, BoardColumn.tsx — 235 lines changed)",
        "Fixed auth redirect loop on JWT token expiry (useAuth.ts, authGuard.ts)",
        "Added BurndownChart.tsx with Recharts for sprint progress visualization",
        "Extracted useTaskMutation hook from BoardColumn to reduce complexity",
      ],
      suggested_next_steps: [
        "Add optimistic updates to the Kanban drag handler",
        "Wire BurndownChart to real sprint milestone data",
        "Test auth redirect fix with expired JWT cookies",
      ],
      standup_update: "Yesterday: Implemented drag-and-drop column reordering for the Kanban board (KanbanBoard.tsx, +212 lines), fixed an auth redirect loop that triggered on token expiry, and added a task burndown chart with Recharts. Also refactored BoardColumn by extracting useTaskMutation hook.\nToday: Wire the column reorder to persist via the API, add optimistic updates to the drag handler, and connect the burndown chart to real sprint data.\nBlockers: None.",
      generated_at: new Date().toISOString(),
    },
  },
  "demo-user/taskflow-api": {
    next_steps: {
      what_you_were_doing: "You were extending the TaskFlow API with a webhook system and Slack integration. You added a SlackNotifier service (+92 lines) that sends notifications when tasks are completed, switched the rate limiter from in-memory to Redis-backed storage, and added a PATCH /tasks/:id/assign endpoint. You also did a significant Drizzle ORM migration, removing 186 lines of raw SQL.",
      key_changes: [
        "New Slack webhook notifications on task completion (SlackNotifier.ts +92 lines, webhooks.ts route updated)",
        "Rate limiter migrated from in-memory Map to Redis-backed store (rateLimiter.ts — fixes data loss on server restart)",
        "New PATCH /tasks/:id/assign endpoint for task reassignment (tasks.ts +42 lines, new validator)",
        "Major DB refactor: removed raw-queries.sql (-186 lines), migrated all queries to Drizzle ORM (+128 lines net reduction)",
        "Security: bumped express to 5.1 and patched jsonwebtoken CVE vulnerability",
      ],
      suggested_next_steps: [
        "Add retry logic to SlackNotifier — if the Slack API is down, notifications silently fail right now",
        "Add rate limit headers (X-RateLimit-Remaining, X-RateLimit-Reset) to API responses",
        "Write a migration script to backfill the new assignee_id column for existing tasks",
        "Verify the jsonwebtoken CVE patch doesn't break existing token verification logic",
        "Add webhook signature verification so only your frontend can trigger Slack notifications",
      ],
      standup_update: null,
      generated_at: new Date().toISOString(),
    },
    standup: {
      what_you_were_doing: "You were extending the TaskFlow API with a webhook system and Slack integration. You added a SlackNotifier service (+92 lines) that sends notifications when tasks are completed, switched the rate limiter from in-memory to Redis-backed storage, and added a PATCH /tasks/:id/assign endpoint.",
      key_changes: [
        "New Slack webhook notifications on task completion (SlackNotifier.ts +92 lines)",
        "Rate limiter switched from in-memory to Redis-backed (fixes restart data loss)",
        "New PATCH /tasks/:id/assign endpoint",
        "DB queries migrated from raw SQL to Drizzle ORM (-186 lines SQL removed)",
      ],
      suggested_next_steps: [
        "Add retry logic to Slack webhook delivery",
        "Write backfill migration for assignee_id column",
        "Add webhook signature verification",
      ],
      standup_update: "Yesterday: Built Slack notification webhook for task completion events (+92 lines), migrated rate limiter from in-memory to Redis-backed storage, added PATCH /tasks/:id/assign endpoint, and completed the Drizzle ORM migration (removed 186 lines of raw SQL).\nToday: Add retry logic for Slack webhooks, implement rate limit response headers, and write a backfill migration for the new assignee_id column.\nBlockers: None.",
      generated_at: new Date().toISOString(),
    },
  },
  "demo-user/infra-scripts": {
    next_steps: {
      what_you_were_doing: "You were setting up production monitoring and fixing CI/CD issues. You added Prometheus alerting rules for API latency p99 thresholds (+52 lines) and updated the Grafana dashboard. You also fixed Docker build cache invalidation in GitHub Actions that was causing unnecessary full rebuilds.",
      key_changes: [
        "New Prometheus alert rules for API latency p99 (api-latency.yml — triggers when p99 > 500ms for 5 minutes)",
        "Updated Grafana API overview dashboard with new latency panels (+34 lines)",
        "Fixed Docker build cache in GitHub Actions — layers were being invalidated unnecessarily (build.yml)",
        "Updated Terraform provider versions to latest stable releases",
      ],
      suggested_next_steps: [
        "Add a PagerDuty integration to the Prometheus alerting pipeline for on-call notifications",
        "Create a separate dashboard for webhook delivery latency and failure rates",
        "Test the Docker cache fix by pushing a non-Dockerfile change and verifying cache hits",
        "Run terraform plan to verify the provider upgrades don't change any existing infrastructure",
        "Add memory and CPU usage alerts alongside the latency alerts",
      ],
      standup_update: null,
      generated_at: new Date().toISOString(),
    },
    standup: {
      what_you_were_doing: "You were setting up production monitoring and fixing CI/CD issues. You added Prometheus alerting rules for API latency p99 thresholds and fixed Docker build cache invalidation in GitHub Actions.",
      key_changes: [
        "New Prometheus p99 latency alerts (api-latency.yml +52 lines)",
        "Fixed Docker build cache in GitHub Actions CI",
        "Updated Terraform provider versions",
      ],
      suggested_next_steps: [
        "Add PagerDuty integration for alert routing",
        "Test Docker cache fix with a non-Dockerfile change",
        "Run terraform plan to verify provider upgrades",
      ],
      standup_update: "Yesterday: Added Prometheus alerting rules for API latency p99 thresholds, updated the Grafana API overview dashboard, and fixed Docker build cache invalidation in GitHub Actions CI.\nToday: Add PagerDuty integration to the alerting pipeline, create a webhook delivery dashboard, and run terraform plan to verify provider upgrades.\nBlockers: None.",
      generated_at: new Date().toISOString(),
    },
  },
};

export function isMockToken(token: string): boolean {
  return token === "mock-token";
}

export function getMockCommitCount(fullName: string): number {
  return (MOCK_COMMITS[fullName] ?? []).length;
}
