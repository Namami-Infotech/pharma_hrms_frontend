"use client";

import { useState, useEffect } from "react";
import { BASE_URL } from "../../api/endpoints";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  TablePagination,
  IconButton,
  Button,
  Chip,
  Avatar,
  useTheme,
  Alert,
  TextField,
  InputAdornment,
  Tooltip,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  alpha,
} from "@mui/material"
import {
  Check,
  Cancel,
  Search,
  Download,
  Refresh,
  Person,
  CalendarToday,
  Add,
  AccountBalanceWallet,
  AccessTime,
  Category,
  Description,
  Schedule,
} from "@mui/icons-material"
import { motion, AnimatePresence } from "framer-motion"
import { format, parseISO, isValid } from "date-fns"
import axios from "axios"
import { useAuth } from "../auth/AuthContext"
import ApplyLeave from "./ApplyLeave"
import ManageLeaveBalance from "./ManageLeaveBalance"


const formatDateTime = (dateString) => {
  try {
    const date = parseISO(dateString);
    return isValid(date)
      ? format(date, "dd MMM yyyy hh:mm:ss a")
      : "Invalid date";
  } catch {
    return "Invalid date";
  }
};
function ViewLeave() {
  const { user } = useAuth()
  const isAdmin = ["Admin", "admin", "SuperAdmin"].includes(user?.role)
  const isRM = user?.is_rm || user?.isRM || Boolean(user?.subordinates && user.subordinates.length > 0)
  const isHR = isAdmin || isRM
  const theme = useTheme()
  const [expanded, setExpanded] = useState(false);

  const [leaves, setLeaves] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [refreshing, setRefreshing] = useState(false)
  const [applyLeaveOpen, setApplyLeaveOpen] = useState(false)
  const [manageBalanceOpen, setManageBalanceOpen] = useState(false)

  const formatDate = (dateString) => {
    try {
      const date = parseISO(dateString)
      return isValid(date) ? format(date, "dd/MM/yyyy") : "Invalid date"
    } catch {
      return "Invalid date"
    }
  }

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/employee/list_employee.php`,
          {
            params: { Tenent_Id: user.tenent_id },
          },
        )

        if (response.data.success) {
          setEmployees(response.data.data)
        } else {
          setError(response.data.message)
        }
      } catch (error) {
        setError("Error fetching employee data")
        console.error("Error:", error)
      }
    }

    fetchEmployees()
  }, [user.tenent_id])

  useEffect(() => {
    if (employees.length > 0) {
      fetchLeaves()
    }
  }, [employees])

  const fetchLeaves = async () => {
    if (!user || !user.emp_id) {
      setError("User is not authenticated")
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const isActualAdmin = ["HR", "Admin", "admin", "SuperAdmin"].includes(user?.role);
      const params = isActualAdmin ? { role: user.role } : { empId: user.emp_id, role: user.role };
      const response = await axios.get(`${BASE_URL}/leave/get_leave.php`, {
        params,
      })

      if (response.data.success) {
        const rawLeaves = response.data.data || []
        const filteredLeaves = employees.length > 0
          ? rawLeaves.filter((leave) =>
              employees.some((emp) => emp.EmpId === leave.EmpId),
            )
          : rawLeaves
        setLeaves(filteredLeaves.length > 0 ? filteredLeaves : rawLeaves)
      } else {
        setError(response.data.message)
      }
    } catch (error) {
      setError("Error fetching leave data")
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchLeaves()
    setRefreshing(false)
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleStatusChange = async (id, newStatus) => {
    const cleanId = id || ""
    if (!cleanId) {
      setError("Invalid leave ID")
      return
    }
    try {
      const response = await axios.post(`${BASE_URL}/leave/approve_leave.php`, {
        id: cleanId,
        leaveId: cleanId,
        status: newStatus,
        role: user?.role,
        userEmpId: user?.emp_id,
      })

      if (response.data.success) {
        setLeaves(leaves.map((leave) => ((leave.id === cleanId || leave.Id === cleanId) ? { ...leave, Status: newStatus } : leave)))
        fetchLeaves()
      } else {
        setError(response.data.message)
      }
    } catch (error) {
      setError("Error updating leave status: " + (error.response?.data?.message || error.message))
      console.error("Error:", error)
    }
  }

  const exportToCsv = () => {
    const csvRows = [["Employee Name", "Start Date", "End Date", "Category", "Reason", "Status", "Applied On"]]

    filteredLeaves.forEach(({ EmpId, StartDate, EndDate, Category, Reason, Status, CreatedAt }) => {
      const employee = employees.find((emp) => emp.EmpId === EmpId)
      const employeeName = employee ? employee.Name : "Unknown"
      csvRows.push([employeeName, formatDate(StartDate), formatDate(EndDate), Category, Reason, Status, CreatedAt])
    })

    const csvContent = csvRows.map((row) => row.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.href = url
    link.setAttribute("download", `leaves_${format(new Date(), "yyyy-MM-dd")}.csv`)
    link.click()
    URL.revokeObjectURL(url)
  }

  // Filter leaves based on search and status
  const filteredLeaves = leaves.filter((leave) => {
    const employee = employees.find((emp) => emp.EmpId === leave.EmpId)
    const employeeName = employee ? employee.Name.toLowerCase() : ""

    const matchesSearch =
      employeeName.includes(searchTerm.toLowerCase()) ||
      leave.Reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      leave.Category.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "" || leave.Status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Calculate stats
  const totalLeaves = leaves.length
  const pendingLeaves = leaves.filter((leave) => leave.Status === "Pending").length
  const approvedLeaves = leaves.filter((leave) => leave.Status === "Approved").length
  const rejectedLeaves = leaves.filter((leave) => leave.Status === "Rejected").length

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "success"
      case "rejected":
        return "error"
      case "pending":
        return "warning"
      default:
        return "default"
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
        <CircularProgress size={60} thickness={4} />
      </Box>
    )
  }

  return (
    <Box
      sx={{
        p: { xs: 1, sm: 1.5 },
        bgcolor: "#f8fafc",
        height: "100%",
        maxHeight: "100%",
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 1, py: 0.5 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {/* Control & Filter Bar - Single Line Layout */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1.2,
          p: { xs: 1, sm: 1.2 },
          mb: 1.5,
          bgcolor: "#ffffff",
          borderRadius: 2,
          border: "1px solid #e2e8f0",
          boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
          flexShrink: 0,
          flexWrap: "wrap",
        }}
      >
        {/* Left: Search + Status Dropdown */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, flexWrap: "wrap" }}>

          {/* Compact Search Input */}
          <TextField
            placeholder="Search employee, reason..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search color="action" sx={{ fontSize: 18 }} />
                </InputAdornment>
              ),
            }}
            sx={{
              width: { xs: "100%", sm: 200, md: 240 },
              "& .MuiOutlinedInput-root": {
                height: 36,
                borderRadius: 1.5,
                fontSize: "0.82rem",
                bgcolor: "#f8fafc",
              },
            }}
          />

          {/* Status Dropdown (Pending, Approved, Rejected) */}
          <FormControl
            size="small"
            sx={{
              minWidth: 155,
              "& .MuiOutlinedInput-root": {
                height: 36,
                borderRadius: 1.5,
                fontSize: "0.82rem",
                bgcolor: "#f8fafc",
              },
            }}
          >
            <InputLabel id="leave-status-filter-label" sx={{ fontSize: "0.82rem" }}>
              Status
            </InputLabel>
            <Select
              labelId="leave-status-filter-label"
              value={statusFilter}
              label="Status"
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPage(0)
              }}
              sx={{ fontSize: "0.82rem" }}
            >
              <MenuItem value="" sx={{ fontSize: "0.82rem" }}>
                All Statuses ({totalLeaves})
              </MenuItem>
              <MenuItem value="Pending" sx={{ fontSize: "0.82rem" }}>
                Pending ({pendingLeaves})
              </MenuItem>
              <MenuItem value="Approved" sx={{ fontSize: "0.82rem" }}>
                Approved ({approvedLeaves})
              </MenuItem>
              <MenuItem value="Rejected" sx={{ fontSize: "0.82rem" }}>
                Rejected ({rejectedLeaves})
              </MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Right: Refresh + Export + Add Leave in Same Line */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            flexWrap: "nowrap",
          }}
        >
          {/* Refresh Icon Button */}
          <Tooltip title="Refresh">
            <IconButton
              onClick={handleRefresh}
              disabled={refreshing}
              size="small"
              sx={{
                border: "1px solid #e2e8f0",
                borderRadius: 1.8,
                width: 36,
                height: 36,
                bgcolor: "#ffffff",
              }}
            >
              {refreshing ? <CircularProgress size={16} /> : <Refresh sx={{ fontSize: 18 }} />}
            </IconButton>
          </Tooltip>

          {/* Export CSV */}
          <Button
            variant="outlined"
            startIcon={<Download sx={{ fontSize: 16 }} />}
            onClick={exportToCsv}
            size="small"
            sx={{
              borderRadius: 1.8,
              height: 36,
              textTransform: "none",
              fontSize: "0.8rem",
              fontWeight: 600,
              borderColor: "#e2e8f0",
              color: "#475569",
              "&:hover": { borderColor: "#cbd5e1", bgcolor: "#f8fafc" },
            }}
          >
            Export
          </Button>

          {/* Add Leave Button */}
          <Button
            variant="contained"
            startIcon={<Add sx={{ fontSize: 18 }} />}
            onClick={() => setApplyLeaveOpen(true)}
            size="small"
            sx={{
              borderRadius: 1.8,
              bgcolor: "#f37021",
              color: "white",
              fontWeight: 600,
              textTransform: "none",
              px: 2,
              height: 36,
              whiteSpace: "nowrap",
              boxShadow: "0 2px 6px rgba(243, 112, 33, 0.25)",
              "&:hover": { bgcolor: "#d95300" },
            }}
          >
            Add Leave
          </Button>
        </Box>
      </Box>

      {/* Main Content */}
      <Paper
        elevation={0}
        sx={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          borderRadius: 2,
          background: "white",
          overflow: "hidden",
          border: "1px solid #e2e8f0",
          boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
        }}
      >
        {/* Table View */}
        <TableContainer sx={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
            <Table stickyHeader sx={{ minWidth: 650 }} size="small">
              <TableHead
                sx={{
                  bgcolor: "#f8fafc",
                  "& .MuiTableCell-stickyHeader": {
                    bgcolor: "#f8fafc",
                  },
                }}
              >
                <TableRow>
                  <TableCell
                    sx={{
                      bgcolor: "#f8fafc",
                      color: "#475569",
                      fontWeight: 700,
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      py: 1,
                      borderBottom: "1px solid #e2e8f0",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Person sx={{ mr: 0.5, fontSize: "0.85rem", color: "#64748b" }} />
                      Employee
                    </Box>
                  </TableCell>
                  <TableCell
                    sx={{
                      bgcolor: "#f8fafc",
                      color: "#475569",
                      fontWeight: 700,
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      py: 1,
                      borderBottom: "1px solid #e2e8f0",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <CalendarToday sx={{ mr: 0.5, fontSize: "0.85rem", color: "#64748b" }} />
                      Dates
                    </Box>
                  </TableCell>
                  <TableCell
                    sx={{
                      bgcolor: "#f8fafc",
                      color: "#475569",
                      fontWeight: 700,
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      py: 1,
                      borderBottom: "1px solid #e2e8f0",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <AccessTime sx={{ mr: 0.5, fontSize: "0.85rem", color: "#64748b" }} />
                      Leave Days
                    </Box>
                  </TableCell>
                  <TableCell
                    sx={{
                      bgcolor: "#f8fafc",
                      color: "#475569",
                      fontWeight: 700,
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      py: 1,
                      borderBottom: "1px solid #e2e8f0",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Category sx={{ mr: 0.5, fontSize: "0.85rem", color: "#64748b" }} />
                      Category
                    </Box>
                  </TableCell>
                  <TableCell
                    sx={{
                      bgcolor: "#f8fafc",
                      color: "#475569",
                      fontWeight: 700,
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      py: 1,
                      borderBottom: "1px solid #e2e8f0",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Description sx={{ mr: 0.5, fontSize: "0.85rem", color: "#64748b" }} />
                      Reason
                    </Box>
                  </TableCell>
                  <TableCell
                    sx={{
                      bgcolor: "#f8fafc",
                      color: "#475569",
                      fontWeight: 700,
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      py: 1,
                      borderBottom: "1px solid #e2e8f0",
                    }}
                  >
                    Status
                  </TableCell>
                  <TableCell
                    sx={{
                      bgcolor: "#f8fafc",
                      color: "#475569",
                      fontWeight: 700,
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      py: 1,
                      borderBottom: "1px solid #e2e8f0",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Schedule sx={{ mr: 0.5, fontSize: "0.85rem", color: "#64748b" }} />
                      Applied
                    </Box>
                  </TableCell>
                  {isHR && (
                    <TableCell
                      sx={{
                        bgcolor: "#f8fafc",
                        color: "#475569",
                        fontWeight: 700,
                        fontSize: "0.75rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        py: 1,
                        borderBottom: "1px solid #e2e8f0",
                      }}
                    >
                      Actions
                    </TableCell>
                  )}
                </TableRow>
              </TableHead>
    <TableBody>
      <AnimatePresence>
        {filteredLeaves
          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
          .map((leave, index) => {
            const employee = employees.find((emp) => emp.EmpId === leave.EmpId)
            const employeeName = employee ? employee.Name : "Unknown"
            
            // Calculate leave days
            const calculateLeaveDays = (startDate, endDate) => {
              const start = new Date(startDate);
              const end = new Date(endDate);
              const timeDiff = end.getTime() - start.getTime();
              const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1; // +1 to include both start and end dates
              return dayDiff;
            };
            
            const leaveDays = calculateLeaveDays(leave.StartDate, leave.EndDate);

            return (
              <motion.tr
                key={leave.id || leave.Id || index}
                component={TableRow}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: index * 0.03 }}
                sx={{
                  "&:hover": {
                    bgcolor: alpha(theme.palette.primary.main, 0.04),
                  },
                }}
              >
                <TableCell sx={{ py: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Avatar
                      sx={{
                        mr: 1.5,
                        width: 28,
                        height: 28,
                        bgcolor: theme.palette.primary.main,
                        fontSize: "0.8rem",
                      }}
                    >
                      <Person fontSize="small" />
                    </Avatar>
                    <Typography
                      variant="body2"
                      fontWeight="medium"
                      sx={{ fontSize: "0.8rem" }}
                    >
                      {employeeName} ({leave.EmpId})
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell sx={{ py: 1 }}>
                  <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
                    {formatDate(leave.StartDate)} - {formatDate(leave.EndDate)}
                  </Typography>
                </TableCell>
                <TableCell sx={{ py: 1 }}>
                  <Chip
                    label={`${leaveDays} day${leaveDays !== 1 ? "s" : ""}`}
                    variant="filled"
                    size="small"
                    color="primary"
                    sx={{
                      height: 22,
                      fontSize: "0.7rem",
                      fontWeight: "bold",
                    }}
                  />
                </TableCell>
                <TableCell sx={{ py: 1 }}>
                  <Chip
                    label={leave.category || leave.Category || leave.LeaveType || "Leave"}
                    variant="outlined"
                    size="small"
                    sx={{ height: 22, fontSize: "0.7rem", fontWeight: 600 }}
                  />
                </TableCell>
                <TableCell sx={{ py: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      maxWidth: 150,
                      overflow: expanded ? "visible" : "hidden",
                      textOverflow: expanded ? "unset" : "ellipsis",
                      whiteSpace: expanded ? "normal" : "nowrap",
                      fontSize: "0.8rem",
                    }}
                  >
                    {leave.Reason}
                  </Typography>

                  {/* Show More / Show Less Button */}
                  {leave.Reason?.length > 20 && (
                    <Typography
                      onClick={() => setExpanded(!expanded)}
                      sx={{
                        color: "primary.main",
                        fontSize: "0.7rem",
                        cursor: "pointer",
                        mt: 0.5,
                        textDecoration: "underline",
                      }}
                    >
                      {expanded ? "Show Less" : "Show More"}
                    </Typography>
                  )}
                </TableCell>
                <TableCell sx={{ py: 1 }}>
                  <Chip
                    label={leave.Status}
                    color={getStatusColor(leave.Status)}
                    size="small"
                    sx={{ height: 22, fontSize: "0.7rem" }}
                  />
                </TableCell>
                <TableCell sx={{ py: 1 }}>
                  <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
                    {formatDateTime(leave.CreatedAt)}
                  </Typography>
                </TableCell>
                {isHR && (
                  <TableCell sx={{ py: 1 }}>
                    {leave.Status !== "Pending" ? (
                      <Typography variant="caption" color="text.secondary">
                        -
                      </Typography>
                    ) : leave.EmpId === user?.emp_id && !isAdmin ? (
                      <Chip
                        label="Pending"
                        size="small"
                        color="warning"
                        variant="outlined"
                        sx={{ fontSize: "0.7rem", height: 22 }}
                      />
                    ) : (
                      <Box sx={{ display: "flex", gap: 0.5 }}>
                        <Tooltip title="Approve">
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() =>
                              handleStatusChange(leave.id || leave.Id, "Approved")
                            }
                            sx={{ fontSize: "0.8rem" }}
                          >
                            <Check fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Reject">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() =>
                              handleStatusChange(leave.id || leave.Id, "Rejected")
                            }
                            sx={{ fontSize: "0.8rem" }}
                          >
                            <Cancel fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    )}
                  </TableCell>
                )}
              </motion.tr>
            );
          })}
      </AnimatePresence>
    </TableBody>
  </Table>
</TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredLeaves.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{ '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': { fontSize: '0.8rem' } }}
        />
      </Paper>

      {/* Floating Action Button removed as requested */}

      {/* Apply Leave Dialog */}
      <ApplyLeave
        open={applyLeaveOpen}
        onClose={() => setApplyLeaveOpen(false)}
        onLeaveApplied={() => {
          fetchLeaves()
          setApplyLeaveOpen(false)
        }}
      />
    </Box>
  )
}

export default ViewLeave