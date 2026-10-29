"use client";
import { BASE_URL } from "../../api/endpoints";

import { useState, useEffect } from "react"
import axios from "axios"
import {
  Typography,
  Box,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Card,
  CardContent,
  Grid,
  Stack,
  Chip,
  Alert,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from "@mui/material"
import { GetApp, AccountBalance, CalendarMonth, TrendingUp } from "@mui/icons-material"

function SalaryList() {
  const [salaries, setSalaries] = useState([])
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  const fetchSalaries = async (month, year) => {
    setLoading(true)
    setError("")
    try {
      const response = await axios.get(
        `${BASE_URL}/salary/salary_records.php?month=${month}&year=${year}`,
      )
      if (response.data.success) {
        setSalaries(response.data.data)
      } else {
        setError("Failed to fetch salary data")
        setSalaries([])
      }
    } catch (err) {
      setError("Error fetching salary data")
      setSalaries([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSalaries(selectedMonth, selectedYear)
  }, [selectedMonth, selectedYear])

  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value)
  }

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value)
  }

  const exportToCSV = () => {
    const csvRows = []
    csvRows.push([
      "Employee ID",
      "Name",
      "Designation",
      "Basic Salary",
      "Total Days in Month",
      "Holidays",
      "Week Offs",
      "Present Days",
      "Leave Days",
      "Actual Working Days",
      "Final Salary",
    ])

    salaries.forEach((salary) => {
      csvRows.push([
        salary.EmpId,
        salary.Name,
        salary.Designation,
        salary.BasicSalary,
        salary.TotalDaysInMonth,
        salary.Holidays,
        salary.WeekOffs,
        salary.PresentDays,
        salary.LeaveDays,
        salary.ActualWorkingDays,
        salary.Salary,
      ])
    })

    const csvString = csvRows.map((row) => row.join(",")).join("\n")
    const blob = new Blob([csvString], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `salary_records_${selectedMonth}_${selectedYear}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getSalaryStats = () => {
    if (!salaries.length) return { totalEmployees: 0, totalSalary: 0, avgSalary: 0 }

    const totalSalary = salaries.reduce((sum, salary) => sum + parseFloat(salary.Salary || 0), 0)
    return {
      totalEmployees: salaries.length,
      totalSalary: totalSalary.toFixed(2),
      avgSalary: (totalSalary / salaries.length).toFixed(2),
    }
  }

  const stats = getSalaryStats()

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  return (
    <Card sx={{ boxShadow: 3 }}>
      <CardContent>
        <Typography variant="h5" component="h2" sx={{ mb: 3, color: "primary.main", fontWeight: 600 }}>
          <AccountBalance sx={{ mr: 1, verticalAlign: "middle" }} />
          Salary Report
        </Typography>

        {/* Controls */}
        <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Month</InputLabel>
              <Select
                value={selectedMonth}
                onChange={handleMonthChange}
                label="Month"
                startAdornment={<CalendarMonth sx={{ mr: 1, color: "action.active" }} />}
              >
                {monthNames.map((month, index) => (
                  <MenuItem key={index + 1} value={index + 1}>
                    {month}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Year</InputLabel>
              <Select value={selectedYear} onChange={handleYearChange} label="Year">
                {[2024, 2025, 2026].map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack direction={isMobile ? "column" : "row"} spacing={2} justifyContent="flex-end">
              <Button
                variant="contained"
                onClick={exportToCSV}
                startIcon={<GetApp />}
                disabled={loading || !salaries.length}
                sx={{
                  bgcolor: "primary.main",
                  "&:hover": { bgcolor: "primary.dark" },
                }}
              >
                Export Summary
              </Button>
            </Stack>
          </Grid>
        </Grid>

        {/* Stats Cards */}
        {!loading && salaries.length > 0 && (
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <Card sx={{ bgcolor: "primary.50", border: "1px solid", borderColor: "primary.200" }}>
                <CardContent sx={{ textAlign: "center", py: 2 }}>
                  <Typography variant="h4" color="primary.main" fontWeight="bold">
                    {stats.totalEmployees}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Employees
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ bgcolor: "success.50", border: "1px solid", borderColor: "success.200" }}>
                <CardContent sx={{ textAlign: "center", py: 2 }}>
                  <Typography variant="h4" color="success.main" fontWeight="bold">
                    ₹{stats.totalSalary}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Salary
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ bgcolor: "info.50", border: "1px solid", borderColor: "info.200" }}>
                <CardContent sx={{ textAlign: "center", py: 2 }}>
                  <Typography variant="h4" color="info.main" fontWeight="bold">
                    ₹{stats.avgSalary}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Average Salary
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Loading State */}
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 4 }}>
            <CircularProgress size={40} sx={{ mr: 2 }} />
            <Typography variant="body1" color="text.secondary">
              Loading salary data...
            </Typography>
          </Box>
        )}

        {/* Error State */}
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {/* No Data State */}
        {!loading && !error && salaries.length === 0 && (
          <Alert severity="info" sx={{ mt: 2 }}>
            No salary records found for {monthNames[selectedMonth - 1]} {selectedYear}
          </Alert>
        )}

        {/* Summary Info */}
        {!loading && salaries.length > 0 && (
          <Box sx={{ mt: 2, p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              <strong>Report Period:</strong> {monthNames[selectedMonth - 1]} {selectedYear}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Generated:</strong> {new Date().toLocaleDateString()}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  )
}

export default SalaryList
