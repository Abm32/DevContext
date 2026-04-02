import { differenceInCalendarDays, differenceInMonths, differenceInWeeks, formatDistanceStrict, getHours, getDay, parseISO } from "date-fns"

export interface CommitStats {
  totalCommits: number
  activeDays: number
  dateSpan: string
  streak: number
  flags: WellnessFlag[]
}

export type WellnessFlagType =
  | "late_nights"
  | "no_rest_days"
  | "long_gap"
  | "intense_sprint"
  | "weekend_warrior"
  | "looking_good"

export interface WellnessFlag {
  type: WellnessFlagType
  message: string
  tip: string
  emoji: string
}

const WELLNESS_MESSAGES: Record<WellnessFlagType, (n?: number) => WellnessFlag> = {
  late_nights: (n = 0) => ({
    type: "late_nights",
    emoji: "🌙",
    message: `${n} late-night commit${n !== 1 ? "s" : ""} detected (after 11pm or before 5am)`,
    tip: "Consider setting a hard stop time — your best problem-solving happens when you're rested.",
  }),
  no_rest_days: (n = 0) => ({
    type: "no_rest_days",
    emoji: "🔥",
    message: `${n}-day streak with no days off`,
    tip: "Rest days aren't wasted days — stepping back often unlocks the solution you were chasing.",
  }),
  long_gap: (n = 0) => ({
    type: "long_gap",
    emoji: "⏸️",
    message: `Last commit was ${n} day${n !== 1 ? "s" : ""} ago`,
    tip: "Use this summary to rebuild your mental model before diving back in.",
  }),
  intense_sprint: (n = 0) => ({
    type: "intense_sprint",
    emoji: "⚡",
    message: `${n} commits in a single day — intense sprint detected`,
    tip: "After a burst like that, a short review session beats jumping straight back into new code.",
  }),
  weekend_warrior: (n = 0) => ({
    type: "weekend_warrior",
    emoji: "📅",
    message: `${n}% of your commits are on weekends`,
    tip: "Your weekends are carrying a lot of the work. Try carving out focused weekday blocks too.",
  }),
  looking_good: () => ({
    type: "looking_good",
    emoji: "✅",
    message: "Your commit patterns look healthy",
    tip: "Good pace, reasonable hours, and some rest days. Keep it up.",
  }),
}

function toDateStr(iso: string): string {
  return iso.substring(0, 10)
}

export function computeCommitStats(commits: Array<{ author_date: string }>): CommitStats {
  if (!commits || commits.length === 0) {
    return { totalCommits: 0, activeDays: 0, dateSpan: "", streak: 0, flags: [] }
  }

  const totalCommits = commits.length

  const dates = commits.map((c) => parseISO(c.author_date))
  const dateStrings = commits.map((c) => toDateStr(c.author_date))
  const uniqueDateStrings = [...new Set(dateStrings)].sort()
  const activeDays = uniqueDateStrings.length

  const earliest = dates.reduce((a, b) => (a < b ? a : b))
  const latest = dates.reduce((a, b) => (a > b ? a : b))
  const daySpan = differenceInCalendarDays(latest, earliest)

  let dateSpan: string
  if (daySpan === 0) {
    dateSpan = "today"
  } else if (daySpan < 7) {
    dateSpan = `${daySpan} day${daySpan !== 1 ? "s" : ""}`
  } else if (daySpan < 60) {
    const w = differenceInWeeks(latest, earliest)
    dateSpan = `${w} week${w !== 1 ? "s" : ""}`
  } else {
    const m = differenceInMonths(latest, earliest)
    dateSpan = m > 0 ? `${m} month${m !== 1 ? "s" : ""}` : formatDistanceStrict(earliest, latest)
  }

  // ── Streak: consecutive days ending at the most recent commit ────────────
  // Computed regardless of how old the latest commit is.
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const daysSinceLatest = differenceInCalendarDays(today, latest)
  const sortedUniqueDates = [...uniqueDateStrings].sort().reverse()

  let streak = 0
  let expected = new Date(latest)
  expected.setHours(0, 0, 0, 0)
  for (const ds of sortedUniqueDates) {
    const d = parseISO(ds)
    d.setHours(0, 0, 0, 0)
    if (differenceInCalendarDays(expected, d) === 0) {
      streak++
      expected = new Date(d)
      expected.setDate(d.getDate() - 1)
    } else {
      break
    }
  }

  // ── Wellness flags ────────────────────────────────────────────────────────
  const flags: WellnessFlag[] = []

  // Late nights
  const lateCommits = dates.filter((d) => {
    const h = getHours(d)
    return h >= 23 || h < 5
  })
  if (lateCommits.length >= 2) {
    flags.push(WELLNESS_MESSAGES.late_nights(lateCommits.length))
  }

  // No rest days (streak >= 7)
  if (streak >= 7) {
    flags.push(WELLNESS_MESSAGES.no_rest_days(streak))
  }

  // Long gap (most recent commit > 5 days ago)
  if (daysSinceLatest >= 5) {
    flags.push(WELLNESS_MESSAGES.long_gap(daysSinceLatest))
  }

  // Intense sprint (single day with >= 5 commits)
  const commitsByDay: Record<string, number> = {}
  for (const ds of dateStrings) {
    commitsByDay[ds] = (commitsByDay[ds] ?? 0) + 1
  }
  const maxInADay = Math.max(...Object.values(commitsByDay))
  if (maxInADay >= 5) {
    flags.push(WELLNESS_MESSAGES.intense_sprint(maxInADay))
  }

  // Weekend warrior (>= 50% on Sat/Sun)
  const weekendCommits = dates.filter((d) => {
    const day = getDay(d)
    return day === 0 || day === 6
  })
  const weekendPct = Math.round((weekendCommits.length / totalCommits) * 100)
  if (weekendPct >= 50 && totalCommits >= 4) {
    flags.push(WELLNESS_MESSAGES.weekend_warrior(weekendPct))
  }

  if (flags.length === 0) {
    flags.push({
      type: "looking_good",
      emoji: "✅",
      message: `Analyzed ${totalCommits} commit${totalCommits !== 1 ? "s" : ""} across ${activeDays} active day${activeDays !== 1 ? "s" : ""}`,
      tip: "Patterns look balanced — good pace, reasonable hours, no red flags.",
    })
  }

  return { totalCommits, activeDays, dateSpan, streak, flags: flags.slice(0, 2) }
}
