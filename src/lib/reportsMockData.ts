import {
  eachMonthOfInterval,
  eachWeekOfInterval,
  eachDayOfInterval,
  format,
  getDay,
  differenceInDays,
  subDays,
} from "date-fns";

// ─── Seeded random helpers ───────────────────────────────────────────────────
function seededRandom(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}
function randInt(seed: number, min: number, max: number): number {
  return Math.floor(seededRandom(seed) * (max - min + 1)) + min;
}
function randFloat(seed: number, min: number, max: number, dp = 1): number {
  return parseFloat((seededRandom(seed) * (max - min) + min).toFixed(dp));
}

// ─── Bar Chart: pickups by month ─────────────────────────────────────────────
export interface PickupBarData {
  month: string;
  completed: number;
  missed: number;
  pending: number;
}
export function generatePickupsByMonth(from: Date, to: Date): PickupBarData[] {
  const months = eachMonthOfInterval({ start: from, end: to });
  return months.map((month) => {
    const seed = month.getFullYear() * 100 + month.getMonth();
    return {
      month: format(month, "MMM yy"),
      completed: randInt(seed + 1, 900, 1600),
      missed: randInt(seed + 2, 80, 350),
      pending: randInt(seed + 3, 40, 180),
    };
  });
}

// ─── Line Chart: weekly waste & new users ────────────────────────────────────
export interface TrendPoint {
  week: string;
  wasteKg: number;
  newUsers: number;
}
export function generateWeeklyTrend(from: Date, to: Date): TrendPoint[] {
  const weeks = eachWeekOfInterval({ start: from, end: to }, { weekStartsOn: 1 });
  return weeks.map((week) => {
    const seed = week.getFullYear() * 1000 + Math.floor(week.getTime() / 1_000_000);
    return {
      week: format(week, "MMM d"),
      wasteKg: randInt(seed + 20, 28000, 85000),
      newUsers: randInt(seed + 10, 120, 480),
    };
  });
}

// ─── Heatmap: daily pickup count ─────────────────────────────────────────────
export interface HeatmapDay {
  date: Date;
  dateStr: string;
  value: number;
  dayOfWeek: number;
  weekIndex: number;
}
export function generateDailyActivity(from: Date, to: Date): HeatmapDay[] {
  const days = eachDayOfInterval({ start: from, end: to });
  const dayOfWeek0 = getDay(days[0]);
  return days.map((day, i) => {
    const seed = day.getFullYear() * 10000 + day.getMonth() * 100 + day.getDate();
    const dow = getDay(day);
    const base = dow === 0 || dow === 6 ? [10, 35] : [40, 95];
    return {
      date: day,
      dateStr: format(day, "yyyy-MM-dd"),
      value: randInt(seed, base[0], base[1]),
      dayOfWeek: dow,
      weekIndex: Math.floor((i + dayOfWeek0) / 7),
    };
  });
}

// ─── Summary KPIs ─────────────────────────────────────────────────────────────
export interface ReportSummary {
  totalPickups: number;
  totalWasteKg: number;
  activeUsers: number;
  completionRate: number;
  pickupsDelta: number;
  wasteDelta: number;
  usersDelta: number;
  completionDelta: number;
}
export function generateSummary(from: Date, to: Date): ReportSummary {
  const days = differenceInDays(to, from) + 1;
  const seed = from.getTime() + to.getTime();
  const completed = randInt(seed + 1, 800, 1400) * Math.ceil(days / 30);
  const missed = randInt(seed + 2, 100, 350) * Math.ceil(days / 30);
  const totalPickups = completed + missed;
  return {
    totalPickups,
    totalWasteKg: randInt(seed + 3, 50000, 150000) * Math.ceil(days / 30),
    activeUsers: randInt(seed + 4, 18000, 26000),
    completionRate: Math.round((completed / totalPickups) * 1000) / 10,
    pickupsDelta: randInt(seed + 5, -8, 24),
    wasteDelta: randInt(seed + 6, 2, 18),
    usersDelta: randInt(seed + 7, 4, 22),
    completionDelta: randInt(seed + 8, -3, 8),
  };
}

// ════════════════════════════════════════════════════════════════════════════
// LOCATIONS TAB
// ════════════════════════════════════════════════════════════════════════════

const LOCATIONS = ["Lagos", "Abuja", "Port Harcourt", "Ibadan", "Kano", "Enugu"];

export interface LocationWasteData {
  location: string;
  wasteKg: number;
  pickups: number;
}
export function generateWasteByLocation(from: Date, to: Date): LocationWasteData[] {
  const seed = from.getTime() + to.getTime();
  return LOCATIONS.map((loc, i) => ({
    location: loc,
    wasteKg: randInt(seed + i * 7, 40000, 220000),
    pickups: randInt(seed + i * 13, 800, 5000),
  })).sort((a, b) => b.wasteKg - a.wasteKg);
}

export interface LocationPickupsData {
  location: string;
  completed: number;
  missed: number;
}
export function generatePickupsByLocation(from: Date, to: Date): LocationPickupsData[] {
  const seed = from.getTime() + to.getTime();
  return LOCATIONS.map((loc, i) => ({
    location: loc,
    completed: randInt(seed + i * 11, 600, 4000),
    missed: randInt(seed + i * 17, 80, 600),
  }));
}

// ════════════════════════════════════════════════════════════════════════════
// USERS TAB
// ════════════════════════════════════════════════════════════════════════════

const NIGERIAN_NAMES = [
  "Chioma Osei", "Emeka Adeyemi", "Fatima Bello", "Babatunde Okafor",
  "Ngozi Eze", "Aisha Mohammed", "Chidi Nwosu", "Oluwaseun Adebayo",
  "Amara Obi", "Kola Adeleke", "Taiwo Ogundimu", "Uche Nwobi",
  "Halima Musa", "Tobi Adewale", "Nkechi Onyema",
];

export interface UserActivityRow {
  userId: string;
  userName: string;
  weeks: number[];
  total: number;
}
export function generateUserActivityHeatmap(from: Date, to: Date): UserActivityRow[] {
  const weeks = eachWeekOfInterval({ start: from, end: to }, { weekStartsOn: 1 });
  const seed = from.getTime();
  return NIGERIAN_NAMES.map((name, ui) => {
    const weekVals = weeks.map((w, wi) => {
      const s = seed + ui * 31 + wi * 97;
      return seededRandom(s) > 0.25 ? randInt(s, 0, 18) : 0;
    });
    return {
      userId: `U${1000 + ui}`,
      userName: name,
      weeks: weekVals,
      total: weekVals.reduce((a, b) => a + b, 0),
    };
  }).sort((a, b) => b.total - a.total);
}

export interface UserGrowthPoint {
  date: string;
  newUsers: number;
  total: number;
}
export function generateUserGrowth(from: Date, to: Date): UserGrowthPoint[] {
  const weeks = eachWeekOfInterval({ start: from, end: to }, { weekStartsOn: 1 });
  let cumulative = 20000;
  const seed = from.getTime();
  return weeks.map((w, i) => {
    const newUsers = randInt(seed + i * 43, 100, 500);
    cumulative += newUsers;
    return { date: format(w, "MMM d"), newUsers, total: cumulative };
  });
}

export interface UsersSummary {
  newUsers: number;
  activeUsers: number;
  retentionRate: number;
  avgPickupsPerUser: number;
  newUsersDelta: number;
  activeUsersDelta: number;
  retentionDelta: number;
  avgPickupsDelta: number;
}
export function generateUsersSummary(from: Date, to: Date): UsersSummary {
  const days = differenceInDays(to, from) + 1;
  const seed = from.getTime() + to.getTime();
  return {
    newUsers: randInt(seed + 1, 800, 2500) * Math.ceil(days / 30),
    activeUsers: randInt(seed + 2, 18000, 26000),
    retentionRate: randFloat(seed + 3, 62, 88, 1),
    avgPickupsPerUser: randFloat(seed + 4, 1.8, 5.4, 1),
    newUsersDelta: randInt(seed + 5, 2, 28),
    activeUsersDelta: randInt(seed + 6, -4, 18),
    retentionDelta: randInt(seed + 7, -3, 7),
    avgPickupsDelta: randInt(seed + 8, -5, 12),
  };
}

// ════════════════════════════════════════════════════════════════════════════
// REVENUE TAB
// ════════════════════════════════════════════════════════════════════════════

export interface RevenueSummary {
  totalRevenue: number;
  revenuePerPickup: number;
  revenuePerKg: number;
  revenueGrowth: number;
  totalRevenueDelta: number;
  perPickupDelta: number;
  perKgDelta: number;
  growthDelta: number;
}
export function generateRevenueSummary(from: Date, to: Date): RevenueSummary {
  const days = differenceInDays(to, from) + 1;
  const seed = from.getTime() + to.getTime();
  const perPickup = randInt(seed + 1, 800, 2200);
  const pickups = randInt(seed + 2, 800, 1400) * Math.ceil(days / 30);
  return {
    totalRevenue: perPickup * pickups,
    revenuePerPickup: perPickup,
    revenuePerKg: randFloat(seed + 3, 12, 38, 2),
    revenueGrowth: randFloat(seed + 4, 4, 32, 1),
    totalRevenueDelta: randInt(seed + 5, -5, 30),
    perPickupDelta: randInt(seed + 6, -3, 12),
    perKgDelta: randInt(seed + 7, -2, 10),
    growthDelta: randInt(seed + 8, -4, 8),
  };
}

export interface RevenuePoint {
  week: string;
  revenue: number;
}
export function generateRevenueWeeklyTrend(from: Date, to: Date): RevenuePoint[] {
  const weeks = eachWeekOfInterval({ start: from, end: to }, { weekStartsOn: 1 });
  const seed = from.getTime();
  return weeks.map((w, i) => ({
    week: format(w, "MMM d"),
    revenue: randInt(seed + i * 53, 3_000_000, 12_000_000),
  }));
}

export interface MoMRevenuePoint {
  month: string;
  current: number;
  previous: number;
}
export function generateMoMRevenue(from: Date, to: Date): MoMRevenuePoint[] {
  const months = eachMonthOfInterval({ start: from, end: to });
  return months.map((month) => {
    const seed = month.getFullYear() * 100 + month.getMonth();
    const current = randInt(seed + 1, 10_000_000, 40_000_000);
    return {
      month: format(month, "MMM yy"),
      current,
      previous: randInt(seed + 9, 8_000_000, 38_000_000),
    };
  });
}

// ════════════════════════════════════════════════════════════════════════════
// TRENDS TAB
// ════════════════════════════════════════════════════════════════════════════

export interface FrequencyPoint {
  date: string;
  count: number;
}
export function generatePickupFrequency(from: Date, to: Date): FrequencyPoint[] {
  const days = eachDayOfInterval({ start: from, end: to });
  return days.map((day) => {
    const seed = day.getFullYear() * 10000 + day.getMonth() * 100 + day.getDate();
    const dow = getDay(day);
    const base = dow === 0 || dow === 6 ? [20, 60] : [80, 220];
    return { date: format(day, "MMM d"), count: randInt(seed + 3, base[0], base[1]) };
  });
}

export interface MoMRow {
  metric: string;
  current: number;
  previous: number;
  change: number;
  format: "number" | "kg" | "naira" | "percent";
}
export function generateMoMComparison(from: Date, to: Date): MoMRow[] {
  const days = differenceInDays(to, from) + 1;
  const seed = from.getTime() + to.getTime();
  const priorSeed = seed - days * 86400000;

  const cur = {
    pickups: randInt(seed + 1, 10000, 18000),
    waste: randInt(seed + 2, 400000, 900000),
    users: randInt(seed + 3, 18000, 26000),
    revenue: randInt(seed + 4, 15_000_000, 45_000_000),
    completion: randFloat(seed + 5, 85, 97, 1),
    newUsers: randInt(seed + 6, 800, 2500),
  };
  const prev = {
    pickups: randInt(priorSeed + 1, 9000, 17000),
    waste: randInt(priorSeed + 2, 350000, 850000),
    users: randInt(priorSeed + 3, 16000, 24000),
    revenue: randInt(priorSeed + 4, 12_000_000, 40_000_000),
    completion: randFloat(priorSeed + 5, 82, 95, 1),
    newUsers: randInt(priorSeed + 6, 700, 2200),
  };

  const pct = (c: number, p: number) =>
    p === 0 ? 100 : Math.round(((c - p) / p) * 100);

  return [
    { metric: "Total Pickups",    current: cur.pickups,    previous: prev.pickups,    change: pct(cur.pickups,    prev.pickups),    format: "number"  },
    { metric: "Waste Collected",  current: cur.waste,      previous: prev.waste,      change: pct(cur.waste,      prev.waste),      format: "kg"      },
    { metric: "Active Users",     current: cur.users,      previous: prev.users,      change: pct(cur.users,      prev.users),      format: "number"  },
    { metric: "Revenue",          current: cur.revenue,    previous: prev.revenue,    change: pct(cur.revenue,    prev.revenue),    format: "naira"   },
    { metric: "Completion Rate",  current: cur.completion, previous: prev.completion, change: pct(cur.completion, prev.completion), format: "percent" },
    { metric: "New Users",        current: cur.newUsers,   previous: prev.newUsers,   change: pct(cur.newUsers,   prev.newUsers),   format: "number"  },
  ];
}
