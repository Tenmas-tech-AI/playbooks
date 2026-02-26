import "dotenv/config";
// TimescaleDB Cloud uses a self-signed cert chain — disable strict verification
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
import { Pool } from "pg";
import { Octokit } from "@octokit/rest";

const db = new Pool({ connectionString: process.env.TIMESCALE_URL });
const gh = new Octokit({ auth: process.env.GITHUB_TOKEN });

const ORG = process.env.GITHUB_ORG!;
const REPOS = (process.env.GITHUB_REPOS ?? "playbooks").split(",");

async function syncPRs(repo: string, since: Date) {
  console.log(`Syncing PRs for ${ORG}/${repo} since ${since.toISOString()}`);

  const { data: prs } = await gh.pulls.list({
    owner: ORG,
    repo,
    state: "closed",
    sort: "updated",
    direction: "desc",
    per_page: 100,
  });

  const merged = prs.filter(
    (pr) => pr.merged_at && new Date(pr.merged_at) >= since
  );

  console.log(`  Found ${merged.length} merged PRs`);

  for (const pr of merged) {
    const openedAt = new Date(pr.created_at);
    const mergedAt = new Date(pr.merged_at!);
    const cycleTimeHours =
      (mergedAt.getTime() - openedAt.getTime()) / (1000 * 60 * 60);

    const labels = pr.labels.map((l) => l.name?.toLowerCase() ?? "");
    const aiAssisted =
      labels.includes("ai-assisted") ||
      pr.body?.toLowerCase().includes("co-authored by claude") ||
      pr.body?.toLowerCase().includes("copilot") ||
      false;

    await db.query(
      `INSERT INTO pr_metrics
        (time, repo, pr_number, author, opened_at, merged_at,
         cycle_time_hours, additions, deletions, ai_assisted)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT DO NOTHING`,
      [
        mergedAt,
        repo,
        pr.number,
        pr.user?.login,
        openedAt,
        mergedAt,
        cycleTimeHours,
        pr.additions ?? 0,
        pr.deletions ?? 0,
        aiAssisted,
      ]
    );
  }
}

async function updateWeeklyMetrics() {
  await db.query(`
    INSERT INTO weekly_metrics (week, repo, prs_merged, avg_cycle_time_hours, bug_prs, ai_prs)
    SELECT
      date_trunc('week', merged_at)::DATE AS week,
      repo,
      COUNT(*) AS prs_merged,
      AVG(cycle_time_hours) AS avg_cycle_time_hours,
      0 AS bug_prs,
      COUNT(*) FILTER (WHERE ai_assisted = TRUE) AS ai_prs
    FROM pr_metrics
    WHERE merged_at >= NOW() - INTERVAL '28 days'
    GROUP BY 1, 2
    ON CONFLICT (week, repo) DO UPDATE
      SET prs_merged = EXCLUDED.prs_merged,
          avg_cycle_time_hours = EXCLUDED.avg_cycle_time_hours,
          ai_prs = EXCLUDED.ai_prs
  `);
  console.log("Weekly metrics updated.");
}

async function main() {
  const since = new Date();
  since.setDate(since.getDate() - 28);

  for (const repo of REPOS) {
    await syncPRs(repo.trim(), since);
  }

  await updateWeeklyMetrics();
  console.log("Sync completed.");
  await db.end();
}

main().catch((err) => {
  console.error("Sync failed:", err.message);
  process.exit(1);
});
