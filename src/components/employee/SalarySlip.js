"use client";
import { BASE_URL } from "../../api/endpoints";

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Paper,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  Autocomplete,
  TextField,
  Divider,
} from "@mui/material";
import {
  Download,
  Print,
  Refresh,
  Person,
  CalendarMonth,
  Payments,
} from "@mui/icons-material";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useAuth } from "../auth/AuthContext";

const MONTHS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

const YEARS = [2024, 2025, 2026, 2027];

function SalarySlip() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [selectedEmpId, setSelectedEmpId] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [payableDaysInput, setPayableDaysInput] = useState("");
  const [isCustomDays, setIsCustomDays] = useState(false);
  const [salarySlip, setSalarySlip] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");

  const slipRef = useRef(null);

  // 1. Fetch active employees list
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const tenantId = user?.tenent_id || 1;
        const res = await axios.get(
          `${BASE_URL}/employee/list_employee.php?Tenent_Id=${tenantId}`
        );
        if (res.data.success && res.data.data) {
          setEmployees(res.data.data);
          // Auto select current logged-in employee or first employee
          if (user?.role === "Employee" && user?.empId) {
            setSelectedEmpId(user.empId);
          } else if (res.data.data.length > 0 && !selectedEmpId) {
            setSelectedEmpId(res.data.data[0].EmpId);
          }
        }
      } catch (err) {
        console.error("Error fetching employees:", err);
      }
    };
    fetchEmployees();
  }, [user]);

  // Reset custom days when changing employee, month, or year
  const handleEmpChange = (newEmpId) => {
    setSelectedEmpId(newEmpId);
    setIsCustomDays(false);
    setPayableDaysInput("");
  };

  const handleMonthChange = (newMonth) => {
    setSelectedMonth(newMonth);
    setIsCustomDays(false);
    setPayableDaysInput("");
  };

  const handleYearChange = (newYear) => {
    setSelectedYear(newYear);
    setIsCustomDays(false);
    setPayableDaysInput("");
  };

  // 2. Fetch salary slip data whenever selectedEmpId, month, year, or customDays changes
  useEffect(() => {
    if (!selectedEmpId) return;

    const fetchSlip = async () => {
      setLoading(true);
      setError("");
      try {
        let url = `${BASE_URL}/salary/salary_slip.php?empId=${selectedEmpId}&month=${selectedMonth}&year=${selectedYear}`;
        if (isCustomDays && payableDaysInput !== "") {
          url += `&payableDays=${payableDaysInput}`;
        }
        const res = await axios.get(url);
        if (res.data.success) {
          setSalarySlip(res.data.data);
          if (!isCustomDays) {
            setPayableDaysInput(String(res.data.data.employee.payableDays ?? 0));
          }
        } else {
          setError(res.data.message || "Failed to load salary slip.");
          setSalarySlip(null);
        }
      } catch (err) {
        console.error("Error fetching salary slip:", err);
        setError("Error loading salary slip. Please check server connection.");
        setSalarySlip(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSlip();
  }, [selectedEmpId, selectedMonth, selectedYear, isCustomDays, payableDaysInput]);

  // Download PDF
  const handleDownloadPDF = async () => {
    if (!slipRef.current) return;
    setDownloading(true);

    try {
      const element = slipRef.current;
      const canvas = await html2canvas(element, {
        scale: 2.5,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
      const empCode = salarySlip?.employee?.empCode || selectedEmpId;
      pdf.save(`Salary_Slip_${empCode}_${selectedMonth}_${selectedYear}.pdf`);
    } catch (err) {
      console.error("Error generating PDF:", err);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Safe data extraction
  const comp = salarySlip?.company || {
    name: "M/S ABERDURE PHARMA",
    address:
      "1ST FLOOR, SHOP 28 PROP.NO 920-21 WARD NO 07 KH NO 1151/3, BISHAN SWAROOP COMPLEX, MEHRAULI MAIN MARKET, MEHRAULI, NEW DELHI, SOUTH DELHI, DELHI, 110030",
    title: `PAY SLIP FOR THE MONTH OF: ${MONTHS.find((m) => m.value === selectedMonth)?.label?.toUpperCase()} ${selectedYear}`,
  };

  const emp = salarySlip?.employee || {
    empCode: selectedEmpId || "AP0005",
    name: "EMPLOYEE NAME",
    fatherName: "FATHER'S NAME",
    designation: "DESIGNATION",
    department: "NA",
    location: "DELHI",
    esiNo: "NA",
    uanNo: "-",
    dob: "NA",
    doj: "NA",
    idNo: "-",
    payableDays: 31,
  };

  const rate = salarySlip?.rate || {
    basicDa: 0,
    hra: 0,
    conv: 0,
    specialAllow: 0,
    total: 0,
  };

  const earn = salarySlip?.earnings || {
    basic: 0,
    hra: 0,
    conv: 0,
    specialAllow: 0,
    gwrInc: 0,
    performanceBonus: 0,
    total: 0,
  };

  const ded = salarySlip?.deductions || {
    esi: 0,
    pf: 0,
    lwf: 0,
    tds: 0,
    advance: 0,
    total: 0,
  };

  const summary = salarySlip?.summary || {
    grossPay: 0,
    grossDed: 0,
    reimbursement: 0,
    netPay: 0,
    netPayWords: "Zero Rupees Only",
  };

  return (
    <Box sx={{ p: { xs: 1, md: 3 }, bgcolor: "#f8fafc", minHeight: "100vh" }}>
      {/* Top Controls Card */}
      <Card
        sx={{
          mb: 3,
          p: 2,
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          borderRadius: 2,
        }}
      >
        <Grid container spacing={1.5} alignItems="center">
          {/* Employee Selector */}
          <Grid item xs={12} sm={3.5} md={3.2}>
            <Autocomplete
              size="small"
              options={employees}
              getOptionLabel={(option) =>
                `${option.Name || ""} (${option.EmpId || ""})`
              }
              value={
                employees.find((e) => e.EmpId === selectedEmpId) || null
              }
              onChange={(_, newValue) => {
                if (newValue) handleEmpChange(newValue.EmpId);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Employee"
                  placeholder="Search by name or ID"
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <Person sx={{ color: "action.active", mr: 1 }} />
                        {params.InputProps.startAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
          </Grid>

          {/* Month Selector */}
          <Grid item xs={6} sm={2} md={1.6}>
            <FormControl fullWidth size="small">
              <InputLabel>Month</InputLabel>
              <Select
                value={selectedMonth}
                label="Month"
                onChange={(e) => handleMonthChange(Number(e.target.value))}
              >
                {MONTHS.map((m) => (
                  <MenuItem key={m.value} value={m.value}>
                    {m.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Year Selector */}
          <Grid item xs={6} sm={1.5} md={1.4}>
            <FormControl fullWidth size="small">
              <InputLabel>Year</InputLabel>
              <Select
                value={selectedYear}
                label="Year"
                onChange={(e) => handleYearChange(Number(e.target.value))}
              >
                {YEARS.map((y) => (
                  <MenuItem key={y} value={y}>
                    {y}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Payable Days (From Attendance with Custom Override) */}
          <Grid item xs={6} sm={2} md={1.8}>
            <TextField
              fullWidth
              size="small"
              type="number"
              label="Payable Days"
              value={payableDaysInput}
              onChange={(e) => {
                setIsCustomDays(true);
                setPayableDaysInput(e.target.value);
              }}
              helperText={
                isCustomDays
                  ? `Custom (Att: ${salarySlip?.employee?.attendanceDays ?? 0})`
                  : `Att. Marked: ${salarySlip?.employee?.attendanceDays ?? 0}d`
              }
              inputProps={{ min: 0, max: 31 }}
            />
          </Grid>

          {/* Actions */}
          <Grid
            item
            xs={12}
            sm={3}
            md={4}
            sx={{ display: "flex", gap: 1, justifyContent: "flex-end", alignItems: "center" }}
          >
            {isCustomDays && (
              <Button
                size="small"
                variant="text"
                onClick={() => {
                  setIsCustomDays(false);
                  setPayableDaysInput("");
                }}
                sx={{
                  color: "#6b7280",
                  textTransform: "none",
                  fontSize: "12px",
                  p: 0.5,
                }}
              >
                ↺ Use Attendance
              </Button>
            )}

            <Button
              variant="contained"
              size="small"
              startIcon={
                downloading ? <CircularProgress size={16} color="inherit" /> : <Download fontSize="small" />
              }
              onClick={handleDownloadPDF}
              disabled={downloading || !salarySlip}
              sx={{
                bgcolor: "#8d0638",
                "&:hover": { bgcolor: "#6b042d" },
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
                fontSize: "13px",
                py: 0.8,
              }}
            >
              {downloading ? "PDF..." : "Download PDF"}
            </Button>

            <Button
              variant="outlined"
              size="small"
              startIcon={<Print fontSize="small" />}
              onClick={handlePrint}
              disabled={!salarySlip}
              sx={{
                borderColor: "#8d0638",
                color: "#8d0638",
                "&:hover": { borderColor: "#6b042d", bgcolor: "rgba(141,6,56,0.04)" },
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
                fontSize: "13px",
                py: 0.8,
              }}
            >
              Print
            </Button>
          </Grid>
        </Grid>
      </Card>

      {error && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress sx={{ color: "#8d0638" }} />
        </Box>
      ) : (
        /* Aberdure Pharma Salary Slip Container */
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            width: "100%",
            overflowX: "auto",
            pb: 4,
          }}
        >
          <Paper
            ref={slipRef}
            elevation={3}
            sx={{
              width: "820px",
              minWidth: "820px",
              bgcolor: "#ffffff",
              p: 3,
              fontFamily: '"Arial", "Helvetica", sans-serif',
              color: "#000000",
              boxSizing: "border-box",
            }}
          >
            {/* Main Outer Border Box */}
            <Box sx={{ border: "2px solid #000000" }}>
              {/* 1. Header Section */}
              <Box sx={{ textAlign: "center", p: 1.5, borderBottom: "2px solid #000000" }}>
                <Typography
                  sx={{
                    fontSize: "20px",
                    fontWeight: "bold",
                    letterSpacing: "0.5px",
                    textTransform: "uppercase",
                  }}
                >
                  {comp.name}
                </Typography>
                <Typography
                  sx={{
                    fontSize: "9.5px",
                    fontWeight: "bold",
                    mt: 0.5,
                    px: 2,
                    lineHeight: 1.3,
                    color: "#111827",
                  }}
                >
                  {comp.address}
                </Typography>
              </Box>

              {/* 2. Month Title Bar */}
              <Box
                sx={{
                  bgcolor: "#d1d5db",
                  textAlign: "center",
                  py: 0.5,
                  borderBottom: "2px solid #000000",
                }}
              >
                <Typography sx={{ fontSize: "12px", fontWeight: "bold" }}>
                  {comp.title}
                </Typography>
              </Box>

              {/* 3. Employee Info 2-Column Grid */}
              <Box sx={{ display: "flex", borderBottom: "2px solid #000000" }}>
                {/* Left Column */}
                <Box sx={{ width: "50%", borderRight: "2px solid #000000" }}>
                  {[
                    ["EMPLOYEE CODE", emp.empCode],
                    ["NAME", emp.name],
                    ["FATHER'S NAME", emp.fatherName],
                    ["DESIGNATION", emp.designation],
                    ["DEPARTMENT", emp.department],
                    ["LOCATION", emp.location],
                  ].map(([label, val], idx, arr) => (
                    <Box
                      key={label}
                      sx={{
                        display: "flex",
                        fontSize: "11px",
                        px: 1,
                        py: 0.35,
                        borderBottom: idx !== arr.length - 1 ? "1px solid #d1d5db" : "none",
                      }}
                    >
                      <Box sx={{ width: "42%", fontWeight: 600 }}>{label}</Box>
                      <Box sx={{ width: "58%", fontWeight: 500 }}>{val || "NA"}</Box>
                    </Box>
                  ))}
                </Box>

                {/* Right Column */}
                <Box sx={{ width: "50%" }}>
                  {[
                    ["ESI No.", emp.esiNo],
                    ["PF/UAN Number", emp.uanNo],
                    ["D.O.B", emp.dob],
                    ["D.O.J", emp.doj],
                    ["ID NO.", emp.idNo],
                    ["Payable Days", emp.payableDays],
                  ].map(([label, val], idx, arr) => (
                    <Box
                      key={label}
                      sx={{
                        display: "flex",
                        fontSize: "11px",
                        px: 1,
                        py: 0.35,
                        borderBottom: idx !== arr.length - 1 ? "1px solid #d1d5db" : "none",
                      }}
                    >
                      <Box sx={{ width: "42%", fontWeight: 600 }}>{label}</Box>
                      <Box sx={{ width: "58%", fontWeight: 500 }}>{val || "NA"}</Box>
                    </Box>
                  ))}
                </Box>
              </Box>

              {/* 4. Salary Table Breakdown (4 Columns) */}
              {/* Header Row */}
              <Box
                sx={{
                  display: "flex",
                  bgcolor: "#e5e7eb",
                  fontWeight: "bold",
                  fontSize: "11px",
                  borderBottom: "2px solid #000000",
                  textAlign: "center",
                }}
              >
                <Box sx={{ width: "24%", py: 0.6, borderRight: "1px solid #000000" }}>
                  RATE
                </Box>
                <Box sx={{ width: "32%", py: 0.6, borderRight: "1px solid #000000" }}>
                  ACTUAL EARNING
                </Box>
                <Box sx={{ width: "24%", py: 0.6, borderRight: "1px solid #000000" }}>
                  DEDUCTIONS
                </Box>
                <Box sx={{ width: "20%", py: 0.6 }}>TOTAL</Box>
              </Box>

              {/* Table Body (6 Rows matching PDF) */}
              <Box sx={{ display: "flex", fontSize: "11px" }}>
                {/* 1. RATE Column */}
                <Box
                  sx={{
                    width: "24%",
                    borderRight: "1px solid #000000",
                    p: 0.5,
                    display: "flex",
                    flexDirection: "column",
                    gap: 0.4,
                  }}
                >
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <span>BASIC & DA</span>
                    <span style={{ fontWeight: 600 }}>{rate.basicDa}</span>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <span>HRA</span>
                    <span style={{ fontWeight: 600 }}>{rate.hra}</span>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <span>CONV.</span>
                    <span style={{ fontWeight: 600 }}>{rate.conv}</span>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <span>SPECIAL ALLOW.</span>
                    <span style={{ fontWeight: 600 }}>{rate.specialAllow}</span>
                  </Box>
                </Box>

                {/* 2. ACTUAL EARNING Column */}
                <Box
                  sx={{
                    width: "32%",
                    borderRight: "1px solid #000000",
                    p: 0.5,
                    display: "flex",
                    flexDirection: "column",
                    gap: 0.4,
                  }}
                >
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <span>BASIC</span>
                    <span style={{ fontWeight: 600 }}>{earn.basic}</span>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <span>HRA</span>
                    <span style={{ fontWeight: 600 }}>{earn.hra}</span>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <span>CONV.</span>
                    <span style={{ fontWeight: 600 }}>{earn.conv}</span>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <span>SPECIAL ALLOW.</span>
                    <span style={{ fontWeight: 600 }}>{earn.specialAllow}</span>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <span>GWR/INC.</span>
                    <span style={{ fontWeight: 600 }}>{earn.gwrInc}</span>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <span>PERFORMANCE BONUS</span>
                    <span style={{ fontWeight: 600 }}>{earn.performanceBonus}</span>
                  </Box>
                </Box>

                {/* 3. DEDUCTIONS Column */}
                <Box
                  sx={{
                    width: "24%",
                    borderRight: "1px solid #000000",
                    p: 0.5,
                    display: "flex",
                    flexDirection: "column",
                    gap: 0.4,
                  }}
                >
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <span>ESI</span>
                    <span style={{ fontWeight: 600 }}>{ded.esi}</span>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <span>PF</span>
                    <span style={{ fontWeight: 600 }}>{ded.pf}</span>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <span>LWF</span>
                    <span style={{ fontWeight: 600 }}>{ded.lwf}</span>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <span>TDS</span>
                    <span style={{ fontWeight: 600 }}>{ded.tds}</span>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <span>ADVANCE</span>
                    <span style={{ fontWeight: 600 }}>{ded.advance}</span>
                  </Box>
                </Box>

                {/* 4. TOTAL Column */}
                <Box
                  sx={{
                    width: "20%",
                    p: 0.5,
                    display: "flex",
                    flexDirection: "column",
                    gap: 0.4,
                  }}
                >
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <span>GROSS PAY</span>
                    <span style={{ fontWeight: 600 }}>{summary.grossPay}</span>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <span>GROSS DED.</span>
                    <span style={{ fontWeight: 600 }}>{summary.grossDed}</span>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <span>REIMBURSEMENT</span>
                    <span style={{ fontWeight: 600 }}>{summary.reimbursement}</span>
                  </Box>
                </Box>
              </Box>

              {/* 5. Total & Net Pay Row */}
              <Box
                sx={{
                  display: "flex",
                  borderTop: "2px solid #000000",
                  borderBottom: "2px solid #000000",
                  fontWeight: "bold",
                  fontSize: "11px",
                  bgcolor: "#f9fafb",
                  py: 0.6,
                }}
              >
                <Box
                  sx={{
                    width: "24%",
                    px: 1,
                    display: "flex",
                    justifyContent: "space-between",
                    borderRight: "1px solid #000000",
                  }}
                >
                  <span>Total</span>
                  <span>{rate.total}</span>
                </Box>

                <Box
                  sx={{
                    width: "32%",
                    px: 1,
                    textAlign: "right",
                    borderRight: "1px solid #000000",
                  }}
                >
                  {earn.total}
                </Box>

                <Box
                  sx={{
                    width: "24%",
                    px: 1,
                    textAlign: "right",
                    borderRight: "1px solid #000000",
                  }}
                >
                  {ded.total}
                </Box>

                <Box
                  sx={{
                    width: "20%",
                    px: 1,
                    display: "flex",
                    justifyContent: "space-between",
                    color: "#1e3a8a",
                  }}
                >
                  <span>Net Pay</span>
                  <span style={{ fontWeight: "bold" }}>{summary.netPay}</span>
                </Box>
              </Box>

              {/* 6. Footer Note */}
              <Box sx={{ textAlign: "center", py: 0.7, bgcolor: "#ffffff" }}>
                <Typography sx={{ fontSize: "10px", fontStyle: "italic" }}>
                  This is a computer-generated slip and does not require a signature.
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>
      )}
    </Box>
  );
}

export default SalarySlip;
