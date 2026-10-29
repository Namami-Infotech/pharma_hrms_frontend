"use client";
import { BASE_URL } from "../../api/endpoints";

import React from "react";
import { useState, useEffect } from "react";
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
              <CalendarToday fontSize="small" sx={{ color: "#8d0638ff" }} />
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

// Legend Component
const CalendarLegend = () => {
  const theme = useTheme();

  const legendItems = [
    {
      color: theme.palette.success.main,
      label: "On Time",
      icon: <AccessTime />,
    },
    { color: theme.palette.error.main, label: "Late", icon: <Schedule /> },
    { color: theme.palette.warning.main, label: "Holiday", icon: <Event /> },
    {
      color: theme.palette.secondary.main,
      label: "Week Off",
      icon: <Weekend />,
    },
    { color: theme.palette.info.main, label: "Leave", icon: <BeachAccess /> },
  ];

  return (
    <Paper
      sx={{
        p: { xs: 1.5, md: 2 },
        mb: 2,
        borderRadius: 2,
        boxShadow: 1,
      }}
    >
      <Typography
        variant="subtitle2"
        gutterBottom
        sx={{ display: "flex", alignItems: "center", gap: 1, fontWeight: 500 }}
      >
        <Info fontSize="small" />
        Calendar Legend
      </Typography>

      <Stack direction="row" spacing={2} flexWrap="wrap">
        {legendItems.map((item, index) => (
          <Box
            key={index}
            display="flex"
            alignItems="center"
            gap={1}
            sx={{
              mb: 1,
              px: 1,
              py: 0.5,
              borderRadius: 1,
              backgroundColor: "#f9f9f9",
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Box
              sx={{
                width: 18,
                height: 18,
                backgroundColor: item.color,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {React.cloneElement(item.icon, {
                sx: { fontSize: 12, color: "#fff" },
              })}
            </Box>
            <Typography variant="caption" sx={{ fontWeight: 500 }}>
              {item.label}
            </Typography>
          </Box>
        ))}
      </Stack>
    </Paper>
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

const AttendanceList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const isHrOrAdmin = ["HR", "Admin", "admin", "SuperAdmin"].includes(user?.role);
  const [selectedEmpId, setSelectedEmpId] = useState(
    isHrOrAdmin ? "" : user.emp_id,
  );
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

  // Helper function to determine if employee is active
  const isEmployeeActive = (employee) => {
    // Check IsActive field - 1 means active, 0 or other means inactive
    return (
      employee.IsActive === 1 ||
      employee.IsActive === "1" ||
      employee.IsActive === true
    );
  };

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

  // Filter today's attendance based on present/absent filter
  useEffect(() => {
    // Get active employees only
    const activeEmployees = employees.filter((emp) => isEmployeeActive(emp));

    // Create a set of employee IDs that have attendance records
    const presentEmpIds = new Set(
      todayAttendance.map((att) =>
        String(att.EmpId || "").trim().toLowerCase(),
      ),
    );

    // Create combined data with all active employees
    const combinedData = [];

    // Add present employees with their attendance data
    todayAttendance.forEach((att) => {
      const emp = employees.find(
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

    // Add absent employees (active employees not in todayAttendance)
    activeEmployees.forEach((emp) => {
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
  }, [todayAttendance, employees, todayFilter, selectedTodayDate]);

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

          // If user is not HR/Admin, set current user as selected
          if (!isHrOrAdmin) {
            const currentUserEmployee = fetchedEmployees.find(
              (emp) => emp.EmpId === user.emp_id,
            ) || {
              EmpId: user.emp_id,
              Name: user.name,
              WeekOff: user.weekOff || "Saturday,Sunday",
              Shift: user.shift || "9:00 AM - 6:00 PM",
              IsActive: 1,
            };
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

  // Today's attendance statistics (based on active employees only)
  const activeEmployeesCount = employees.filter((emp) =>
    isEmployeeActive(emp),
  ).length;
  const presentCount = todayAttendance.length; // API returns only present employees
  const absentCount = activeEmployeesCount - presentCount;

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
          px: { xs: 1, md: 2 },
          py: { xs: 1, md: 1 },
          backgroundColor: "#f5f5f5",
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 1800 }}>
          <Paper
            sx={{ p: { xs: 1.5, md: 2 }, mb: 3, borderRadius: 2, boxShadow: 2 }}
          >
            <Box display="flex" flexDirection="column" gap={2}>
              {/* Title Row */}
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography
                  variant="h5"
                  fontWeight="bold"
                  sx={{ color: "#8d0638ff" }}
                >
                  Attendance Management
                </Typography>

                {/* Mobile-only refresh button */}
                <Box sx={{ display: { xs: "block", md: "none" } }}>
                  <Tooltip title="Refresh Data">
                    <IconButton
                      onClick={refreshData}
                      disabled={loading || todayLoading}
                      size="small"
                      sx={{ ml: 1 }}
                    >
                      {loading || todayLoading ? (
                        <CircularProgress size={18} />
                      ) : (
                        <Refresh fontSize="small" />
                      )}
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

              {/* Main Controls - Stack vertically on mobile, row on desktop */}
              <Box
                display="flex"
                flexDirection={{ xs: "column", md: "row" }}
                gap={2}
              >
                {/* Left Side - Filters (Full width on mobile) */}
                <Box
                  flex={{ md: 1 }}
                  display="flex"
                  flexDirection={{ xs: "column", sm: "row" }}
                  gap={1.5}
                  sx={{ width: { xs: "100%", md: "auto" } }}
                >
                  {/* Select Employee field: Only shown in Attendance History tab (activeTab === 0), hidden in Today's Attendance tab so all employees are shown */}
                  {isHrOrAdmin && activeTab === 0 && (
                    <>
                      <Box flex={{ xs: 1, sm: 1 }}>
                        <Autocomplete
                          options={filteredEmployees}
                          getOptionLabel={(option) =>
                            `${option.Name} (${option.EmpId})`
                          }
                          value={
                            employees.find(
                              (emp) => emp.EmpId === selectedEmpId,
                            ) || null
                          }
                          onChange={(e, newValue) => {
                            setSelectedEmpId(newValue ? newValue.EmpId : "");
                            setSelectedEmployee(newValue);
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Select Employee"
                              variant="outlined"
                              size="small"
                              fullWidth
                            />
                          )}
                          loading={loading}
                        />
                      </Box>

                      {/* Employee Filter */}
                      <Box flex={{ xs: 1, sm: 1 }} minWidth={{ sm: 140 }}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Employee Status</InputLabel>
                          <Select
                            value={employeeFilter}
                            label="Employee Status"
                            onChange={(e) =>
                              handleEmployeeFilterChange(e.target.value)
                            }
                          >
                            <MenuItem value="active">Active Only</MenuItem>
                            <MenuItem value="inactive">Inactive Only</MenuItem>
                            <MenuItem value="all">All Employees</MenuItem>
                          </Select>
                        </FormControl>
                      </Box>
                    </>
                  )}

                  {/* Month/Year Selector - Only show in History tab */}
                  {activeTab === 0 && (
                    <Box flex={{ xs: 1, sm: 1 }}>
                      <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                          views={["year", "month"]}
                          label="Select Month & Year"
                          value={selectedDate}
                          onChange={(newValue) => setSelectedDate(newValue)}
                          renderInput={(params) => (
                            <TextField {...params} size="small" fullWidth />
                          )}
                        />
                      </LocalizationProvider>
                    </Box>
                  )}
                </Box>

                {/* Right Side - Action Buttons */}
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent={{ xs: "space-between", md: "flex-end" }}
                  gap={1}
                  sx={{
                    width: { xs: "100%", md: "auto" },
                    mt: { xs: 1, md: 0 },
                  }}
                >
                  {/* View Mode Toggle - Mobile/Tablet (only in History tab) */}
                  {activeTab === 0 && (
                    <Box sx={{ display: { xs: "flex", md: "none" }, gap: 0.5 }}>
                      <Tooltip title="Calendar View">
                        <Button
                          variant={
                            viewMode === "calendar" ? "contained" : "outlined"
                          }
                          onClick={() => setViewMode("calendar")}
                          size="small"
                          sx={{ minWidth: 40, px: 1 }}
                        >
                          <CalendarToday fontSize="small" />
                        </Button>
                      </Tooltip>
                      <Tooltip title="List View">
                        <Button
                          variant={
                            viewMode === "list" ? "contained" : "outlined"
                          }
                          onClick={() => setViewMode("list")}
                          size="small"
                          sx={{ minWidth: 40, px: 1 }}
                        >
                          <FilterList fontSize="small" />
                        </Button>
                      </Tooltip>
                    </Box>
                  )}

                  {/* View Mode Toggle - Desktop (only in History tab) */}
                  {activeTab === 0 && (
                    <Box
                      sx={{
                        display: { xs: "none", md: "flex" },
                        gap: 0.5,
                        mr: 1,
                      }}
                    >
                      <Tooltip title="Calendar View">
                        <Button
                          variant={
                            viewMode === "calendar" ? "contained" : "outlined"
                          }
                          onClick={() => setViewMode("calendar")}
                          size="small"
                          startIcon={<CalendarToday />}
                          sx={{ px: 2 }}
                        >
                          Calendar
                        </Button>
                      </Tooltip>
                      <Tooltip title="List View">
                        <Button
                          variant={
                            viewMode === "list" ? "contained" : "outlined"
                          }
                          onClick={() => setViewMode("list")}
                          size="small"
                          startIcon={<FilterList />}
                          sx={{ px: 2 }}
                        >
                          List
                        </Button>
                      </Tooltip>
                    </Box>
                  )}

                  {/* Action Buttons */}
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    {isHrOrAdmin && (
                      <Tooltip title="Regularise">
                        <IconButton
                          onClick={regularise}
                          size="small"
                          sx={{
                            border: `1px solid ${theme.palette.primary.main}`,
                            borderRadius: 1,
                            width: 36,
                            height: 36,
                          }}
                        >
                          <Settings fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}

                    {/* Export Button - Mobile */}
                    <Tooltip
                      title={
                        activeTab === 0
                          ? "Export to CSV"
                          : "Export Today's Data"
                      }
                    >
                      <IconButton
                        onClick={
                          activeTab === 0 ? exportToCsv : exportTodayToCsv
                        }
                        disabled={
                          activeTab === 0
                            ? filteredActivities.length === 0
                            : filteredTodayAttendance.length === 0
                        }
                        size="small"
                        sx={{
                          border: `1px solid ${theme.palette.primary.main}`,
                          borderRadius: 1,
                          width: 36,
                          height: 36,
                          backgroundColor: theme.palette.primary.main,
                          color: "#fff",
                          "&:hover": {
                            backgroundColor: theme.palette.primary.dark,
                          },
                          "&:disabled": {
                            backgroundColor: theme.palette.action.disabled,
                            borderColor: theme.palette.action.disabled,
                          },
                          display: { xs: "flex", md: "none" },
                        }}
                      >
                        <Download fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    {/* Export Button - Desktop */}
                    <Tooltip
                      title={
                        activeTab === 0
                          ? "Export to CSV"
                          : "Export Today's Data"
                      }
                    >
                      <Button
                        variant="contained"
                        onClick={
                          activeTab === 0 ? exportToCsv : exportTodayToCsv
                        }
                        disabled={
                          activeTab === 0
                            ? filteredActivities.length === 0
                            : filteredTodayAttendance.length === 0
                        }
                        size="small"
                        startIcon={<Download />}
                        sx={{
                          height: 36,
                          display: { xs: "none", md: "flex" },
                          px: 2,
                        }}
                      >
                        Export
                      </Button>
                    </Tooltip>

                    {/* Refresh Button - Desktop only (mobile is in title row) */}
                    <Box sx={{ display: { xs: "none", md: "block" } }}>
                      <Tooltip title="Refresh Data">
                        <IconButton
                          onClick={refreshData}
                          disabled={loading || todayLoading}
                          size="small"
                          sx={{
                            border: `1px solid ${theme.palette.primary.main}`,
                            borderRadius: 1,
                            width: 36,
                            height: 36,
                            ml: 0.5,
                          }}
                        >
                          {loading || todayLoading ? (
                            <CircularProgress size={18} />
                          ) : (
                            <Refresh fontSize="small" />
                          )}
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Stack>
                </Box>
              </Box>
            </Box>
          </Paper>

          {/* Error Alert */}
          {error && (
            <Alert
              severity="error"
              sx={{ mb: 3 }}
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          )}

          {/* Loading Alert */}
          {(loading || todayLoading) && (
            <Alert severity="info" sx={{ mb: 3 }}>
              <Box display="flex" alignItems="center" gap={2}>
                <CircularProgress size={20} />
                {activeTab === 0
                  ? "Loading attendance data..."
                  : "Loading today's attendance..."}
              </Box>
            </Alert>
          )}

          {/* Tabs for switching between views */}
          <Paper sx={{ mb: 2, borderRadius: 2, boxShadow: 1 }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{
                borderBottom: 1,
                borderColor: "divider",
                "& .MuiTab-root": {
                  minHeight: 48,
                },
              }}
            >
              <Tab
                icon={<CalendarToday />}
                label="Attendance History"
                iconPosition="start"
              />
              <Tab
                icon={<Today />}
                label="Today's Attendance"
                iconPosition="start"
              />
            </Tabs>
          </Paper>

          {activeTab === 0 ? (
            <>
              {/* Summary Cards for History View */}
              <Grid container spacing={1} sx={{ mb: 2 }}>
                <Grid item xs={6} sm={3}>
                  <Card
                    sx={{
                      background:
                        "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
                      p: 0.5,
                      borderRadius: 1.5,
                      boxShadow: 0.5,
                    }}
                  >
                    <CardContent sx={{ p: 0.5, "&:last-child": { pb: 0.5 } }}>
                      <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between"
                      >
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Working Days
                          </Typography>
                          <Typography
                            variant="subtitle2"
                            fontWeight="bold"
                            lineHeight={1}
                          >
                            {totalDays}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Records
                          </Typography>
                        </Box>
                        <CalendarToday
                          sx={{ fontSize: 18, color: "#8d0638ff" }}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={6} sm={3}>
                  <Card
                    sx={{
                      background:
                        "linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)",
                      p: 0.5,
                      borderRadius: 1.5,
                      boxShadow: 0.5,
                    }}
                  >
                    <CardContent sx={{ p: 0.5, "&:last-child": { pb: 0.5 } }}>
                      <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between"
                      >
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            On Time
                          </Typography>
                          <Typography
                            variant="subtitle2"
                            fontWeight="bold"
                            color="success.main"
                            lineHeight={1}
                          >
                            {onTimeDays}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {totalDays > 0
                              ? `${((onTimeDays / totalDays) * 100).toFixed(1)}%`
                              : "0%"}
                          </Typography>
                        </Box>
                        <AccessTime
                          sx={{ fontSize: 18, color: "success.main" }}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={6} sm={3}>
                  <Card
                    sx={{
                      background:
                        "linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)",
                      p: 0.5,
                      borderRadius: 1.5,
                      boxShadow: 0.5,
                    }}
                  >
                    <CardContent sx={{ p: 0.5, "&:last-child": { pb: 0.5 } }}>
                      <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between"
                      >
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Late Arrivals
                          </Typography>
                          <Typography
                            variant="subtitle2"
                            fontWeight="bold"
                            color="error.main"
                            lineHeight={1}
                          >
                            {lateDays}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {totalDays > 0
                              ? `${((lateDays / totalDays) * 100).toFixed(1)}%`
                              : "0%"}
                          </Typography>
                        </Box>
                        <Schedule sx={{ fontSize: 18, color: "error.main" }} />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={6} sm={3}>
                  <Card
                    sx={{
                      background:
                        "linear-gradient(135deg, #fff3e0 0%, #ffcc80 100%)",
                      p: 0.5,
                      borderRadius: 1.5,
                      boxShadow: 0.5,
                    }}
                  >
                    <CardContent sx={{ p: 0.5, "&:last-child": { pb: 0.5 } }}>
                      <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between"
                      >
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Non-Working
                          </Typography>
                          <Typography
                            variant="subtitle2"
                            fontWeight="bold"
                            color="warning.main"
                            lineHeight={1}
                          >
                            {holidayCount + weekOffCount + leaveCount}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Holidays / Leaves
                          </Typography>
                        </Box>
                        <Event sx={{ fontSize: 18, color: "warning.main" }} />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Calendar Legend */}
              <CalendarLegend />

              {/* Main Content for History View */}
              {viewMode === "calendar" ? (
                <Paper
                  sx={{ p: { xs: 1.5, md: 2 }, borderRadius: 2, boxShadow: 1 }}
                >
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ fontWeight: 500 }}
                  >
                    Attendance Calendar - {format(selectedDate, "MMMM yyyy")}
                  </Typography>

                  <Calendar
                    localizer={localizer}
                    events={filteredActivities}
                    startAccessor="start"
                    endAccessor="end"
                    style={{
                      height: 450,
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
                </Paper>
              ) : (
                <Paper sx={{ borderRadius: 2, boxShadow: 1 }}>
                  <Box sx={{ p: { xs: 1.5, md: 2 } }}>
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{ fontWeight: 500 }}
                    >
                      All Records - {format(selectedDate, "MMMM yyyy")}
                    </Typography>
                    <Divider sx={{ mb: 2 }} />

                    {filteredActivities.length === 0 ? (
                      <Box sx={{ textAlign: "center", py: 6 }}>
                        <CalendarToday
                          sx={{ fontSize: 60, color: "text.secondary", mb: 2 }}
                        />
                        <Typography
                          variant="subtitle1"
                          color="text.secondary"
                          gutterBottom
                        >
                          No records found
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {selectedEmpId
                            ? `No data available for ${format(selectedDate, "MMMM yyyy")}`
                            : "Please select an employee to view attendance data"}
                        </Typography>
                      </Box>
                    ) : isMobile ? (
                      <Stack spacing={1}>
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
                      <TableContainer sx={{ borderRadius: 2 }}>
                        <Table>
                          <TableHead>
                            <TableRow
                              sx={{
                                backgroundColor: theme.palette.primary.main,
                              }}
                            >
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
                                    color: "#fff",
                                    fontWeight: 600,
                                    py: 1.2,
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
                                    "&:hover": {
                                      backgroundColor:
                                        theme.palette.action.hover,
                                    },
                                    borderLeft: `4px solid ${activity.type === "attendance"
                                        ? activity.color === "green"
                                          ? theme.palette.success.main
                                          : theme.palette.error.main
                                        : activity.type === "holiday"
                                          ? theme.palette.warning.main
                                          : activity.type === "weekoff"
                                            ? theme.palette.secondary.main
                                            : theme.palette.info.main
                                      }`,
                                    transition: "background 0.3s",
                                  }}
                                >
                                  <TableCell sx={{ py: 1 }}>
                                    <Box
                                      display="flex"
                                      alignItems="center"
                                      gap={1}
                                    >
                                      <CalendarToday
                                        fontSize="small"
                                        sx={{ color: "#8d0638ff" }}
                                      />
                                      {activity.start
                                        ? format(activity.start, "dd/MM/yyyy")
                                        : "N/A"}
                                    </Box>
                                  </TableCell>

                                  <TableCell sx={{ py: 1 }}>
                                    <Box
                                      display="flex"
                                      alignItems="center"
                                      gap={1}
                                    >
                                      {activity.type === "attendance" && (
                                        <Person fontSize="small" />
                                      )}
                                      {activity.type === "holiday" && (
                                        <Event fontSize="small" />
                                      )}
                                      {activity.type === "weekoff" && (
                                        <Weekend fontSize="small" />
                                      )}
                                      {activity.type === "leave" && (
                                        <BeachAccess fontSize="small" />
                                      )}
                                      <Typography
                                        variant="body2"
                                        sx={{ textTransform: "capitalize" }}
                                      >
                                        {activity.type}
                                      </Typography>
                                    </Box>
                                  </TableCell>

                                  <TableCell sx={{ py: 1 }}>
                                    {activity.type === "attendance" ? (
                                      <Tooltip
                                        title={`Location: ${activity.firstInLocation || "N/A"}`}
                                      >
                                        <Box
                                          component="a"
                                          href={generateMapUrl(
                                            activity.firstInLocation,
                                          )}
                                          target="_blank"
                                          sx={{
                                            textDecoration: "none",
                                            color: "primary.main",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1,
                                            "&:hover": {
                                              textDecoration: "underline",
                                            },
                                          }}
                                        >
                                          <LocationOn fontSize="small" />
                                          {activity.firstIn} (
                                          {activity.firstEvent})
                                        </Box>
                                      </Tooltip>
                                    ) : (
                                      <Typography
                                        variant="body2"
                                        color="text.secondary"
                                      >
                                        -
                                      </Typography>
                                    )}
                                  </TableCell>

                                  <TableCell sx={{ py: 1 }}>
                                    {activity.type === "attendance" ? (
                                      activity.lastOutLocation !== "N/A" ? (
                                        <Tooltip
                                          title={`Location: ${activity.lastOutLocation}`}
                                        >
                                          <Box
                                            component="a"
                                            href={generateMapUrl(
                                              activity.lastOutLocation,
                                            )}
                                            target="_blank"
                                            sx={{
                                              textDecoration: "none",
                                              color: "primary.main",
                                              display: "flex",
                                              alignItems: "center",
                                              gap: 1,
                                              "&:hover": {
                                                textDecoration: "underline",
                                              },
                                            }}
                                          >
                                            <LocationOn fontSize="small" />
                                            {activity.lastOut} (
                                            {activity.lastEvent})
                                          </Box>
                                        </Tooltip>
                                      ) : (
                                        <Box
                                          display="flex"
                                          alignItems="center"
                                          gap={1}
                                        >
                                          <Schedule
                                            fontSize="small"
                                            color="disabled"
                                          />
                                          {activity.lastOut}
                                        </Box>
                                      )
                                    ) : (
                                      <Typography
                                        variant="body2"
                                        color="text.secondary"
                                      >
                                        -
                                      </Typography>
                                    )}
                                  </TableCell>

                                  <TableCell sx={{ py: 1 }}>
                                    {activity.type === "attendance" ? (
                                      <Box
                                        display="flex"
                                        alignItems="center"
                                        gap={1}
                                      >
                                        <AccessTime
                                          fontSize="small"
                                          color="info"
                                        />
                                        <Typography fontWeight={500}>
                                          {activity.workingHours}
                                        </Typography>
                                      </Box>
                                    ) : (
                                      <Typography
                                        variant="body2"
                                        color="text.secondary"
                                      >
                                        -
                                      </Typography>
                                    )}
                                  </TableCell>

                                  <TableCell sx={{ py: 1 }}>
                                    {activity.type === "attendance" ? (
                                      <AttendanceStatusChip
                                        status={
                                          activity.color === "green"
                                            ? "on-time"
                                            : "late"
                                        }
                                        time=""
                                      />
                                    ) : (
                                      <AttendanceStatusChip
                                        status={activity.type}
                                      />
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}

                    {filteredActivities.length > 0 && (
                      <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={filteredActivities.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={(event, newPage) => setPage(newPage)}
                        onRowsPerPageChange={(event) => {
                          setRowsPerPage(
                            Number.parseInt(event.target.value, 10),
                          );
                          setPage(0);
                        }}
                      />
                    )}
                  </Box>
                </Paper>
              )}
            </>
          ) : (
            <>
              {/* Today's Attendance View */}
              <Paper sx={{ borderRadius: 2, boxShadow: 1 }}>
                <Box sx={{ p: { xs: 1.5, md: 2 } }}>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={2}
                    flexWrap="wrap"
                    gap={2}
                  >
                    <Box display="flex" alignItems="center" gap={2}>
                      <Typography variant="h6" sx={{ fontWeight: 500 }}>
                        Daily Attendance
                      </Typography>
                      <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                          label="Select Date"
                          value={selectedTodayDate}
                          onChange={(newDate) => setSelectedTodayDate(newDate)}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              size="small"
                              sx={{ width: 150 }}
                            />
                          )}
                        />
                      </LocalizationProvider>
                    </Box>

                    <Box
                      display="flex"
                      alignItems="center"
                      gap={2}
                      flexWrap="wrap"
                    >
                      <Box display="flex" alignItems="center" gap={1}>
                        <Badge
                          color="primary"
                          badgeContent={activeEmployeesCount}
                          sx={{ cursor: "pointer" }}
                          onClick={handleAllClick}
                        >
                          <Groups
                            color={todayFilter === "all" ? "primary" : "action"}
                          />
                        </Badge>
                        <Typography
                          variant="body2"
                          onClick={handleAllClick}
                          sx={{
                            cursor: "pointer",
                            fontWeight:
                              todayFilter === "all" ? "bold" : "normal",
                            borderBottom:
                              todayFilter === "all"
                                ? `2px solid ${theme.palette.primary.main}`
                                : "none",
                          }}
                        >
                          Total: <strong>{activeEmployeesCount}</strong>
                        </Typography>
                      </Box>

                      <Box display="flex" alignItems="center" gap={1}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: "50%",
                            backgroundColor: "success.main",
                            cursor: "pointer",
                          }}
                          onClick={handlePresentClick}
                        />
                        <Typography
                          variant="body2"
                          onClick={handlePresentClick}
                          sx={{
                            cursor: "pointer",
                            fontWeight:
                              todayFilter === "present" ? "bold" : "normal",
                            borderBottom:
                              todayFilter === "present"
                                ? `2px solid ${theme.palette.success.main}`
                                : "none",
                          }}
                        >
                          Present: <strong>{presentCount}</strong>
                        </Typography>
                      </Box>

                      <Box display="flex" alignItems="center" gap={1}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: "50%",
                            backgroundColor: "error.main",
                            cursor: "pointer",
                          }}
                          onClick={handleAbsentClick}
                        />
                        <Typography
                          variant="body2"
                          onClick={handleAbsentClick}
                          sx={{
                            cursor: "pointer",
                            fontWeight:
                              todayFilter === "absent" ? "bold" : "normal",
                            borderBottom:
                              todayFilter === "absent"
                                ? `2px solid ${theme.palette.error.main}`
                                : "none",
                          }}
                        >
                          Absent: <strong>{absentCount}</strong>
                        </Typography>
                      </Box>

                      {/* Clear filter button */}
                      {todayFilter !== "all" && (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => setTodayFilter("all")}
                          sx={{ ml: 1 }}
                        >
                          Clear Filter
                        </Button>
                      )}
                    </Box>
                  </Box>

                  <Divider sx={{ mb: 2 }} />

                  {filteredTodayAttendance.length === 0 ? (
                    <Box sx={{ textAlign: "center", py: 6 }}>
                      <Today
                        sx={{ fontSize: 60, color: "text.secondary", mb: 2 }}
                      />
                      <Typography
                        variant="subtitle1"
                        color="text.secondary"
                        gutterBottom
                      >
                        No attendance records for{" "}
                        {format(selectedTodayDate, "dd/MM/yyyy")}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        No employees have checked in yet or data is not
                        available.
                      </Typography>
                    </Box>
                  ) : isMobile ? (
                    <Stack spacing={1}>
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
                    <TableContainer sx={{ borderRadius: 2 }}>
                      <Table>
                        <TableHead>
                          <TableRow
                            sx={{ backgroundColor: theme.palette.primary.main }}
                          >
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
                                sx={{ color: "#fff", fontWeight: 600, py: 1.2 }}
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
                                (attendance.FirstIn === "N/A" ||
                                  !attendance.FirstIn
                                  ? "absent"
                                  : "present");

                              return (
                                <TableRow
                                  key={index}
                                  sx={{
                                    "&:hover": {
                                      backgroundColor:
                                        theme.palette.action.hover,
                                    },
                                    borderLeft: `4px solid ${status === "present"
                                        ? theme.palette.success.main
                                        : theme.palette.error.main
                                      }`,
                                    transition: "background 0.3s",
                                  }}
                                >
                                  <TableCell sx={{ py: 1 }}>
                                    <Box
                                      display="flex"
                                      alignItems="center"
                                      gap={1}
                                    >
                                      <Avatar
                                        sx={{
                                          width: 32,
                                          height: 32,
                                          bgcolor: theme.palette.primary.main,
                                        }}
                                      >
                                        {employee.Name
                                          ? employee.Name.charAt(
                                            0,
                                          ).toUpperCase()
                                          : attendance.EmpId.charAt(0)}
                                      </Avatar>
                                      <Box>
                                        <Typography
                                          variant="body2"
                                          fontWeight="medium"
                                        >
                                          {employee.Name || attendance.EmpId}
                                        </Typography>
                                        <Typography
                                          variant="caption"
                                          color="text.secondary"
                                        >
                                          {attendance.EmpId}
                                        </Typography>
                                      </Box>
                                    </Box>
                                  </TableCell>

                                  <TableCell sx={{ py: 1 }}>
                                    <Box
                                      display="flex"
                                      alignItems="center"
                                      gap={1}
                                    >
                                      <LocalPhoneIcon
                                        fontSize="small"
                                        color="info"
                                      />
                                      <Typography fontWeight={500}>
                                        {employee.Mobile || "N/A"}
                                      </Typography>
                                    </Box>
                                  </TableCell>

                                  <TableCell sx={{ py: 1 }}>
                                    {status === "present" ? (
                                      <Tooltip
                                        title={`Location: ${attendance.FirstInLocation || "N/A"}`}
                                      >
                                        <Box
                                          component="a"
                                          href={generateMapUrl(
                                            attendance.FirstInLocation,
                                          )}
                                          target="_blank"
                                          sx={{
                                            textDecoration: "none",
                                            color: "primary.main",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1,
                                            "&:hover": {
                                              textDecoration: "underline",
                                            },
                                          }}
                                        >
                                          <LocationOn fontSize="small" />
                                          {attendance.FirstIn} (
                                          {attendance.FirstEvent})
                                        </Box>
                                      </Tooltip>
                                    ) : (
                                      <Typography
                                        variant="body2"
                                        color="text.secondary"
                                      >
                                        Not Checked In
                                      </Typography>
                                    )}
                                  </TableCell>

                                  <TableCell sx={{ py: 1 }}>
                                    {status === "present" &&
                                      attendance.LastOutLocation !== "N/A" ? (
                                      <Tooltip
                                        title={`Location: ${attendance.LastOutLocation}`}
                                      >
                                        <Box
                                          component="a"
                                          href={generateMapUrl(
                                            attendance.LastOutLocation,
                                          )}
                                          target="_blank"
                                          sx={{
                                            textDecoration: "none",
                                            color: "primary.main",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1,
                                            "&:hover": {
                                              textDecoration: "underline",
                                            },
                                          }}
                                        >
                                          <LocationOn fontSize="small" />
                                          {attendance.LastOut} (
                                          {attendance.LastEvent})
                                        </Box>
                                      </Tooltip>
                                    ) : (
                                      <Box
                                        display="flex"
                                        alignItems="center"
                                        gap={1}
                                      >
                                        <Schedule
                                          fontSize="small"
                                          color="disabled"
                                        />
                                        {attendance.LastOut}
                                      </Box>
                                    )}
                                  </TableCell>

                                  <TableCell sx={{ py: 1 }}>
                                    {status === "present" ? (
                                      <Box
                                        display="flex"
                                        alignItems="center"
                                        gap={1}
                                      >
                                        <AccessTime
                                          fontSize="small"
                                          color="info"
                                        />
                                        <Typography fontWeight={500}>
                                          {attendance.WorkingHours}
                                        </Typography>
                                      </Box>
                                    ) : (
                                      <Typography
                                        variant="body2"
                                        color="text.secondary"
                                      >
                                        0h 0m
                                      </Typography>
                                    )}
                                  </TableCell>

                                  <TableCell sx={{ py: 1 }}>
                                    <AttendanceStatusChip
                                      status={status}
                                      time={
                                        status === "present" &&
                                          attendance.FirstIn !== "N/A"
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
                    </TableContainer>
                  )}

                  {filteredTodayAttendance.length > 0 && (
                    <TablePagination
                      rowsPerPageOptions={[5, 10, 25]}
                      component="div"
                      count={filteredTodayAttendance.length}
                      rowsPerPage={todayRowsPerPage}
                      page={todayPage}
                      onPageChange={(event, newPage) => setTodayPage(newPage)}
                      onRowsPerPageChange={(event) => {
                        setTodayRowsPerPage(
                          Number.parseInt(event.target.value, 10),
                        );
                        setTodayPage(0);
                      }}
                    />
                  )}
                </Box>
              </Paper>
            </>
          )}
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default AttendanceList;
