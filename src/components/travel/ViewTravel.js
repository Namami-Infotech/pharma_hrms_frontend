"use client";
import { BASE_URL } from "../../api/endpoints";

import { useState, useEffect } from "react"
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  TablePagination,
  Button,
  IconButton,
  Card,
  CardContent,
  Chip,
  Stack,
  Alert,
  useTheme,
  useMediaQuery,
  Tooltip,
  alpha,
  Paper,
  Grid,
} from "@mui/material"
import {
  Check,
  Cancel,
  GetApp,
  FlightTakeoff,
  Person,
  CalendarToday,
  LocationOn,
  DirectionsCar,
} from "@mui/icons-material"
import axios from "axios"
import { useAuth } from "../auth/AuthContext"

// Compact Stats Card Component
const StatsCard = ({ title, value, color, icon }) => {
  const theme = useTheme()

  return (
    <Card
      sx={{
        height: "100%",
        borderLeft: `3px solid ${color}`,
        background: `linear-gradient(135deg, ${alpha(color, 0.08)} 0%, ${alpha(color, 0.04)} 100%)`,
        borderRadius: 2,
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" color="text.secondary" fontWeight="500" sx={{ fontSize: '0.75rem' }}>
              {title}
            </Typography>
            <Typography variant="h6" fontWeight="bold" color={color} sx={{ fontSize: '1.25rem', lineHeight: 1.2 }}>
              {value}
            </Typography>
          </Box>
          {icon}
        </Box>
      </CardContent>
    </Card>
  )
}

function ViewTravel({ EmpId }) {
  const [travelExpenses, setTravelExpenses] = useState([])
  const [employeeData, setEmployeeData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const { user } = useAuth()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

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

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/employee/list_employee.php`,
          {
            params: { Tenent_Id: user.tenent_id },
          },
        )

        if (response.data.success) {
          const filteredEmployees = response.data.data.filter((emp) => emp.Tenent_Id === user.tenent_id)
          setEmployeeData(filteredEmployees)
        } else {
          setError(response.data.message)
        }
      } catch (error) {
        setError("Error fetching employee data")
        console.error("Error:", error)
      }
    }

    fetchEmployeeData()
  }, [user.tenent_id])

  useEffect(() => {
    const fetchTravelExpenses = async () => {
      try {
        if (!EmpId) {
          setError("Employee ID is missing")
          setLoading(false)
          return
        }

        const response = await axios.get(`${BASE_URL}/travel/get_travel.php`, {
          params: { empId: user.emp_id, role: user.role },
        })

        if (response.data.success) {
          const updatedTravelExpenses = response.data.data.filter((expense) =>
            employeeData.some((emp) => emp.EmpId === expense.empId && emp.Tenent_Id === user.tenent_id),
          )

          const travelWithNames = updatedTravelExpenses.map((expense) => {
            const employee = employeeData.find((emp) => emp.EmpId === expense.empId)
            return {
              ...expense,
              employeeName: employee ? employee.Name : "Unknown",
            }
          })
          setTravelExpenses(travelWithNames)
        } else {
          setError(response.data.message)
        }
      } catch (error) {
        setError("Error fetching travel expenses data")
        console.error("Error:", error)
      } finally {
        setLoading(false)
      }
    }

    if (employeeData.length > 0) {
      fetchTravelExpenses()
    }
  }, [EmpId, user.emp_id, user.role, employeeData, user.tenent_id])

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleStatusChange = async (id, status) => {
    try {
      const response = await axios.post(`${BASE_URL}/travel/update_status.php`, {
        id,
        status,
      })

      if (response.data.success) {
        setTravelExpenses(travelExpenses.map((expense) => (expense.id === id ? { ...expense, status } : expense)))
      } else {
        setError(response.data.message)
      }
    } catch (error) {
      setError("Error updating travel status")
      console.error("Error:", error)
    }
  }

  const exportToCsv = () => {
    const csvRows = [["Employee Name", "Date", "Destination", "From", "To", "Type", "Status"]]

    travelExpenses.forEach(({ employeeName, travelDate, travelDestination, travelFrom, travelTo, travelType, status }) => {
      csvRows.push([employeeName, formatDate(travelDate), travelDestination, travelFrom, travelTo, travelType, status])
    })

    const csvContent = csvRows.map((row) => row.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.href = url
    link.setAttribute("download", "travel_requests.csv")
    link.click()
    URL.revokeObjectURL(url)
  }

  const getTravelStats = () => {
    const pending = travelExpenses.filter((expense) => expense.status === "Pending").length
    const approved = travelExpenses.filter((expense) => expense.status === "Approved").length
    const rejected = travelExpenses.filter((expense) => expense.status === "Rejected").length

    return { pending, approved, rejected, total: travelExpenses.length }
  }

  const stats = getTravelStats()

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
        <CircularProgress size={60} thickness={4} />
      </Box>
    )
  }

  return (
    <Box sx={{ p: { xs: 1, md: 2 }, bgcolor: "#f8fafc", minHeight: "100vh" }}>
      {/* Header */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 2.5, 
          mb: 2, 
          borderRadius: 2, 
          background: 'white',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight="700" color="#8d0638ff" gutterBottom>
              Travel Requests
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage and track all travel requests
            </Typography>
          </Box>
          <Button
            variant="outlined"
            onClick={exportToCsv}
            startIcon={<GetApp />}
            disabled={travelExpenses.length === 0}
            size="small"
            sx={{ borderRadius: 2 }}
          >
            Export CSV
          </Button>
        </Box>

        {/* Stats Cards */}
        {travelExpenses.length > 0 && (
          <Grid container spacing={1.5} sx={{ mb: 2 }}>
            <Grid item xs={4}>
              <StatsCard
                title="Pending"
                value={stats.pending}
                color={theme.palette.warning.main}
                icon={<Chip label="Pending" size="small" color="warning" sx={{ height: 24, fontSize: '0.7rem' }} />}
              />
            </Grid>
            <Grid item xs={4}>
              <StatsCard
                title="Approved"
                value={stats.approved}
                color={theme.palette.success.main}
                icon={<Chip label="Approved" size="small" color="success" sx={{ height: 24, fontSize: '0.7rem' }} />}
              />
            </Grid>
            <Grid item xs={4}>
              <StatsCard
                title="Rejected"
                value={stats.rejected}
                color={theme.palette.error.main}
                icon={<Chip label="Rejected" size="small" color="error" sx={{ height: 24, fontSize: '0.7rem' }} />}
              />
            </Grid>
          </Grid>
        )}
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 2, 
            borderRadius: 2,
            border: `1px solid ${theme.palette.error.light}`,
          }} 
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      )}

      {/* Main Content */}
      <Paper 
        elevation={0} 
        sx={{ 
          borderRadius: 2, 
          background: 'white',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          overflow: 'hidden'
        }}
      >
        {travelExpenses.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 6 }}>
            <FlightTakeoff sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No Travel Requests
            </Typography>
            <Typography variant="body2" color="text.secondary">
              No travel requests found for your account.
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table sx={{ minWidth: 650 }} size="small">
              <TableHead sx={{ bgcolor: "#8d0638ff" }}>
                <TableRow>
                  <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: '0.8rem', py: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Person sx={{ mr: 0.5, fontSize: '0.9rem' }} />
                      Employee
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: '0.8rem', py: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <CalendarToday sx={{ mr: 0.5, fontSize: '0.9rem' }} />
                      Date
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: '0.8rem', py: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <LocationOn sx={{ mr: 0.5, fontSize: '0.9rem' }} />
                      Destination
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: '0.8rem', py: 1 }}>From</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: '0.8rem', py: 1 }}>To</TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: '0.8rem', py: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <DirectionsCar sx={{ mr: 0.5, fontSize: '0.9rem' }} />
                      Type
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: '0.8rem', py: 1 }}>Status</TableCell>
                  {user && user.role === "HR" && (
                    <TableCell sx={{ color: "white", fontWeight: "bold", fontSize: '0.8rem', py: 1 }}>Actions</TableCell>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {travelExpenses.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((expense) => (
                  <TableRow
                    key={expense.id}
                    sx={{
                      "&:hover": {
                        bgcolor: alpha(theme.palette.primary.main, 0.04),
                      },
                    }}
                  >
                    <TableCell sx={{ py: 1 }}>
                      <Typography variant="body2" fontWeight="500" sx={{ fontSize: '0.8rem' }}>
                        {expense.employeeName}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 1 }}>
                      <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                        {formatDate(expense.travelDate)}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 1 }}>
                      <Typography variant="body2" fontWeight="500" sx={{ fontSize: '0.8rem' }}>
                        {expense.travelDestination}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 1 }}>
                      <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                        {expense.travelFrom}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 1 }}>
                      <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                        {expense.travelTo}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 1 }}>
                      <Chip label={expense.travelType} size="small" variant="outlined" sx={{ height: 24, fontSize: '0.7rem' }} />
                    </TableCell>
                    <TableCell sx={{ py: 1 }}>
                      <Chip label={expense.status} size="small" color={getStatusColor(expense.status)} sx={{ height: 24, fontSize: '0.7rem' }} />
                    </TableCell>
                    {user && user.role === "HR" && (
                      <TableCell sx={{ py: 1 }}>
                        {expense.status === "Pending" && (
                          <Stack direction="row" spacing={0.5}>
                            <Tooltip title="Approve Request">
                              <IconButton
                                onClick={() => handleStatusChange(expense.id, "Approved")}
                                size="small"
                                sx={{
                                  color: theme.palette.success.main,
                                  bgcolor: alpha(theme.palette.success.main, 0.1),
                                  "&:hover": {
                                    bgcolor: alpha(theme.palette.success.main, 0.2),
                                  }
                                }}
                              >
                                <Check fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Reject Request">
                              <IconButton
                                onClick={() => handleStatusChange(expense.id, "Rejected")}
                                size="small"
                                sx={{
                                  color: theme.palette.error.main,
                                  bgcolor: alpha(theme.palette.error.main, 0.1),
                                  "&:hover": {
                                    bgcolor: alpha(theme.palette.error.main, 0.2),
                                  }
                                }}
                              >
                                <Cancel fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={travelExpenses.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{ 
                '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': { fontSize: '0.8rem' },
                borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`
              }}
            />
          </TableContainer>
        )}
      </Paper>
    </Box>
  )
}

export default ViewTravel