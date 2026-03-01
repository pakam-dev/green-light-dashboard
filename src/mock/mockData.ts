// ─────────────────────────────────────────────────────────────────────────────
// Mock data — used as fallbacks in each page when the API has not yet returned
// data. Pattern: `const data = apiArray?.length ? apiArray : MOCK_XYZ;`
// API integration in src/store/api/ is untouched.
// ─────────────────────────────────────────────────────────────────────────────

// ══════════════════════════════════════════════════════════════════════════════
// LOAN
// ══════════════════════════════════════════════════════════════════════════════

export const MOCK_LOAN_SUMMARY = {
  totalLoans:     1_437,
  activeLoans:      523,
  pendingLoans:     148,
  repaidLoans:      712,
  defaultedLoans:    54,
  totalDisbursed: 61_900_000,
  totalRepaid:    48_250_000,
  repaymentRate:      87.4,
};

export const MOCK_LOAN_MONTHLY = [
  { month: "Mar 25", disbursed: 3_800_000, collected: 2_950_000, loans: 62  },
  { month: "Apr 25", disbursed: 4_100_000, collected: 3_200_000, loans: 67  },
  { month: "May 25", disbursed: 4_500_000, collected: 3_500_000, loans: 72  },
  { month: "Jun 25", disbursed: 4_200_000, collected: 3_300_000, loans: 68  },
  { month: "Jul 25", disbursed: 4_800_000, collected: 3_800_000, loans: 78  },
  { month: "Aug 25", disbursed: 5_100_000, collected: 4_000_000, loans: 83  },
  { month: "Sep 25", disbursed: 5_400_000, collected: 4_200_000, loans: 87  },
  { month: "Oct 25", disbursed: 5_700_000, collected: 4_500_000, loans: 91  },
  { month: "Nov 25", disbursed: 5_900_000, collected: 4_700_000, loans: 93  },
  { month: "Dec 25", disbursed: 6_100_000, collected: 4_900_000, loans: 96  },
  { month: "Jan 26", disbursed: 6_400_000, collected: 5_100_000, loans: 100 },
  { month: "Feb 26", disbursed: 6_200_000, collected: 5_000_000, loans: 95  },
];

export const MOCK_LOAN_LOCATION = [
  { state: "Lagos",       count: 312, amount:  8_736_000 },
  { state: "Abuja (FCT)", count: 248, amount:  6_944_000 },
  { state: "Rivers",      count: 186, amount:  5_208_000 },
  { state: "Kano",        count: 143, amount:  4_004_000 },
  { state: "Ogun",        count: 121, amount:  3_388_000 },
  { state: "Anambra",     count:  98, amount:  2_744_000 },
  { state: "Delta",       count:  87, amount:  2_436_000 },
  { state: "Oyo",         count:  76, amount:  2_128_000 },
  { state: "Edo",         count:  64, amount:  1_792_000 },
  { state: "Imo",         count:  52, amount:  1_456_000 },
];

export const MOCK_LOAN_PROVIDERS = [
  { id: "pv1", name: "First Bank Nigeria", description: "Leading tier-1 commercial bank",  contactEmail: "loans@firstbank.ng",  contactPhone: "07000000001", isActive: true,  createdAt: "2025-01-10T08:00:00Z" },
  { id: "pv2", name: "Access Bank",        description: "Pan-African banking group",        contactEmail: "loans@accessbank.ng", contactPhone: "07000000002", isActive: true,  createdAt: "2025-01-20T08:00:00Z" },
  { id: "pv3", name: "UBA Nigeria",        description: "United Bank for Africa",           contactEmail: "loans@ubagroup.com",  contactPhone: "07000000003", isActive: true,  createdAt: "2025-02-05T08:00:00Z" },
  { id: "pv4", name: "Zenith Bank",        description: "Top-tier financial institution",   contactEmail: "loans@zenithbank.ng", contactPhone: "07000000004", isActive: false, createdAt: "2025-02-15T08:00:00Z" },
];

export const MOCK_LOAN_PRODUCTS = [
  { id: "lp1", name: "Business Growth Loan", provider: "First Bank Nigeria", interestRate: 12.5, minAmount: 100_000, maxAmount:  5_000_000, tenure: "12 months", description: "For SME business expansion",  isActive: true,  createdAt: "2025-01-15T10:00:00Z" },
  { id: "lp2", name: "Personal Advance",     provider: "Access Bank",        interestRate: 18.0, minAmount:  50_000, maxAmount:  1_000_000, tenure: "6 months",  description: "Short-term personal credit",  isActive: true,  createdAt: "2025-02-20T10:00:00Z" },
  { id: "lp3", name: "Agricultural Loan",   provider: "UBA Nigeria",         interestRate:  9.0, minAmount: 200_000, maxAmount: 10_000_000, tenure: "24 months", description: "Farm inputs and equipment",   isActive: false, createdAt: "2025-03-10T10:00:00Z" },
  { id: "lp4", name: "Micro Finance Plus",  provider: "Zenith Bank",         interestRate: 24.0, minAmount:  10_000, maxAmount:    200_000, tenure: "3 months",  description: "Quick micro-credit facility", isActive: true,  createdAt: "2025-04-05T10:00:00Z" },
];

export const MOCK_LOANS = [
  { id: "ln01", borrower: { id: "u01", name: "Adaeze Okonkwo",   email: "adaeze@example.com",   phone: "08012345601" }, amount: 500_000,   amountRepaid: 350_000,  balance: 150_000,  status: "active",    purpose: "Business expansion",  disbursedAt: "2025-06-01T09:00:00Z",  dueDate: "2026-06-01T09:00:00Z",  createdAt: "2025-05-28T09:00:00Z", provider: "First Bank Nigeria", loanProduct: "Business Growth Loan" },
  { id: "ln02", borrower: { id: "u02", name: "Emeka Nwosu",      email: "emeka@example.com",    phone: "08012345602" }, amount: 250_000,   amountRepaid: 250_000,  balance: 0,         status: "repaid",    purpose: "School fees",         disbursedAt: "2025-01-15T09:00:00Z",  dueDate: "2025-07-15T09:00:00Z",  createdAt: "2025-01-10T09:00:00Z", provider: "Access Bank",        loanProduct: "Personal Advance"     },
  { id: "ln03", borrower: { id: "u03", name: "Fatima Al-Hassan", email: "fatima@example.com",   phone: "08012345603" }, amount: 1_000_000, amountRepaid: 0,         balance: 1_000_000, status: "pending",   purpose: "Farm equipment",      disbursedAt: undefined,               dueDate: undefined,               createdAt: "2026-02-20T09:00:00Z", provider: "UBA Nigeria",        loanProduct: "Agricultural Loan"    },
  { id: "ln04", borrower: { id: "u04", name: "Chukwudi Eze",     email: "chukwudi@example.com", phone: "08012345604" }, amount: 150_000,   amountRepaid: 50_000,   balance: 100_000,  status: "defaulted", purpose: "Working capital",     disbursedAt: "2024-10-01T09:00:00Z",  dueDate: "2025-04-01T09:00:00Z",  createdAt: "2024-09-25T09:00:00Z", provider: "Zenith Bank",        loanProduct: "Micro Finance Plus"   },
  { id: "ln05", borrower: { id: "u05", name: "Ngozi Ibe",        email: "ngozi@example.com",    phone: "08012345605" }, amount: 300_000,   amountRepaid: 180_000,  balance: 120_000,  status: "active",    purpose: "Retail inventory",    disbursedAt: "2025-09-01T09:00:00Z",  dueDate: "2026-03-01T09:00:00Z",  createdAt: "2025-08-28T09:00:00Z", provider: "First Bank Nigeria", loanProduct: "Business Growth Loan" },
  { id: "ln06", borrower: { id: "u06", name: "Bola Adeyemi",     email: "bola@example.com",     phone: "08012345606" }, amount: 75_000,    amountRepaid: 75_000,   balance: 0,         status: "repaid",    purpose: "Medical expenses",    disbursedAt: "2025-03-01T09:00:00Z",  dueDate: "2025-06-01T09:00:00Z",  createdAt: "2025-02-25T09:00:00Z", provider: "Access Bank",        loanProduct: "Personal Advance"     },
  { id: "ln07", borrower: { id: "u07", name: "Musa Yusuf",       email: "musa@example.com",     phone: "08012345607" }, amount: 2_000_000, amountRepaid: 0,         balance: 2_000_000, status: "pending",   purpose: "Construction",        disbursedAt: undefined,               dueDate: undefined,               createdAt: "2026-02-18T09:00:00Z", provider: "UBA Nigeria",        loanProduct: "Business Growth Loan" },
  { id: "ln08", borrower: { id: "u08", name: "Chioma Nwoye",     email: "chioma@example.com",   phone: "08012345608" }, amount: 400_000,   amountRepaid: 280_000,  balance: 120_000,  status: "active",    purpose: "Poultry farming",     disbursedAt: "2025-08-15T09:00:00Z",  dueDate: "2026-08-15T09:00:00Z",  createdAt: "2025-08-10T09:00:00Z", provider: "UBA Nigeria",        loanProduct: "Agricultural Loan"    },
  { id: "ln09", borrower: { id: "u09", name: "Segun Lawal",      email: "segun@example.com",    phone: "08012345609" }, amount: 80_000,    amountRepaid: 30_000,   balance: 50_000,   status: "defaulted", purpose: "Transportation",      disbursedAt: "2025-04-01T09:00:00Z",  dueDate: "2025-07-01T09:00:00Z",  createdAt: "2025-03-28T09:00:00Z", provider: "Zenith Bank",        loanProduct: "Micro Finance Plus"   },
  { id: "ln10", borrower: { id: "u10", name: "Ifeoma Obiora",    email: "ifeoma@example.com",   phone: "08012345610" }, amount: 600_000,   amountRepaid: 600_000,  balance: 0,         status: "repaid",    purpose: "Import finance",      disbursedAt: "2025-02-01T09:00:00Z",  dueDate: "2025-08-01T09:00:00Z",  createdAt: "2025-01-28T09:00:00Z", provider: "First Bank Nigeria", loanProduct: "Business Growth Loan" },
  { id: "ln11", borrower: { id: "u11", name: "Tunde Bakare",     email: "tunde@example.com",    phone: "08012345611" }, amount: 120_000,   amountRepaid: 0,         balance: 120_000,  status: "rejected",  purpose: "Vehicle purchase",    disbursedAt: undefined,               dueDate: undefined,               createdAt: "2026-01-15T09:00:00Z", provider: "Access Bank",        loanProduct: "Personal Advance"     },
  { id: "ln12", borrower: { id: "u12", name: "Amina Garba",      email: "amina@example.com",    phone: "08012345612" }, amount: 500_000,   amountRepaid: 100_000,  balance: 400_000,  status: "active",    purpose: "Market trading",      disbursedAt: "2025-12-01T09:00:00Z",  dueDate: "2026-12-01T09:00:00Z",  createdAt: "2025-11-28T09:00:00Z", provider: "UBA Nigeria",        loanProduct: "Business Growth Loan" },
];

// ══════════════════════════════════════════════════════════════════════════════
// INSTANTBUY
// ══════════════════════════════════════════════════════════════════════════════

export const MOCK_IB_SUMMARY = {
  totalFunded:         42_750_000,
  totalPayments:       31_200_000,
  activeWallets:          2_847,
  successRate:              94.2,
  avgTransactionValue:  12_500,
};

export const MOCK_IB_MONTHLY = [
  { month: "Mar 25", topups: 2_800_000, payments: 2_100_000 },
  { month: "Apr 25", topups: 3_100_000, payments: 2_300_000 },
  { month: "May 25", topups: 3_400_000, payments: 2_500_000 },
  { month: "Jun 25", topups: 3_200_000, payments: 2_400_000 },
  { month: "Jul 25", topups: 3_600_000, payments: 2_700_000 },
  { month: "Aug 25", topups: 3_900_000, payments: 2_900_000 },
  { month: "Sep 25", topups: 4_100_000, payments: 3_100_000 },
  { month: "Oct 25", topups: 4_400_000, payments: 3_300_000 },
  { month: "Nov 25", topups: 4_600_000, payments: 3_500_000 },
  { month: "Dec 25", topups: 5_100_000, payments: 3_900_000 },
  { month: "Jan 26", topups: 4_800_000, payments: 3_600_000 },
  { month: "Feb 26", topups: 4_200_000, payments: 3_200_000 },
];

export const MOCK_IB_DAILY = [
  { day:  "1", transactions: 48 }, { day:  "2", transactions: 55 },
  { day:  "3", transactions: 41 }, { day:  "4", transactions: 63 },
  { day:  "5", transactions: 72 }, { day:  "6", transactions: 58 },
  { day:  "7", transactions: 44 }, { day:  "8", transactions: 67 },
  { day:  "9", transactions: 81 }, { day: "10", transactions: 76 },
  { day: "11", transactions: 53 }, { day: "12", transactions: 69 },
  { day: "13", transactions: 88 }, { day: "14", transactions: 95 },
  { day: "15", transactions: 74 }, { day: "16", transactions: 61 },
  { day: "17", transactions: 83 }, { day: "18", transactions: 91 },
  { day: "19", transactions: 79 }, { day: "20", transactions: 66 },
  { day: "21", transactions: 57 }, { day: "22", transactions: 84 },
  { day: "23", transactions: 93 }, { day: "24", transactions: 78 },
  { day: "25", transactions: 86 }, { day: "26", transactions: 70 },
  { day: "27", transactions: 62 }, { day: "28", transactions: 49 },
  { day: "29", transactions: 55 }, { day: "30", transactions: 68 },
];

export const MOCK_IB_LOCATIONS = [
  { state: "Lagos",       count: 487, amount: 14_610_000 },
  { state: "Abuja (FCT)", count: 312, amount:  9_360_000 },
  { state: "Rivers",      count: 214, amount:  6_420_000 },
  { state: "Kano",        count: 156, amount:  4_680_000 },
  { state: "Ogun",        count: 132, amount:  3_960_000 },
  { state: "Anambra",     count: 108, amount:  3_240_000 },
  { state: "Delta",       count:  94, amount:  2_820_000 },
  { state: "Oyo",         count:  83, amount:  2_490_000 },
];

export const MOCK_IB_TRANSACTIONS = [
  // ── Top-ups ──────────────────────────────────────────────────────────────
  { id: "t01", userName: "Adaeze Okonkwo",   userPhone: "08012345601", reference: "TXN-2026-001", type: "topup",   amount:  20_000, status: "successful", createdAt: "2026-02-25T10:15:00Z" },
  { id: "t02", userName: "Emeka Nwosu",      userPhone: "08012345602", reference: "TXN-2026-002", type: "topup",   amount:  50_000, status: "successful", createdAt: "2026-02-24T14:30:00Z" },
  { id: "t03", userName: "Fatima Al-Hassan", userPhone: "08012345603", reference: "TXN-2026-003", type: "topup",   amount:  10_000, status: "pending",    createdAt: "2026-02-24T09:00:00Z" },
  { id: "t04", userName: "Ngozi Ibe",        userPhone: "08012345605", reference: "TXN-2026-004", type: "topup",   amount:  35_000, status: "successful", createdAt: "2026-02-23T11:45:00Z" },
  { id: "t05", userName: "Bola Adeyemi",     userPhone: "08012345606", reference: "TXN-2026-005", type: "topup",   amount:   5_000, status: "failed",     createdAt: "2026-02-22T16:20:00Z" },
  { id: "t06", userName: "Segun Lawal",      userPhone: "08012345609", reference: "TXN-2026-006", type: "topup",   amount:  15_000, status: "successful", createdAt: "2026-02-20T13:10:00Z" },
  { id: "t13", userName: "Amina Garba",      userPhone: "08012345612", reference: "TXN-2026-013", type: "topup",   amount:  25_000, status: "successful", createdAt: "2026-02-18T09:30:00Z" },
  { id: "t14", userName: "Ifeoma Obiora",    userPhone: "08012345610", reference: "TXN-2026-014", type: "topup",   amount:  40_000, status: "successful", createdAt: "2026-02-16T11:00:00Z" },
  // ── Material Purchases ────────────────────────────────────────────────────
  { id: "t07", userName: "Chioma Nwoye",  userPhone: "08012345608", reference: "PMT-2026-001", type: "payment", amount: 18_500, status: "successful", createdAt: "2026-02-25T11:00:00Z", materials: [{ name: "Plastic Bottles", kg: 5.0, pricePerKg: 2_000 }, { name: "Cardboard", kg: 4.25, pricePerKg: 2_000 }], totalWeight: 9.25, address: "14 Adeola Street, Lekki, Lagos" },
  { id: "t08", userName: "Musa Yusuf",    userPhone: "08012345607", reference: "PMT-2026-002", type: "payment", amount: 32_000, status: "successful", createdAt: "2026-02-23T09:30:00Z", materials: [{ name: "Aluminum Cans", kg: 8.0, pricePerKg: 4_000 }], totalWeight: 8.0, address: "22 Independence Ave, Wuse, Abuja" },
  { id: "t09", userName: "Ifeoma Obiora", userPhone: "08012345610", reference: "PMT-2026-003", type: "payment", amount: 24_500, status: "successful", createdAt: "2026-02-21T14:20:00Z", materials: [{ name: "E-Waste", kg: 2.5, pricePerKg: 6_000 }, { name: "Glass", kg: 5.0, pricePerKg: 1_300 }], totalWeight: 7.5, address: "90 Agege Motor Road, Lagos" },
  { id: "t10", userName: "Tunde Bakare",  userPhone: "08012345611", reference: "PMT-2026-004", type: "payment", amount: 12_000, status: "failed",     createdAt: "2026-02-20T10:00:00Z", materials: [{ name: "Plastic Bottles", kg: 6.0, pricePerKg: 2_000 }], totalWeight: 6.0, address: "34 Bodija Market Road, Ibadan" },
  { id: "t15", userName: "Chukwudi Eze",  userPhone: "08012345604", reference: "PMT-2026-005", type: "payment", amount: 27_000, status: "successful", createdAt: "2026-02-19T08:45:00Z", materials: [{ name: "Aluminum Cans", kg: 3.0, pricePerKg: 4_000 }, { name: "Plastic Bottles", kg: 7.5, pricePerKg: 2_000 }], totalWeight: 10.5, address: "45 Awolowo Road, Ikoyi, Lagos" },
  // ── Reversals ─────────────────────────────────────────────────────────────
  { id: "t11", userName: "Adaeze Okonkwo", userPhone: "08012345601", reference: "REV-2026-001", type: "reversal", amount:  5_000, status: "reversed", createdAt: "2026-02-22T16:45:00Z" },
  { id: "t12", userName: "Bola Adeyemi",   userPhone: "08012345606", reference: "REV-2026-002", type: "reversal", amount:  5_000, status: "reversed", createdAt: "2026-02-22T17:00:00Z" },
  { id: "t16", userName: "Fatima Al-Hassan", userPhone: "08012345603", reference: "REV-2026-003", type: "reversal", amount: 10_000, status: "reversed", createdAt: "2026-02-18T14:30:00Z" },
];

// ══════════════════════════════════════════════════════════════════════════════
// FINANCIALS
// ══════════════════════════════════════════════════════════════════════════════

export const MOCK_FINANCIALS = {
  monthly: [
    { month: "Mar 25", schedules: 1_200_000, loans:  420_000, instantBuy: 280_000, totalRevenue: 1_900_000, netProfit:   760_000 },
    { month: "Apr 25", schedules: 1_350_000, loans:  480_000, instantBuy: 310_000, totalRevenue: 2_140_000, netProfit:   856_000 },
    { month: "May 25", schedules: 1_480_000, loans:  530_000, instantBuy: 340_000, totalRevenue: 2_350_000, netProfit:   940_000 },
    { month: "Jun 25", schedules: 1_320_000, loans:  490_000, instantBuy: 320_000, totalRevenue: 2_130_000, netProfit:   852_000 },
    { month: "Jul 25", schedules: 1_600_000, loans:  560_000, instantBuy: 360_000, totalRevenue: 2_520_000, netProfit: 1_008_000 },
    { month: "Aug 25", schedules: 1_750_000, loans:  600_000, instantBuy: 390_000, totalRevenue: 2_740_000, netProfit: 1_096_000 },
    { month: "Sep 25", schedules: 1_900_000, loans:  640_000, instantBuy: 410_000, totalRevenue: 2_950_000, netProfit: 1_180_000 },
    { month: "Oct 25", schedules: 2_000_000, loans:  680_000, instantBuy: 440_000, totalRevenue: 3_120_000, netProfit: 1_248_000 },
    { month: "Nov 25", schedules: 2_100_000, loans:  710_000, instantBuy: 460_000, totalRevenue: 3_270_000, netProfit: 1_308_000 },
    { month: "Dec 25", schedules: 2_300_000, loans:  780_000, instantBuy: 510_000, totalRevenue: 3_590_000, netProfit: 1_436_000 },
    { month: "Jan 26", schedules: 2_150_000, loans:  740_000, instantBuy: 480_000, totalRevenue: 3_370_000, netProfit: 1_348_000 },
    { month: "Feb 26", schedules: 1_980_000, loans:  700_000, instantBuy: 450_000, totalRevenue: 3_130_000, netProfit: 1_252_000 },
  ],
  segments: {
    schedules: {
      completedCount: 14_405,
      totalWasteKg:  773_981,
    },
    loans: {
      loanBook:        61_900_000,
      nplRatio:               3.8,
      collectionRate:        87.4,
    },
    instantBuy: {
      activeWallets:   2_847,
      gmv:            31_200_000,
      takeRate:               2.1,
    },
  },
};

// ══════════════════════════════════════════════════════════════════════════════
// SCHEDULES
// ══════════════════════════════════════════════════════════════════════════════

export const MOCK_PICKUP_LOCATIONS = [
  { state: "Lagos",       count: 523 },
  { state: "Abuja (FCT)", count: 387 },
  { state: "Rivers",      count: 265 },
  { state: "Ogun",        count: 198 },
  { state: "Kano",        count: 154 },
  { state: "Anambra",     count: 112 },
  { state: "Delta",       count:  97 },
  { state: "Oyo",         count:  84 },
  { state: "Edo",         count:  71 },
  { state: "Imo",         count:  58 },
];

export const MOCK_DROPOFF_LOCATIONS = [
  { state: "Lagos",       count: 412 },
  { state: "Rivers",      count: 298 },
  { state: "Abuja (FCT)", count: 243 },
  { state: "Ogun",        count: 176 },
  { state: "Kano",        count: 134 },
  { state: "Delta",       count: 108 },
  { state: "Anambra",     count:  92 },
  { state: "Oyo",         count:  78 },
];

const cat = (name: string) => ({ catId: name.toLowerCase().replace(/\s/g, "-"), name });

export const MOCK_PICKUP_PENDING = [
  { id: "pup01", scheduleCreator: "Adaeze Okonkwo",   phone: "08012345601", address: "14 Adeola Street, Lekki, Lagos",           categories: [cat("Plastic Bottles"), cat("Cardboard")],              quantity: "8 bags",  createdAt: "2026-02-24T10:00:00Z", images: [] },
  { id: "pup02", scheduleCreator: "Emeka Nwosu",      phone: "08012345602", address: "22 Independence Ave, Wuse, Abuja",          categories: [cat("Aluminum Cans"), cat("Glass")],                     quantity: "5 bags",  createdAt: "2026-02-23T11:00:00Z", images: [] },
  { id: "pup03", scheduleCreator: "Fatima Al-Hassan", phone: "08012345603", address: "3 Old GRA Road, Port Harcourt, Rivers",     categories: [cat("E-Waste"), cat("Plastic Bottles")],                 quantity: "12 bags", createdAt: "2026-02-22T09:30:00Z", images: [] },
  { id: "pup04", scheduleCreator: "Chukwudi Eze",     phone: "08012345604", address: "45 Awolowo Road, Ikoyi, Lagos",             categories: [cat("Cardboard"), cat("Organic")],                       quantity: "6 bags",  createdAt: "2026-02-22T08:00:00Z", images: [] },
  { id: "pup05", scheduleCreator: "Ngozi Ibe",        phone: "08012345605", address: "10 Ring Road, Benin City, Edo",             categories: [cat("Plastic Bottles")],                                 quantity: "9 bags",  createdAt: "2026-02-21T14:00:00Z", images: [] },
  { id: "pup06", scheduleCreator: "Bola Adeyemi",     phone: "08012345606", address: "67 Opebi Road, Ikeja, Lagos",               categories: [cat("Cardboard"), cat("Plastic Bottles"), cat("Glass")], quantity: "11 bags", createdAt: "2026-02-20T13:00:00Z", images: [] },
];

export const MOCK_PICKUP_COMPLETED = [
  { id: "puc01", scheduleCreator: "Musa Yusuf",     phone: "08012345607", address: "8 Ahmadu Bello Way, Kaduna",          categories: [cat("Aluminum Cans")],                    quantity: "7 bags",  createdAt: "2026-02-10T10:00:00Z", images: [], collectorName: "Kola Adeyemi"  },
  { id: "puc02", scheduleCreator: "Chioma Nwoye",   phone: "08012345608", address: "5 Trans Amadi, Port Harcourt",        categories: [cat("E-Waste")],                          quantity: "4 bags",  createdAt: "2026-02-08T09:00:00Z", images: [], collectorName: "Emeka Osei"   },
  { id: "puc03", scheduleCreator: "Segun Lawal",    phone: "08012345609", address: "90 Agege Motor Road, Lagos",          categories: [cat("Plastic Bottles"), cat("Cardboard")], quantity: "15 bags", createdAt: "2026-02-07T11:00:00Z", images: [], collectorName: "Tunde Adesanya" },
  { id: "puc04", scheduleCreator: "Ifeoma Obiora",  phone: "08012345610", address: "12 Aba Road, Owerri, Imo",            categories: [cat("Glass"), cat("Aluminum Cans")],       quantity: "6 bags",  createdAt: "2026-02-05T10:00:00Z", images: [], collectorName: "Chidi Eze"    },
  { id: "puc05", scheduleCreator: "Tunde Bakare",   phone: "08012345611", address: "34 Bodija Market Road, Ibadan",       categories: [cat("Organic"), cat("Cardboard")],         quantity: "10 bags", createdAt: "2026-02-03T09:30:00Z", images: [], collectorName: "Remi Oladele" },
  { id: "puc06", scheduleCreator: "Amina Garba",    phone: "08012345612", address: "5 Maiduguri Road, Kano",              categories: [cat("Plastic Bottles")],                  quantity: "8 bags",  createdAt: "2026-02-01T08:00:00Z", images: [], collectorName: "Sani Ibrahim" },
  { id: "puc07", scheduleCreator: "Sunday Effiong", phone: "08012345613", address: "18 Ndidem Street, Calabar",           categories: [cat("Cardboard"), cat("Plastic Bottles")], quantity: "5 bags",  createdAt: "2026-01-28T10:00:00Z", images: [], collectorName: "Monday Archibong" },
];

export const MOCK_PICKUP_CANCELLED = [
  { id: "puca01", scheduleCreator: "Yemi Adesanya",  phone: "08012345614", address: "20 Masha Road, Surulere, Lagos",          categories: [cat("Plastic Bottles")],                 quantity: "3 bags", createdAt: "2026-02-15T10:00:00Z", images: [] },
  { id: "puca02", scheduleCreator: "Obiageli Onu",   phone: "08012345615", address: "6 University Road, Nsukka, Enugu",         categories: [cat("Cardboard"), cat("Glass")],          quantity: "7 bags", createdAt: "2026-02-12T09:00:00Z", images: [] },
  { id: "puca03", scheduleCreator: "James Okonkwo",  phone: "08012345616", address: "45 Nnewi Road, Onitsha, Anambra",          categories: [cat("Plastic Bottles"), cat("Aluminum Cans")], quantity: "5 bags", createdAt: "2026-02-09T11:00:00Z", images: [] },
];

export const MOCK_DROPOFF_PENDING = [
  { id: "dop01", scheduleCreator: "Chiamaka Dike", phone: "08022345601", address: "Pakam Collection Point, Lekki Phase 1",  categories: [cat("Plastic Bottles"), cat("E-Waste")],    quantity: "20 bags", createdAt: "2026-02-25T09:00:00Z", images: [] },
  { id: "dop02", scheduleCreator: "Olumide Ojo",   phone: "08022345602", address: "Pakam Hub, Utako, Abuja",                categories: [cat("Cardboard"), cat("Aluminum Cans")],   quantity: "15 bags", createdAt: "2026-02-24T10:30:00Z", images: [] },
  { id: "dop03", scheduleCreator: "Patricia Eze",  phone: "08022345603", address: "Green Point, GRA, Port Harcourt",        categories: [cat("Glass"), cat("Plastic Bottles")],     quantity: "18 bags", createdAt: "2026-02-23T08:00:00Z", images: [] },
  { id: "dop04", scheduleCreator: "Hakeem Salami", phone: "08022345604", address: "Eco Drop-off, Allen Ave, Lagos",         categories: [cat("E-Waste")],                           quantity: "10 bags", createdAt: "2026-02-22T14:00:00Z", images: [] },
  { id: "dop05", scheduleCreator: "Grace Akor",    phone: "08022345605", address: "Pakam Hub, Owerri, Imo",                 categories: [cat("Organic"), cat("Cardboard")],         quantity: "25 bags", createdAt: "2026-02-21T11:00:00Z", images: [] },
];

export const MOCK_DROPOFF_COMPLETED = [
  { id: "doc01", scheduleCreator: "Ahmed Bello",  phone: "08022345606", address: "Pakam Hub, Kano Central",          categories: [cat("Aluminum Cans"), cat("Plastic Bottles")], quantity: "30 bags", createdAt: "2026-02-10T09:00:00Z", images: [], collectorName: "Usman Danjuma" },
  { id: "doc02", scheduleCreator: "Adaku Nwafor", phone: "08022345607", address: "Green Point, Asaba, Delta",        categories: [cat("Cardboard"), cat("Glass")],               quantity: "22 bags", createdAt: "2026-02-08T10:00:00Z", images: [], collectorName: "Felix Okonkwo"  },
  { id: "doc03", scheduleCreator: "Funke Adeola", phone: "08022345608", address: "Eco Drop-off, Abeokuta, Ogun",    categories: [cat("Plastic Bottles")],                       quantity: "18 bags", createdAt: "2026-02-06T08:30:00Z", images: [], collectorName: "Dayo Adeyemi"  },
  { id: "doc04", scheduleCreator: "Chris Osei",   phone: "08022345609", address: "Pakam Point, Benin City, Edo",    categories: [cat("E-Waste"), cat("Aluminum Cans")],         quantity: "14 bags", createdAt: "2026-02-04T09:00:00Z", images: [], collectorName: "Okon Ekpenyong" },
  { id: "doc05", scheduleCreator: "Nkiru Okeke",  phone: "08022345610", address: "Green Hub, Enugu",                categories: [cat("Cardboard"), cat("Plastic Bottles")],     quantity: "20 bags", createdAt: "2026-02-02T11:00:00Z", images: [], collectorName: "Chuks Eze"      },
];

export const MOCK_DROPOFF_CANCELLED = [
  { id: "doca01", scheduleCreator: "Sunday Eze",  phone: "08022345611", address: "Eco Point, Ikeja, Lagos",          categories: [cat("Glass")],                                quantity: "8 bags",  createdAt: "2026-02-14T09:00:00Z", images: [] },
  { id: "doca02", scheduleCreator: "Mary Ekong",  phone: "08022345612", address: "Pakam Hub, Uyo, Akwa Ibom",        categories: [cat("Plastic Bottles"), cat("Cardboard")],     quantity: "12 bags", createdAt: "2026-02-11T10:00:00Z", images: [] },
];

// ══════════════════════════════════════════════════════════════════════════════
// COLLECTORS
// ══════════════════════════════════════════════════════════════════════════════

export const MOCK_COLLECTOR_SUMMARY = {
  totalCollectors:   24,
  onlineCount:        8,
  onAssignmentCount:  7,
  offlineCount:       9,
  completedToday:    43,
};

export const MOCK_COLLECTORS = [
  // ── On Assignment ──────────────────────────────────────────────────────────
  { id: "col01", name: "Kola Adeyemi",     phone: "08031001001", email: "kola@pakam.ng",     status: "on-assignment" as const, isActive: true,  lat:  6.4698, lng: 3.5852, currentAddress: "12 Admiralty Way, Lekki Phase 1, Lagos",        completedToday: 4, totalCompleted: 312, lastSeen: "2026-02-26T09:45:00Z", assignedScheduleId: "pup01" },
  { id: "col02", name: "Emeka Osei",       phone: "08031001002", email: "emeka@pakam.ng",     status: "on-assignment" as const, isActive: true,  lat:  6.5958, lng: 3.3436, currentAddress: "Aromire Ave, Ikeja, Lagos",                    completedToday: 3, totalCompleted: 287, lastSeen: "2026-02-26T09:50:00Z", assignedScheduleId: "pup03" },
  { id: "col03", name: "Tunde Adesanya",   phone: "08031001003", email: "tunde@pakam.ng",     status: "on-assignment" as const, isActive: true,  lat:  6.4550, lng: 3.3841, currentAddress: "Herbert Macaulay Way, Yaba, Lagos",            completedToday: 5, totalCompleted: 401, lastSeen: "2026-02-26T09:48:00Z", assignedScheduleId: "pup06" },
  { id: "col04", name: "Chidi Eze",        phone: "08031001004", email: "chidi@pakam.ng",     status: "on-assignment" as const, isActive: true,  lat:  9.0597, lng: 7.4951, currentAddress: "Wuse Zone 5, Abuja",                          completedToday: 3, totalCompleted: 198, lastSeen: "2026-02-26T09:40:00Z", assignedScheduleId: "dop02" },
  { id: "col05", name: "Remi Oladele",     phone: "08031001005", email: "remi@pakam.ng",      status: "on-assignment" as const, isActive: true,  lat:  6.4969, lng: 3.3524, currentAddress: "Western Ave, Surulere, Lagos",                completedToday: 2, totalCompleted: 154, lastSeen: "2026-02-26T09:52:00Z", assignedScheduleId: "pup04" },
  { id: "col06", name: "Sani Ibrahim",     phone: "08031001006", email: "sani@pakam.ng",      status: "on-assignment" as const, isActive: false, lat: 12.0022, lng: 8.5919, currentAddress: "Kofar Nassarawa, Kano",                       completedToday: 2, totalCompleted: 143, lastSeen: "2026-02-26T09:35:00Z", assignedScheduleId: "dop05" },
  { id: "col07", name: "Monday Archibong", phone: "08031001007", email: "monday@pakam.ng",    status: "on-assignment" as const, isActive: true,  lat:  4.8241, lng: 7.0199, currentAddress: "Peter Odili Road, Port Harcourt, Rivers",      completedToday: 3, totalCompleted: 221, lastSeen: "2026-02-26T09:42:00Z", assignedScheduleId: "dop03" },
  // ── Online ─────────────────────────────────────────────────────────────────
  { id: "col08", name: "Usman Danjuma",    phone: "08031001008", email: "usman@pakam.ng",     status: "online"         as const, isActive: true,  lat:  9.1173, lng: 7.3964, currentAddress: "Gwarinpa Estate, Abuja",                     completedToday: 6, totalCompleted: 355, lastSeen: "2026-02-26T09:55:00Z" },
  { id: "col09", name: "Felix Okonkwo",    phone: "08031001009", email: "felix@pakam.ng",     status: "online"         as const, isActive: true,  lat:  6.4281, lng: 3.4219, currentAddress: "Sanusi Fafunwa St, Victoria Island, Lagos",  completedToday: 5, totalCompleted: 298, lastSeen: "2026-02-26T09:53:00Z" },
  { id: "col10", name: "Dayo Adeyemi",     phone: "08031001010", email: "dayo@pakam.ng",      status: "online"         as const, isActive: true,  lat:  7.3775, lng: 3.9470, currentAddress: "Ring Road, Ibadan, Oyo",                     completedToday: 4, totalCompleted: 267, lastSeen: "2026-02-26T09:50:00Z" },
  { id: "col11", name: "Okon Ekpenyong",   phone: "08031001011", email: "okon@pakam.ng",      status: "online"         as const, isActive: true,  lat:  6.3350, lng: 5.6037, currentAddress: "Airport Road, Benin City, Edo",              completedToday: 3, totalCompleted: 189, lastSeen: "2026-02-26T09:47:00Z" },
  { id: "col12", name: "Chuks Eze",        phone: "08031001012", email: "chuks@pakam.ng",     status: "online"         as const, isActive: false, lat:  6.4418, lng: 7.4985, currentAddress: "Independence Layout, Enugu",                 completedToday: 4, totalCompleted: 234, lastSeen: "2026-02-26T09:44:00Z" },
  { id: "col13", name: "Ngozi Amadi",      phone: "08031001013", email: "ngozi.a@pakam.ng",   status: "online"         as const, isActive: true,  lat:  4.8156, lng: 7.0498, currentAddress: "Rumuola Road, Port Harcourt, Rivers",        completedToday: 5, totalCompleted: 311, lastSeen: "2026-02-26T09:56:00Z" },
  { id: "col14", name: "Babs Olawale",     phone: "08031001014", email: "babs@pakam.ng",      status: "online"         as const, isActive: true,  lat:  6.5244, lng: 3.3792, currentAddress: "Lagos Island, Lagos",                        completedToday: 2, totalCompleted: 176, lastSeen: "2026-02-26T09:30:00Z" },
  { id: "col15", name: "Amaka Nweke",      phone: "08031001015", email: "amaka@pakam.ng",     status: "online"         as const, isActive: true,  lat:  6.2210, lng: 6.9980, currentAddress: "Onitsha Road, Asaba, Delta",                 completedToday: 1, totalCompleted: 132, lastSeen: "2026-02-26T09:20:00Z" },
  // ── Offline ────────────────────────────────────────────────────────────────
  { id: "col16", name: "Jide Ogundimu",    phone: "08031001016", email: "jide@pakam.ng",      status: "offline"        as const, isActive: true,  completedToday: 0, totalCompleted: 201, lastSeen: "2026-02-25T18:30:00Z" },
  { id: "col17", name: "Stella Nwafor",    phone: "08031001017", email: "stella@pakam.ng",    status: "offline"        as const, isActive: true,  completedToday: 3, totalCompleted: 167, lastSeen: "2026-02-26T07:45:00Z" },
  { id: "col18", name: "Hakeem Badmus",    phone: "08031001018", email: "hakeem@pakam.ng",    status: "offline"        as const, isActive: false, completedToday: 0, totalCompleted: 98,  lastSeen: "2026-02-25T20:00:00Z" },
  { id: "col19", name: "Grace Effiong",    phone: "08031001019", email: "grace@pakam.ng",     status: "offline"        as const, isActive: true,  completedToday: 2, totalCompleted: 144, lastSeen: "2026-02-26T08:10:00Z" },
  { id: "col20", name: "Patrick Obi",      phone: "08031001020", email: "patrick@pakam.ng",   status: "offline"        as const, isActive: true,  completedToday: 0, totalCompleted: 76,  lastSeen: "2026-02-24T17:00:00Z" },
];

// ══════════════════════════════════════════════════════════════════════════════
// PAYOUTS
// ══════════════════════════════════════════════════════════════════════════════

export const MOCK_PAYOUT_SUMMARY = {
  totalRequests:  247,
  totalAmount:    12_350_000,
  pendingCount:    38,
  pendingAmount:   1_900_000,
  approvedCount:   22,
  approvedAmount:  1_100_000,
  paidCount:      168,
  paidAmount:     8_400_000,
  rejectedCount:   19,
  rejectedAmount:    950_000,
};

export const MOCK_PAYOUTS = [
  // ── Pending ────────────────────────────────────────────────────────────────
  { id: "po01", userId: "u01", userName: "Adaeze Okonkwo",   userPhone: "08012345601", userEmail: "adaeze@example.com",    amount:  50_000, bankName: "GTBank",         accountNumber: "0123456789", accountName: "Adaeze Okonkwo",   status: "pending"  as const, requestedAt: "2026-02-25T10:00:00Z" },
  { id: "po02", userId: "u02", userName: "Emeka Nwosu",      userPhone: "08012345602", userEmail: "emeka@example.com",     amount: 120_000, bankName: "Access Bank",    accountNumber: "0234567890", accountName: "Emeka Nwosu",      status: "pending"  as const, requestedAt: "2026-02-24T14:30:00Z" },
  { id: "po03", userId: "u05", userName: "Ngozi Ibe",        userPhone: "08012345605", userEmail: "ngozi@example.com",     amount:  75_000, bankName: "Zenith Bank",    accountNumber: "0345678901", accountName: "Ngozi Ibe",        status: "pending"  as const, requestedAt: "2026-02-24T09:00:00Z" },
  { id: "po04", userId: "u08", userName: "Chioma Nwoye",     userPhone: "08012345608", userEmail: "chioma@example.com",    amount: 200_000, bankName: "First Bank",     accountNumber: "0456789012", accountName: "Chioma Nwoye",     status: "pending"  as const, requestedAt: "2026-02-23T11:00:00Z" },
  // ── Approved ───────────────────────────────────────────────────────────────
  { id: "po05", userId: "u10", userName: "Ifeoma Obiora",    userPhone: "08012345610", userEmail: "ifeoma@example.com",    amount:  85_000, bankName: "UBA",            accountNumber: "0567890123", accountName: "Ifeoma Obiora",    status: "approved" as const, requestedAt: "2026-02-20T08:00:00Z", processedAt: "2026-02-21T09:00:00Z" },
  { id: "po06", userId: "u13", userName: "Sunday Effiong",   userPhone: "08012345613", userEmail: "sunday@example.com",    amount: 150_000, bankName: "Fidelity Bank",  accountNumber: "0678901234", accountName: "Sunday Effiong",   status: "approved" as const, requestedAt: "2026-02-19T13:00:00Z", processedAt: "2026-02-20T10:00:00Z" },
  { id: "po07", userId: "u11", userName: "Tunde Bakare",     userPhone: "08012345611", userEmail: "tunde@example.com",     amount:  60_000, bankName: "Stanbic IBTC",   accountNumber: "0789012345", accountName: "Tunde Bakare",     status: "approved" as const, requestedAt: "2026-02-18T10:00:00Z", processedAt: "2026-02-19T11:00:00Z" },
  // ── Paid ───────────────────────────────────────────────────────────────────
  { id: "po08", userId: "u06", userName: "Bola Adeyemi",     userPhone: "08012345606", userEmail: "bola@example.com",      amount:  30_000, bankName: "GTBank",         accountNumber: "0890123456", accountName: "Bola Adeyemi",     status: "paid"     as const, requestedAt: "2026-02-10T09:00:00Z", processedAt: "2026-02-12T10:00:00Z", reference: "GTB-2026-00312" },
  { id: "po09", userId: "u03", userName: "Fatima Al-Hassan", userPhone: "08012345603", userEmail: "fatima@example.com",    amount: 250_000, bankName: "Access Bank",    accountNumber: "0901234567", accountName: "Fatima Al-Hassan", status: "paid"     as const, requestedAt: "2026-02-08T14:00:00Z", processedAt: "2026-02-10T09:00:00Z", reference: "ACB-2026-00298" },
  { id: "po10", userId: "u12", userName: "Amina Garba",      userPhone: "08012345612", userEmail: "amina@example.com",     amount:  40_000, bankName: "Zenith Bank",    accountNumber: "0012345678", accountName: "Amina Garba",      status: "paid"     as const, requestedAt: "2026-02-05T11:00:00Z", processedAt: "2026-02-07T08:00:00Z", reference: "ZEN-2026-00201" },
  { id: "po11", userId: "u14", userName: "Yemi Adesanya",    userPhone: "08012345614", userEmail: "yemi@example.com",      amount: 100_000, bankName: "First Bank",     accountNumber: "0112345678", accountName: "Yemi Adesanya",    status: "paid"     as const, requestedAt: "2026-01-28T10:00:00Z", processedAt: "2026-01-30T09:00:00Z", reference: "FBN-2026-00188" },
  { id: "po12", userId: "u15", userName: "Obiageli Onu",     userPhone: "08012345615", userEmail: "obiageli@example.com",  amount:  70_000, bankName: "UBA",            accountNumber: "0212345678", accountName: "Obiageli Onu",     status: "paid"     as const, requestedAt: "2026-01-20T08:00:00Z", processedAt: "2026-01-22T10:00:00Z", reference: "UBA-2026-00164" },
  // ── Rejected ───────────────────────────────────────────────────────────────
  { id: "po13", userId: "u04", userName: "Chukwudi Eze",     userPhone: "08012345604", userEmail: "chukwudi@example.com",  amount:  90_000, bankName: "Polaris Bank",   accountNumber: "0312345678", accountName: "Chukwudi Eze",     status: "rejected" as const, requestedAt: "2026-02-15T09:00:00Z", processedAt: "2026-02-16T11:00:00Z", rejectionReason: "Account name mismatch — please resubmit with correct account details" },
  { id: "po14", userId: "u09", userName: "Segun Lawal",      userPhone: "08012345609", userEmail: "segun@example.com",     amount:  45_000, bankName: "Heritage Bank",  accountNumber: "0412345678", accountName: "Segun Lawal",      status: "rejected" as const, requestedAt: "2026-02-12T10:00:00Z", processedAt: "2026-02-13T09:00:00Z", rejectionReason: "Insufficient wallet balance at time of processing" },
  { id: "po15", userId: "u07", userName: "Musa Yusuf",       userPhone: "08012345607", userEmail: "musa@example.com",      amount: 500_000, bankName: "Keystone Bank",  accountNumber: "0512345678", accountName: "Musa Yusuf",       status: "rejected" as const, requestedAt: "2026-02-08T13:00:00Z", processedAt: "2026-02-09T10:00:00Z", rejectionReason: "Amount exceeds single-transaction withdrawal limit of ₦300,000" },
];

// ══════════════════════════════════════════════════════════════════════════════
// USERS
// ══════════════════════════════════════════════════════════════════════════════

export const MOCK_USERS = [
  { id: 1,  name: "Adaeze Okonkwo",    email: "adaeze@example.com",    phone: "08012345601", role: "user",       status: "active"   as const, createdAt: "2024-06-01T08:00:00Z", completedSchedule: 12  },
  { id: 2,  name: "Emeka Nwosu",       email: "emeka@example.com",     phone: "08012345602", role: "aggregator", status: "active"   as const, createdAt: "2024-03-15T08:00:00Z", completedSchedule: 87  },
  { id: 3,  name: "Fatima Al-Hassan",  email: "fatima@example.com",    phone: "08012345603", role: "user",       status: "active"   as const, createdAt: "2024-08-22T08:00:00Z", completedSchedule:  5  },
  { id: 4,  name: "Chukwudi Eze",      email: "chukwudi@example.com",  phone: "08012345604", role: "user",       status: "inactive" as const, createdAt: "2024-04-10T08:00:00Z", completedSchedule: 23  },
  { id: 5,  name: "Ngozi Ibe",         email: "ngozi@example.com",     phone: "08012345605", role: "aggregator", status: "active"   as const, createdAt: "2023-11-05T08:00:00Z", completedSchedule: 154 },
  { id: 6,  name: "Bola Adeyemi",      email: "bola@example.com",      phone: "08012345606", role: "user",       status: "active"   as const, createdAt: "2024-09-18T08:00:00Z", completedSchedule:  8  },
  { id: 7,  name: "Musa Yusuf",        email: "musa@example.com",      phone: "08012345607", role: "admin",      status: "active"   as const, createdAt: "2023-01-01T08:00:00Z", completedSchedule:  0  },
  { id: 8,  name: "Chioma Nwoye",      email: "chioma@example.com",    phone: "08012345608", role: "user",       status: "active"   as const, createdAt: "2024-07-30T08:00:00Z", completedSchedule: 31  },
  { id: 9,  name: "Segun Lawal",       email: "segun@example.com",     phone: "08012345609", role: "user",       status: "inactive" as const, createdAt: "2024-05-12T08:00:00Z", completedSchedule: 17  },
  { id: 10, name: "Ifeoma Obiora",     email: "ifeoma@example.com",    phone: "08012345610", role: "aggregator", status: "active"   as const, createdAt: "2023-08-25T08:00:00Z", completedSchedule: 243 },
  { id: 11, name: "Tunde Bakare",      email: "tunde@example.com",     phone: "08012345611", role: "user",       status: "active"   as const, createdAt: "2025-01-14T08:00:00Z", completedSchedule:  3  },
  { id: 12, name: "Amina Garba",       email: "amina@example.com",     phone: "08012345612", role: "user",       status: "active"   as const, createdAt: "2024-10-02T08:00:00Z", completedSchedule: 19  },
  { id: 13, name: "Sunday Effiong",    email: "sunday@example.com",    phone: "08012345613", role: "aggregator", status: "active"   as const, createdAt: "2024-02-17T08:00:00Z", completedSchedule: 92  },
  { id: 14, name: "Yemi Adesanya",     email: "yemi@example.com",      phone: "08012345614", role: "user",       status: "active"   as const, createdAt: "2025-01-28T08:00:00Z", completedSchedule:  6  },
  { id: 15, name: "Obiageli Onu",      email: "obiageli@example.com",  phone: "08012345615", role: "user",       status: "active"   as const, createdAt: "2024-11-09T08:00:00Z", completedSchedule: 11  },
];
