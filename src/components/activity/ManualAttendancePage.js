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
        const activeEmployees = response.data.data.filter(
          (emp) => emp.IsActive === 1 || emp.IsActive === "1" || emp.IsActive === true,
        );

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
    <Box sx={{ p: 3, backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      {/* Header */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 2,
          bgcolor: "#8d0638ff",
          color: "white",
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Manual Attendance
            </Typography>
            <Typography variant="body1">
              Mark or edit attendance for employees manually
            </Typography>
          </Box>
          <Tooltip title="Refresh Data">
            <IconButton onClick={refreshData} sx={{ color: "white", bgcolor: "rgba(255,255,255,0.15)", "&:hover": { bgcolor: "rgba(255,255,255,0.25)" } }}>
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
      </Paper>

      {/* Search and Filters */}
      <Paper sx={{ p: 2.5, mb: 3, borderRadius: 2 }}>
        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
          {/* Search input */}
          <TextField
            placeholder="Search employees by name, ID, or dept..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            sx={{ flex: 2, minWidth: 240 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search color="action" />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchTerm("")}>
                    <Clear fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {/* Attendance Date Selector */}
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
                  <DateRange fontSize="small" color="primary" />
                </InputAdornment>
              ),
            }}
            inputProps={{
              min: getMinDate(),
              max: getMaxDate(),
            }}
            sx={{ flex: 1, minWidth: 190 }}
          />

          {/* Status Filter */}
          <FormControl size="small" sx={{ flex: 1, minWidth: 170 }}>
            <InputLabel>Attendance Status</InputLabel>
            <Select
              value={statusFilter}
              label="Attendance Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">All Employees ({employees.length})</MenuItem>
              <MenuItem value="marked">Marked Only ({markedCount})</MenuItem>
              <MenuItem value="unmarked">Not Marked Only ({unmarkedCount})</MenuItem>
            </Select>
          </FormControl>

          {(searchTerm || statusFilter !== "all" || selectedDate !== format(new Date(), "yyyy-MM-dd")) && (
            <Button size="small" onClick={clearFilters} startIcon={<Clear />} sx={{ color: "#8d0638ff" }}>
              Reset Filters
            </Button>
          )}
        </Box>
      </Paper>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Loading */}
      {loading ? (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <LinearProgress sx={{ mb: 2, maxWidth: 400, mx: "auto" }} />
          <Typography>Loading employees...</Typography>
        </Box>
      ) : (
        <>
          {/* Results Summary Bar */}
          <Paper sx={{ p: 2, mb: 2, borderRadius: 2, bgcolor: "#fff", border: "1px solid #e0e0e0" }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
              <Box display="flex" alignItems="center" gap={1.5}>
                <Typography variant="body1" fontWeight={600}>
                  Showing {filteredEmployees.length} of {employees.length} employees
                </Typography>
                <Chip
                  label={`${markedCount} Marked`}
                  color="success"
                  size="small"
                  variant="filled"
                />
                <Chip
                  label={`${unmarkedCount} Not Marked`}
                  color="default"
                  size="small"
                  variant="outlined"
                />
              </Box>
              <Typography variant="body2" color="text.secondary">
                Selected Date: <strong>{format(parseISO(selectedDate), "dd MMMM yyyy")}</strong>
                {attendanceLoading && " (loading...)"}
              </Typography>
            </Box>
          </Paper>

          {/* Employee Table */}
          <Paper sx={{ borderRadius: 2, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: "#8d0638ff" }}>
                  <TableRow>
                    <TableCell sx={{ color: "white", fontWeight: 600 }}>Employee ID</TableCell>
                    <TableCell sx={{ color: "white", fontWeight: 600 }}>Employee</TableCell>
                    <TableCell sx={{ color: "white", fontWeight: 600 }}>Designation</TableCell>
                    <TableCell sx={{ color: "white", fontWeight: 600 }}>Department</TableCell>
                    <TableCell sx={{ color: "white", fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ color: "white", fontWeight: 600 }} align="center">
                      Action
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getCurrentPageData().map((employee) => {
                    const attRecord = attendanceMap[employee.EmpId];
                    const isMarked = Boolean(attRecord);

                    return (
                      <TableRow key={employee.EmpId} hover sx={{ "&:hover": { bgcolor: "rgba(141,6,56,0.02)" } }}>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600} sx={{ fontFamily: "monospace" }}>
                            {employee.EmpId}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1.5}>
                            <Avatar sx={{ bgcolor: isMarked ? "#8d0638ff" : "grey.500", width: 36, height: 36, fontSize: "0.9rem" }}>
                              {employee.Name?.charAt(0) || employee.EmpId.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography fontWeight={600} variant="body2">
                                {employee.Name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" display="block">
                                {employee.EmailId || "No email"}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {employee.Designation || "N/A"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {employee.Department}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <StatusBadge
                            isMarked={isMarked}
                            inTime={attRecord?.FirstIn}
                            outTime={attRecord?.LastOut}
                          />
                        </TableCell>
                        <TableCell align="center">
                          {isMarked ? (
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<Edit />}
                              onClick={() => handleEditAttendance(employee)}
                              sx={{
                                color: "#8d0638ff",
                                borderColor: "#8d0638ff",
                                textTransform: "none",
                                fontWeight: 600,
                                px: 2,
                                "&:hover": {
                                  borderColor: "#6d042aff",
                                  bgcolor: alpha("#8d0638ff", 0.08),
                                },
                              }}
                            >
                              Edit
                            </Button>
                          ) : (
                            <Button
                              variant="contained"
                              size="small"
                              startIcon={<HowToReg />}
                              onClick={() => handleMarkAttendance(employee)}
                              sx={{
                                bgcolor: "#8d0638ff",
                                textTransform: "none",
                                fontWeight: 600,
                                px: 2,
                                "&:hover": { bgcolor: "#6d042aff" },
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

            {/* Pagination */}
            <TablePagination
              component="div"
              count={filteredEmployees.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25, 50]}
              sx={{ borderTop: "1px solid rgba(224, 224, 224, 1)" }}
            />
          </Paper>

          {/* No Results */}
          {filteredEmployees.length === 0 && !loading && (
            <Paper sx={{ p: 6, textAlign: "center", borderRadius: 2, mt: 3 }}>
              <Person sx={{ fontSize: 50, color: "grey.400", mb: 1 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No active employees found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your search or status filter"
                  : "No active employees in the system"}
              </Typography>
            </Paper>
          )}
        </>
      )}

      {/* Mark / Edit Attendance Dialog */}
      <Dialog
        open={markAttendanceDialog}
        onClose={() => !submitting && setMarkAttendanceDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: "#8d0638ff", color: "white" }}>
          <Box display="flex" alignItems="center" gap={1}>
            {formMode === "edit" ? <Edit /> : <HowToReg />}
            <Typography variant="h6" fontWeight={600}>
              {formMode === "edit" ? "Edit Attendance (IN/OUT)" : "Mark Attendance (IN/OUT)"}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedEmployee && (
            <Stack spacing={3} mt={1}>
              {/* Employee Info */}
              <Box p={2} sx={{ bgcolor: "grey.100", borderRadius: 1.5 }}>
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar sx={{ bgcolor: "#8d0638ff", width: 50, height: 50 }}>
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

              <Box display="flex" gap={2}>
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
                <Typography variant="body2" fontWeight={600} color="#8d0638ff" gutterBottom>
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
        <DialogActions sx={{ p: 2.5, borderTop: "1px solid #e0e0e0" }}>
          <Button onClick={() => setMarkAttendanceDialog(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmitAttendance}
            disabled={submitting}
            startIcon={formMode === "edit" ? <Edit /> : <HowToReg />}
            sx={{
              bgcolor: "#8d0638ff",
              "&:hover": { bgcolor: "#6d042aff" },
              px: 3,
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
