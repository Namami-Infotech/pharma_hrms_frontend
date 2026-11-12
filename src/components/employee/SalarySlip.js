"use client";
import { BASE_URL } from "../../api/endpoints";

import React, { useState, useEffect, useRef, useMemo } from "react";
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
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Avatar,
  InputAdornment,
  Tooltip,
  Stack,
} from "@mui/material";
import {
  Download,
  Print,
  Person,
  CalendarMonth,
  Visibility,
  Close,
  Search,
  FileDownload,
  ReceiptLong,
  CheckCircleOutline,
  HourglassEmpty,
} from "@mui/icons-material";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useAuth } from "../auth/AuthContext";
import logo from "../../assets/aberdure_logo.png";

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

/**
 * Helper to split long address into balanced, readable lines
 */
const formatAddressLines = (addr) => {
  if (!addr) return [];
  if (typeof addr !== "string") return [addr];
  if (addr.includes("\n")) return addr.split("\n").map((s) => s.trim()).filter(Boolean);

  if (addr.includes("BISHAN SWAROOP COMPLEX")) {
    const idxBishan = addr.indexOf("BISHAN SWAROOP COMPLEX");
    const p1 = addr.substring(0, idxBishan).replace(/,\s*$/, "").trim() + ",";
    const rest = addr.substring(idxBishan);
    if (rest.includes("MEHRAULI,")) {
      const idxMehrauli = rest.indexOf("MEHRAULI,");
      const p2 = rest.substring(0, idxMehrauli).replace(/,\s*$/, "").trim() + ",";
      const p3 = rest.substring(idxMehrauli).trim();
      return [p1, p2, p3];
    }
    return [p1, rest];
  }
  return [addr];
};

/**
 * Aberdure Pharma Standard Salary Slip Paper View
 */
function AberdureSalarySlipPaper({ comp, emp, rate, earn, ded, summary, paperRef }) {
  return (
    <Paper
      ref={paperRef}
      elevation={2}
      sx={{
        width: "820px",
        minWidth: "820px",
        bgcolor: "#ffffff",
        p: 3,
        fontFamily: '"Arial", "Helvetica", sans-serif',
        color: "#000000",
        boxSizing: "border-box",
        mx: "auto",
      }}
    >
      {/* Main Outer Border Box */}
      <Box sx={{ border: "2px solid #000000" }}>
        {/* 1. Header Section: Logo on Left, Company Info on Right */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            p: 1.5,
            borderBottom: "2px solid #000000",
          }}
        >
          {/* Left: Company Logo */}
          <Box sx={{ maxWidth: "170px", flexShrink: 0, pl: 0.5 }}>
            <img
              src={logo}
              alt="Aberdure Pharma Logo"
              style={{
                maxHeight: "65px",
                maxWidth: "160px",
                objectFit: "contain",
                display: "block",
              }}
            />
          </Box>

          {/* Right: Company Name & Address */}
          <Box sx={{ textAlign: "right", maxWidth: "480px", pr: 0.5 }}>
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
            <Box
              sx={{
                fontSize: "9.5px",
                fontWeight: "bold",
                mt: 0.5,
                lineHeight: 1.4,
                color: "#111827",
              }}
            >
              {formatAddressLines(comp.address).map((line, idx) => (
                <div key={idx}>{line}</div>
              ))}
            </Box>
          </Box>
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
            ].map(([label, val]) => (
              <Box
                key={label}
                sx={{
                  display: "flex",
                  fontSize: "11px",
                  px: 1,
                  py: 0.35,
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
              // ["ID NO.", emp.idNo],
              ["Payable Days", emp.payableDays],
            ].map(([label, val]) => (
              <Box
                key={label}
                sx={{
                  display: "flex",
                  fontSize: "11px",
                  px: 1,
                  py: 0.35,
                }}
              >
                <Box sx={{ width: "42%", fontWeight: 600 }}>{label}</Box>
                <Box sx={{ width: "58%", fontWeight: 500 }}>{val || "NA"}</Box>
              </Box>
            ))}
          </Box>
        </Box>

        {/* 4. Salary Table Breakdown (4 Columns) */}
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

        {/* Table Body */}
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
              <span>SALARY</span>
              <span style={{ fontWeight: 600 }}>{rate.salary}</span>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <span>DA</span>
              <span style={{ fontWeight: 600 }}>{rate.da}</span>
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
              <span>SALARY</span>
              <span style={{ fontWeight: 600 }}>{earn.basic}</span>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <span>DA</span>
              <span style={{ fontWeight: 600 }}>{earn.da}</span>
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
              <span>OTHER DEDUCTION</span>
              <span style={{ fontWeight: 600 }}>{ded.otherDeduction ?? ded.other_deduction ?? 0}</span>
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
              <span>EXPENSE</span>
              <span style={{ fontWeight: 600 }}>{summary.expense ?? summary.reimbursement ?? 0}</span>
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
  );
}

function SalarySlip() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [selectedEmpId, setSelectedEmpId] = useState("");

  // Default to previous month from current month
  // "in salary slip and salary details will come only for previous month from current month"
  const now = useMemo(() => new Date(), []);
  const prevDate = useMemo(() => new Date(now.getFullYear(), now.getMonth() - 1, 1), [now]);
  const maxAllowedYear = prevDate.getFullYear();
  const maxAllowedMonth = prevDate.getMonth() + 1;

  const [selectedMonth, setSelectedMonth] = useState(maxAllowedMonth);
  const [selectedYear, setSelectedYear] = useState(maxAllowedYear);
  const [salarySlip, setSalarySlip] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");
  const [isSlipOpen, setIsSlipOpen] = useState(false);

  // Salary Records Table State (Bottom UI)
  const [salaryRecords, setSalaryRecords] = useState([]);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [tableSearch, setTableSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const slipRef = useRef(null);

  const isAdmin = ["Admin", "admin", "SuperAdmin"].includes(user?.role);
  const isRM = user?.is_rm || user?.isRM || Boolean(user?.subordinates && user.subordinates.length > 0);

  // Selected employee object and joining date check
  const selectedEmp = useMemo(
    () => employees.find((e) => e.EmpId === selectedEmpId),
    [employees, selectedEmpId]
  );

  const isBeforeJoining = useMemo(() => {
    if (!selectedEmp?.JoinDate) return false;
    const jd = new Date(selectedEmp.JoinDate);
    if (isNaN(jd.getTime())) return false;
    const jYear = jd.getFullYear();
    const jMonth = jd.getMonth() + 1;
    return selectedYear < jYear || (selectedYear === jYear && selectedMonth < jMonth);
  }, [selectedEmp, selectedYear, selectedMonth]);

  // 1. Fetch active employees list
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const tenantId = user?.tenent_id || 1;
        const res = await axios.get(
          `${BASE_URL}/employee/list_employee.php?Tenent_Id=${tenantId}`
        );
        if (res.data.success && res.data.data) {
          const allEmps = res.data.data;
          const userEmpId = user?.emp_id || user?.empId;

          let allowedEmps = allEmps;
          if (!isAdmin) {
            if (isRM) {
              allowedEmps = allEmps.filter(
                (emp) =>
                  emp.EmpId === userEmpId ||
                  emp.RM === userEmpId ||
                  (user?.subordinates && user.subordinates.includes(emp.EmpId))
              );
            } else {
              allowedEmps = allEmps.filter((emp) => emp.EmpId === userEmpId);
            }
          }

          setEmployees(allowedEmps);
          if (!selectedEmpId || !allowedEmps.some((e) => e.EmpId === selectedEmpId)) {
            setSelectedEmpId(userEmpId || (allowedEmps[0]?.EmpId || ""));
          }
        }
      } catch (err) {
        console.error("Error fetching employees:", err);
      }
    };
    fetchEmployees();
  }, [user, isAdmin, isRM]);

  // 2. Fetch salary slip data whenever selectedEmpId, month, or year changes
  useEffect(() => {
    if (!selectedEmpId) return;

    if (isBeforeJoining && selectedEmp?.JoinDate) {
      setError("Data not found before joining date.");
      setSalarySlip(null);
      return;
    }

    const fetchSlip = async () => {
      setLoading(true);
      setError("");
      try {
        const url = `${BASE_URL}/salary/salary_slip.php?empId=${selectedEmpId}&month=${selectedMonth}&year=${selectedYear}`;
        const res = await axios.get(url);
        if (res.data.success) {
          setSalarySlip(res.data.data);
        } else {
          setError(res.data.message || "Failed to load salary slip.");
          setSalarySlip(null);
        }
      } catch (err) {
        console.error("Error fetching salary slip:", err);
        const backendMsg = err.response?.data?.message;
        setError(backendMsg || "Error loading salary slip. Please check server connection.");
        setSalarySlip(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSlip();
  }, [selectedEmpId, selectedMonth, selectedYear, isBeforeJoining, selectedEmp]);

  // 3. Fetch Dynamic Salary Records for bottom table UI (Admin Only)
  useEffect(() => {
    if (!isAdmin) {
      setSalaryRecords([]);
      return;
    }

    const fetchRecords = async () => {
      setRecordsLoading(true);
      try {
        const tenantId = user?.tenent_id || 1;
        const recRes = await axios.get(
          `${BASE_URL}/salary/salary_records.php?month=${selectedMonth}&year=${selectedYear}&Tenent_Id=${tenantId}`
        );
        if (recRes.data.success && Array.isArray(recRes.data.data)) {
          setSalaryRecords(recRes.data.data);
        } else {
          setSalaryRecords([]);
        }
      } catch (err) {
        console.error("Error fetching salary records:", err);
        setSalaryRecords([]);
      } finally {
        setRecordsLoading(false);
      }
    };

    fetchRecords();
  }, [isAdmin, selectedMonth, selectedYear, user]);

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

  // Export CSV for Salary Records Table
  const handleExportCSV = () => {
    if (!salaryRecords || salaryRecords.length === 0) return;
    const headers = [
      "Emp ID",
      "Employee Name",
      "Department",
      "Month",
      "Year",
      "Total Working Days",
      "Total Gross Salary",
      "Total Earning",
      "Total Deductions",
      "Net Take Home",
    ];
    const rows = salaryRecords.map((r) => [
      r.EmpId,
      `"${r.Name || ""}"`,
      `"${r.Department || ""}"`,
      MONTHS.find((m) => m.value === selectedMonth)?.label || selectedMonth,
      selectedYear,
      r.TotalWorkingDays ?? 0,
      r.TotalGrossSalary ?? 0,
      r.TotalEarning ?? 0,
      r.TotalDeductions ?? 0,
      r.NetSalary ?? 0,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Salary_Records_${selectedMonth}_${selectedYear}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Quick Action: View Slip for specific row in table
  const handleViewEmployeeSlip = (empId) => {
    setSelectedEmpId(empId);
    setIsSlipOpen(true);
  };

  // Filtered Salary Records for Table
  const filteredRecords = useMemo(() => {
    if (!tableSearch.trim()) return salaryRecords;
    const q = tableSearch.toLowerCase().trim();
    return salaryRecords.filter(
      (r) =>
        r.Name?.toLowerCase().includes(q) ||
        r.EmpId?.toLowerCase().includes(q) ||
        r.Designation?.toLowerCase().includes(q) ||
        r.Department?.toLowerCase().includes(q)
    );
  }, [salaryRecords, tableSearch]);

  // Statistics for KPI summary
  const totalPayroll = useMemo(
    () => salaryRecords.reduce((sum, r) => sum + (Number(r.NetSalary) || 0), 0),
    [salaryRecords]
  );
  const paidCount = useMemo(
    () => salaryRecords.filter((r) => r.Status === "Paid").length,
    [salaryRecords]
  );
  const pendingCount = salaryRecords.length - paidCount;

  // Safe slip data extraction
  const comp = salarySlip?.company || {
    name: "M/S ABERDURE PHARMA",
    address:
      "1ST FLOOR, SHOP 28 PROP.NO 920-21 WARD NO 07 KH NO 1151/3,\nBISHAN SWAROOP COMPLEX, MEHRAULI MAIN MARKET,\nMEHRAULI, NEW DELHI, SOUTH DELHI, DELHI, 110030",
    title: `PAY SLIP FOR THE MONTH OF: ${MONTHS.find((m) => m.value === selectedMonth)?.label?.toUpperCase()} ${selectedYear}`,
  };

  const emp = salarySlip?.employee || {
    empCode: selectedEmpId || "AP0001",
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
    payableDays: 30,    
  };

  const rate = salarySlip?.rate || {
    salary: 0,
    da: 0,
    basicDa: 0,
    hra: 0,
    conv: 0,
    specialAllow: 0,
    total: 0,
  };

  const earn = salarySlip?.earnings || {
    basic: 0,
    da: 0,
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
    otherDeduction: 0,
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
    <Box sx={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* 1. Generator & Filter Controls Card (Clean & Compact Spacing) */}
      <Card
        elevation={0}
        sx={{
          mb: 1.5,
          p: { xs: 1.25, sm: 1.5 },
          bgcolor: "#ffffff",
          borderRadius: 2,
          border: "1px solid #e2e8f0",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          flexShrink: 0,
        }}
      >
        <Grid container spacing={1.5} alignItems="center">
          {/* Employee Selector */}
          <Grid item xs={12} sm={4} md={3.5}>
            <Autocomplete
              size="small"
              disabled={!isAdmin && !isRM}
              options={employees}
              getOptionLabel={(option) =>
                `${option.Name || ""} (${option.EmpId || ""})`
              }
              value={employees.find((e) => e.EmpId === selectedEmpId) || null}
              onChange={(_, newValue) => {
                if (newValue) setSelectedEmpId(newValue.EmpId);
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
                        <Person sx={{ color: "#f37021", mr: 1, fontSize: 20 }} />
                        {params.InputProps.startAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
          </Grid>

          {/* Month Selector */}
          <Grid item xs={6} sm={2.5} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Month</InputLabel>
              <Select
                value={selectedMonth}
                label="Month"
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
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
          <Grid item xs={6} sm={2} md={1.5}>
            <FormControl fullWidth size="small">
              <InputLabel>Year</InputLabel>
              <Select
                value={selectedYear}
                label="Year"
                onChange={(e) => setSelectedYear(Number(e.target.value))}
              >
                {YEARS.map((y) => (
                  <MenuItem key={y} value={y}>
                    {y}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Actions: View Slip (Primary), Download PDF, Print */}
          <Grid
            item
            xs={12}
            sm={3.5}
            md={5}
            sx={{
              display: "flex",
              gap: 1,
              justifyContent: { xs: "flex-start", sm: "flex-end" },
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <Button
              variant="contained"
              size="small"
              startIcon={<Visibility fontSize="small" />}
              onClick={() => setIsSlipOpen(true)}
              disabled={loading || !salarySlip}
              sx={{
                bgcolor: "#f37021",
                "&:hover": { bgcolor: "#d95300" },
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
                fontSize: "13px",
                px: 2,
                py: 0.8,
                boxShadow: "0 2px 6px rgba(243, 112, 33, 0.25)",
                flex: { xs: 1, sm: "none" },
              }}
            >
              View Slip
            </Button>

            <Button
              variant="outlined"
              size="small"
              startIcon={
                downloading ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <Download fontSize="small" />
                )
              }
              onClick={handleDownloadPDF}
              disabled={downloading || !salarySlip}
              sx={{
                borderColor: "#f37021",
                color: "#f37021",
                "&:hover": {
                  borderColor: "#d95300",
                  bgcolor: "rgba(243, 112, 33, 0.04)",
                },
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
                fontSize: "13px",
                py: 0.8,
                flex: { xs: 1, sm: "none" },
              }}
            >
              {downloading ? "PDF..." : "Download PDF"}
            </Button>


          </Grid>
        </Grid>
      </Card>

      {error && (
        <Alert severity="info" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* 2. KPI Summary Cards Row & 3. Employee Salary Records Table (ADMIN ONLY) */}
      {isAdmin && (
        <>
          {/* <Grid container spacing={1.2} sx={{ mb: 1.2, flexShrink: 0 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card
                elevation={0}
                sx={{
                  p: 1.25,
                  borderRadius: 2,
                  border: "1px solid #e2e8f0",
                  bgcolor: "#ffffff",
                }}
              >
                <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 600, fontSize: "0.78rem" }}>
                  Total Employees
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a", mt: 0.3 }}>
                  {salaryRecords.length}
                </Typography>
                <Typography variant="caption" sx={{ color: "#94a3b8", fontSize: "0.72rem" }}>
                  Active staff in payroll
                </Typography>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card
                elevation={0}
                sx={{
                  p: 1.25,
                  borderRadius: 2,
                  border: "1px solid #e2e8f0",
                  bgcolor: "#ffffff",
                }}
              >
                <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 600, fontSize: "0.78rem" }}>
                  Total Net Payroll
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 800, color: "#f37021", mt: 0.3 }}>
                  ₹{totalPayroll.toLocaleString("en-IN")}
                </Typography>
                <Typography variant="caption" sx={{ color: "#94a3b8", fontSize: "0.72rem" }}>
                  For {MONTHS.find((m) => m.value === selectedMonth)?.label} {selectedYear}
                </Typography>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card
                elevation={0}
                sx={{
                  p: 1.25,
                  borderRadius: 2,
                  border: "1px solid #e2e8f0",
                  bgcolor: "#ffffff",
                }}
              >
                <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 600, fontSize: "0.78rem" }}>
                  Disbursed / Paid
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 800, color: "#16a34a", mt: 0.3 }}>
                  {paidCount}
                </Typography>
                <Typography variant="caption" sx={{ color: "#16a34a", fontSize: "0.72rem" }}>
                  Processed successfully
                </Typography>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card
                elevation={0}
                sx={{
                  p: 1.25,
                  borderRadius: 2,
                  border: "1px solid #e2e8f0",
                  bgcolor: "#ffffff",
                }}
              >
                <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 600, fontSize: "0.78rem" }}>
                  Pending Disbursements
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 800, color: pendingCount > 0 ? "#ea580c" : "#64748b", mt: 0.3 }}>
                  {pendingCount}
                </Typography>
                <Typography variant="caption" sx={{ color: "#94a3b8", fontSize: "0.72rem" }}>
                  Awaiting clearance
                </Typography>
              </Card>
            </Grid>
          </Grid> */}

          {/* 3. Bottom: Employee Salary Records Table */}
          <Card
            elevation={0}
            sx={{
              flex: 1,
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
              borderRadius: 2,
              border: "1px solid #e2e8f0",
              bgcolor: "#ffffff",
              overflow: "hidden",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              mb: 0,
            }}
          >
            {/* Table Header Bar */}
            <Box
              sx={{
                p: 1.2,
                px: 1.5,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 1.2,
                borderBottom: "1px solid #f1f5f9",
                flexShrink: 0,
              }}
            >
              <TextField
                size="small"
                placeholder="Search by name, ID or role..."
                value={tableSearch}
                onChange={(e) => {
                  setTableSearch(e.target.value);
                  setPage(0);
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: "#94a3b8", fontSize: 18 }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  width: { xs: "100%", sm: 260 },
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 1.8,
                    bgcolor: "#f8fafc",
                    fontSize: "0.85rem",
                    height: 36,
                  },
                }}
              />

              <Button
                variant="outlined"
                size="small"
                startIcon={<FileDownload fontSize="small" />}
                onClick={handleExportCSV}
                disabled={salaryRecords.length === 0}
                sx={{
                  borderColor: "#cbd5e1",
                  color: "#475569",
                  borderRadius: 1.8,
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "12.5px",
                  height: 36,
                  "&:hover": { borderColor: "#94a3b8", bgcolor: "#f8fafc" },
                }}
              >
                Export CSV
              </Button>
            </Box>

            {/* Table Content */}
            {recordsLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 8 }}>
                <CircularProgress size={36} sx={{ color: "#f37021" }} />
              </Box>
            ) : (
              <TableContainer sx={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow sx={{ "& th": { bgcolor: "#f8fafc", fontWeight: 700, fontSize: "0.78rem", color: "#475569", py: 1.2 } }}>
                      <TableCell>EMP ID</TableCell>
                      <TableCell>EMPLOYEE</TableCell>
                      <TableCell align="center">TOTAL WORKING DAYS</TableCell>
                      <TableCell align="right">TOTAL GROSS SALARY</TableCell>
                      <TableCell align="right">TOTAL EARNING</TableCell>
                      <TableCell align="right">DEDUCTIONS</TableCell>
                      <TableCell align="right">NET TAKE HOME</TableCell>
                      <TableCell align="center">ACTION</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredRecords.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} align="center" sx={{ py: 6, color: "#94a3b8" }}>
                          No salary records found matching your filter.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredRecords
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((row) => (
                          <TableRow
                            key={row.EmpId}
                            hover
                            sx={{
                              "&:last-child td, &:last-child th": { border: 0 },
                              transition: "background-color 0.15s ease",
                            }}
                          >
                            {/* Emp ID */}
                            <TableCell sx={{ fontWeight: 700, fontSize: "0.82rem", color: "#1e293b" }}>
                              {row.EmpId}
                            </TableCell>

                            {/* Employee Name */}
                            <TableCell>
                              <Box>
                                <Typography sx={{ fontWeight: 600, fontSize: "0.83rem", color: "#0f172a", lineHeight: 1.2 }}>
                                  {row.Name}
                                </Typography>
                                <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.72rem" }}>
                                  {row.Department || "General"}
                                </Typography>
                              </Box>
                            </TableCell>

                            {/* Total Working Days (Dynamic from attendance & leaves) */}
                            <TableCell align="center">
                              <Chip
                                size="small"
                                label={`${row.TotalWorkingDays ?? row.PresentDays ?? 0} Days`}
                                sx={{
                                  height: 24,
                                  fontSize: "0.75rem",
                                  bgcolor: "#f1f5f9",
                                  color: "#1e293b",
                                  fontWeight: 600,
                                }}
                              />
                            </TableCell>

                            {/* Total Gross Salary (Defined monthly package: Basic + HRA + DA + Conveyance + Special Allowance) */}
                            <TableCell align="right" sx={{ fontSize: "0.8rem", color: "#334155", fontWeight: 600 }}>
                              ₹{Number(row.TotalGrossSalary ?? row.GrossSalary ?? 0).toLocaleString("en-IN")}
                            </TableCell>

                            {/* Total Earning (Actual earnings pro-rated by attendance & leaves, matches salary slip) */}
                            <TableCell align="right" sx={{ fontSize: "0.8rem", color: "#16a34a", fontWeight: 600 }}>
                              ₹{Number(row.TotalEarning ?? 0).toLocaleString("en-IN")}
                            </TableCell>

                            {/* Total Deductions */}
                            <TableCell align="right" sx={{ fontSize: "0.8rem", color: "#dc2626" }}>
                              -₹{Number(row.TotalDeductions || 0).toLocaleString("en-IN")}
                            </TableCell>

                            {/* Net Take Home */}
                            <TableCell align="right" sx={{ fontSize: "0.85rem", fontWeight: 700, color: "#f37021" }}>
                              ₹{Number(row.NetSalary || 0).toLocaleString("en-IN")}
                            </TableCell>

                            {/* Action: View Slip */}
                            <TableCell align="center">
                              <Tooltip title="View Salary Slip">
                                <Button
                                  variant="outlined"
                                  size="small"
                                  startIcon={<Visibility sx={{ fontSize: "15px !important" }} />}
                                  onClick={() => handleViewEmployeeSlip(row.EmpId)}
                                  sx={{
                                    py: 0.4,
                                    px: 1.2,
                                    minWidth: 0,
                                    fontSize: "0.75rem",
                                    textTransform: "none",
                                    fontWeight: 600,
                                    borderRadius: 1.8,
                                    borderColor: "#f37021",
                                    color: "#f37021",
                                    "&:hover": {
                                      borderColor: "#d95300",
                                      bgcolor: "rgba(243, 112, 33, 0.05)",
                                    },
                                  }}
                                >
                                  View
                                </Button>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {/* Table Pagination */}
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={filteredRecords.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              sx={{ borderTop: "1px solid #f1f5f9" }}
            />
          </Card>
        </>
      )}

      {/* 4. Salary Slip Preview Modal (Aberdure Pharma Standard Slip) */}
      <Dialog
        open={isSlipOpen}
        onClose={() => setIsSlipOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: { xs: 2, sm: 3 },
            m: { xs: 1.5, sm: 2 },
            width: { xs: "calc(100% - 24px)", sm: "auto" },
            bgcolor: "#f8fafc",
            overflow: "hidden",
            boxShadow: "0 20px 45px rgba(0,0,0,0.18)",
          },
        }}
      >
        {/* Dialog Header */}
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            bgcolor: "#ffffff",
            borderBottom: "1px solid #e2e8f0",
            py: 1.5,
            px: 2.5,
          }}
        >
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: "1.05rem", color: "#0f172a" }}>
              Salary Slip Preview — {emp.name} ({emp.empCode})
            </Typography>
            <Typography variant="caption" sx={{ color: "#64748b" }}>
              Pay slip for {MONTHS.find((m) => m.value === selectedMonth)?.label} {selectedYear}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Button
              variant="contained"
              size="small"
              startIcon={
                downloading ? (
                  <CircularProgress size={15} color="inherit" />
                ) : (
                  <Download fontSize="small" />
                )
              }
              onClick={handleDownloadPDF}
              disabled={downloading}
              sx={{
                bgcolor: "#f37021",
                "&:hover": { bgcolor: "#d95300" },
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
                fontSize: "12.5px",
                py: 0.6,
                px: 1.5,
              }}
            >
              {downloading ? "PDF..." : "Download PDF"}
            </Button>



            <IconButton
              size="small"
              onClick={() => setIsSlipOpen(false)}
              sx={{ color: "#64748b", ml: 0.5 }}
            >
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>

        {/* Dialog Content: Aberdure Pharma Standard Slip */}
        <DialogContent
          sx={{
            bgcolor: "#f1f5f9",
            p: { xs: 1.5, sm: 3 },
            display: "flex",
            justifyContent: "center",
            overflowX: "auto",
          }}
        >
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 8 }}>
              <CircularProgress sx={{ color: "#f37021" }} />
            </Box>
          ) : (
            <AberdureSalarySlipPaper
              comp={comp}
              emp={emp}
              rate={rate}
              earn={earn}
              ded={ded}
              summary={summary}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* 5. Hidden DOM Container for High-Resolution PDF Capture */}
      <Box
        sx={{
          position: "fixed",
          left: "-9999px",
          top: 0,
          opacity: 1,
          zIndex: -100,
          pointerEvents: "none",
        }}
      >
        <AberdureSalarySlipPaper
          paperRef={slipRef}
          comp={comp}
          emp={emp}
          rate={rate}
          earn={earn}
          ded={ded}
          summary={summary}
        />
      </Box>
    </Box>
  );
}

export default SalarySlip;