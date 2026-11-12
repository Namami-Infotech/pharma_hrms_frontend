"use client";
import { BASE_URL } from "../../api/endpoints";

import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  Alert,
  useTheme,
  Stack,
  IconButton,
  TablePagination,
  Tooltip,
  alpha,
} from "@mui/material";
import {
  Search,
  Refresh,
  Person,
  CheckCircle,
  Cancel,
  Schedule,
  HowToReg,
  DateRange,
  Clear,
  AccessTime,
  Edit,
} from "@mui/icons-material";
import { format, parseISO, subDays, addDays, isAfter, isBefore } from "date-fns";
import axios from "axios";
import { useAuth } from "../auth/AuthContext";

// Helper to convert time strings (e.g. "09:30 AM", "06:30 PM", "18:00:00") to HH:mm for input[type=time]
const timeStringToHHMM = (timeStr) => {
  if (!timeStr || timeStr === "N/A") return "09:00";
  if (/^\d{2}:\d{2}$/.test(timeStr)) return timeStr;
  if (/^\d{2}:\d{2}:\d{2}$/.test(timeStr)) return timeStr.slice(0, 5);
  const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (match) {
    let hours = parseInt(match[1], 10);
    const minutes = match[2];
    const ampm = match[3] ? match[3].toUpperCase() : null;
    if (ampm === "PM" && hours < 12) hours += 12;
    if (ampm === "AM" && hours === 12) hours = 0;
    return `${String(hours).padStart(2, "0")}:${minutes}`;
  }
  return "09:00";
};

const StatusBadge = ({ isMarked, inTime, outTime }) => {
  if (isMarked) {
    const hasTimes = inTime && outTime && inTime !== "N/A" && outTime !== "N/A";
    const label = hasTimes ? `Marked (${inTime} - ${outTime})` : "Marked";
    return (
      <Tooltip title={hasTimes ? `IN: ${inTime} | OUT: ${outTime}` : "Attendance Marked"}>
        <Chip
          size="small"
          icon={<CheckCircle fontSize="small" />}
          label={label}
          color="success"
          variant="filled"
          sx={{ fontWeight: 600, fontSize: "0.75rem" }}
        />
      </Tooltip>
    );
  }

  return (
    <Chip
      size="small"
      icon={<Person fontSize="small" />}
      label="Not Marked"
      color="default"
      variant="outlined"
      sx={{ color: "text.secondary", fontSize: "0.75rem" }}
    />
  );
};

const ManualAttendancePage = () => {
  const { user } = useAuth();
  const theme = useTheme();

  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [statusFilter, setStatusFilter] = useState("all"); // "all", "marked", "unmarked"
  const [attendanceMap, setAttendanceMap] = useState({});

  // Dialog State
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [markAttendanceDialog, setMarkAttendanceDialog] = useState(false);
  const [formMode, setFormMode] = useState("mark"); // "mark" | "edit"
  const [attendanceDate, setAttendanceDate] = useState(new Date());
  const [inTime, setInTime] = useState("09:00");
  const [outTime, setOutTime] = useState("18:00");
  const [submitting, setSubmitting] = useState(false);

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Calculate min and max dates for the date picker
  const getMinDate = () => {
    return format(subDays(new Date(), 30), "yyyy-MM-dd");
  };

  const getMaxDate = () => {
    return format(new Date(), "yyyy-MM-dd");
  };

  // Fetch employees data
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(
        `${BASE_URL}/employee/list_employee.php?Tenent_Id=${user.tenent_id}`,
        { timeout: 10000 },
      );

      if (response.data.success && response.data.data) {
        let activeEmployees = response.data.data.filter(
          (emp) => emp.IsActive === 1 || emp.IsActive === "1" || emp.IsActive === true,
        );

        const isAdmin = ["Admin", "admin", "SuperAdmin"].includes(user?.role);
        const isRM = user?.is_rm || user?.isRM || Boolean(user?.subordinates && user.subordinates.length > 0);

        if (!isAdmin) {
          if (isRM) {
            // RM can mark manual attendance for their subordinates
            activeEmployees = activeEmployees.filter(
              (emp) => emp.RM === user.emp_id || (user?.subordinates && user.subordinates.includes(emp.EmpId))
            );
          } else {
            // Plain employees cannot mark manual attendance
            activeEmployees = [];
          }
        }

        const employeesData = activeEmployees.map((emp) => ({
          ...emp,
          Name: emp.Name || emp.EmpName || "Unknown",
          EmpId: emp.EmpId,
          Department: emp.Department || emp.Dept || emp.OfficeName || "N/A",
          Designation: emp.Designation || emp.Role || "N/A",
          IsActive: emp.IsActive || 0,
        }));

        setEmployees(employeesData);
      } else {
        setError("No employee data found");
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
      setError("Failed to load employee data");
    } finally {
      setLoading(false);
    }
  };

  // Fetch attendance records for the selected date
  const fetchAttendanceForDate = async (dateStr) => {
    try {
      setAttendanceLoading(true);
      const res = await axios.get(
        `${BASE_URL}/attendance/get_today_attendance.php`,
        {
          params: { date: dateStr },
          timeout: 10000,
        },
      );

      if (res.data.success && Array.isArray(res.data.data)) {
        const map = {};
        res.data.data.forEach((att) => {
          map[att.EmpId] = att;
        });
        setAttendanceMap(map);
      } else {
        setAttendanceMap({});
      }
    } catch (err) {
      console.error("Error fetching attendance for date:", err);
      setAttendanceMap({});
    } finally {
      setAttendanceLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [user.tenent_id]);

  useEffect(() => {
    if (selectedDate) {
      fetchAttendanceForDate(selectedDate);
    }
  }, [selectedDate]);

  // Filter employees whenever employees, searchTerm, attendanceMap, or statusFilter changes
  useEffect(() => {
    let result = [...employees];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (emp) =>
          (emp.Name && emp.Name.toLowerCase().includes(term)) ||
          (emp.EmpId && emp.EmpId.toLowerCase().includes(term)) ||
          (emp.Department && emp.Department.toLowerCase().includes(term)),
      );
    }

    // Apply status filter
    if (statusFilter === "marked") {
      result = result.filter((emp) => Boolean(attendanceMap[emp.EmpId]));
    } else if (statusFilter === "unmarked") {
      result = result.filter((emp) => !attendanceMap[emp.EmpId]);
    }

    setFilteredEmployees(result);
    setPage(0);
  }, [employees, searchTerm, attendanceMap, statusFilter]);

  // Handle pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Get current page data
  const getCurrentPageData = () => {
    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredEmployees.slice(startIndex, endIndex);
  };

  // Open Dialog in Mark mode
  const handleMarkAttendance = (employee) => {
    setFormMode("mark");
    setSelectedEmployee(employee);
    setAttendanceDate(parseISO(selectedDate));
    setInTime("09:00");
    setOutTime("18:00");
    setMarkAttendanceDialog(true);
  };

  // Open Dialog in Edit mode
  const handleEditAttendance = (employee) => {
    setFormMode("edit");
    setSelectedEmployee(employee);
    setAttendanceDate(parseISO(selectedDate));
    const att = attendanceMap[employee.EmpId];
    setInTime(timeStringToHHMM(att?.FirstIn));
    setOutTime(timeStringToHHMM(att?.LastOut));
    setMarkAttendanceDialog(true);
  };

  const handleSubmitAttendance = async () => {
    try {
      setSubmitting(true);
      setError(null);

      const targetDateStr = format(attendanceDate, "yyyy-MM-dd");

      // Prepare in-time record
      const inTimeRecord = {
        EmpId: selectedEmployee.EmpId,
        LocationId: user.location_id || "3",
        Event: "In",
        GeoLocation: "0.00000, 0.00000",
        MobileDateTime: `${targetDateStr} ${inTime}:00`,
        app_ver: "Manual",
      };

      // If outTime is earlier than inTime, checkout is next day
      const outDateStr =
        outTime <= inTime
          ? format(addDays(attendanceDate, 1), "yyyy-MM-dd")
          : targetDateStr;

      // Prepare out-time record
      const outTimeRecord = {
        EmpId: selectedEmployee.EmpId,
        LocationId: user.location_id || "3",
        Event: "Out",
        GeoLocation: "0.00000, 0.00000",
        MobileDateTime: `${outDateStr} ${outTime}:00`,
        app_ver: "Manual",
      };

      // Submit IN time
      const inResponse = await axios.post(
        `${BASE_URL}/attendance/mark_manual_attendance.php`,
        inTimeRecord,
        { headers: { "Content-Type": "application/json" } },
      );

      if (!inResponse.data?.success) {
        throw new Error(inResponse.data?.message || "IN attendance failed");
      }

      // Submit OUT time
      const outResponse = await axios.post(
        `${BASE_URL}/attendance/mark_manual_attendance.php`,
        outTimeRecord,
        { headers: { "Content-Type": "application/json" } },
      );

      if (!outResponse.data?.success) {
        throw new Error(outResponse.data?.message || "OUT attendance failed");
      }

      setSuccess(
        `Attendance ${formMode === "edit" ? "updated" : "marked"} successfully for ${selectedEmployee.Name} on ${format(attendanceDate, "dd/MM/yyyy")} (IN: ${inTime}, OUT: ${outTime})`,
      );
      setMarkAttendanceDialog(false);
      setSelectedEmployee(null);

      // Re-fetch attendance for selectedDate to immediately update table status & show Edit button
      await fetchAttendanceForDate(selectedDate);
    } catch (err) {
      console.error("Attendance submission error:", err);
      setError(err.message || "Failed to mark attendance. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const refreshData = () => {
    fetchEmployees();
    fetchAttendanceForDate(selectedDate);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setSelectedDate(format(new Date(), "yyyy-MM-dd"));
  };

  // Count marked vs unmarked
  const markedCount = employees.filter((emp) => Boolean(attendanceMap[emp.EmpId])).length;
  const unmarkedCount = employees.length - markedCount;

  return (
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
      {/* Top Controls & Status Bar */}
      <Paper
        elevation={0}
        sx={{
          p: 1,
          px: 1.5,
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
        {/* Left: Search, Date, Status, Quick Chips */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", flex: 1 }}>
          <TextField
            placeholder="Search by name, ID, dept..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            sx={{
              width: { xs: "100%", sm: 220, md: 260 },
              "& .MuiOutlinedInput-root": {
                height: 36,
                fontSize: "0.82rem",
                borderRadius: 1.5,
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: "#94a3b8", fontSize: 18 }} />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchTerm("")}>
                    <Clear sx={{ fontSize: 16 }} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            label="Attendance Date"
            type="date"
            size="small"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <DateRange sx={{ color: "#f37021", fontSize: 18 }} />
                </InputAdornment>
              ),
            }}
            inputProps={{
              min: getMinDate(),
              max: getMaxDate(),
            }}
            sx={{
              width: { xs: "100%", sm: 160 },
              "& .MuiOutlinedInput-root": {
                height: 36,
                fontSize: "0.82rem",
                borderRadius: 1.5,
              },
            }}
          />

          <FormControl
            size="small"
            sx={{
              minWidth: 150,
              "& .MuiOutlinedInput-root": {
                height: 36,
                fontSize: "0.82rem",
                borderRadius: 1.5,
              },
            }}
          >
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">All ({employees.length})</MenuItem>
              <MenuItem value="marked">Marked ({markedCount})</MenuItem>
              <MenuItem value="unmarked">Not Marked ({unmarkedCount})</MenuItem>
            </Select>
          </FormControl>

          {/* Quick status filter chips */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
            <Chip
              clickable
              onClick={() => setStatusFilter("all")}
              label={`All: ${employees.length}`}
              size="small"
              sx={{
                height: 26,
                fontSize: "0.75rem",
                fontWeight: 600,
                bgcolor: statusFilter === "all" ? "#0f172a" : "#f1f5f9",
                color: statusFilter === "all" ? "#ffffff" : "#475569",
                "&:hover": { bgcolor: statusFilter === "all" ? "#1e293b" : "#e2e8f0" },
              }}
            />
            <Chip
              clickable
              onClick={() => setStatusFilter("marked")}
              label={`${markedCount} Marked`}
              size="small"
              sx={{
                height: 26,
                fontSize: "0.75rem",
                fontWeight: 600,
                bgcolor: statusFilter === "marked" ? "#10b981" : "rgba(16, 185, 129, 0.12)",
                color: statusFilter === "marked" ? "#ffffff" : "#047857",
                "&:hover": { bgcolor: statusFilter === "marked" ? "#059669" : "rgba(16, 185, 129, 0.2)" },
              }}
            />
            <Chip
              clickable
              onClick={() => setStatusFilter("unmarked")}
              label={`${unmarkedCount} Not Marked`}
              size="small"
              sx={{
                height: 26,
                fontSize: "0.75rem",
                fontWeight: 600,
                bgcolor: statusFilter === "unmarked" ? "#64748b" : "#f1f5f9",
                color: statusFilter === "unmarked" ? "#ffffff" : "#475569",
                "&:hover": { bgcolor: statusFilter === "unmarked" ? "#475569" : "#e2e8f0" },
              }}
            />
          </Box>

          {(searchTerm || statusFilter !== "all" || selectedDate !== format(new Date(), "yyyy-MM-dd")) && (
            <Button
              size="small"
              onClick={clearFilters}
              startIcon={<Clear sx={{ fontSize: 14 }} />}
              sx={{
                color: "#f37021",
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.78rem",
              }}
            >
              Reset
            </Button>
          )}
        </Box>

        {/* Right: Selected Date & Refresh */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Chip
            icon={<DateRange sx={{ fontSize: 14, color: "#f37021 !important" }} />}
            label={`${format(parseISO(selectedDate), "dd MMMM yyyy")}${attendanceLoading ? " (loading...)" : ""}`}
            size="small"
            sx={{
              height: 28,
              fontSize: "0.75rem",
              fontWeight: 600,
              bgcolor: "#fff7ed",
              color: "#c2410c",
              border: "1px solid #ffedd5",
            }}
          />

          <Tooltip title="Refresh Data">
            <IconButton
              onClick={refreshData}
              size="small"
              sx={{
                bgcolor: "#ffffff",
                border: "1px solid #e2e8f0",
                color: "#64748b",
                width: 36,
                height: 36,
                borderRadius: 1.5,
                boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                "&:hover": { bgcolor: "#f8fafc", color: "#0f172a", borderColor: "#cbd5e1" },
              }}
            >
              <Refresh sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Paper>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 1, py: 0.2, flexShrink: 0 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 1, py: 0.2, flexShrink: 0 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Loading & Table Section */}
      {loading ? (
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
          <LinearProgress sx={{ mb: 2, width: 200 }} />
          <Typography variant="body2" color="text.secondary">Loading employees...</Typography>
        </Box>
      ) : (
        <Paper
          elevation={0}
          sx={{
            flex: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            borderRadius: 2,
            border: "1px solid #e2e8f0",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            overflow: "hidden",
            bgcolor: "#ffffff",
          }}
        >
          {filteredEmployees.length === 0 ? (
            <Box sx={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", py: 6 }}>
              <Person sx={{ fontSize: 48, color: "#cbd5e1", mb: 1 }} />
              <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                No active employees found
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your search or status filter"
                  : "No active employees in the system"}
              </Typography>
            </Box>
          ) : (
            <TableContainer sx={{ flex: 1, minHeight: 0, overflowY: "auto", overflowX: "auto", width: "100%" }}>
              <Table stickyHeader size="small" sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ bgcolor: "#f8fafc", color: "#475569", fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.5px", py: 1, borderBottom: "1px solid #e2e8f0" }}>
                      Employee ID
                    </TableCell>
                    <TableCell sx={{ bgcolor: "#f8fafc", color: "#475569", fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.5px", py: 1, borderBottom: "1px solid #e2e8f0" }}>
                      Employee
                    </TableCell>
                    <TableCell sx={{ bgcolor: "#f8fafc", color: "#475569", fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.5px", py: 1, borderBottom: "1px solid #e2e8f0" }}>
                      Designation
                    </TableCell>
                    <TableCell sx={{ bgcolor: "#f8fafc", color: "#475569", fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.5px", py: 1, borderBottom: "1px solid #e2e8f0" }}>
                      Department
                    </TableCell>
                    <TableCell sx={{ bgcolor: "#f8fafc", color: "#475569", fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.5px", py: 1, borderBottom: "1px solid #e2e8f0" }}>
                      Status
                    </TableCell>
                    <TableCell sx={{ bgcolor: "#f8fafc", color: "#475569", fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.5px", py: 1, borderBottom: "1px solid #e2e8f0" }} align="center">
                      Action
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getCurrentPageData().map((employee) => {
                    const attRecord = attendanceMap[employee.EmpId];
                    const isMarked = Boolean(attRecord);

                    return (
                      <TableRow key={employee.EmpId} hover sx={{ "&:hover": { bgcolor: "#f8fafc" } }}>
                        <TableCell sx={{ py: 0.8 }}>
                          <Typography variant="body2" fontWeight={600} sx={{ fontFamily: "monospace", fontSize: "0.8rem" }}>
                            {employee.EmpId}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 0.8 }}>
                          <Box display="flex" alignItems="center" gap={1.2}>
                            <Avatar sx={{ bgcolor: isMarked ? "#f37021" : "grey.500", width: 32, height: 32, fontSize: "0.8rem" }}>
                              {employee.Name?.charAt(0) || employee.EmpId.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography fontWeight={600} variant="body2" sx={{ fontSize: "0.8rem", color: "#0f172a" }}>
                                {employee.Name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: "0.7rem" }}>
                                {employee.EmailId || "No email"}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ py: 0.8, fontSize: "0.8rem" }}>
                          <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
                            {employee.Designation || "N/A"}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 0.8, fontSize: "0.8rem" }}>
                          <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
                            {employee.Department}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 0.8 }}>
                          <StatusBadge
                            isMarked={isMarked}
                            inTime={attRecord?.FirstIn}
                            outTime={attRecord?.LastOut}
                          />
                        </TableCell>
                        <TableCell align="center" sx={{ py: 0.8 }}>
                          {isMarked ? (
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<Edit sx={{ fontSize: 15 }} />}
                              onClick={() => handleEditAttendance(employee)}
                              sx={{
                                color: "#f37021",
                                borderColor: "#f37021",
                                textTransform: "none",
                                fontWeight: 600,
                                fontSize: "0.75rem",
                                height: 30,
                                px: 1.8,
                                "&:hover": {
                                  borderColor: "#d95300",
                                  bgcolor: alpha("#f37021", 0.08),
                                },
                              }}
                            >
                              Edit
                            </Button>
                          ) : (
                            <Button
                              variant="contained"
                              size="small"
                              startIcon={<HowToReg sx={{ fontSize: 15 }} />}
                              onClick={() => handleMarkAttendance(employee)}
                              sx={{
                                bgcolor: "#f37021",
                                textTransform: "none",
                                fontWeight: 600,
                                fontSize: "0.75rem",
                                height: 30,
                                px: 1.8,
                                boxShadow: "0 1px 2px rgba(243, 112, 33, 0.25)",
                                "&:hover": { bgcolor: "#d95300" },
                              }}
                            >
                              Mark
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Pagination */}
          {filteredEmployees.length > 0 && (
            <TablePagination
              component="div"
              count={filteredEmployees.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25, 50]}
              sx={{ flexShrink: 0, borderTop: "1px solid #f1f5f9" }}
            />
          )}
        </Paper>
      )}

      {/* Mark / Edit Attendance Dialog */}
      <Dialog
        open={markAttendanceDialog}
        onClose={() => !submitting && setMarkAttendanceDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: { xs: 2, sm: 2.5 },
            m: { xs: 1.5, sm: 2 },
            width: { xs: "calc(100% - 24px)", sm: "auto" },
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle sx={{ bgcolor: "#f37021", color: "white", p: { xs: 2, sm: 2.5 } }}>
          <Box display="flex" alignItems="center" gap={1}>
            {formMode === "edit" ? <Edit /> : <HowToReg />}
            <Typography variant="h6" fontWeight={600} sx={{ fontSize: { xs: "1.05rem", sm: "1.25rem" } }}>
              {formMode === "edit" ? "Edit Attendance (IN/OUT)" : "Mark Attendance (IN/OUT)"}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: { xs: 2, sm: 3 }, pt: { xs: "16px !important", sm: "24px !important" }, overflowX: "hidden" }}>
          {selectedEmployee && (
            <Stack spacing={2.5} mt={1}>
              {/* Employee Info */}
              <Box p={2} sx={{ bgcolor: "grey.100", borderRadius: 1.5 }}>
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar sx={{ bgcolor: "#f37021", width: 50, height: 50 }}>
                    {selectedEmployee.Name?.charAt(0) || selectedEmployee.EmpId.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {selectedEmployee.Name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedEmployee.EmpId} • {selectedEmployee.Department}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {selectedEmployee.Designation}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Attendance Date */}
              <TextField
                label="Attendance Date"
                type="date"
                value={format(attendanceDate, "yyyy-MM-dd")}
                onChange={(e) => setAttendanceDate(parseISO(e.target.value))}
                fullWidth
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <DateRange color="primary" />
                    </InputAdornment>
                  ),
                }}
                inputProps={{
                  min: getMinDate(),
                  max: getMaxDate(),
                }}
                helperText="You can mark attendance for the last 30 days up to today"
              />

              <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2 }}>
                <TextField
                  label="IN Time"
                  type="time"
                  value={inTime}
                  onChange={(e) => setInTime(e.target.value)}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AccessTime color="action" />
                      </InputAdornment>
                    ),
                  }}
                  helperText="Time format: HH:MM"
                />

                <TextField
                  label="OUT Time"
                  type="time"
                  value={outTime}
                  onChange={(e) => setOutTime(e.target.value)}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AccessTime color="action" />
                      </InputAdornment>
                    ),
                  }}
                  helperText="Time format: HH:MM"
                />
              </Box>

              {/* Summary */}
              <Box
                p={2}
                sx={{
                  bgcolor: "#fdf6f8",
                  borderRadius: 1.5,
                  border: "1px solid #f2d5df",
                }}
              >
                <Typography variant="body2" fontWeight={600} color="#f37021" gutterBottom>
                  Summary:
                </Typography>
                <Box display="flex" justifyContent="space-between" flexWrap="wrap" gap={1}>
                  <Typography variant="body2" color="text.secondary">
                    Date: <strong>{format(attendanceDate, "dd/MM/yyyy")}</strong>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    IN: <strong>{inTime}</strong>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    OUT: <strong>{outTime}</strong>
                  </Typography>
                </Box>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions
          sx={{
            p: { xs: 2, sm: 2.5 },
            borderTop: "1px solid #e0e0e0",
            display: "flex",
            flexDirection: { xs: "column-reverse", sm: "row" },
            gap: { xs: 1, sm: 1.5 },
          }}
        >
          <Button
            onClick={() => setMarkAttendanceDialog(false)}
            disabled={submitting}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmitAttendance}
            disabled={submitting}
            startIcon={formMode === "edit" ? <Edit /> : <HowToReg />}
            sx={{
              bgcolor: "#f37021",
              "&:hover": { bgcolor: "#d95300" },
              px: 3,
              width: { xs: "100%", sm: "auto" },
            }}
          >
            {submitting ? "Saving..." : formMode === "edit" ? "Update Attendance" : "Mark Attendance"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManualAttendancePage;
