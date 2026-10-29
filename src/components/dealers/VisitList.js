"use client";
import { BASE_URL } from "../../api/endpoints";
 
import { useEffect, useState } from "react"
import {
  CircularProgress,
  Typography,
  Box,
  TextField,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Alert,
  Stack,
  useTheme,
  useMediaQuery,
  Fade,
} from "@mui/material"
import {
  GetApp,
  DateRange,
  Assessment,
  TrendingUp,
  FileDownload,
} from "@mui/icons-material"
import axios from "axios"
import { saveAs } from "file-saver"
import AttendanceReport from "./AttendanceReport"
import SalaryList from "../employee/SalaryList"
import SalarySlip from "../employee/SalarySlip"
import MonthlyInOutReport from "../activity/MonthlyInOutReport"
 
const VisitList = () => {
  const [employees, setEmployees] = useState([])
  const [visits, setVisits] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))
 
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/employee/list_employee.php?Tenent_Id=1`,
        )
        if (response.data.success) {
          setEmployees(response.data.data)
        }
      } catch (error) {
        console.error("Error fetching employees:", error)
      }
    }
    fetchEmployees()
  }, [])
 
  useEffect(() => {
    const fetchVisits = async () => {
      if (!fromDate || !toDate) return
 
      setLoading(true)
      setError("")
      try {
        const response = await axios.get(
          `${BASE_URL}/visit/get_visits_entry.php?role=HR`,
        )
        if (response.data.success) {
          const filteredVisits = response.data.data.filter((visit) => {
            const visitDate = new Date(visit.VisitDateTime)
            return visitDate >= new Date(fromDate) && visitDate <= new Date(toDate)
          })
          setVisits(filteredVisits)
        } else {
          setVisits([])
          setError("No visits found.")
        }
      } catch (error) {
        setError("Error fetching visit history.")
        setVisits([])
      } finally {
        setLoading(false)
      }
    }
    fetchVisits()
  }, [fromDate, toDate])
 
  const handleDateChange = (event, type) => {
    type === "from" ? setFromDate(event.target.value) : setToDate(event.target.value)
  }
 
  const exportSummaryToCSV = () => {
    const summaryData = employees.map((employee) => {
      const dealerVisits = visits.filter(
        (visit) => visit.EmpId === employee.EmpId && visit.SourceEvent !== "In" && visit.SourceEvent !== "Out",
      )
      const totalDistance = dealerVisits
        .reduce((total, visit) => total + parseFloat(visit.Distance || 0), 0)
        .toFixed(2)
 
      return {
        Employee: employee.Name,
        DateRange: `${new Date(fromDate).toLocaleDateString()} - ${new Date(toDate).toLocaleDateString()}`,
        TotalVisits: dealerVisits.length,
        TotalDistance: `${totalDistance} km`,
      }
    })
 
    const csvContent = [
      ["Employee", "Date Range", "Total Visits", "Total Distance (km)"],
      ...summaryData.map((row) => Object.values(row)),
    ]
      .map((e) => e.join(","))
      .join("\n")
 
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    saveAs(blob, "summary_report.csv")
  }
 
  const exportDetailToCSV = () => {
    const csvData = visits
      .filter((visit) => visit.SourceEvent !== "In" && visit.SourceEvent !== "Out")
      .map((visit) => ({
        Employee: employees.find((emp) => emp.EmpId === visit.EmpId)?.Name || "N/A",
        Event: visit.SourceEvent,
        DateTime: `"${new Date(visit.SourceTime).toLocaleString()}"`,
        Distance: `${visit.Distance} km`,
      }))
 
    const csvContent = [
      ["Employee", "Event", "DateTime", "Distance (km)"],
      ...csvData.map((row) => Object.values(row)),
    ]
      .map((e) => e.join(","))
      .join("\n")
 
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    saveAs(blob, "detailed_report.csv")
  }
 
  const getVisitStats = () => {
    const dealerVisits = visits.filter((visit) => visit.SourceEvent !== "In" && visit.SourceEvent !== "Out")
    const totalDistance = dealerVisits.reduce((total, visit) => total + parseFloat(visit.Distance || 0), 0)
    const uniqueEmployees = new Set(dealerVisits.map((visit) => visit.EmpId)).size
 
    return {
      totalVisits: dealerVisits.length,
      totalDistance: totalDistance.toFixed(2),
      uniqueEmployees,
    }
  }
 
  const stats = getVisitStats()
 
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 5 }}>
        <Typography variant="h4" fontWeight={700} sx={{ color: "primary.main", mb: 1, display: "flex", alignItems: "center", gap: 1 }}>
          <Assessment /> Reports Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Comprehensive reporting system for visits, attendance, and salary management
        </Typography>
      </Box>
 
      {/* Visit Report Section */}
      <Card sx={{ mb: 5, boxShadow: 4, borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h5" fontWeight={700} color="primary.main" sx={{ mb: 3, display: "flex", alignItems: "center", gap: 1 }}>
            <TrendingUp /> Visit Report
          </Typography>
 
          {/* Date Range */}
          <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
            <Grid item xs={12} md={3}>
              <TextField
                label="From Date"
                type="date"
                size="small"
                fullWidth
                value={fromDate}
                onChange={(e) => handleDateChange(e, "from")}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                label="To Date"
                type="date"
                size="small"
                fullWidth
                value={toDate}
                onChange={(e) => handleDateChange(e, "to")}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack direction={isMobile ? "column" : "row"} spacing={2}>
                <Button
                  variant="contained"
                  startIcon={<FileDownload />}
                  disabled={!fromDate || !toDate || loading}
                  sx={{
                    bgcolor: "primary.main",
                    "&:hover": { bgcolor: "primary.dark", transform: "scale(1.03)" },
                    textTransform: "none",
                    fontWeight: 600,
                  }}
                >
                  Summary Report
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<GetApp />}
                  disabled={!fromDate || !toDate || loading}
                  sx={{
                    borderColor: "primary.main",
                    color: "primary.main",
                    "&:hover": { bgcolor: "primary.50", transform: "scale(1.03)" },
                    textTransform: "none",
                    fontWeight: 600,
                  }}
                >
                  Detailed Report
                </Button>
              </Stack>
            </Grid>
          </Grid>
 
          {/* Stats Cards */}
          {fromDate && toDate && !loading && (
            <Fade in>
              <Grid container spacing={3} sx={{ mb: 2 }}>
                {[
                  {
                    title: "Total Visits",
                    value: stats.totalVisits,
                    bg: "linear-gradient(135deg, #e3f2fd, #bbdefb)",
                    icon: <TrendingUp sx={{ fontSize: 28, color: "#1976d2" }} />,
                  },
                  {
                    title: "Total Distance (km)",
                    value: stats.totalDistance,
                    bg: "linear-gradient(135deg, #e8f5e8, #c8e6c9)",
                    icon: <Assessment sx={{ fontSize: 28, color: "#2e7d32" }} />,
                  },
                  {
                    title: "Active Employees",
                    value: stats.uniqueEmployees,
                    bg: "linear-gradient(135deg, #fff3e0, #ffcc80)",
                    icon: <FileDownload sx={{ fontSize: 28, color: "#f57c00" }} />,
                  },
                ].map((stat, idx) => (
                  <Grid item xs={12} sm={6} md={4} key={idx}>
                    <Card
                      sx={{
                        background: stat.bg,
                        borderRadius: 3,
                        boxShadow: 3,
                        cursor: "default",
                        transition: "all 0.3s ease",
                        "&:hover": { transform: "translateY(-4px)", boxShadow: 6 },
                      }}
                    >
                      <CardContent sx={{ display: "flex", alignItems: "center", gap: 2, py: 2 }}>
                        <Box>{stat.icon}</Box>
                        <Box>
                          <Typography variant="h4" fontWeight="bold" color="text.primary">
                            {stat.value}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {stat.title}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Fade>
          )}
 
          {/* Loading and Error */}
          {loading && (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 4 }}>
              <CircularProgress size={40} sx={{ mr: 2 }} />
              <Typography variant="body1" color="text.secondary">
                Loading visit data...
              </Typography>
            </Box>
          )}
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </CardContent>
      </Card>
 
      {/* Other Reports */}
      <Stack spacing={4}>
        <AttendanceReport />
        <MonthlyInOutReport />
        {/* <SalaryList /> */}
        {/* <SalarySlip /> */}
      </Stack>
    </Container>
  )
}
 
export default VisitList