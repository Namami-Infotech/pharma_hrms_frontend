/**
 * SAFEGUARD HRMS - Centralized Frontend API Endpoints
 * Automatically selects Local vs Live backend based on environment:
 * - Local: http://localhost:5000/SAFEGUARD/api
 * - Live:  https://namami-infotech.com/pharma-hrms/api
 */

const isLocal =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' ||
   window.location.hostname === '127.0.0.1');

export const BASE_URL = isLocal
  ? 'http://localhost:5000/SAFEGUARD/api'
  : 'https://namami-infotech.com/pharma-hrms/api';

// 1. Authentication Module
export const AUTH_API = {
  LOGIN: `${BASE_URL}/auth/login.php`,
  NEW_LOGIN_OTP: `${BASE_URL}/auth/new_login.php`,
  VERIFY_OTP: `${BASE_URL}/auth/otp.php`,
  CHANGE_PASSWORD: `${BASE_URL}/auth/change_password.php`,
  FORGET_PASSWORD: `${BASE_URL}/auth/forget_password.php`,
  MANAGE_DEVICES: `${BASE_URL}/auth/devices.php`,
  GET_OFFICE_DETAILS: `${BASE_URL}/auth/get_office_details.php`,
  GET_MENU_BY_TENANT: `${BASE_URL}/auth/get_menu_by_tenent.php`,
};

// 2. Employee Management Module
export const EMPLOYEE_API = {
  ADD_EMPLOYEE: `${BASE_URL}/employee/add_employee`,
  EDIT_EMPLOYEE: `${BASE_URL}/employee/edit_employee`,
  LIST_EMPLOYEES: `${BASE_URL}/employee/list_employee`,
  VIEW_EMPLOYEE: `${BASE_URL}/employee/view_employee`,
  DISABLE_EMPLOYEE: `${BASE_URL}/employee/disable_employee`,
  ADD_OFFICE: `${BASE_URL}/employee/add_office`,
  GET_OFFICE: `${BASE_URL}/employee/get_office`,
  UPLOAD_IMAGE: `${BASE_URL}/employee/upload_employee_image`,
};

// 3. Attendance Module
export const ATTENDANCE_API = {
  MARK_ATTENDANCE: `${BASE_URL}/attendance/mark_attendance`,
  MARK_ATTENDANCE_V2: `${BASE_URL}/attendance/mark_attendance1`,
  MOBILE_ATTENDANCE: `${BASE_URL}/attendance/mobile_attendance`,
  MARK_MANUAL: `${BASE_URL}/attendance/mark_manual_attendance`,
  GET_RAW_ATTENDANCE: `${BASE_URL}/attendance/get_attendance`,
  GET_TODAY_ATTENDANCE: `${BASE_URL}/attendance/get_today_attendance`,
  VIEW_ATTENDANCE: `${BASE_URL}/attendance/view_attendance`,
  PROCESS_ATTENDANCE: `${BASE_URL}/attendance/attendance`,
  APPLY_REGULARISE: `${BASE_URL}/attendance/regularise`,
  GET_REGULARISE: `${BASE_URL}/attendance/get_regularise`,
  UPDATE_REGULARISE: `${BASE_URL}/attendance/update_regularise`,
  CORRECT_ACTIVITY: `${BASE_URL}/attendance/correct_activity`,
};

// 4. Leave Management Module
export const LEAVE_API = {
  APPLY_LEAVE: `${BASE_URL}/leave/apply_leave`,
  BALANCE_LEAVE: `${BASE_URL}/leave/balance_leave`,
  GET_LEAVES: `${BASE_URL}/leave/get_leave`,
  APPROVE_LEAVE: `${BASE_URL}/leave/approve_leave`,
  ADD_COMP_OFF: `${BASE_URL}/leave/add_comp_off`,
  ADD_PL: `${BASE_URL}/leave/add_pl`,
};

// 5. Assets Module
export const ASSET_API = {
  ADD_ASSET: `${BASE_URL}/assets/add_asset`,
  GET_ASSETS: `${BASE_URL}/assets/get_asset`,
  ISSUE_ASSET: `${BASE_URL}/assets/issue_asset`,
  GET_ISSUED_ASSETS: `${BASE_URL}/assets/get_issue_asset`,
  UPDATE_STATUS: `${BASE_URL}/assets/update_asset_status`,
};

// 6. Expenses Module
export const EXPENSE_API = {
  APPLY_EXPENSE: `${BASE_URL}/expense/apply_expense`,
  GET_EXPENSES: `${BASE_URL}/expense/get_expense`,
  UPDATE_EXPENSE: `${BASE_URL}/expense/update_expense`,
};

// 7. Travel Management Module
export const TRAVEL_API = {
  APPLY_TRAVEL: `${BASE_URL}/travel/apply_travel`,
  GET_TRAVEL: `${BASE_URL}/travel/get_travel`,
  UPDATE_STATUS: `${BASE_URL}/travel/update_status`,
};

// 8. Field Visits Module
export const VISIT_API = {
  MARK_VISIT: `${BASE_URL}/visit/mark_visit`,
  GET_VISITS_ENTRY: `${BASE_URL}/visit/get_visits_entry`,
  GET_PLANNED_VISITS: `${BASE_URL}/visit/plan`,
  GET_PLAN_VISIT_EMPLOYEE: `${BASE_URL}/visit/plan_visit`,
  VIEW_ONE_VISIT: `${BASE_URL}/visit/view_one_visit`,
  VIEW_VISIT: `${BASE_URL}/visit/view_visit`,
  PROCESS_VISITS_ENTRY: `${BASE_URL}/visit/visits_entry`,
};

// 9. Payroll / Salary Module
export const SALARY_API = {
  ADD_SALARY: `${BASE_URL}/salary/add_salary`,
  CALCULATE_SALARY: `${BASE_URL}/salary/calculate_salary`,
  GET_SALARY: `${BASE_URL}/salary/get_salary`,
  GET_SALARY_RECORDS: `${BASE_URL}/salary/salary_records`,
  GET_SALARY_SLIP: `${BASE_URL}/salary/salary_slip`,
};

// 10. Task Management Module
export const TASK_API = {
  GET_TASKS: `${BASE_URL}/task/get_task`,
  TASK_ACTION: `${BASE_URL}/task/task_action`,
};

// 11. Holiday Calendar Module
export const HOLIDAY_API = {
  ADD_HOLIDAY: `${BASE_URL}/holiday/add_holiday`,
  EDIT_HOLIDAY: `${BASE_URL}/holiday/edit_holiday`,
  VIEW_HOLIDAYS: `${BASE_URL}/holiday/view_holiday`,
};

// 12. Invoices Module
export const INVOICE_API = {
  GET_INVOICES: `${BASE_URL}/invoices/get_invoices`,
  UPDATE_INVOICE: `${BASE_URL}/invoices/update_invoice`,
};

// 13. Push Notifications Module
export const NOTIFICATION_API = {
  ADD_NOTIFICATION: `${BASE_URL}/notification/add_notification`,
  GET_NOTIFICATIONS: `${BASE_URL}/notification/get_notification`,
};

// 14. Organization Policy Module
export const POLICY_API = {
  ADD_POLICY: `${BASE_URL}/policy/add_policy`,
  DISABLE_POLICY: `${BASE_URL}/policy/disable_policy`,
  UPLOAD_POLICY: `${BASE_URL}/policy/upload_policy`,
  VIEW_POLICY: `${BASE_URL}/policy/view_policy`,
};

// 15. Support & Helpdesk Module
export const SUPPORT_API = {
  GET_SUPPORT: `${BASE_URL}/support/get_support`,
  GET_TICKET: `${BASE_URL}/support/get_ticket`,
};

// 16. Live Tracking Module
export const TRACK_API = {
  ADD_LOCATION: `${BASE_URL}/track/add_location`,
  GET_ADDRESS: `${BASE_URL}/track/address`,
  GET_LOCATION: `${BASE_URL}/track/get_location`,
};

// 17. Dashboard & Stats Module
export const DASHBOARD_API = {
  GET_DASHBOARD: `${BASE_URL}/dashboard/dashboard`,
};

// 18. Dynamic Menus & Checkpoints Module
export const MENU_API = {
  ADD_CHECKPOINTS: `${BASE_URL}/menu/add_checkpoints`,
  ADD_MENUS: `${BASE_URL}/menu/add_menus`,
  ADD_TRANSACTION: `${BASE_URL}/menu/add_transaction`,
  GET_CHECKPOINTS: `${BASE_URL}/menu/get_checkpoints`,
  GET_MENU: `${BASE_URL}/menu/get_menu`,
  GET_TRANSACTION: `${BASE_URL}/menu/get_transaction`,
  GET_TYPES: `${BASE_URL}/menu/get_types`,
  GET_TYPE_EXT: `${BASE_URL}/menu/get_type_ext`,
};

// 19. Dealer Management Module
export const DEALER_API = {
  ADD_DEALER: `${BASE_URL}/dealer/add_dealers`,
  GET_DEALERS: `${BASE_URL}/dealer/get_dealers`,
};

// 20. Miscellaneous Module
export const MISC_API = {
  SEND_BIRTHDAY_WISHES: `${BASE_URL}/birthday`,
  REQUEST_DEMO: `${BASE_URL}/demo`,
  TEST_DB: `${BASE_URL}/test_db`,
};

// Master Export
export const API_ROUTES = {
  AUTH: AUTH_API,
  EMPLOYEE: EMPLOYEE_API,
  ATTENDANCE: ATTENDANCE_API,
  LEAVE: LEAVE_API,
  ASSET: ASSET_API,
  EXPENSE: EXPENSE_API,
  TRAVEL: TRAVEL_API,
  VISIT: VISIT_API,
  SALARY: SALARY_API,
  TASK: TASK_API,
  HOLIDAY: HOLIDAY_API,
  INVOICE: INVOICE_API,
  NOTIFICATION: NOTIFICATION_API,
  POLICY: POLICY_API,
  SUPPORT: SUPPORT_API,
  TRACK: TRACK_API,
  DASHBOARD: DASHBOARD_API,
  MENU: MENU_API,
  DEALER: DEALER_API,
  MISC: MISC_API,
};

export default API_ROUTES;
