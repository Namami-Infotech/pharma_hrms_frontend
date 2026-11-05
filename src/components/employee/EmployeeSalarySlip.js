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
  TableCell,
  TableRow,
  Table,
  TableHead,
  TableContainer,
  Paper,
  Container,
  TableBody,
  Divider,
} from "@mui/material";
import GetAppIcon from "@mui/icons-material/GetApp";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import logo from "../../assets/aberdure_logo.png";
import { useParams } from "react-router-dom";
function EmployeeSalarySlip() {
  const [salarySlip, setSalarySlip] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const salarySlipRef = useRef(null);

    const { EmpId } = useParams();
    console.log(EmpId)
  // useEffect(() => {
  //   const fetchEmployees = async () => {
  //     try {
  //       const response = await axios.get(
  //         `${BASE_URL}/employee/list_employee.php?Tenent_Id=1`,
  //       );
  //     } catch (error) {
  //       console.error("Error fetching employees:", error);
  //     }
  //   };
  //   fetchEmployees();
  // });

  useEffect(() => {
  if (EmpId) {
    const fetchSalarySlip = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/salary/salary_slip.php?month=${selectedMonth}&year=${selectedYear}&EmpId=${EmpId}`
        );
        setSalarySlip(response.data.data);
      } catch (error) {
        console.error("Error fetching salary slip:", error);
      }
    };
    fetchSalarySlip();
  }
}, [EmpId, selectedMonth, selectedYear]);


  const downloadPDF = () => {
  const input = salarySlipRef.current;
  if (!input) return;

  html2canvas(input, {
    scale: 2, // Higher resolution
    scrollX: 0,
    scrollY: 0,
    windowWidth: document.documentElement.scrollWidth,
    windowHeight: input.scrollHeight, // Capture full height
  }).then((canvas) => {
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");

    const imgWidth = 210; // A4 width
    const imgHeight = (canvas.height * imgWidth) / canvas.width; 

    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
    pdf.save(`salary_slip_${selectedMonth}_${selectedYear}.pdf`);
  });
};



  

  const employeeDetails = salarySlip
    ? [
        ["Employee ID", salarySlip.EmpId, "PF No.", "-"],
        ["Employee Name", salarySlip.Name, "Bank", "Bank Name"],
        [
          "Designation",
          salarySlip.Designation,
          "Account No.",
          "xxxxxxxxxxxxx",
        ],
        ["Location", "Delhi", "Date of Joining", "23-07-2024"],
      ]
    : [];

  const salaryDetails = salarySlip
    ? [
        ["Gross Wages", `₹${salarySlip.BasicSalary}`, "Total Deductions", "₹0"],
        [
          "Total Working Days",
          salarySlip.TotalDaysInMonth,
          "Net Salary",
          `₹${salarySlip.Salary}`,
        ],
        ["Leaves", salarySlip.LeaveDays, "Paid Days", salarySlip.PresentDays],
        [
          "Week Offs",
          salarySlip.WeekOffs,
          "Present Days",
          salarySlip.PresentDays,
        ],
      ]
    : [];

  const earnings = salarySlip
    ? [
        ["Basic", salarySlip.BasicSalary],
        ["HRA", "0"],
        ["Conveyance Allowance", "0"],
        ["Medical Allowance", "0"],
        ["Other Allowances", "0"],
      ]
    : [];

  const deductions = [
    ["EPF", "0"],
    ["ESI", "0"],
    ["Other Deduction", salarySlip?.deductions?.otherDeduction ? String(salarySlip.deductions.otherDeduction) : "0"],
    ["Professional Tax", "0"],
  ];
  const months = [
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
  ];

  return (
    <Box sx={{ width: "100%", maxWidth: 800, mx: "auto", px: 2 }}>

      <Typography variant="h5" sx={{ marginBottom: 2 }}>
        Salary Slip
      </Typography>

      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        {/* <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Employee</InputLabel>
          <Select
            value={selectedEmployee}
            onChange={handleEmployeeChange} // Use the new handler
          >
            {employees.map((emp) => (
              <MenuItem key={emp.EmpId} value={emp.EmpId}>
                {emp.Name}
              </MenuItem>
            ))}
          </Select>
        </FormControl> */}
        <FormControl size="small">
          <InputLabel>Month</InputLabel>
          <Select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            {[...Array(12).keys()].map((i) => (
              <MenuItem key={i + 1} value={i + 1}>
                {new Date(2024, i).toLocaleString("default", { month: "long" })}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small">
          <InputLabel>Year</InputLabel>
          <Select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            {[2024, 2025].map((year) => (
              <MenuItem key={year} value={year}>
                {year}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          variant="contained"
          size="small"
          onClick={downloadPDF}
          sx={{ backgroundColor: "#f37021" }}
        >
          Download PDF <GetAppIcon sx={{ color: "white", ml: 1 }} />
        </Button>
      </Box>

      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 3 }} ref={salarySlipRef}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <img
              src={logo}
              alt="Aberdure Pharma"
              style={{ maxHeight: "65px", maxWidth: "140px", objectFit: "contain", display: "block" }}
            />

            <div style={{ textAlign: "right", maxWidth: "480px" }}>
              <Typography variant="h6" align="right" fontWeight="bold">
                M/S ABERDURE PHARMA
              </Typography>
              <Typography variant="body2" component="div" align="right" fontWeight="bold" sx={{ fontSize: "10.5px", lineHeight: 1.4, my: 0.5 }}>
                <div>1ST FLOOR, SHOP 28 PROP.NO 920-21 WARD NO 07 KH NO 1151/3,</div>
                <div>BISHAN SWAROOP COMPLEX, MEHRAULI MAIN MARKET,</div>
                <div>MEHRAULI, NEW DELHI - 110030</div>
              </Typography>
              <Typography variant="subtitle1" align="right">
                Pay Slip for {months[selectedMonth - 1]} {selectedYear}
              </Typography>
            </div>
          </div>
          <Divider/>
          <TableContainer component={Paper} sx={{ mt: 2, overflowX: "auto" }}>

            <Table>
              <TableBody>
                {employeeDetails.map((row, index) => (
                  <TableRow key={index}>
                    {row.map((cell, idx) => (
                      <TableCell key={idx}>{cell}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableBody>
                {salaryDetails.map((row, index) => (
                  <TableRow
                    key={index}
                    sx={{ bgcolor: index === 0 ? "#f2f2f2" : "inherit" }}
                  >
                    {row.map((cell, idx) => (
                      <TableCell
                        key={idx}
                        fontWeight={idx % 2 !== 0 ? "bold" : "normal"}
                      >
                        {cell}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#f2f2f2" }}>
                  <TableCell>Earnings</TableCell>
                  <TableCell>Amount (₹)</TableCell>
                  <TableCell>Deductions</TableCell>
                  <TableCell>Amount (₹)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {earnings.map((earn, index) => (
                  <TableRow key={index}>
                    <TableCell>{earn[0]}</TableCell>
                    <TableCell>{earn[1]}</TableCell>
                    <TableCell>{deductions[index]?.[0] || ""}</TableCell>
                    <TableCell>{deductions[index]?.[1] || ""}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Typography
            variant="h6"
            align="right"
            fontWeight="bold"
            sx={{ mt: 2 }}
          >
            Net Salary: ₹{salarySlip ? salarySlip.Salary : "0"}
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}

export default EmployeeSalarySlip;
