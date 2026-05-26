import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const adminCode = "LINKUP-NGO-2026";

const emptyStats = {
  categoryCounts: [],
  languageCounts: [],
  regionCounts: [],
  trendSeries: [],
  total: 0,
};

export const create = mutation({
  args: {
    issueId: v.string(),
    issueLabel: v.string(),
    language: v.string(),
    region: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("submissions", {
      ...args,
      submittedAt: Date.now(),
    });
  },
});

export const stats = query({
  args: {},
  handler: async (ctx) => {
    const submissions = await ctx.db.query("submissions").order("desc").take(1000);

    if (submissions.length === 0) {
      return emptyStats;
    }

    return {
      categoryCounts: countBy(submissions, (submission) => submission.issueLabel),
      languageCounts: countBy(submissions, (submission) => submission.language),
      regionCounts: countBy(submissions, (submission) => submission.region),
      trendSeries: buildTrendSeries(submissions),
      total: submissions.length,
    };
  },
});

export const reset = mutation({
  args: {
    adminCode: v.string(),
  },
  handler: async (ctx, args) => {
    if (args.adminCode !== adminCode) {
      throw new Error("Unauthorized reset attempt.");
    }

    const submissions = await ctx.db.query("submissions").take(500);
    await Promise.all(submissions.map((submission) => ctx.db.delete(submission._id)));
    return { deleted: submissions.length };
  },
});

function countBy<T>(items: T[], getKey: (item: T) => string) {
  const counts = new Map<string, number>();

  items.forEach((item) => {
    const key = getKey(item) || "Unspecified";
    counts.set(key, (counts.get(key) ?? 0) + 1);
  });

  return [...counts.entries()]
    .map(([label, count]) => ({ count, label }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

function buildTrendSeries(
  submissions: Array<{ issueLabel: string; submittedAt: number }>,
) {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const bucketDays = [90, 75, 60, 45, 30, 15, 0];
  const topCategories = countBy(submissions, (submission) => submission.issueLabel)
    .slice(0, 3)
    .map((item) => item.label);

  return topCategories.map((label) => ({
    label,
    points: bucketDays.map((daysAgo, index) => {
      const bucketStart = now - (daysAgo + 15) * dayMs;
      const bucketEnd = index === bucketDays.length - 1 ? now + dayMs : now - daysAgo * dayMs;

      return submissions.filter(
        (submission) =>
          submission.issueLabel === label &&
          submission.submittedAt >= bucketStart &&
          submission.submittedAt < bucketEnd,
      ).length;
    }),
  }));
}
