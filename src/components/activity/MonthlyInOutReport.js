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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Autocomplete,
  Chip,
} from "@mui/material";
import { GetApp, AccessTime } from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import axios from "axios";
import { saveAs } from "file-saver";
import { useAuth } from "../auth/AuthContext";

const MonthlyInOutReport = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  // attendanceMap: { normalizedEmpId: [{ date "dd/MM/yyyy", firstIn, lastOut, workingHours }] }
  const [attendanceMap, setAttendanceMap] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const month = selectedDate.getMonth() + 1;
  const year = selectedDate.getFullYear();

  const monthNames = [
    "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
    "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
  ];

  const filterActiveEmployees = useCallback((emps) => {
    return emps.filter((emp) => {
      const isActive = emp.IsActive || emp.isActive;
      return isActive === 1 || isActive === "1";
    });
  }, []);

  const normalizeEmpId = useCallback((empId) => {
    if (!empId) return "";
    const strId = String(empId).trim();
    const cleanId = strId.replace(/^SGI/i, "");
    return cleanId.padStart(4, "0");
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const empRes = await axios.get(
          `${BASE_URL}/employee/list_employee.php?Tenent_Id=${user.tenent_id}`
        );

        if (!empRes.data.success) {
          setError("Failed to load employees.");
          return;
        }

        const activeEmps = filterActiveEmployees(empRes.data.data || []);
        setEmployees(activeEmps);

        // Fetch attendance from view_attendance.php per employee — same source as daily logs
        // so the In/Out times match exactly what the attendance page shows.
        const BATCH = 10;
        const map = {};
        for (let i = 0; i < activeEmps.length; i += BATCH) {
          const batch = activeEmps.slice(i, i + BATCH);
          const results = await Promise.allSettled(
            batch.map((emp) =>
              axios.get(
                `${BASE_URL}/attendance/view_attendance.php?EmpId=${emp.EmpId}`
              )
            )
          );
          results.forEach((res, j) => {
            const emp = batch[j];
            const key = normalizeEmpId(emp.EmpId);
            if (res.status === "fulfilled" && res.value.data.success) {
              map[key] = res.value.data.data || [];
            } else {
              map[key] = [];
            }
          });
        }
        setAttendanceMap(map);
      } catch (err) {
        setError("Failed to initialize data. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user.tenent_id, filterActiveEmployees, normalizeEmpId]);

  const getDaysInMonth = useCallback((m, y) => new Date(y, m, 0).getDate(), []);

  // view_attendance.php returns date as "dd/MM/yyyy"; days[] uses "yyyy-MM-dd"
  const toApiDateStr = useCallback((isoDate) => {
    const [y, m, d] = isoDate.split("-");
    return `${d}/${m}/${y}`;
  }, []);

  const getAttendanceForDay = useCallback(
    (employeeId, dateStr) => {
      if (!employeeId || !dateStr) return null;
      const key = normalizeEmpId(employeeId);
      const records = attendanceMap[key] || [];
      const apiDate = toApiDateStr(dateStr);
      return records.find((r) => r.date === apiDate) || null;
    },
    [attendanceMap, normalizeEmpId, toApiDateStr]
  );

  // Parse "Xh Ym" → decimal hours for summing totals
  const parseWorkingHours = useCallback((hoursStr) => {
    if (!hoursStr) return 0;
    const match = String(hoursStr).match(/(\d+)h\s*(\d+)m/);
    if (!match) return 0;
    return parseInt(match[1], 10) + parseInt(match[2], 10) / 60;
  }, []);

  const formatHours = useCallback((decimalHours) => {
    if (!decimalHours || decimalHours <= 0) return "0h 0m";
    const h = Math.floor(decimalHours);
    const m = Math.round((decimalHours - h) * 60);
    return `${h}h ${m}m`;
  }, []);

  const daysInMonth = useMemo(
    () => getDaysInMonth(month, year),
    [month, year, getDaysInMonth]
  );

  const days = useMemo(() => {
    const arr = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const dayOfWeek = new Date(dateStr).toLocaleDateString("en-US", { weekday: "short" });
      arr.push({ day: d, dateStr, dayOfWeek });
    }
    return arr;
  }, [daysInMonth, month, year]);

  const displayedEmployees = useMemo(() => {
    if (selectedEmployee) {
      return employees.filter(
        (e) => normalizeEmpId(e.EmpId) === normalizeEmpId(selectedEmployee.EmpId)
      );
    }
    return employees;
  }, [employees, selectedEmployee, normalizeEmpId]);

  // Pre-compute row data to avoid repeated computation in render
  const rowData = useMemo(() => {
    return displayedEmployees.map((emp) => {
      let presentCount = 0;
      let totalHoursDecimal = 0;

      const dayCells = days.map(({ dateStr }) => {
        const rec = getAttendanceForDay(emp.EmpId, dateStr);
        if (rec && rec.firstIn && rec.firstIn !== "N/A") {
          presentCount++;
          totalHoursDecimal += parseWorkingHours(rec.workingHours);
          return {
            in: rec.firstIn,
            out: rec.lastOut && rec.lastOut !== "N/A" ? rec.lastOut : "-",
            hasRecord: true,
          };
        }
        return { in: "-", out: "-", hasRecord: false };
      });

      return { emp, dayCells, presentCount, totalHoursDecimal };
    });
  }, [displayedEmployees, days, getAttendanceForDay, parseWorkingHours]);

  const exportToCSV = async () => {
    setExporting(true);
    setError("");
    try {
      const monthName = monthNames[month - 1];
      const header = ["S.R NO.", "Emp. Code", "Name", "Designation", "Grade", "Office"];

      for (const { dateStr, dayOfWeek } of days) {
        header.push(`${dateStr} (${dayOfWeek}) In`);
        header.push(`${dateStr} (${dayOfWeek}) Out`);
        header.push(`${dateStr} (${dayOfWeek}) Hrs`);
      }
      header.push("Total Present Days");

      const csvRows = [header];
      const targetEmployees = displayedEmployees;

      for (let i = 0; i < targetEmployees.length; i += 10) {
        const batch = targetEmployees.slice(i, i + 10);
        for (let j = 0; j < batch.length; j++) {
          const emp = batch[j];
          const row = [
            (i + j + 1).toString(),
            emp.EmpId || "",
            emp.Name || "",
            emp.Designation || "",
            emp.Grade || "",
            emp.OfficeName || emp.office_name || "",
          ];

          let presentCount = 0;
          let totalHoursDecimal = 0;

          for (const { dateStr } of days) {
            const rec = getAttendanceForDay(emp.EmpId, dateStr);
            if (rec && rec.firstIn && rec.firstIn !== "N/A") {
              const hrs = parseWorkingHours(rec.workingHours);
              row.push(rec.firstIn);
              row.push(rec.lastOut && rec.lastOut !== "N/A" ? rec.lastOut : "-");
              row.push(rec.workingHours || "-");
              presentCount++;
              totalHoursDecimal += hrs;
            } else {
              row.push("-", "-", "-");
            }
          }

          row.push(presentCount.toString());
          csvRows.push(row);
        }
        await new Promise((resolve) => setTimeout(resolve, 0));
      }

      const csvContent = csvRows
        .map((row) => row.map((f) => `"${String(f || "").replace(/"/g, '""')}"`).join(","))
        .join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      saveAs(blob, `IN_OUT_REPORT_${monthName}_${year}.csv`);
    } catch (err) {
      console.error("Export error:", err);
      setError("Failed to generate report. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const headerCellSx = {
    fontWeight: 700,
    bgcolor: "#8d0638",
    color: "white",
    whiteSpace: "nowrap",
    borderRight: "1px solid rgba(255,255,255,0.2)",
  };

  const subHeaderCellSx = {
    fontWeight: 600,
    fontSize: "0.72rem",
    bgcolor: "#b00548",
    color: "white",
    whiteSpace: "nowrap",
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Card sx={{ boxShadow: 3 }}>
        <CardContent>
          <Typography
            variant="h5"
            component="h2"
            sx={{ mb: 3, color: "primary.main", fontWeight: 600 }}
          >
            <AccessTime sx={{ mr: 1, verticalAlign: "middle" }} />
            Monthly In/Out Time Report
          </Typography>

          {/* Controls */}
          <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
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

            <Grid item xs={12} md={4}>
              <Autocomplete
                options={employees}
                getOptionLabel={(emp) => `${emp.EmpId} - ${emp.Name}`}
                value={selectedEmployee}
                onChange={(_, newVal) => setSelectedEmployee(newVal)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                    label="Filter by Employee (optional)"
                    fullWidth
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Stack
                direction="row"
                spacing={2}
                justifyContent={isMobile ? "flex-start" : "flex-end"}
              >
                <Button
                  variant="contained"
                  onClick={exportToCSV}
                  disabled={loading || exporting || employees.length === 0}
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

          {/* Summary chips */}
          {/* {!loading && employees.length > 0 && (
            <Stack direction="row" spacing={1} sx={{ mb: 2 }} flexWrap="wrap">
              <Chip
                label={`${employees.length} Active Employees`}
                size="small"
                color="primary"
                variant="outlined"
              />
              <Chip
                label={`${monthNames[month - 1]} ${year}`}
                size="small"
                color="secondary"
                variant="outlined"
              />
              <Chip
                label={`${daysInMonth} Days`}
                size="small"
                variant="outlined"
              />
              {selectedEmployee && (
                <Chip
                  label={`Filtered: ${selectedEmployee.Name}`}
                  size="small"
                  color="warning"
                  onDelete={() => setSelectedEmployee(null)}
                />
              )}
            </Stack>
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

          {/* Report Table */}
          {!loading && rowData.length > 0 && (
            <TableContainer
              component={Paper}
              sx={{ mt: 2, maxHeight: 520, overflow: "auto", border: "1px solid", borderColor: "divider" }}
            >
              <Table size="small" stickyHeader>
                <TableHead>
                  {/* Row 1: main headers */}
                  <TableRow>
                    <TableCell sx={{ ...headerCellSx, minWidth: 45 }}>S.R</TableCell>
                    <TableCell sx={{ ...headerCellSx, minWidth: 100 }}>Emp. Code</TableCell>
                    <TableCell sx={{ ...headerCellSx, minWidth: 150 }}>Name</TableCell>
                    {days.map(({ day, dateStr, dayOfWeek }) => (
                      <TableCell
                        key={dateStr}
                        align="center"
                        colSpan={2}
                        sx={{
                          ...headerCellSx,
                          minWidth: 160,
                          bgcolor:
                            dayOfWeek === "Sun"
                              ? "#5c0425"
                              : dayOfWeek === "Sat"
                              ? "#6e0530"
                              : "#8d0638",
                        }}
                      >
                        {day} {dayOfWeek}
                      </TableCell>
                    ))}
                    <TableCell sx={{ ...headerCellSx, minWidth: 80 }}>Present</TableCell>
                  </TableRow>

                  {/* Row 2: In/Out sub-headers */}
                  <TableRow>
                    <TableCell sx={subHeaderCellSx} colSpan={3} />
                    {days.map(({ dateStr }) => (
                      <>
                        <TableCell
                          key={`${dateStr}-in`}
                          sx={{ ...subHeaderCellSx, minWidth: 80 }}
                        >
                          In
                        </TableCell>
                        <TableCell
                          key={`${dateStr}-out`}
                          sx={{ ...subHeaderCellSx, minWidth: 80 }}
                        >
                          Out
                        </TableCell>
                      </>
                    ))}
                    <TableCell sx={subHeaderCellSx} colSpan={1} />
                  </TableRow>
                </TableHead>

                <TableBody>
                  {rowData.map(({ emp, dayCells, presentCount, totalHoursDecimal }, idx) => (
                    <TableRow
                      key={emp.EmpId}
                      hover
                      sx={{ "&:nth-of-type(odd)": { bgcolor: "grey.50" } }}
                    >
                      <TableCell sx={{ fontSize: "0.8rem" }}>{idx + 1}</TableCell>
                      <TableCell sx={{ fontSize: "0.8rem", fontWeight: 500 }}>
                        {emp.EmpId}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, whiteSpace: "nowrap" }}>
                        {emp.Name}
                      </TableCell>

                      {dayCells.map((cell, di) => (
                        <>
                          <TableCell
                            key={`${emp.EmpId}-${di}-in`}
                            sx={{
                              fontSize: "0.72rem",
                              color: cell.hasRecord ? "success.dark" : "text.disabled",
                              borderLeft: "1px solid",
                              borderColor: "divider",
                              px: 0.5,
                            }}
                          >
                            {cell.in}
                          </TableCell>
                          <TableCell
                            key={`${emp.EmpId}-${di}-out`}
                            sx={{
                              fontSize: "0.72rem",
                              color: cell.hasRecord && cell.out !== "-" ? "error.dark" : "text.disabled",
                              px: 0.5,
                            }}
                          >
                            {cell.out}
                          </TableCell>
                        </>
                      ))}

                      <TableCell>
                        <Chip
                          label={presentCount}
                          size="small"
                          color={
                            presentCount >= 20
                              ? "success"
                              : presentCount >= 10
                              ? "warning"
                              : "error"
                          }
                          sx={{ fontWeight: 700 }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {!loading && employees.length > 0 && rowData.length === 0 && (
            <Alert severity="info" sx={{ mt: 2 }}>
              No employees found for the selected filter.
            </Alert>
          )}
        </CardContent>
      </Card>
    </LocalizationProvider>
  );
};

export default MonthlyInOutReport;
