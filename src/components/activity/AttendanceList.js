"use client";
import { BASE_URL } from "../../api/endpoints";

import React from "react";
import { useState, useEffect, useMemo } from "react";
import {
  Alert,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  useMediaQuery,
  Autocomplete,
  TextField,
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Grid,
  Divider,
  useTheme,
  Stack,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Badge,
  ButtonBase,
} from "@mui/material";
import {
  Download,
  Settings,
  LocationOn,
  AccessTime,
  CalendarToday,
  Person,
  Schedule,
  TrendingUp,
  Refresh,
  FilterList,
  DateRange,
  Weekend,
  Event,
  BeachAccess,
  Info,
  Today,
  Groups,
  CheckCircle,
  Cancel,
} from "@mui/icons-material";
import LocalPhoneIcon from "@mui/icons-material/LocalPhone";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import {
  format,
  parse,
  startOfWeek,
  getDay,
  isWithinInterval,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  parseISO,
  isToday,
} from "date-fns";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { DatePicker } from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

const locales = {
  "en-US": require("date-fns/locale/en-US"),
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date()),
  getDay,
  locales,
});

// Mock auth context and navigate for demo
const mockUseAuth = () => ({
  user: {
    role: "HR",
    emp_id: "NI003",
    tenent_id: "1",
    shift: "10:00 AM - 7:00 PM",
    name: "Yash Jain",
    weekOff: "Saturday,Sunday",
  },
});

const mockUseNavigate = () => (path) => console.log(`Navigate to: ${path}`);

const generateMapUrl = (geoLocation) => {
  if (!geoLocation || geoLocation === "N/A") {
    return "#";
  }

  const [latitude, longitude] = geoLocation.split(",");

  if (!latitude || !longitude) {
    return "#";
  }

  const lat = Number.parseFloat(latitude);
  const lon = Number.parseFloat(longitude);

  if (isNaN(lat) || isNaN(lon)) {
    return "#";
  }

  return `https://www.google.com/maps/search/?api=1&query=${lat},${lon}&zoom=15&basemap=satellite&markercolor=red`;
};

const AttendanceStatusChip = ({ status, time }) => {
  const getStatusProps = () => {
    switch (status) {
      case "on-time":
        return { color: "success", label: "On Time" };
      case "late":
        return { color: "error", label: "Late" };
      case "early":
        return { color: "info", label: "Early" };
      case "holiday":
        return { color: "warning", label: "Holiday" };
      case "weekoff":
        return { color: "secondary", label: "Week Off" };
      case "leave":
        return { color: "info", label: "Leave" };
      case "present":
        return { color: "success", label: "Present" };
      case "absent":
        return { color: "error", label: "Absent" };
      default:
        return { color: "default", label: "N/A" };
    }
  };

  const { color, label } = getStatusProps();

  return (
    <Chip
      size="small"
      color={color}
      label={`${label} ${time !== "N/A" && time ? `(${time})` : ""}`}
      sx={{ fontSize: "0.75rem" }}
    />
  );
};

const AttendanceCard = ({ activity, isMobile }) => {
  const theme = useTheme();

  const getCardColor = () => {
    switch (activity.type) {
      case "attendance":
        return activity.color === "green"
          ? theme.palette.success.main
          : theme.palette.error.main;
      case "holiday":
        return theme.palette.warning.main;
      case "weekoff":
        return theme.palette.secondary.main;
      case "leave":
        return theme.palette.info.main;
      default:
        return theme.palette.grey[500];
    }
  };

  return (
    <Card
      sx={{
        mb: 2,
        borderLeft: `4px solid ${getCardColor()}`,
        "&:hover": {
          boxShadow: theme.shadows[4],
          transform: "translateY(-2px)",
          transition: "all 0.2s ease-in-out",
        },
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <Box display="flex" alignItems="center" gap={1}>
              <CalendarToday fontSize="small" sx={{ color: "#f37021" }} />
              <Typography variant="body2" fontWeight="medium">
                {activity.start ? format(activity.start, "dd/MM/yyyy") : "N/A"}
              </Typography>
            </Box>
          </Grid>

          {activity.type === "attendance" ? (
            <>
              <Grid item xs={6} sm={2}>
                <Box display="flex" alignItems="center" gap={1}>
                  <AccessTime fontSize="small" color="success" />
                  <Tooltip
                    title={`Check-in location: ${activity.firstInLocation || "N/A"}`}
                  >
                    <Typography
                      variant="body2"
                      component="a"
                      href={generateMapUrl(activity.firstInLocation)}
                      target="_blank"
                      sx={{
                        textDecoration: "none",
                        color: "primary.main",
                        "&:hover": { textDecoration: "underline" },
                      }}
                    >
                      {activity.firstIn}
                    </Typography>
                  </Tooltip>
                </Box>
              </Grid>

              <Grid item xs={6} sm={2}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Schedule fontSize="small" color="warning" />
                  {activity.lastOutLocation !== "N/A" ? (
                    <Tooltip
                      title={`Check-out location: ${activity.lastOutLocation}`}
                    >
                      <Typography
                        variant="body2"
                        component="a"
                        href={generateMapUrl(activity.lastOutLocation)}
                        target="_blank"
                        sx={{
                          textDecoration: "none",
                          color: "primary.main",
                          "&:hover": { textDecoration: "underline" },
                        }}
                      >
                        {activity.lastOut}
                      </Typography>
                    </Tooltip>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      {activity.lastOut}
                    </Typography>
                  )}
                </Box>
              </Grid>

              <Grid item xs={6} sm={2}>
                <Box display="flex" alignItems="center" gap={1}>
                  <TrendingUp fontSize="small" color="info" />
                  <Typography variant="body2" fontWeight="medium">
                    {activity.workingHours}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={6} sm={3}>
                <AttendanceStatusChip
                  status={activity.color === "green" ? "on-time" : "late"}
                  time={activity.firstIn}
                />
              </Grid>
            </>
          ) : (
            <Grid item xs={12} sm={9}>
              <Box display="flex" alignItems="center" gap={2}>
                {activity.type === "holiday" && (
                  <Event fontSize="small" color="warning" />
                )}
                {activity.type === "weekoff" && (
                  <Weekend fontSize="small" color="secondary" />
                )}
                {activity.type === "leave" && (
                  <BeachAccess fontSize="small" color="info" />
                )}
                <Typography variant="body2" fontWeight="medium">
                  {activity.title}
                </Typography>
                <AttendanceStatusChip status={activity.type} />
              </Box>
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
};

// Legend Component - compact dot strip
const CalendarLegend = () => {
  const theme = useTheme();

  const legendItems = [
    { color: theme.palette.success.main, label: "On Time" },
    { color: theme.palette.error.main, label: "Late" },
    { color: theme.palette.warning.main, label: "Holiday" },
    { color: theme.palette.secondary.main, label: "Week Off" },
    { color: theme.palette.info.main, label: "Leave" },
  ];

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
      {legendItems.map((item, index) => (
        <Box key={index} sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: item.color }} />
          <Typography sx={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 500 }}>
            {item.label}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

// Today's Attendance Card Component
const TodayAttendanceCard = ({ attendance, isMobile, employees }) => {
  const theme = useTheme();
  const employee =
    employees.find((emp) => emp.EmpId === attendance.EmpId) || {};

  const getStatus = () => {
    if (attendance.FirstIn === "N/A" || !attendance.FirstIn) {
      return "absent";
    }
    return "present";
  };

  const status = getStatus();

  return (
    <Card
      sx={{
        mb: 2,
        borderLeft: `4px solid ${status === "present"
          ? theme.palette.success.main
          : theme.palette.error.main
          }`,
        "&:hover": {
          boxShadow: theme.shadows[4],
          transform: "translateY(-2px)",
          transition: "all 0.2s ease-in-out",
        },
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <Box display="flex" alignItems="center" gap={1}>
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: theme.palette.primary.main,
                }}
              >
                {employee.Name
                  ? employee.Name.charAt(0).toUpperCase()
                  : attendance.EmpId.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="body2" fontWeight="medium">
                  {employee.Name || attendance.EmpId}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {attendance.EmpId}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={6} sm={2}>
            <Box display="flex" alignItems="center" gap={1}>
              <AccessTime fontSize="small" color="success" />
              <Tooltip
                title={`Check-in location: ${attendance.FirstInLocation || "N/A"}`}
              >
                <Typography
                  variant="body2"
                  component="a"
                  href={generateMapUrl(attendance.FirstInLocation)}
                  target="_blank"
                  sx={{
                    textDecoration: "none",
                    color: "primary.main",
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  {attendance.FirstIn}
                </Typography>
              </Tooltip>
            </Box>
          </Grid>

          <Grid item xs={6} sm={2}>
            <Box display="flex" alignItems="center" gap={1}>
              <Schedule fontSize="small" color="warning" />
              {attendance.LastOutLocation !== "N/A" ? (
                <Tooltip
                  title={`Check-out location: ${attendance.LastOutLocation}`}
                >
                  <Typography
                    variant="body2"
                    component="a"
                    href={generateMapUrl(attendance.LastOutLocation)}
                    target="_blank"
                    sx={{
                      textDecoration: "none",
                      color: "primary.main",
                      "&:hover": { textDecoration: "underline" },
                    }}
                  >
                    {attendance.LastOut}
                  </Typography>
                </Tooltip>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  {attendance.LastOut}
                </Typography>
              )}
            </Box>
          </Grid>

          <Grid item xs={6} sm={2}>
            <Box display="flex" alignItems="center" gap={1}>
              <TrendingUp fontSize="small" color="info" />
              <Typography variant="body2" fontWeight="medium">
                {attendance.WorkingHours}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={6} sm={3}>
            <AttendanceStatusChip
              status={status}
              time={attendance.FirstIn !== "N/A" ? attendance.FirstIn : ""}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

// Helper function to determine if employee is active
const isEmployeeActive = (employee) => {
  if (!employee) return false;
  return (
    employee.IsActive === 1 ||
    employee.IsActive === "1" ||
    employee.IsActive === true
  );
};

const AttendanceList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const isAdmin = ["Admin", "admin", "SuperAdmin"].includes(user?.role);
  const isRM = user?.is_rm || user?.isRM || Boolean(user?.subordinates && user.subordinates.length > 0);
  const canSelectEmployee = isAdmin || isRM;
  const [selectedEmpId, setSelectedEmpId] = useState(
    isAdmin ? "" : user.emp_id,
  );

  // Employees visible to the current user:
  // - Admin: all active employees
  // - RM: self + active employees reporting to this RM
  // - Plain Employee: strictly only self
  const allowedEmployees = useMemo(() => {
    if (isAdmin) {
      return employees.filter((emp) => isEmployeeActive(emp));
    }
    const currentEmpId = String(user?.emp_id || "").trim().toLowerCase();
    const currentName = String(user?.username || user?.name || "").trim().toLowerCase();
    const userSubordinates = Array.isArray(user?.subordinates) ? user.subordinates : [];

    if (isRM) {
      return employees.filter((emp) => {
        if (!isEmployeeActive(emp)) return false;
        const empId = String(emp.EmpId || "").trim().toLowerCase();
        const empRM = String(emp.RM || "").trim().toLowerCase();
        const isSelf = empId === currentEmpId;
        const isDirectSub = (currentEmpId && empRM === currentEmpId) || (currentName && empRM === currentName);
        const isInSubList = userSubordinates.some((s) => String(s).trim().toLowerCase() === empId);
        return isSelf || isDirectSub || isInSubList;
      });
    }

    // Plain Employee: ONLY self
    return employees.filter((emp) => {
      const empId = String(emp.EmpId || "").trim().toLowerCase();
      return empId === currentEmpId && isEmployeeActive(emp);
    });
  }, [employees, isAdmin, isRM, user]);

  const [allActivities, setAllActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState([]);
  const [filteredTodayAttendance, setFilteredTodayAttendance] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [todayLoading, setTodayLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [todayPage, setTodayPage] = useState(0);
  const [todayRowsPerPage, setTodayRowsPerPage] = useState(10);
  const [viewMode, setViewMode] = useState("calendar");
  const [activeTab, setActiveTab] = useState(0);

  // Combined month-year selection for history
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Today's date picker state
  const [selectedTodayDate, setSelectedTodayDate] = useState(new Date());

  // Filter state for today's attendance
  const [todayFilter, setTodayFilter] = useState("all"); // "all", "present", "absent"

  // Employee filter state
  const [employeeFilter, setEmployeeFilter] = useState("active"); // "active", "inactive", "all"

  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Generate week off events
  const generateWeekOffEvents = (employee, startDate, endDate) => {
    if (!employee?.WeekOff) return [];

    const weekOffDays = employee.WeekOff.split(",").map((day) =>
      day.trim().toLowerCase(),
    );
    const dayMap = {
      sunday: 0,
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6,
    };

    const weekOffNumbers = weekOffDays
      .map((day) => dayMap[day])
      .filter((num) => num !== undefined);
    const events = [];

    const days = eachDayOfInterval({ start: startDate, end: endDate });

    days.forEach((day) => {
      if (weekOffNumbers.includes(day.getDay())) {
        events.push({
          title: "Week Off",
          start: day,
          end: day,
          allDay: true,
          type: "weekoff",
          color: theme.palette.secondary.main,
        });
      }
    });

    return events;
  };

  // Generate holiday events
  const generateHolidayEvents = () => {
    return holidays.map((holiday) => ({
      title: holiday.title,
      start: parseISO(holiday.date),
      end: parseISO(holiday.date),
      allDay: true,
      type: "holiday",
      color: theme.palette.warning.main,
    }));
  };

  // Generate leave events
  const generateLeaveEvents = (empId) => {
    return leaves
      .filter((leave) => leave.EmpId === empId && leave.Status === "Approved")
      .flatMap((leave) => {
        const startDate = parseISO(leave.StartDate);
        const endDate = parseISO(leave.EndDate);
        const days = eachDayOfInterval({ start: startDate, end: endDate });

        return days.map((day) => ({
          title: `Leave (${leave.Category}) - ${leave.Reason}`,
          start: day,
          end: day,
          allDay: true,
          type: "leave",
          color: theme.palette.info.main,
          category: leave.Category,
          reason: leave.Reason,
        }));
      });
  };

  useEffect(() => {
    const startDate = startOfMonth(selectedDate);
    const endDate = endOfMonth(selectedDate);

    let filtered = [];

    // Add attendance data
    const attendanceEvents = allActivities.filter((activity) => {
      if (!activity.start || activity.type !== "attendance") return false;
      return isWithinInterval(activity.start, {
        start: startDate,
        end: endDate,
      });
    });

    // Add week off events
    const weekOffEvents = selectedEmployee
      ? generateWeekOffEvents(selectedEmployee, startDate, endDate)
      : [];

    // Add holiday events
    const holidayEvents = generateHolidayEvents().filter((holiday) =>
      isWithinInterval(holiday.start, { start: startDate, end: endDate }),
    );

    // Add leave events
    const leaveEvents = selectedEmpId
      ? generateLeaveEvents(selectedEmpId).filter((leave) =>
        isWithinInterval(leave.start, { start: startDate, end: endDate }),
      )
      : [];

    // Combine all events
    filtered = [
      ...attendanceEvents,
      ...weekOffEvents,
      ...holidayEvents,
      ...leaveEvents,
    ];

    // Sort by date in chronological order (earliest to latest)
    filtered.sort((a, b) => {
      // Handle null dates
      if (!a.start && !b.start) return 0;
      if (!a.start) return -1;
      if (!b.start) return 1;

      // Ensure dates are Date objects
      const dateA = a.start instanceof Date ? a.start : new Date(a.start);
      const dateB = b.start instanceof Date ? b.start : new Date(b.start);

      // Sort in ascending order (1st of month to last of month)
      return dateA - dateB;
    });

    setFilteredActivities(filtered);
    setPage(0);
  }, [
    allActivities,
    selectedDate,
    selectedEmployee,
    selectedEmpId,
    holidays,
    leaves,
  ]);

  // Fetch today's attendance
  const fetchTodayAttendance = async (date = new Date()) => {
    setTodayLoading(true);
    try {
      console.log("Fetching attendance for date:", format(date, "yyyy-MM-dd"));

      const response = await axios.get(
        `${BASE_URL}/attendance/get_today_attendance.php`,
        {
          params: {
            date: format(date, "yyyy-MM-dd"),
            role: user?.role,
            EmpId: user?.emp_id,
            is_rm: isRM ? "true" : "false",
            Tenent_Id: user?.tenent_id,
          },
          timeout: 10000,
        },
      );

      console.log("Attendance API Response:", response.data);

      if (response.data.success && response.data.data) {
        setTodayAttendance(response.data.data);
        // Reset filter when fetching new data
        setTodayFilter("all");
      } else {
        setTodayAttendance([]);
      }
    } catch (error) {
      console.error("Error fetching attendance:", error);
      setTodayAttendance([]);
    } finally {
      setTodayLoading(false);
    }
  };

  // Filter today's attendance based on present/absent filter and allowed employees
  useEffect(() => {
    const allowedEmpIds = new Set(
      allowedEmployees.map((emp) =>
        String(emp.EmpId || "").trim().toLowerCase(),
      ),
    );

    // Only include attendance records of employees the current user is permitted to see
    const visibleTodayAttendance = todayAttendance.filter((att) =>
      allowedEmpIds.has(String(att.EmpId || "").trim().toLowerCase()),
    );

    // Create a set of employee IDs that have attendance records among allowed employees
    const presentEmpIds = new Set(
      visibleTodayAttendance.map((att) =>
        String(att.EmpId || "").trim().toLowerCase(),
      ),
    );

    // Create combined data with allowed active employees
    const combinedData = [];

    // Add present employees with their attendance data
    visibleTodayAttendance.forEach((att) => {
      const emp = allowedEmployees.find(
        (e) =>
          String(e.EmpId || "").trim().toLowerCase() ===
          String(att.EmpId || "").trim().toLowerCase(),
      );
      combinedData.push({
        ...att,
        _employee: emp,
        _status: "present",
      });
    });

    // Add absent employees (allowed active employees not in visibleTodayAttendance)
    allowedEmployees.forEach((emp) => {
      const cleanEmpId = String(emp.EmpId || "").trim().toLowerCase();
      if (!presentEmpIds.has(cleanEmpId)) {
        combinedData.push({
          EmpId: emp.EmpId,
          Date: format(selectedTodayDate, "dd/MM/yyyy"),
          FirstIn: "N/A",
          FirstInLocation: "N/A",
          LastOut: "N/A",
          LastOutLocation: "N/A",
          WorkingHours: "0h 0m",
          FirstEvent: "N/A",
          LastEvent: "N/A",
          _status: "absent",
          _employee: emp, // Store employee data for reference
        });
      }
    });

    // Apply filter
    let filtered = combinedData;
    if (todayFilter === "present") {
      filtered = combinedData.filter((item) => item._status === "present");
    } else if (todayFilter === "absent") {
      filtered = combinedData.filter((item) => item._status === "absent");
    }

    setFilteredTodayAttendance(filtered);
    setTodayPage(0); // Reset pagination when filter changes
  }, [todayAttendance, allowedEmployees, todayFilter, selectedTodayDate]);

  const fetchAttendance = async () => {
    if (!selectedEmpId) return;

    setError(null);
    setLoading(true);

    try {
      console.log("Fetching attendance for EmpId:", selectedEmpId);

      const response = await axios.get(
        `${BASE_URL}/attendance/view_attendance.php`,
        {
          params: { EmpId: selectedEmpId },
          timeout: 10000,
        },
      );

      console.log("Attendance API Response:", response.data);

      if (response.data.success && response.data.data) {
        const attendanceData = response.data.data
          .map((activity) => {
            if (!activity.date) {
              console.warn("Activity missing date:", activity);
              return null;
            }

            let formattedDate;
            try {
              formattedDate = parse(activity.date, "dd/MM/yyyy", new Date());
              if (isNaN(formattedDate)) {
                formattedDate = parseISO(activity.date);
                if (isNaN(formattedDate)) {
                  console.error("Invalid date format:", activity.date);
                  return null;
                }
              }
            } catch (error) {
              console.error("Date parsing error:", error, activity.date);
              return null;
            }

            const currentEmployee =
              employees.find(
                (emp) =>
                  String(emp.EmpId || "").trim().toLowerCase() ===
                  String(selectedEmpId || "").trim().toLowerCase(),
              ) || selectedEmployee;

            const employeeShift =
              currentEmployee?.Shift ||
              selectedEmployee?.Shift ||
              user.shift ||
              "9:00 AM - 6:00 PM";

            return {
              title: `In: ${activity.firstIn || "N/A"}\nOut: ${activity.lastOut || "N/A"}`,
              start: formattedDate,
              end: formattedDate,
              firstIn: activity.firstIn || "N/A",
              lastOut: activity.lastOut || "N/A",
              firstInLocation: activity.firstInLocation || "N/A",
              lastOutLocation: activity.lastOutLocation || "N/A",
              workingHours: activity.workingHours || "0h 0m",
              allDay: true,
              color: compareTimes(activity.firstIn, employeeShift),
              firstEvent: activity.firstEvent || "Unknown",
              lastEvent: activity.lastEvent || "Unknown",
              type: "attendance",
            };
          })
          .filter(Boolean);

        console.log("Processed attendance data:", attendanceData);
        setAllActivities(attendanceData);
      } else {
        console.log(
          "No attendance data found or API returned error:",
          response.data,
        );
        setAllActivities([]);
        if (!response.data.success) {
          setError(
            response.data.message ||
            "No attendance data found for the selected employee",
          );
        }
      }
    } catch (error) {
      console.error("Error fetching attendance:", error);
      setError(
        "Error fetching attendance: " +
        (error.response?.data?.message || error.message),
      );
      setAllActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchHolidays = async () => {
    try {
      console.log("Fetching holidays for Tenent_Id:", user.tenent_id);

      const response = await axios.get(
        `${BASE_URL}/holiday/view_holiday.php?Tenent_Id=${user.tenent_id}`,
        { timeout: 10000 },
      );

      console.log("Holidays API Response:", response.data);

      if (response.data.success && response.data.data) {
        setHolidays(response.data.data);
      } else {
        setHolidays([]);
      }
    } catch (error) {
      console.error("Error fetching holidays:", error);
      setHolidays([]);
    }
  };

  const fetchLeaves = async (empId) => {
    if (!empId) return;

    try {
      console.log("Fetching leaves for empId:", empId);

      const response = await axios.get(
        `${BASE_URL}/leave/get_leave.php?empId=${empId}`,
        { timeout: 10000 },
      );

      console.log("Leaves API Response:", response.data);

      if (response.data.success && response.data.data) {
        setLeaves(response.data.data);
      } else {
        setLeaves([]);
      }
    } catch (error) {
      console.error("Error fetching leaves:", error);
      setLeaves([]);
    }
  };

  // Employee filter handler
  const handleEmployeeFilterChange = (filter) => {
    setEmployeeFilter(filter);

    if (filter === "active") {
      const activeEmployees = employees.filter((emp) => isEmployeeActive(emp));
      setFilteredEmployees(activeEmployees);
      console.log(
        `Filtered to show ${activeEmployees.length} active employees`,
      );
    } else if (filter === "inactive") {
      const inactiveEmployees = employees.filter(
        (emp) => !isEmployeeActive(emp),
      );
      setFilteredEmployees(inactiveEmployees);
      console.log(
        `Filtered to show ${inactiveEmployees.length} inactive employees`,
      );
    } else {
      setFilteredEmployees(employees);
      console.log(`Filtered to show all ${employees.length} employees`);
    }
  };

  // Add employee fetching for HR role
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        console.log("Fetching employees for Tenent_Id:", user.tenent_id);

        const response = await axios.get(
          `${BASE_URL}/employee/list_employee.php?Tenent_Id=${user.tenent_id}`,
          { timeout: 10000 },
        );

        console.log("=== RAW EMPLOYEE API RESPONSE ===");
        console.log("Full API Response:", response.data);
        console.log("Success status:", response.data.success);

        if (response.data.success && response.data.data) {
          const fetchedEmployees = response.data.data;
          console.log("Number of employees fetched:", fetchedEmployees.length);

          // Log first employee to check structure
          if (fetchedEmployees.length > 0) {
            console.log("First employee data:", fetchedEmployees[0]);
            console.log(
              "IsActive field in first employee:",
              fetchedEmployees[0].IsActive,
            );
            console.log(
              "Type of IsActive:",
              typeof fetchedEmployees[0].IsActive,
            );
          }

          setEmployees(fetchedEmployees);

          // Calculate active/inactive counts
          const activeCount = fetchedEmployees.filter((emp) =>
            isEmployeeActive(emp),
          ).length;
          const inactiveCount = fetchedEmployees.length - activeCount;

          console.log(
            `Active employees: ${activeCount}, Inactive employees: ${inactiveCount}`,
          );

          // Default: show active employees
          const activeEmployees = fetchedEmployees.filter((emp) =>
            isEmployeeActive(emp),
          );
          console.log("Active employees count:", activeEmployees.length);
          setFilteredEmployees(activeEmployees);

          // If user is RM, filter list to self + subordinates
          if (isRM && !isAdmin) {
            const teamEmployees = activeEmployees.filter((emp) =>
              emp.EmpId === user.emp_id ||
              emp.RM === user.emp_id ||
              (user.username && emp.RM === user.username) ||
              (user.subordinates && user.subordinates.includes(emp.EmpId))
            );
            console.log("Team employees count for RM:", teamEmployees.length);
            const selfEmp = activeEmployees.filter((emp) => emp.EmpId === user.emp_id);
            setFilteredEmployees(teamEmployees.length > 0 ? teamEmployees : (selfEmp.length > 0 ? selfEmp : activeEmployees));

            if (!selectedEmpId) {
              const selfOrFirst = teamEmployees.find((emp) => emp.EmpId === user.emp_id) || teamEmployees[0];
              if (selfOrFirst) {
                setSelectedEmployee(selfOrFirst);
                setSelectedEmpId(selfOrFirst.EmpId);
              }
            }
          } else if (!isAdmin) {
            // Plain employee: only self
            const currentUserEmployee = fetchedEmployees.find(
              (emp) => emp.EmpId === user.emp_id,
            ) || {
              EmpId: user.emp_id,
              Name: user.name,
              WeekOff: user.weekOff || "Saturday,Sunday",
              Shift: user.shift || "9:00 AM - 6:00 PM",
              IsActive: 1,
            };
            setFilteredEmployees([currentUserEmployee]);
            setSelectedEmployee(currentUserEmployee);
            setSelectedEmpId(user.emp_id);
          } else if (fetchedEmployees.length > 0) {
            // For HR/Admin, auto-select first employee so history loads immediately
            const firstActive = activeEmployees[0] || fetchedEmployees[0];
            if (firstActive && !selectedEmpId) {
              setSelectedEmployee(firstActive);
              setSelectedEmpId(firstActive.EmpId);
            }
          }
        } else {
          console.log("No employee data or API error:", response.data.message);
          setEmployees([]);
          setFilteredEmployees([]);
          setError(
            "Error fetching employee list: " +
            (response.data.message || "Unknown error"),
          );
        }
      } catch (error) {
        console.error("Error fetching employees:", error);
        console.error("Error details:", error.response?.data || error.message);
        setError("Error fetching employee list: " + error.message);
        setEmployees([]);
        setFilteredEmployees([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
    fetchHolidays();
    fetchTodayAttendance(selectedTodayDate);
  }, [user.role, user.tenent_id, user.emp_id]);

  // Update when selectedTodayDate changes
  useEffect(() => {
    fetchTodayAttendance(selectedTodayDate);
  }, [selectedTodayDate]);

  useEffect(() => {
    if (selectedEmpId) {
      console.log("Selected EmpId changed to:", selectedEmpId);
      fetchAttendance();
      fetchLeaves(selectedEmpId);
    }
  }, [selectedEmpId]);

  const parseTime = (timeString) => {
    if (!timeString || timeString === "N/A") return null;

    // Matches e.g. "9:00 AM", "09:00 AM", "09:00:00", "9:00", "09:00" even with surrounding text
    const match = timeString.match(/(\d{1,2}:\d{2}(?::\d{2})?)\s*(AM|PM|am|pm)?/i);
    if (!match) return null;

    const timePart = match[1];
    const modifier = match[2] ? match[2].toUpperCase() : null;

    let [hours, minutes] = timePart.split(":");
    let h = Number.parseInt(hours, 10);
    const m = String(minutes).padStart(2, "0");

    if (modifier) {
      if (modifier === "PM" && h < 12) {
        h += 12;
      } else if (modifier === "AM" && h === 12) {
        h = 0;
      }
    }

    return `${String(h).padStart(2, "0")}:${m}`;
  };

  const compareTimes = (attendanceTime, shiftTime) => {
    if (!attendanceTime || attendanceTime === "N/A") {
      return "red";
    }

    try {
      let rawShiftStart = (shiftTime || "").split(" - ")[0];
      let shiftStartTime = parseTime(rawShiftStart);

      // If shift has no explicit time (e.g. "General"), default to 09:00 AM
      if (!shiftStartTime) {
        shiftStartTime = "09:00";
      }

      const attendanceTime24 = parseTime(attendanceTime);

      if (!attendanceTime24) {
        return "red";
      }

      const shiftStart = new Date(`1970-01-01T${shiftStartTime}:00`);
      const attendance = new Date(`1970-01-01T${attendanceTime24}:00`);

      const diffInMinutes = (attendance - shiftStart) / (1000 * 60);

      if (diffInMinutes <= 5) {
        return "green";
      } else {
        return "red";
      }
    } catch (error) {
      console.error("Error comparing times:", error);
      return "red";
    }
  };

  const exportToCsv = () => {
    const csvRows = [
      [
        "Date",
        "Type",
        "Check In",
        "Check In Event",
        "Check Out",
        "Check Out Event",
        "Working Hours",
        "Status",
        "Notes",
      ],
    ];

    filteredActivities.forEach((activity) => {
      if (activity.type === "attendance") {
        csvRows.push([
          activity.start ? format(activity.start, "dd/MM/yyyy") : "N/A",
          "Attendance",
          activity.firstIn,
          activity.firstEvent || "N/A",
          activity.lastOut,
          activity.lastEvent || "N/A",
          activity.workingHours,
          activity.color === "green" ? "On Time" : "Late",
          "",
        ]);
      } else {
        csvRows.push([
          activity.start ? format(activity.start, "dd/MM/yyyy") : "N/A",
          activity.type.charAt(0).toUpperCase() + activity.type.slice(1),
          "-",
          "-",
          "-",
          "-",
          "-",
          activity.type.charAt(0).toUpperCase() + activity.type.slice(1),
          activity.title,
        ]);
      }
    });

    const csvContent = csvRows.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute(
      "download",
      `attendance_${selectedEmpId}_${format(selectedDate, "MMM_yyyy")}.csv`,
    );
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportTodayToCsv = () => {
    const csvRows = [
      [
        "Employee ID",
        "Employee Name",
        "Contact No.",
        "Date",
        "Check In",
        "Check In Location",
        "Check Out",
        "Check Out Location",
        "Working Hours",
        "Status",
      ],
    ];

    filteredTodayAttendance.forEach((attendance) => {
      const employee =
        attendance._employee ||
        employees.find((emp) => emp.EmpId === attendance.EmpId) ||
        {};
      const status =
        attendance._status ||
        (attendance.FirstIn === "N/A" || !attendance.FirstIn
          ? "Absent"
          : "Present");

      csvRows.push([
        attendance.EmpId,
        employee.Name || "N/A",
        employee.Mobile || "N/A",
        attendance.Date,
        attendance.FirstIn,
        attendance.FirstInLocation,
        attendance.LastOut,
        attendance.LastOutLocation,
        attendance.WorkingHours,
        status,
      ]);
    });

    const csvContent = csvRows.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute(
      "download",
      `attendance_${format(selectedTodayDate, "dd_MM_yyyy")}.csv`,
    );
    link.click();
    URL.revokeObjectURL(url);
  };

  const refreshData = () => {
    console.log("Refreshing data...");
    if (selectedEmpId) {
      fetchAttendance();
      fetchLeaves(selectedEmpId);
    }
    fetchHolidays();
    fetchTodayAttendance(selectedTodayDate);
  };

  const regularise = () => {
    navigate("/regularise");
  };

  // Calculate statistics for filtered data (only attendance records)
  const attendanceRecords = filteredActivities.filter(
    (a) => a.type === "attendance",
  );
  const totalDays = attendanceRecords.length;
  const onTimeDays = attendanceRecords.filter(
    (a) => a.color === "green",
  ).length;
  const lateDays = attendanceRecords.filter((a) => a.color === "red").length;
  const avgHours =
    attendanceRecords.length > 0
      ? attendanceRecords.reduce((acc, activity) => {
        const hours =
          Number.parseFloat(activity.workingHours.replace(/[^\d.]/g, "")) ||
          0;
        return acc + hours;
      }, 0) / attendanceRecords.length
      : 0;

  // Count other types
  const holidayCount = filteredActivities.filter(
    (a) => a.type === "holiday",
  ).length;
  const weekOffCount = filteredActivities.filter(
    (a) => a.type === "weekoff",
  ).length;
  const leaveCount = filteredActivities.filter(
    (a) => a.type === "leave",
  ).length;

  // Today's attendance statistics (based on allowed active employees only)
  const activeEmployeesCount = allowedEmployees.length;
  const presentCount = allowedEmployees.filter((emp) => {
    const cleanId = String(emp.EmpId || "").trim().toLowerCase();
    return todayAttendance.some(
      (att) => String(att.EmpId || "").trim().toLowerCase() === cleanId
    );
  }).length;
  const absentCount = Math.max(0, activeEmployeesCount - presentCount);

  const eventStyleGetter = (event) => {
    let backgroundColor = "#3174ad";

    switch (event.type) {
      case "attendance":
        backgroundColor =
          event.color === "green"
            ? theme.palette.success.main
            : theme.palette.error.main;
        break;
      case "holiday":
        backgroundColor = theme.palette.warning.main;
        break;
      case "weekoff":
        backgroundColor = theme.palette.secondary.main;
        break;
      case "leave":
        backgroundColor = theme.palette.info.main;
        break;
    }

    return {
      style: {
        backgroundColor,
        color: "#fff",
        fontSize: "12px",
        borderRadius: "4px",
        border: "none",
        padding: "4px",
      },
    };
  };

  // Tab change handler
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Filter handlers for today's attendance
  const handlePresentClick = () => {
    setTodayFilter("present");
  };

  const handleAbsentClick = () => {
    setTodayFilter("absent");
  };

  const handleAllClick = () => {
    setTodayFilter("all");
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box
        sx={{
          p: { xs: 1, sm: 1.5 },
          bgcolor: "#f8fafc",
          height: "100%",
          maxHeight: "100%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxSizing: "border-box",
        }}
      >
        {/* Top Control Bar: Tabs + Filters + Actions in a single sleek Paper */}
        <Paper
          elevation={0}
          sx={{
            p: 1,
            mb: 1.2,
            borderRadius: 2,
            border: "1px solid #e2e8f0",
            bgcolor: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 1.2,
            flexShrink: 0,
          }}
        >
          {/* Left: View Tabs */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              bgcolor: "#f1f5f9",
              p: 0.4,
              borderRadius: 2,
              gap: 0.4,
            }}
          >
            <ButtonBase
              onClick={(e) => handleTabChange(e, 0)}
              sx={{
                px: 1.5,
                py: 0.6,
                borderRadius: 1.5,
                fontSize: "0.82rem",
                fontWeight: activeTab === 0 ? 700 : 500,
                bgcolor: activeTab === 0 ? "#f37021" : "transparent",
                color: activeTab === 0 ? "#ffffff" : "#64748b",
                display: "flex",
                alignItems: "center",
                gap: 0.7,
                transition: "all 0.15s ease",
                boxShadow: activeTab === 0 ? "0 1px 3px rgba(243, 112, 33, 0.3)" : "none",
                "&:hover": {
                  bgcolor: activeTab === 0 ? "#e05f10" : "rgba(0,0,0,0.04)",
                },
              }}
            >
              <CalendarToday sx={{ fontSize: 16 }} />
              Attendance History
            </ButtonBase>
            <ButtonBase
              onClick={(e) => handleTabChange(e, 1)}
              sx={{
                px: 1.5,
                py: 0.6,
                borderRadius: 1.5,
                fontSize: "0.82rem",
                fontWeight: activeTab === 1 ? 700 : 500,
                bgcolor: activeTab === 1 ? "#f37021" : "transparent",
                color: activeTab === 1 ? "#ffffff" : "#64748b",
                display: "flex",
                alignItems: "center",
                gap: 0.7,
                transition: "all 0.15s ease",
                boxShadow: activeTab === 1 ? "0 1px 3px rgba(243, 112, 33, 0.3)" : "none",
                "&:hover": {
                  bgcolor: activeTab === 1 ? "#e05f10" : "rgba(0,0,0,0.04)",
                },
              }}
            >
              <Today sx={{ fontSize: 16 }} />
              Today's Attendance
            </ButtonBase>
          </Box>

          {/* Middle: Filters for Active Tab */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              flexWrap: "wrap",
              flex: 1,
              justifyContent: { xs: "flex-start", md: "center" },
            }}
          >
            {activeTab === 0 ? (
              <>
                {canSelectEmployee && (
                  <Box sx={{ minWidth: { xs: 180, sm: 220 }, maxWidth: 280 }}>
                    <Autocomplete
                      options={filteredEmployees}
                      getOptionLabel={(option) => `${option.Name} (${option.EmpId})`}
                      value={employees.find((emp) => emp.EmpId === selectedEmpId) || null}
                      onChange={(event, newValue) => {
                        setSelectedEmpId(newValue ? newValue.EmpId : "");
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Select Employee"
                          variant="outlined"
                          size="small"
                          InputProps={{
                            ...params.InputProps,
                            startAdornment: <Person sx={{ mr: 0.5, color: "#94a3b8", fontSize: 18 }} />,
                          }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              height: 36,
                              fontSize: "0.82rem",
                              borderRadius: 1.5,
                            },
                          }}
                        />
                      )}
                    />
                  </Box>
                )}

                <DatePicker
                  views={["year", "month"]}
                  value={selectedDate}
                  onChange={(newValue) => newValue && setSelectedDate(newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      size="small"
                      sx={{
                        width: 160,
                        "& .MuiOutlinedInput-root": {
                          height: 36,
                          fontSize: "0.82rem",
                          borderRadius: 1.5,
                        },
                      }}
                    />
                  )}
                />

                {/* View Mode Toggle: List / Calendar */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    bgcolor: "#f1f5f9",
                    p: 0.3,
                    borderRadius: 1.5,
                  }}
                >
                  <ButtonBase
                    onClick={() => setViewMode("list")}
                    sx={{
                      px: 1.2,
                      py: 0.4,
                      borderRadius: 1.2,
                      fontSize: "0.78rem",
                      fontWeight: viewMode === "list" ? 600 : 500,
                      bgcolor: viewMode === "list" ? "#ffffff" : "transparent",
                      color: viewMode === "list" ? "#0f172a" : "#64748b",
                      boxShadow: viewMode === "list" ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                    }}
                  >
                    <FilterList sx={{ fontSize: 15 }} />
                    List
                  </ButtonBase>
                  <ButtonBase
                    onClick={() => setViewMode("calendar")}
                    sx={{
                      px: 1.2,
                      py: 0.4,
                      borderRadius: 1.2,
                      fontSize: "0.78rem",
                      fontWeight: viewMode === "calendar" ? 600 : 500,
                      bgcolor: viewMode === "calendar" ? "#ffffff" : "transparent",
                      color: viewMode === "calendar" ? "#0f172a" : "#64748b",
                      boxShadow: viewMode === "calendar" ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                    }}
                  >
                    <CalendarToday sx={{ fontSize: 14 }} />
                    Calendar
                  </ButtonBase>
                </Box>
              </>
            ) : (
              <>
                <DatePicker
                  value={selectedTodayDate}
                  onChange={(newDate) => newDate && setSelectedTodayDate(newDate)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      size="small"
                      sx={{
                        width: 150,
                        "& .MuiOutlinedInput-root": {
                          height: 36,
                          fontSize: "0.82rem",
                          borderRadius: 1.5,
                        },
                      }}
                    />
                  )}
                />

                <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                  <Chip
                    clickable
                    onClick={handleAllClick}
                    size="small"
                    label={`All: ${activeEmployeesCount}`}
                    sx={{
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      bgcolor: todayFilter === "all" ? "#0f172a" : "#f1f5f9",
                      color: todayFilter === "all" ? "#ffffff" : "#475569",
                      "&:hover": { bgcolor: todayFilter === "all" ? "#1e293b" : "#e2e8f0" },
                    }}
                  />
                  <Chip
                    clickable
                    onClick={handlePresentClick}
                    size="small"
                    label={`Present: ${presentCount}`}
                    sx={{
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      bgcolor: todayFilter === "present" ? "#10b981" : "rgba(16, 185, 129, 0.12)",
                      color: todayFilter === "present" ? "#ffffff" : "#047857",
                      "&:hover": { bgcolor: todayFilter === "present" ? "#059669" : "rgba(16, 185, 129, 0.2)" },
                    }}
                  />
                  <Chip
                    clickable
                    onClick={handleAbsentClick}
                    size="small"
                    label={`Absent: ${absentCount}`}
                    sx={{
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      bgcolor: todayFilter === "absent" ? "#ef4444" : "rgba(239, 68, 68, 0.12)",
                      color: todayFilter === "absent" ? "#ffffff" : "#b91c1c",
                      "&:hover": { bgcolor: todayFilter === "absent" ? "#dc2626" : "rgba(239, 68, 68, 0.2)" },
                    }}
                  />
                </Box>
              </>
            )}
          </Box>

          {/* Right: Export & Refresh */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Tooltip title={activeTab === 0 ? "Export to CSV" : "Export Today's Data"}>
              <span>
                <Button
                  variant="contained"
                  onClick={activeTab === 0 ? exportToCsv : exportTodayToCsv}
                  disabled={
                    activeTab === 0
                      ? filteredActivities.length === 0
                      : filteredTodayAttendance.length === 0
                  }
                  size="small"
                  startIcon={<Download sx={{ fontSize: 16 }} />}
                  sx={{
                    bgcolor: "#f37021",
                    color: "#ffffff",
                    borderRadius: 1.5,
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "0.82rem",
                    height: 36,
                    px: 1.8,
                    boxShadow: "0 1px 3px rgba(243, 112, 33, 0.25)",
                    "&:hover": { bgcolor: "#d95300" },
                  }}
                >
                  Export
                </Button>
              </span>
            </Tooltip>

            <Tooltip title="Refresh Data">
              <IconButton
                onClick={refreshData}
                disabled={loading || todayLoading}
                size="small"
                sx={{
                  bgcolor: "#ffffff",
                  border: "1px solid #e2e8f0",
                  color: "#64748b",
                  width: 36,
                  height: 36,
                  borderRadius: 1.5,
                  "&:hover": { bgcolor: "#f8fafc", color: "#0f172a" },
                }}
              >
                {loading || todayLoading ? (
                  <CircularProgress size={16} />
                ) : (
                  <Refresh sx={{ fontSize: 18 }} />
                )}
              </IconButton>
            </Tooltip>
          </Box>
        </Paper>

        {/* Error Alert */}
        {error && (
          <Alert
            severity="error"
            sx={{ mb: 1, py: 0.2, flexShrink: 0 }}
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        {/* Loading Alert */}
        {(loading || todayLoading) && (
          <Alert severity="info" sx={{ mb: 1, py: 0.2, flexShrink: 0 }}>
            <Box display="flex" alignItems="center" gap={1.5}>
              <CircularProgress size={16} />
              <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
                {activeTab === 0
                  ? "Loading attendance data..."
                  : "Loading today's attendance..."}
              </Typography>
            </Box>
          </Alert>
        )}

        {/* Main 2-Column Section Matching Screenshot 3 */}
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "1fr 260px", xl: "1fr 280px" },
            gap: 1.5,
            overflow: "hidden",
          }}
        >
          {/* Left Column: Table or Full Calendar */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
              height: "100%",
              overflow: "hidden",
            }}
          >
            {activeTab === 0 ? (
              viewMode === "calendar" ? (
                <Paper
                  sx={{
                    flex: 1,
                    minHeight: 0,
                    display: "flex",
                    flexDirection: "column",
                    p: 1.5,
                    borderRadius: 2.5,
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                    overflow: "hidden",
                    bgcolor: "#ffffff",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mb: 1,
                      flexShrink: 0,
                    }}
                  >
                    <Typography sx={{ fontWeight: 600, fontSize: "0.95rem", color: "#0f172a" }}>
                      Attendance Calendar - {format(selectedDate, "MMMM yyyy")}
                    </Typography>
                    <CalendarLegend />
                  </Box>
                  <Box
                    sx={{
                      flex: 1,
                      minHeight: 0,
                      overflow: "auto",
                      "& .rbc-calendar": {
                        minWidth: { xs: 480, sm: "100%" },
                        height: "100% !important",
                        minHeight: 400,
                      },
                    }}
                  >
                    <Calendar
                      localizer={localizer}
                      events={filteredActivities}
                      startAccessor="start"
                      endAccessor="end"
                      style={{
                        height: "100%",
                        backgroundColor: "#fff",
                        borderRadius: 8,
                        padding: 4,
                      }}
                      eventPropGetter={eventStyleGetter}
                      views={["month", "week", "day"]}
                      popup
                      date={selectedDate}
                      onNavigate={(date) => {
                        setSelectedDate(date);
                      }}
                      tooltipAccessor={(event) =>
                        event.type === "attendance"
                          ? `${event.title}\nWorking Hours: ${event.workingHours}`
                          : event.title
                      }
                    />
                  </Box>
                </Paper>
              ) : (
                <Paper
                  sx={{
                    flex: 1,
                    minHeight: 0,
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: 2.5,
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                    overflow: "hidden",
                    bgcolor: "#ffffff",
                  }}
                >
                  {/* Table Card Header */}
                  <Box
                    sx={{
                      p: 1.2,
                      px: 2,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      borderBottom: "1px solid #f1f5f9",
                      flexShrink: 0,
                      flexWrap: "wrap",
                      gap: 1,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography sx={{ fontWeight: 700, fontSize: "0.92rem", color: "#0f172a" }}>
                        All Records - {format(selectedDate, "MMMM yyyy")}
                      </Typography>
                      <Chip
                        label={`${filteredActivities.length} Records`}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: "0.7rem",
                          fontWeight: 600,
                          bgcolor: "#fff7ed",
                          color: "#f37021",
                          border: "1px solid #ffedd5",
                        }}
                      />
                    </Box>
                    <CalendarLegend />
                  </Box>

                  {/* Table Scrollable Container */}
                  <TableContainer sx={{ flex: 1, minHeight: 0, overflowY: "auto", overflowX: "auto" }}>
                    {filteredActivities.length === 0 ? (
                      <Box sx={{ textAlign: "center", py: 6 }}>
                        <CalendarToday sx={{ fontSize: 48, color: "#cbd5e1", mb: 1.5 }} />
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          No records found
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {selectedEmpId
                            ? `No data available for ${format(selectedDate, "MMMM yyyy")}`
                            : "Please select an employee to view attendance data"}
                        </Typography>
                      </Box>
                    ) : isMobile ? (
                      <Stack spacing={1} sx={{ p: 1 }}>
                        {filteredActivities
                          .slice(
                            page * rowsPerPage,
                            page * rowsPerPage + rowsPerPage,
                          )
                          .map((activity, index) => (
                            <AttendanceCard
                              key={index}
                              activity={activity}
                              isMobile={isMobile}
                            />
                          ))}
                      </Stack>
                    ) : (
                      <Table stickyHeader size="small">
                        <TableHead>
                          <TableRow>
                            {[
                              "Date",
                              "Type",
                              "Check In",
                              "Check Out",
                              "Working Hours",
                              "Status",
                            ].map((head) => (
                              <TableCell
                                key={head}
                                sx={{
                                  bgcolor: "#f8fafc",
                                  color: "#475569",
                                  fontWeight: 700,
                                  fontSize: "0.75rem",
                                  py: 1,
                                  borderBottom: "1px solid #e2e8f0",
                                }}
                              >
                                {head}
                              </TableCell>
                            ))}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {filteredActivities
                            .slice(
                              page * rowsPerPage,
                              page * rowsPerPage + rowsPerPage,
                            )
                            .map((activity, index) => (
                              <TableRow
                                key={index}
                                sx={{
                                  "&:hover": { bgcolor: "#f8fafc" },
                                  borderLeft: `3px solid ${
                                    activity.type === "attendance"
                                      ? activity.color === "green"
                                        ? "#10b981"
                                        : "#ef4444"
                                      : activity.type === "holiday"
                                      ? "#f59e0b"
                                      : activity.type === "weekoff"
                                      ? "#94a3b8"
                                      : "#3b82f6"
                                  }`,
                                }}
                              >
                                <TableCell sx={{ py: 0.8, fontSize: "0.8rem" }}>
                                  <Box display="flex" alignItems="center" gap={0.8}>
                                    <CalendarToday sx={{ fontSize: 14, color: "#f37021" }} />
                                    {activity.start ? format(activity.start, "dd/MM/yyyy") : "N/A"}
                                  </Box>
                                </TableCell>
                                <TableCell sx={{ py: 0.8, fontSize: "0.8rem" }}>
                                  <Box display="flex" alignItems="center" gap={0.8}>
                                    {activity.type === "attendance" && <Person sx={{ fontSize: 15, color: "#64748b" }} />}
                                    {activity.type === "holiday" && <Event sx={{ fontSize: 15, color: "#f59e0b" }} />}
                                    {activity.type === "weekoff" && <Weekend sx={{ fontSize: 15, color: "#94a3b8" }} />}
                                    {activity.type === "leave" && <BeachAccess sx={{ fontSize: 15, color: "#3b82f6" }} />}
                                    <Typography sx={{ fontSize: "0.78rem", textTransform: "capitalize", fontWeight: 500 }}>
                                      {activity.type}
                                    </Typography>
                                  </Box>
                                </TableCell>
                                <TableCell sx={{ py: 0.8, fontSize: "0.8rem" }}>
                                  {activity.type === "attendance" ? (
                                    <Tooltip title={`Location: ${activity.firstInLocation || "N/A"}`}>
                                      <Box
                                        component="a"
                                        href={generateMapUrl(activity.firstInLocation)}
                                        target="_blank"
                                        sx={{
                                          textDecoration: "none",
                                          color: "#0284c7",
                                          display: "flex",
                                          alignItems: "center",
                                          gap: 0.5,
                                          fontSize: "0.78rem",
                                          "&:hover": { textDecoration: "underline" },
                                        }}
                                      >
                                        <LocationOn sx={{ fontSize: 14 }} />
                                        {activity.firstIn} ({activity.firstEvent})
                                      </Box>
                                    </Tooltip>
                                  ) : (
                                    <Typography sx={{ color: "#94a3b8", fontSize: "0.78rem" }}>-</Typography>
                                  )}
                                </TableCell>
                                <TableCell sx={{ py: 0.8, fontSize: "0.8rem" }}>
                                  {activity.type === "attendance" ? (
                                    activity.lastOutLocation !== "N/A" ? (
                                      <Tooltip title={`Location: ${activity.lastOutLocation}`}>
                                        <Box
                                          component="a"
                                          href={generateMapUrl(activity.lastOutLocation)}
                                          target="_blank"
                                          sx={{
                                            textDecoration: "none",
                                            color: "#0284c7",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 0.5,
                                            fontSize: "0.78rem",
                                            "&:hover": { textDecoration: "underline" },
                                          }}
                                        >
                                          <LocationOn sx={{ fontSize: 14 }} />
                                          {activity.lastOut} ({activity.lastEvent})
                                        </Box>
                                      </Tooltip>
                                    ) : (
                                      <Box display="flex" alignItems="center" gap={0.5} sx={{ color: "#94a3b8", fontSize: "0.78rem" }}>
                                        <Schedule sx={{ fontSize: 14 }} />
                                        {activity.lastOut}
                                      </Box>
                                    )
                                  ) : (
                                    <Typography sx={{ color: "#94a3b8", fontSize: "0.78rem" }}>-</Typography>
                                  )}
                                </TableCell>
                                <TableCell sx={{ py: 0.8, fontSize: "0.8rem" }}>
                                  {activity.type === "attendance" ? (
                                    <Box display="flex" alignItems="center" gap={0.5}>
                                      <AccessTime sx={{ fontSize: 14, color: "#64748b" }} />
                                      <Typography sx={{ fontSize: "0.78rem", fontWeight: 600 }}>
                                        {activity.workingHours}
                                      </Typography>
                                    </Box>
                                  ) : (
                                    <Typography sx={{ color: "#94a3b8", fontSize: "0.78rem" }}>-</Typography>
                                  )}
                                </TableCell>
                                <TableCell sx={{ py: 0.8 }}>
                                  {activity.type === "attendance" ? (
                                    <AttendanceStatusChip
                                      status={activity.color === "green" ? "on-time" : "late"}
                                      time=""
                                    />
                                  ) : (
                                    <AttendanceStatusChip status={activity.type} />
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    )}
                  </TableContainer>

                  {/* Table Pagination */}
                  {filteredActivities.length > 0 && (
                    <TablePagination
                      rowsPerPageOptions={[5, 10, 25]}
                      component="div"
                      count={filteredActivities.length}
                      rowsPerPage={rowsPerPage}
                      page={page}
                      onPageChange={(event, newPage) => setPage(newPage)}
                      onRowsPerPageChange={(event) => {
                        setRowsPerPage(Number.parseInt(event.target.value, 10));
                        setPage(0);
                      }}
                      sx={{ flexShrink: 0, borderTop: "1px solid #f1f5f9" }}
                    />
                  )}
                </Paper>
              )
            ) : (
              /* Today's Attendance Table */
              <Paper
                sx={{
                  flex: 1,
                  minHeight: 0,
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: 2.5,
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                  overflow: "hidden",
                  bgcolor: "#ffffff",
                }}
              >
                {/* Header */}
                <Box
                  sx={{
                    p: 1.2,
                    px: 2,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderBottom: "1px solid #f1f5f9",
                    flexShrink: 0,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: "0.92rem", color: "#0f172a" }}>
                      Daily Attendance - {format(selectedTodayDate, "dd/MM/yyyy")}
                    </Typography>
                    <Chip
                      label={`${filteredTodayAttendance.length} Employees`}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: "0.7rem",
                        fontWeight: 600,
                        bgcolor: "#fff7ed",
                        color: "#f37021",
                        border: "1px solid #ffedd5",
                      }}
                    />
                  </Box>
                </Box>

                {/* Table Container */}
                <TableContainer sx={{ flex: 1, minHeight: 0, overflowY: "auto", overflowX: "auto" }}>
                  {filteredTodayAttendance.length === 0 ? (
                    <Box sx={{ textAlign: "center", py: 6 }}>
                      <Today sx={{ fontSize: 48, color: "#cbd5e1", mb: 1.5 }} />
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        No attendance records for {format(selectedTodayDate, "dd/MM/yyyy")}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        No employees have checked in yet or data is not available.
                      </Typography>
                    </Box>
                  ) : isMobile ? (
                    <Stack spacing={1} sx={{ p: 1 }}>
                      {filteredTodayAttendance
                        .slice(
                          todayPage * todayRowsPerPage,
                          todayPage * todayRowsPerPage + todayRowsPerPage,
                        )
                        .map((attendance, index) => (
                          <TodayAttendanceCard
                            key={index}
                            attendance={attendance}
                            isMobile={isMobile}
                            employees={employees}
                          />
                        ))}
                    </Stack>
                  ) : (
                    <Table stickyHeader size="small">
                      <TableHead>
                        <TableRow>
                          {[
                            "Employee",
                            "Contact No.",
                            "Check In",
                            "Check Out",
                            "Working Hours",
                            "Status",
                          ].map((head) => (
                            <TableCell
                              key={head}
                              sx={{
                                bgcolor: "#f8fafc",
                                color: "#475569",
                                fontWeight: 700,
                                fontSize: "0.75rem",
                                py: 1,
                                borderBottom: "1px solid #e2e8f0",
                              }}
                            >
                              {head}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredTodayAttendance
                          .slice(
                            todayPage * todayRowsPerPage,
                            todayPage * todayRowsPerPage + todayRowsPerPage,
                          )
                          .map((attendance, index) => {
                            const employee =
                              attendance._employee ||
                              employees.find(
                                (emp) => emp.EmpId === attendance.EmpId,
                              ) ||
                              {};
                            const status =
                              attendance._status ||
                              (attendance.FirstIn === "N/A" || !attendance.FirstIn
                                ? "absent"
                                : "present");

                            return (
                              <TableRow
                                key={index}
                                sx={{
                                  "&:hover": { bgcolor: "#f8fafc" },
                                  borderLeft: `3px solid ${
                                    status === "present" ? "#10b981" : "#ef4444"
                                  }`,
                                }}
                              >
                                <TableCell sx={{ py: 0.8 }}>
                                  <Box display="flex" alignItems="center" gap={1}>
                                    <Avatar
                                      sx={{
                                        width: 28,
                                        height: 28,
                                        fontSize: "0.75rem",
                                        fontWeight: 600,
                                        bgcolor: "#f37021",
                                      }}
                                    >
                                      {employee.Name
                                        ? employee.Name.charAt(0).toUpperCase()
                                        : attendance.EmpId.charAt(0)}
                                    </Avatar>
                                    <Box>
                                      <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: "#0f172a" }}>
                                        {employee.Name || attendance.EmpId}
                                      </Typography>
                                      <Typography sx={{ fontSize: "0.7rem", color: "#64748b" }}>
                                        {attendance.EmpId}
                                      </Typography>
                                    </Box>
                                  </Box>
                                </TableCell>
                                <TableCell sx={{ py: 0.8 }}>
                                  <Box display="flex" alignItems="center" gap={0.5}>
                                    <LocalPhoneIcon sx={{ fontSize: 14, color: "#64748b" }} />
                                    <Typography sx={{ fontSize: "0.78rem", fontWeight: 500 }}>
                                      {employee.Mobile || "N/A"}
                                    </Typography>
                                  </Box>
                                </TableCell>
                                <TableCell sx={{ py: 0.8 }}>
                                  {status === "present" ? (
                                    <Tooltip title={`Location: ${attendance.FirstInLocation || "N/A"}`}>
                                      <Box
                                        component="a"
                                        href={generateMapUrl(attendance.FirstInLocation)}
                                        target="_blank"
                                        sx={{
                                          textDecoration: "none",
                                          color: "#0284c7",
                                          display: "flex",
                                          alignItems: "center",
                                          gap: 0.5,
                                          fontSize: "0.78rem",
                                          "&:hover": { textDecoration: "underline" },
                                        }}
                                      >
                                        <LocationOn sx={{ fontSize: 14 }} />
                                        {attendance.FirstIn} ({attendance.FirstEvent})
                                      </Box>
                                    </Tooltip>
                                  ) : (
                                    <Typography sx={{ color: "#94a3b8", fontSize: "0.78rem" }}>
                                      Not Checked In
                                    </Typography>
                                  )}
                                </TableCell>
                                <TableCell sx={{ py: 0.8 }}>
                                  {status === "present" && attendance.LastOutLocation !== "N/A" ? (
                                    <Tooltip title={`Location: ${attendance.LastOutLocation}`}>
                                      <Box
                                        component="a"
                                        href={generateMapUrl(attendance.LastOutLocation)}
                                        target="_blank"
                                        sx={{
                                          textDecoration: "none",
                                          color: "#0284c7",
                                          display: "flex",
                                          alignItems: "center",
                                          gap: 0.5,
                                          fontSize: "0.78rem",
                                          "&:hover": { textDecoration: "underline" },
                                        }}
                                      >
                                        <LocationOn sx={{ fontSize: 14 }} />
                                        {attendance.LastOut} ({attendance.LastEvent})
                                      </Box>
                                    </Tooltip>
                                  ) : (
                                    <Box display="flex" alignItems="center" gap={0.5} sx={{ color: "#94a3b8", fontSize: "0.78rem" }}>
                                      <Schedule sx={{ fontSize: 14 }} />
                                      {attendance.LastOut}
                                    </Box>
                                  )}
                                </TableCell>
                                <TableCell sx={{ py: 0.8 }}>
                                  {status === "present" ? (
                                    <Box display="flex" alignItems="center" gap={0.5}>
                                      <AccessTime sx={{ fontSize: 14, color: "#64748b" }} />
                                      <Typography sx={{ fontSize: "0.78rem", fontWeight: 600 }}>
                                        {attendance.WorkingHours}
                                      </Typography>
                                    </Box>
                                  ) : (
                                    <Typography sx={{ color: "#94a3b8", fontSize: "0.78rem" }}>
                                      0h 0m
                                    </Typography>
                                  )}
                                </TableCell>
                                <TableCell sx={{ py: 0.8 }}>
                                  <AttendanceStatusChip
                                    status={status}
                                    time={
                                      status === "present" && attendance.FirstIn !== "N/A"
                                        ? attendance.FirstIn
                                        : ""
                                    }
                                  />
                                </TableCell>
                              </TableRow>
                            );
                          })}
                      </TableBody>
                    </Table>
                  )}
                </TableContainer>

                {/* Table Pagination */}
                {filteredTodayAttendance.length > 0 && (
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={filteredTodayAttendance.length}
                    rowsPerPage={todayRowsPerPage}
                    page={todayPage}
                    onPageChange={(event, newPage) => setTodayPage(newPage)}
                    onRowsPerPageChange={(event) => {
                      setTodayRowsPerPage(Number.parseInt(event.target.value, 10));
                      setTodayPage(0);
                    }}
                    sx={{ flexShrink: 0, borderTop: "1px solid #f1f5f9" }}
                  />
                )}
              </Paper>
            )}
          </Box>

          {/* Right Column: Attendance Overview & Summary Cards */}
          <Paper
            elevation={0}
            sx={{
              display: { xs: "none", lg: "flex" },
              flexDirection: "column",
              borderRadius: 2.5,
              border: "1px solid #e2e8f0",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              bgcolor: "#ffffff",
              height: "100%",
              minHeight: 0,
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <Box
              sx={{
                p: 1.2,
                px: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid #f1f5f9",
                flexShrink: 0,
              }}
            >
              <Typography sx={{ fontWeight: 700, fontSize: "0.92rem", color: "#0f172a" }}>
                {activeTab === 0 ? "Monthly Overview" : "Today's Overview"}
              </Typography>
              <Chip
                label={activeTab === 0 ? format(selectedDate, "MMM yyyy") : format(selectedTodayDate, "dd MMM")}
                size="small"
                sx={{
                  height: 22,
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  bgcolor: "#f1f5f9",
                  color: "#475569",
                  border: "1px solid #e2e8f0",
                }}
              />
            </Box>

            {/* Cards Container */}
            <Box
              sx={{
                p: 1.5,
                flex: 1,
                minHeight: 0,
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: 1.2,
              }}
            >
              {activeTab === 0 ? (
                <>
                  {/* Working Days Card (Soft Yellow/Amber) */}
                  <Card
                    elevation={0}
                    sx={{
                      bgcolor: "#fef9c3",
                      border: "1px solid #fef08a",
                      borderRadius: 2,
                      p: 1.5,
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                    }}
                  >
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: 2,
                        bgcolor: "#ffffff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#ca8a04",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                        flexShrink: 0,
                      }}
                    >
                      <CalendarToday sx={{ fontSize: 22 }} />
                    </Box>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography sx={{ fontWeight: 800, fontSize: "1.35rem", lineHeight: 1.1, color: "#713f12" }}>
                        {totalDays}
                      </Typography>
                      <Typography sx={{ fontSize: "0.78rem", fontWeight: 600, color: "#854d0e", mt: 0.2 }}>
                        Working Days
                      </Typography>
                      <Typography sx={{ fontSize: "0.7rem", color: "#a16207", mt: 0.2 }}>
                        {filteredActivities.length} records logged
                      </Typography>
                    </Box>
                  </Card>

                  {/* On Time Card (Soft Green) */}
                  <Card
                    elevation={0}
                    sx={{
                      bgcolor: "#dcfce7",
                      border: "1px solid #bbf7d0",
                      borderRadius: 2,
                      p: 1.5,
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                    }}
                  >
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: 2,
                        bgcolor: "#ffffff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#16a34a",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                        flexShrink: 0,
                      }}
                    >
                      <CheckCircle sx={{ fontSize: 22 }} />
                    </Box>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.8 }}>
                        <Typography sx={{ fontWeight: 800, fontSize: "1.35rem", lineHeight: 1.1, color: "#14532d" }}>
                          {onTimeDays}
                        </Typography>
                        {totalDays > 0 && (
                          <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#15803d" }}>
                            ({((onTimeDays / totalDays) * 100).toFixed(0)}%)
                          </Typography>
                        )}
                      </Box>
                      <Typography sx={{ fontSize: "0.78rem", fontWeight: 600, color: "#166534", mt: 0.2 }}>
                        On Time Check-ins
                      </Typography>
                      <Typography sx={{ fontSize: "0.7rem", color: "#15803d", mt: 0.2 }}>
                        Punctual attendance
                      </Typography>
                    </Box>
                  </Card>

                  {/* Late Arrivals Card (Soft Red) */}
                  <Card
                    elevation={0}
                    sx={{
                      bgcolor: "#fee2e2",
                      border: "1px solid #fecaca",
                      borderRadius: 2,
                      p: 1.5,
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                    }}
                  >
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: 2,
                        bgcolor: "#ffffff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#dc2626",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                        flexShrink: 0,
                      }}
                    >
                      <Cancel sx={{ fontSize: 22 }} />
                    </Box>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.8 }}>
                        <Typography sx={{ fontWeight: 800, fontSize: "1.35rem", lineHeight: 1.1, color: "#7f1d1d" }}>
                          {lateDays}
                        </Typography>
                        {totalDays > 0 && (
                          <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#b91c1c" }}>
                            ({((lateDays / totalDays) * 100).toFixed(0)}%)
                          </Typography>
                        )}
                      </Box>
                      <Typography sx={{ fontSize: "0.78rem", fontWeight: 600, color: "#991b1b", mt: 0.2 }}>
                        Late Arrivals
                      </Typography>
                      <Typography sx={{ fontSize: "0.7rem", color: "#b91c1c", mt: 0.2 }}>
                        Delayed check-ins
                      </Typography>
                    </Box>
                  </Card>

                  {/* Non-Working / Leaves Card */}
                  <Card
                    elevation={0}
                    sx={{
                      bgcolor: "#fff7ed",
                      border: "1px solid #ffedd5",
                      borderRadius: 2,
                      p: 1.5,
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                    }}
                  >
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: 2,
                        bgcolor: "#ffffff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#ea580c",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                        flexShrink: 0,
                      }}
                    >
                      <Event sx={{ fontSize: 22 }} />
                    </Box>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography sx={{ fontWeight: 800, fontSize: "1.35rem", lineHeight: 1.1, color: "#7c2d12" }}>
                        {holidayCount + weekOffCount + leaveCount}
                      </Typography>
                      <Typography sx={{ fontSize: "0.78rem", fontWeight: 600, color: "#9a3412", mt: 0.2 }}>
                        Non-Working / Leaves
                      </Typography>
                      <Typography sx={{ fontSize: "0.7rem", color: "#c2410c", mt: 0.2 }}>
                        {holidayCount} Hol • {weekOffCount} Off • {leaveCount} Lv
                      </Typography>
                    </Box>
                  </Card>
                </>
              ) : (
                <>
                  {/* Today: Total Employees */}
                  <Card
                    elevation={0}
                    sx={{
                      bgcolor: "#fef9c3",
                      border: "1px solid #fef08a",
                      borderRadius: 2,
                      p: 1.5,
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                    }}
                  >
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: 2,
                        bgcolor: "#ffffff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#ca8a04",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                        flexShrink: 0,
                      }}
                    >
                      <Groups sx={{ fontSize: 22 }} />
                    </Box>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography sx={{ fontWeight: 800, fontSize: "1.35rem", lineHeight: 1.1, color: "#713f12" }}>
                        {activeEmployeesCount}
                      </Typography>
                      <Typography sx={{ fontSize: "0.78rem", fontWeight: 600, color: "#854d0e", mt: 0.2 }}>
                        Total Employees
                      </Typography>
                      <Typography sx={{ fontSize: "0.7rem", color: "#a16207", mt: 0.2 }}>
                        Active staff count
                      </Typography>
                    </Box>
                  </Card>

                  {/* Today: Present Today */}
                  <Card
                    elevation={0}
                    sx={{
                      bgcolor: "#dcfce7",
                      border: "1px solid #bbf7d0",
                      borderRadius: 2,
                      p: 1.5,
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                    }}
                  >
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: 2,
                        bgcolor: "#ffffff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#16a34a",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                        flexShrink: 0,
                      }}
                    >
                      <CheckCircle sx={{ fontSize: 22 }} />
                    </Box>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.8 }}>
                        <Typography sx={{ fontWeight: 800, fontSize: "1.35rem", lineHeight: 1.1, color: "#14532d" }}>
                          {presentCount}
                        </Typography>
                        {activeEmployeesCount > 0 && (
                          <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#15803d" }}>
                            ({((presentCount / activeEmployeesCount) * 100).toFixed(0)}%)
                          </Typography>
                        )}
                      </Box>
                      <Typography sx={{ fontSize: "0.78rem", fontWeight: 600, color: "#166534", mt: 0.2 }}>
                        Present Today
                      </Typography>
                      <Typography sx={{ fontSize: "0.7rem", color: "#15803d", mt: 0.2 }}>
                        Checked-in employees
                      </Typography>
                    </Box>
                  </Card>

                  {/* Today: Absent Today */}
                  <Card
                    elevation={0}
                    sx={{
                      bgcolor: "#fee2e2",
                      border: "1px solid #fecaca",
                      borderRadius: 2,
                      p: 1.5,
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                    }}
                  >
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: 2,
                        bgcolor: "#ffffff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#dc2626",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                        flexShrink: 0,
                      }}
                    >
                      <Cancel sx={{ fontSize: 22 }} />
                    </Box>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.8 }}>
                        <Typography sx={{ fontWeight: 800, fontSize: "1.35rem", lineHeight: 1.1, color: "#7f1d1d" }}>
                          {absentCount}
                        </Typography>
                        {activeEmployeesCount > 0 && (
                          <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#b91c1c" }}>
                            ({((absentCount / activeEmployeesCount) * 100).toFixed(0)}%)
                          </Typography>
                        )}
                      </Box>
                      <Typography sx={{ fontSize: "0.78rem", fontWeight: 600, color: "#991b1b", mt: 0.2 }}>
                        Absent Today
                      </Typography>
                      <Typography sx={{ fontSize: "0.7rem", color: "#b91c1c", mt: 0.2 }}>
                        Pending check-in
                      </Typography>
                    </Box>
                  </Card>
                </>
              )}
            </Box>
          </Paper>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default AttendanceList;