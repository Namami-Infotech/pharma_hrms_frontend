"use client";
import { BASE_URL } from "../../api/endpoints";

import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Typography,
  Box,
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
  Alert,
  CircularProgress,
  Stack,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { GetApp, Schedule } from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import axios from "axios";
import { saveAs } from "file-saver";
import { useAuth } from "../auth/AuthContext";

const AttendanceReport = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [leaveData, setLeaveData] = useState([]);
  const [salaryData, setSalaryData] = useState([]);
  const [holidayData, setHolidayData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Extract month and year from selectedDate
  const month = selectedDate.getMonth() + 1;
  const year = selectedDate.getFullYear();

  const monthNames = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
  ];

  // Memoized constants
  const NORMAL_SHIFT_HOURS = useMemo(() => 9, []);
  const OT_THRESHOLD_HOURS = useMemo(() => 10, []); // OT starts after 10 hours

  // Filter active employees - only where IsActive === 1
  const filterActiveEmployees = useCallback((employees) => {
    return employees.filter((employee) => {
      const isActive = employee.IsActive || employee.isActive;
      return isActive === 1 || isActive === "1";
    });
  }, []);

  // Check if employee grade starts with S (S1, S2, S3, etc.) - for Sunday double pay
  const isSGrade = useCallback((grade) => {
    if (!grade) return false;
    const gradeStr = String(grade).trim().toUpperCase();

    // Explicitly check for S1 through S8 only
    const sCadreGrades = ["S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8"];
    return sCadreGrades.includes(gradeStr);
  }, []);

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const [employeesRes, attendanceRes, leaveRes, salaryRes, holidayRes] =
          await Promise.allSettled([
            axios.get(
              `${BASE_URL}/employee/list_employee.php?Tenent_Id=${user.tenent_id}`,
            ),
            axios.get(
              `${BASE_URL}/attendance/get_attendance.php`,
            ),
            axios.get(
              `${BASE_URL}/leave/get_leave.php?role=HR`,
            ),
            axios.get(
              `${BASE_URL}/salary/get_salary.php`,
            ),
            axios.get(
              `${BASE_URL}/holiday/view_holiday.php?Tenent_Id=${user.tenent_id}`,
            ),
          ]);

        if (
          employeesRes.status === "fulfilled" &&
          employeesRes.value.data.success
        ) {
          const allEmployees = employeesRes.value.data.data || [];
          const activeEmployees = filterActiveEmployees(allEmployees);
          setEmployees(activeEmployees);
        }

        if (
          attendanceRes.status === "fulfilled" &&
          attendanceRes.value.data.success
        ) {
          setAttendance(attendanceRes.value.data.data || []);
        }

        if (leaveRes.status === "fulfilled" && leaveRes.value.data.success) {
          setLeaveData(leaveRes.value.data.data || []);
        }

        if (salaryRes.status === "fulfilled" && salaryRes.value.data.success) {
          setSalaryData(salaryRes.value.data.data || []);
        }

        if (
          holidayRes.status === "fulfilled" &&
          holidayRes.value.data.success
        ) {
          setHolidayData(holidayRes.value.data.data || []);
        }

        const errors = [];
        if (employeesRes.status === "rejected") errors.push("Employees");
        if (attendanceRes.status === "rejected") errors.push("Attendance");
        if (leaveRes.status === "rejected") errors.push("Leave");
        if (salaryRes.status === "rejected") errors.push("Salary");
        if (holidayRes.status === "rejected") errors.push("Holiday");

        if (errors.length > 0) {
          setError(
            `Failed to load: ${errors.join(", ")}. Some data may be incomplete.`,
          );
        }
      } catch (error) {
        console.error("Error in fetch:", error);
        setError("Failed to initialize data. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user.tenent_id, filterActiveEmployees]);

  // Helper functions
  const getDaysInMonth = useCallback((month, year) => {
    return new Date(year, month, 0).getDate();
  }, []);

  const isSunday = useCallback((dateString) => {
    const date = new Date(dateString);
    return date.getDay() === 0;
  }, []);

  // Check if a date is a holiday
  const isHoliday = useCallback(
    (dateString) => {
      if (!holidayData || holidayData.length === 0) return false;

      const holiday = holidayData.find((h) => h.date === dateString);
      return holiday ? holiday.title : false;
    },
    [holidayData],
  );

  const formatHoursToHoursMinutes = useCallback((decimalHours) => {
    if (!decimalHours || decimalHours === 0) return "0 Hr 0 Min";
    const hours = Math.floor(decimalHours);
    const minutes = Math.round((decimalHours - hours) * 60);
    return `${hours} Hr ${minutes} Min`;
  }, []);

  // Updated OT calculation to start after 10 hours (1 hour buffer)
  const calculateOTHours = useCallback(
    (inTime, outTime) => {
      if (
        !inTime ||
        !outTime ||
        inTime === "0000-00-00 00:00:00" ||
        outTime === "0000-00-00 00:00:00"
      ) {
        return 0;
      }

      try {
        const inDate = new Date(inTime);
        const outDate = new Date(outTime);

        if (isNaN(inDate.getTime()) || isNaN(outDate.getTime())) return 0;

        const totalWorkedHours = (outDate - inDate) / (1000 * 60 * 60);

        // OT only counted after 10 hours (9 hours normal + 1 hour buffer)
        // So if someone works 11 hours, OT = 1 hour (11 - 10)
        const otHours = Math.max(0, totalWorkedHours - OT_THRESHOLD_HOURS);

        return Math.round(otHours * 100) / 100;
      } catch {
        return 0;
      }
    },
    [OT_THRESHOLD_HOURS],
  );

  // Get normalized employee ID for matching
  const normalizeEmpId = useCallback((empId) => {
    if (!empId) return "";
    const strId = String(empId).trim();
    const cleanId = strId.replace(/^SGI/i, "");
    return cleanId.padStart(4, "0");
  }, []);

  // Find attendance records for employee on specific date
  const getAttendanceRecords = useCallback(
    (employeeId, date) => {
      if (!employeeId || !date) return [];

      const normalizedEmpId = normalizeEmpId(employeeId);

      return attendance.filter((record) => {
        const recordEmpId = normalizeEmpId(record.EmpId || record.empId);
        const recordDate = record.InTime
          ? record.InTime.split(" ")[0]
          : record.attendance_date
            ? record.attendance_date.split(" ")[0]
            : record.Date
              ? record.Date.split(" ")[0]
              : "";

        return recordEmpId === normalizedEmpId && recordDate === date;
      });
    },
    [attendance, normalizeEmpId],
  );

  // Find leave records for employee on specific date
  const getLeaveForDate = useCallback(
    (employeeId, date) => {
      if (!employeeId || !date) return null;

      const normalizedEmpId = normalizeEmpId(employeeId);
      const targetDate = new Date(date);
      targetDate.setHours(0, 0, 0, 0); // Reset time part for accurate date comparison

      const leave = leaveData.find((record) => {
        const leaveEmpId = normalizeEmpId(record.EmpId || record.empId);

        // Parse dates and set to start of day for comparison
        const startDate = new Date(record.StartDate || record.startDate);
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(record.EndDate || record.endDate);
        endDate.setHours(23, 59, 59, 999); // End of day

        return (
          leaveEmpId === normalizedEmpId &&
          record.Status === "Approved" && // Only count approved leaves
          targetDate >= startDate &&
          targetDate <= endDate
        );
      });

      if (!leave) return null;

      // Map the category to the required format
      const category = leave.Category || leave.category || "";

      // Handle different category formats
      switch (category) {
        case "HalfDay":
        case "HD":
        case "HALF DAY":
        case "Half Day":
          return "HD";

        case "LWP":
        case "Leave Without Pay":
        case "LWOP":
          return "LWP";

        case "CL":
        case "Casual Leave":
          return "CL";

        case "SL":
        case "Sick Leave":
          return "SL";

        default:
          return category; // Return as is if it matches expected format
      }
    },
    [leaveData, normalizeEmpId],
  );

  // Get salary for employee
  const getEmployeeSalary = useCallback(
    (employeeId) => {
      if (!employeeId) return null;

      const normalizedEmpId = normalizeEmpId(employeeId);
      const salary = salaryData.find(
        (s) => normalizeEmpId(s.empId || s.EmpId) === normalizedEmpId,
      );

      if (!salary) return null;

      return {
        basic: parseFloat(salary.basic_salary) || 0,
        hra: parseFloat(salary.hra) || 0,
        conveyance: parseFloat(salary.conveyance) || 0,
        specialAllowance: parseFloat(salary.special_allowance) || 0,
        epf: parseFloat(salary.epf) || 0,
        esi: parseFloat(salary.esi) || 0,
        netTakeHome: parseFloat(salary.net_take_home) || 0,
      };
    },
    [salaryData, normalizeEmpId],
  );

  // Calculate attendance status for a day
  const getDayStatus = useCallback(
    (employeeId, date) => {
      // First check for holiday - if it's a holiday, mark as "P" with holiday title
      const holidayTitle = isHoliday(date);
      if (holidayTitle) {
        return "WO"; // Holiday counts as Weekly Off
      }

      // Then check for leave (including HalfDay and LWP)
      const leaveType = getLeaveForDate(employeeId, date);

      if (leaveType) {
        // If it's a half day, check if there's attendance for the remaining half
        if (leaveType === "HD") {
          const records = getAttendanceRecords(employeeId, date);
          if (records.length > 0) {
            return "HD"; // Half day with attendance for remaining half
          } else {
            return "HD"; // Still half day even if no attendance (full day half day leave)
          }
        }

        // Return the leave type (CL, SL, HD, LWP)
        return leaveType;
      }

      const records = getAttendanceRecords(employeeId, date);

      // Sunday handling
      if (isSunday(date)) {
        return records.length > 0 ? "P" : "WO";
      }

      // No records = Absent
      if (records.length === 0) return "A";

      const record = records[0];
      const inTime = record.InTime || record.in_time;
      const outTime = record.OutTime || record.out_time;

      if (inTime && inTime !== "0000-00-00 00:00:00") {
        const hasOutTime = outTime && outTime !== "0000-00-00 00:00:00";
        return hasOutTime ? "P" : "HD";
      }

      return "A";
    },
    [getLeaveForDate, getAttendanceRecords, isSunday, isHoliday],
  );

  // Calculate OT for a day
  const getDayOT = useCallback(
    (employeeId, date) => {
      // No OT on holidays
      if (isHoliday(date)) {
        return 0;
      }

      const records = getAttendanceRecords(employeeId, date);
      if (records.length === 0) return 0;

      const record = records[0];
      const inTime = record.InTime || record.in_time;
      const outTime = record.OutTime || record.out_time;

      if (
        !inTime ||
        !outTime ||
        inTime === "0000-00-00 00:00:00" ||
        outTime === "0000-00-00 00:00:00"
      ) {
        return 0;
      }

      return calculateOTHours(inTime, outTime);
    },
    [getAttendanceRecords, calculateOTHours, isHoliday],
  );

  // In calculateEmployeeSummary function
  const calculateEmployeeSummary = useCallback(
    (employeeId, employeeGrade) => {
      const currentMonth = month;
      const daysInMonth = getDaysInMonth(currentMonth, year);
      const isSGradeEmp = isSGrade(employeeGrade); // Now only true for S1-S8

      let presentCount = 0;
      let absentCount = 0;
      let weeklyOffCount = 0;
      let halfDayCount = 0;
      let clCount = 0;
      let slCount = 0;
      let lwpCount = 0;
      let sundayWorkingCount = 0;
      let holidayCount = 0;
      let totalOTHours = 0;

      for (let day = 1; day <= daysInMonth; day++) {
        const date = `${year}-${String(currentMonth).padStart(2, "0")}-${String(
          day,
        ).padStart(2, "0")}`;
        const status = getDayStatus(employeeId, date);
        const otHours = getDayOT(employeeId, date);

        totalOTHours += otHours;

        // Count holidays separately
        if (isHoliday(date)) {
          holidayCount++;
        }

        switch (status) {
          case "P":
            presentCount++;
            if (isSunday(date)) {
              sundayWorkingCount++;
            }
            break;
          case "A":
            absentCount++;
            break;
          case "WO":
            weeklyOffCount++;
            break;
          case "HD":
            halfDayCount++;
            break;
          case "CL":
            clCount++;
            break;
          case "SL":
            slCount++;
            break;
          case "LWP":
            lwpCount++;
            break;
          default:
            break;
        }
      }

      // Calculate effective present days
      let effectivePresentDays;

      if (isSGradeEmp) {
        // FOR S1-S8 CADRE EMPLOYEES ONLY: Sunday working counts as DOUBLE
        console.log(
          `S Cadre Employee (${employeeGrade}): Applying DOUBLE pay for ${sundayWorkingCount} Sunday working days`,
        );

        // Regular present days (excluding Sundays worked)
        const regularPresentDays = presentCount - sundayWorkingCount;

        // Sunday working counts as 2 days each (DOUBLE)
        const sundayDoubleDays = sundayWorkingCount * 2;

        effectivePresentDays =
          regularPresentDays + // Regular weekdays present
          sundayDoubleDays + // Sunday working counted as DOUBLE
          halfDayCount * 0.5 + // Half days count as 0.5
          clCount + // Casual leaves count as full day
          slCount + // Sick leaves count as full day
          weeklyOffCount + // Weekly offs count as full day
          holidayCount; // Holidays count as full day (Present)

        console.log(
          `Regular Present: ${regularPresentDays}, Sunday Double: ${sundayDoubleDays}, Holidays: ${holidayCount}, Total: ${effectivePresentDays}`,
        );
      } else {
        // FOR NON S1-S8 EMPLOYEES: Regular calculation (Sunday working counts as 1 day)
        effectivePresentDays =
          presentCount + // All present days (including Sundays as 1 day)
          halfDayCount * 0.5 + // Half days count as 0.5
          clCount + // Casual leaves count as full day
          slCount + // Sick leaves count as full day
          weeklyOffCount + // Weekly offs count as full day
          holidayCount; // Holidays count as full day (Present)
      }

      // Total days for EMP (P + CL + SL + Holiday)
      const totalDaysForEmp = presentCount + clCount + slCount + holidayCount;

      return {
        presentCount,
        absentCount,
        weeklyOffCount,
        halfDayCount,
        clCount,
        slCount,
        lwpCount,
        sundayWorkingCount,
        holidayCount,
        totalOTHours,
        totalOTFormatted: formatHoursToHoursMinutes(totalOTHours),
        effectivePresentDays,
        totalDaysForEmp,
        totalDays: daysInMonth,
        isSGradeEmp,
        // Add breakdown for clarity
        breakdown: isSGradeEmp
          ? {
              regularPresentDays: presentCount - sundayWorkingCount,
              sundayDoubleDays: sundayWorkingCount * 2,
              halfDayEquivalent: halfDayCount * 0.5,
              leavesTotal: clCount + slCount,
              weeklyOffTotal: weeklyOffCount,
              holidayTotal: holidayCount,
            }
          : null,
      };
    },
    [
      month,
      year,
      getDaysInMonth,
      getDayStatus,
      getDayOT,
      isSunday,
      formatHoursToHoursMinutes,
      isSGrade,
      isHoliday,
    ],
  );

  // Calculate salary for employee
  const calculateEmployeeSalary = useCallback(
    (employeeId, summary) => {
      const salary = getEmployeeSalary(employeeId);
      if (!salary) {
        return {
          basic: 0,
          hra: 0,
          conveyance: 0,
          specialAllowance: 0,
          netSalary: 0,
          otWages: 0,
        };
      }

      const currentMonth = month;
      const daysInMonth = getDaysInMonth(currentMonth, year);

      // Formula: salary/days in month * total working days (effectivePresentDays)
      const workingDaysRatio = summary.effectivePresentDays / daysInMonth;

      // Calculate pro-rated salary based on days in month ratio
      const calculatedBasic = Math.round(salary.basic * workingDaysRatio);
      const calculatedHRA = Math.round(salary.hra * workingDaysRatio);
      const calculatedConveyance = Math.round(
        salary.conveyance * workingDaysRatio,
      );
      const calculatedSpecialAllowance = Math.round(
        salary.specialAllowance * workingDaysRatio,
      );

      // OT calculation - using updated OT hours
      const workingDays = daysInMonth - summary.weeklyOffCount;
      const totalMonthlySalary =
        salary.basic + salary.hra + salary.conveyance + salary.specialAllowance;
      const otRatePerHour =
        workingDays > 0 ? totalMonthlySalary / (workingDays * 8) : 0;
      const otWages =
        summary.totalOTHours > 0
          ? Math.round(summary.totalOTHours * otRatePerHour * 1.25)
          : 0;

      // Total salary with OT
      const totalGross =
        calculatedBasic +
        calculatedHRA +
        calculatedConveyance +
        calculatedSpecialAllowance +
        otWages;

      const deductions = salary.epf + salary.esi;
      const netSalary = Math.max(0, Math.round(totalGross - deductions));

      return {
        basic: calculatedBasic,
        hra: calculatedHRA,
        conveyance: calculatedConveyance,
        specialAllowance: calculatedSpecialAllowance,
        netSalary,
        otWages,
        totalGross, // Add this if needed
      };
    },
    [month, year, getDaysInMonth, getEmployeeSalary],
  );

  // Export to CSV
  const exportToCSV = async () => {
    if (!month) {
      alert("Please select a month");
      return;
    }

    setExporting(true);
    setError("");

    try {
      const currentMonth = month;
      const daysInMonth = getDaysInMonth(currentMonth, year);
      const monthName = monthNames[currentMonth - 1];

      // Create header - TWO columns per date (Status and INCE)
      const header = [
        "S.R NO.",
        "UAN",
        "ESI",
        "Emp. Code",
        "Name of Emp.",
        "Father Name",
        "Designation",
        "CADRE",
        "OfficeName",
        "DOJ",
      ];

      // Add TWO columns per day - Status and INCE
      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(currentMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        header.push(dateStr); // Status column
        header.push("INCE."); // INCE column
      }

      // Add summary columns with actual salary breakdown
      const summaryColumns = [
        "P",
        "HD",
        "NT",
        "CL",
        "SL",
        "LWP",
        "GH",
        "PWO",
        "WO",
        "C-OFF",
        "ABSENT",
        "WI",
        "TOTAL DAYS",
        "HOLIDAYS",
        "SUN WORKING (DOUBLE)",
        "WORKING DAY OT (EXTRA HOURS WORKING@1.25)",
        "WORKING DAY OT (EXTRA HOURS WORKING@1.25)",
        "(Inc1DM+Inc2 DN)@1.25",
        "TOTAL DAYS FOR EMP",
        "OT WAGES",
        // Actual Salary Breakdown
        "ACTUAL BASIC",
        "ACTUAL HRA",
        "ACTUAL CONVEYANCE",
        "ACTUAL SPECIAL ALLOWANCE",
        "ACTUAL TOTAL",
        "ACTUAL EPF",
        "ACTUAL ESI",
        "ACTUAL NET TAKE HOME",
        // Calculated Salary Breakdown (Pro-rated)
        "CALC BASIC",
        "CALC HRA",
        "CALC CONVEYANCE",
        "CALC SPECIAL ALLOWANCE",
        "CALC TOTAL",
        "CALC NET SALARY",
      ];

      header.push(...summaryColumns);

      const csvRows = [header];

      // Process ALL active employees
      console.log(`Total active employees: ${employees.length}`);

      // Process employees in batches
      const batchSize = 10;

      for (let i = 0; i < employees.length; i += batchSize) {
        const batch = employees.slice(i, i + batchSize);

        for (let j = 0; j < batch.length; j++) {
          const employee = batch[j];
          const employeeGrade = employee.Grade || employee.grade || "";
          const summary = calculateEmployeeSummary(
            employee.EmpId,
            employeeGrade,
          );
          const salary = calculateEmployeeSalary(employee.EmpId, summary);

          // Get actual full salary (before pro-rata calculation)
          const actualSalary = getEmployeeSalary(employee.EmpId);

          // Calculate total actual salary (sum of all components)
          const totalActualSalary = actualSalary
            ? actualSalary.basic +
              actualSalary.hra +
              actualSalary.conveyance +
              actualSalary.specialAllowance
            : 0;

          // Calculate total calculated salary (sum of pro-rated components)
          const totalCalculatedSalary =
            salary.basic +
            salary.hra +
            salary.conveyance +
            salary.specialAllowance;

          // Start row
          const row = [
            (i + j + 1).toString(), // S.R NO.
            employee.UAN || "", // UAN
            employee.ESI || "", // ESI
            employee.EmpId, // Emp. Code
            employee.Name || "", // Name of Emp.
            employee.FatherName || "", // Father Name
            employee.Designation || "", // Designation
            employeeGrade, // CADRE (Grade)
            employee.OfficeName || employee.office_name || "", // OfficeName
            employee.JoinDate ? employee.JoinDate.split("T")[0] : "", // DOJ
          ];

          // Add TWO daily columns per date - Status and INCE
          for (let day = 1; day <= daysInMonth; day++) {
            const date = `${year}-${String(currentMonth).padStart(
              2,
              "0",
            )}-${String(day).padStart(2, "0")}`;
            const status = getDayStatus(employee.EmpId, date);
            const otHours = getDayOT(employee.EmpId, date);

            row.push(status); // Status column
            row.push(otHours > 0 ? formatHoursToHoursMinutes(otHours) : ""); // INCE column
          }

          // Add summary with actual and calculated salary breakdown
          row.push(
            // Attendance summary
            summary.presentCount.toString(), // P
            summary.halfDayCount.toString(), // HD
            "0", // NT
            summary.clCount.toString(), // CL
            summary.slCount.toString(), // SL
            summary.lwpCount.toString(), // LWP
            "0", // GH
            "0", // PWO
            summary.weeklyOffCount.toString(), // WO
            "0", // C-OFF
            summary.absentCount.toString(), // ABSENT
            "0", // WI
            summary.totalDays.toString(), // TOTAL DAYS
            summary.holidayCount.toString(), // HOLIDAYS
            summary.sundayWorkingCount.toString(), // SUN WORKING (DOUBLE)
            summary.totalOTFormatted, // WORKING DAY OT
            summary.totalOTFormatted, // WORKING DAY OT (duplicate)
            formatHoursToHoursMinutes(summary.totalOTHours * 1.25), // (Inc1DM+Inc2 DN)@1.25
            summary.totalDaysForEmp.toString(), // TOTAL DAYS FOR EMP
            salary.otWages.toString(), // OT WAGES

            // Actual Salary Breakdown
            actualSalary?.basic.toString() || "0", // ACTUAL BASIC
            actualSalary?.hra.toString() || "0", // ACTUAL HRA
            actualSalary?.conveyance.toString() || "0", // ACTUAL CONVEYANCE
            actualSalary?.specialAllowance.toString() || "0", // ACTUAL SPECIAL ALLOWANCE
            totalActualSalary.toString(), // ACTUAL TOTAL
            actualSalary?.epf.toString() || "0", // ACTUAL EPF
            actualSalary?.esi.toString() || "0", // ACTUAL ESI
            actualSalary?.netTakeHome.toString() || "0", // ACTUAL NET TAKE HOME

            // Calculated Salary Breakdown (Pro-rated)
            salary.basic.toString(), // CALC BASIC
            salary.hra.toString(), // CALC HRA
            salary.conveyance.toString(), // CALC CONVEYANCE
            salary.specialAllowance.toString(), // CALC SPECIAL ALLOWANCE
            totalCalculatedSalary.toString(), // CALC TOTAL
            salary.netSalary.toString(), // CALC NET SALARY
          );

          csvRows.push(row);
        }

        // Yield to browser to prevent freezing
        await new Promise((resolve) => setTimeout(resolve, 0));
      }

      // Create CSV content
      const csvContent = csvRows
        .map((row) => row.map((field) => `"${field || ""}"`).join(","))
        .join("\n");

      // Create blob and download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      saveAs(blob, `ATTENDANCE_REPORT_${monthName}_${year}.csv`);
    } catch (error) {
      console.error("Export error:", error);
      setError("Failed to generate report. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  // Data statistics
  const stats = useMemo(
    () => ({
      totalEmployees: employees.length,
      attendanceRecords: attendance.length,
      leaveRecords: leaveData.length,
      salaryRecords: salaryData.length,
      holidayRecords: holidayData.length,
      monthName: month ? monthNames[month - 1] : "",
      year,
    }),
    [
      employees,
      attendance,
      leaveData,
      salaryData,
      holidayData,
      month,
      year,
      monthNames,
    ],
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Card sx={{ boxShadow: 3 }}>
        <CardContent>
          <Typography
            variant="h5"
            component="h2"
            sx={{ mb: 3, color: "primary.main", fontWeight: 600 }}
          >
            <Schedule sx={{ mr: 1, verticalAlign: "middle" }} />
            Monthly Attendance Report
          </Typography>

          {/* Controls */}
          <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <DatePicker
                views={["year", "month"]}
                label="Select Month & Year"
                value={selectedDate}
                onChange={(newValue) => setSelectedDate(newValue)}
                renderInput={(params) => (
                  <TextField {...params} size="small" fullWidth />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Stack
                direction={isMobile ? "column" : "row"}
                spacing={2}
                justifyContent="flex-end"
              >
                <Button
                  variant="contained"
                  onClick={exportToCSV}
                  disabled={loading || exporting}
                  sx={{
                    bgcolor: "primary.main",
                    "&:hover": { bgcolor: "primary.dark" },
                    minWidth: 150,
                  }}
                >
                  {exporting ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    <>
                      <GetApp sx={{ mr: 1 }} />
                      Export CSV
                    </>
                  )}
                </Button>
              </Stack>
            </Grid>
          </Grid>

          {/* Stats Card */}
          {/* {month && (
            <Card
              sx={{
                mb: 3,
                bgcolor: "grey.50",
                border: "1px solid",
                borderColor: "grey.200",
              }}
            >
              <CardContent>
                <Typography
                  variant="subtitle1"
                  gutterBottom
                  sx={{ fontWeight: 600 }}
                >
                  {stats.monthName} {stats.year} - All Active Employees
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={2.4}>
                    <Typography variant="body2" color="text.secondary">
                      Active Employees
                    </Typography>
                    <Typography variant="h6">{stats.totalEmployees}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={2.4}>
                    <Typography variant="body2" color="text.secondary">
                      Attendance Records
                    </Typography>
                    <Typography variant="h6">
                      {stats.attendanceRecords}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={2.4}>
                    <Typography variant="body2" color="text.secondary">
                      Leave Records
                    </Typography>
                    <Typography variant="h6">{stats.leaveRecords}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={2.4}>
                    <Typography variant="body2" color="text.secondary">
                      Salary Records
                    </Typography>
                    <Typography variant="h6">{stats.salaryRecords}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={2.4}>
                    <Typography variant="body2" color="text.secondary">
                      Holiday Records
                    </Typography>
                    <Typography variant="h6">{stats.holidayRecords}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )} */}

          {/* Loading State */}
          {loading && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                py: 4,
              }}
            >
              <CircularProgress size={40} sx={{ mr: 2 }} />
              <Typography variant="body1" color="text.secondary">
                Loading employee data...
              </Typography>
            </Box>
          )}

          {/* Error State */}
          {error && (
            <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError("")}>
              {error}
            </Alert>
          )}
        </CardContent>
      </Card>
    </LocalizationProvider>
  );
};

export default AttendanceReport;