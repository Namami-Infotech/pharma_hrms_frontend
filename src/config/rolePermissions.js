import {
  Dashboard,
  HolidayVillage,
  Policy,
  Notifications,
  Person,
  Business,
  BarChart,
  AccountBalanceWallet,
  AddLocationAlt,
  LocalAirport,
  HowToReg,
  Map,
  SupportAgent,
  Laptop,
  Summarize,
  Payments,
  RequestQuote,
  Medication,
  Receipt as ReceiptIcon,
  EditCalendar as EditCalendarIcon,
} from "@mui/icons-material";

// ============================================================================
// 1. ALL AVAILABLE NAVIGATION ITEMS
// ============================================================================
export const ALL_NAV_ITEMS = [
  { path: "/dashboard", name: "Dashboard", icon: <Dashboard />, category: "Main" },
  { path: "/notification", name: "Notifications", icon: <Notifications />, category: "Main", hasNotification: true },
  { path: "/employees", name: "Employees", icon: <Person />, category: "HR" },
  { path: "/offices", name: "Offices", icon: <Business />, category: "HR" },
  { path: "/attendance", name: "Attendance", icon: <BarChart />, category: "Analytics" },
  { path: "/manual-attendance", name: "Manual Attendance", icon: <EditCalendarIcon />, category: "Analytics" },
  { path: "/regularise", name: "Regularise", icon: <HowToReg />, category: "HR" },
  { path: "/leave", name: "Leave", icon: <Person />, category: "HR" },
  { path: "/holiday", name: "Holiday", icon: <HolidayVillage />, category: "HR" },
  { path: "/salary", name: "Salary", icon: <Payments />, category: "Finance" },
  { path: "/expense", name: "Expense", icon: <AccountBalanceWallet />, category: "Finance" },
  { path: "/invoices", name: "Invoices", icon: <ReceiptIcon />, category: "Finance" },
  { path: "/quotation", name: "Quotation", icon: <RequestQuote />, category: "Finance" },
  { path: "/products", name: "Products", icon: <Medication />, category: "Finance" },
  { path: "/travel", name: "Travel", icon: <LocalAirport />, category: "Travel" },
  { path: "/visit", name: "Visit", icon: <AddLocationAlt />, category: "Field" },
  { path: "/maps", name: "Maps", icon: <Map />, category: "Field" },
  { path: "/registration", name: "Leads", icon: <HowToReg />, category: "Sales" },
  { path: "/assets", name: "Assets", icon: <Laptop />, category: "IT" },
  { path: "/policy", name: "Policy", icon: <Policy />, category: "Compliance" },
  { path: "/tickets", name: "Tickets", icon: <SupportAgent />, category: "Support" },
  { path: "/docket", name: "Docket", icon: <HowToReg />, category: "Operations" },
  { path: "/report", name: "Reports", icon: <Summarize />, category: "Analytics" },
];

// ============================================================================
// 2. DYNAMIC MODULES BY ID (Maps 1-20 module IDs directly from tenent.Menu in DB)
// ============================================================================
export const MODULES_BY_ID = {
  1: { id: 1, path: "/attendance", name: "Attendance", icon: <BarChart />, category: "Analytics" },
  2: { id: 2, path: "/leave", name: "Leave", icon: <Person />, category: "HR" },
  3: { id: 3, path: "/expense", name: "Expense", icon: <AccountBalanceWallet />, category: "Finance" },
  4: { id: 4, path: "/registration", name: "Leads", icon: <HowToReg />, category: "Sales" },
  5: { id: 5, path: "/visit", name: "Visit", icon: <AddLocationAlt />, category: "Field" },
  6: { id: 6, path: "/travel", name: "Travel", icon: <LocalAirport />, category: "Travel" },
  7: { id: 7, path: "/invoices", name: "Invoices", icon: <ReceiptIcon />, category: "Finance" },
  8: { id: 8, path: "/policy", name: "Policy", icon: <Policy />, category: "Compliance" },
  9: { id: 9, path: "/holiday", name: "Holiday", icon: <HolidayVillage />, category: "HR" },
  10: { id: 10, path: "/tickets", name: "Tickets", icon: <SupportAgent />, category: "Support" },
  11: { id: 11, path: "/assets", name: "Assets", icon: <Laptop />, category: "IT" },
  12: { id: 12, path: "/employees", name: "Employees", icon: <Person />, category: "HR" },
  13: { id: 13, path: "/offices", name: "Offices", icon: <Business />, category: "HR" },
  14: { id: 14, path: "/salary", name: "Salary", icon: <Payments />, category: "Finance" },
  15: { id: 15, path: "/docket", name: "Docket", icon: <HowToReg />, category: "Operations" },
  16: { id: 16, path: "/manual-attendance", name: "Manual Attendance", icon: <EditCalendarIcon />, category: "Analytics" },
  17: { id: 17, path: "/regularise", name: "Regularise", icon: <HowToReg />, category: "HR" },
  18: { id: 18, path: "/quotation", name: "Quotation", icon: <RequestQuote />, category: "Finance" },
  19: { id: 19, path: "/products", name: "Products", icon: <Medication />, category: "Finance" },
  20: { id: 20, path: "/report", name: "Reports", icon: <Summarize />, category: "Analytics" },
  21: { id: 21, path: "/dashboard", name: "Dashboard", icon: <Dashboard />, category: "Main" },
  22: { id: 22, path: "/notification", name: "Notifications", icon: <Notifications />, category: "Main", hasNotification: true },
  23: { id: 23, path: "/maps", name: "Maps", icon: <Map />, category: "Field" },
};

export const MODULE_ID_TO_PATH = Object.fromEntries(
  Object.entries(MODULES_BY_ID).map(([id, mod]) => [id, mod.path])
);

// ============================================================================
// 2. CENTRAL ROLE PERMISSIONS OBJECT (EDIT ALL ROLES HERE IN ONE PLACE)
// ============================================================================
// To change menus for any role or add a new role, simply edit this object!
export const ROLE_PERMISSIONS = {
  // --- ADMIN: Complete System Access ---
  Admin: [
    "/dashboard",
    "/employees",
    "/offices",
    "/attendance",
    "/manual-attendance",
    "/regularise",
    "/leave",
    "/holiday",
    "/salary",
    "/expense",
    "/invoices",
    "/quotation",
    "/products",
    "/travel",
    "/visit",
    "/maps",
    "/registration",
    "/assets",
    "/policy",
    "/tickets",
    "/docket",
    "/report",
    "/notification",
  ],

  // --- HR: Human Resources & Administrative Access ---
  HR: [
    "/dashboard",
    "/employees",
    "/offices",
    "/attendance",
    "/manual-attendance",
    "/regularise",
    "/leave",
    "/holiday",
    "/salary",
    "/expense",
    "/assets",
    "/tickets",
    "/registration",
    "/policy",
    "/report",
    "/invoices",
    "/quotation",
    "/products",
    "/notification",
  ],

  // --- MANAGER: Team Supervision & Operational Access ---
  Manager: [
    "/dashboard",
    "/attendance",
    "/regularise",
    "/leave",
    "/holiday",
    "/salary",
    "/expense",
    "/quotation",
    "/products",
    "/travel",
    "/visit",
    "/maps",
    "/policy",
    "/notification",
  ],

  // --- SALES: Field & Business Development Access ---
  Sales: [
    "/dashboard",
    "/registration",
    "/visit",
    "/maps",
    "/salary",
    "/expense",
    "/quotation",
    "/products",
    "/travel",
    "/attendance",
    "/leave",
    "/holiday",
    "/policy",
    "/notification",
  ],

  // --- EMPLOYEE: General Employee Self-Service Access ---
  Employee: [
    "/dashboard",
    "/attendance",
    "/leave",
    "/salary",
    "/expense",
    "/travel",
    "/holiday",
    "/policy",
    "/tickets",
    "/notification",
  ],

  // --- DEFAULT FALLBACK: For any new or unspecified role ---
  default: [
    "/dashboard",
    "/attendance",
    "/leave",
    "/holiday",
    "/policy",
    "/notification",
  ],
};
