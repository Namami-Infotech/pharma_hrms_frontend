"use client";
import { BASE_URL } from "../../api/endpoints";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Typography,
  IconButton,
  Grid,
  TablePagination,
  Box,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  ListItemText,
  Card,
  CardContent,
  Chip,
  Avatar,
  Divider,
  useTheme,
  useMediaQuery,
  Alert,
  CircularProgress,
  Tooltip,
  InputAdornment,
  Fade,
  Autocomplete,
  Checkbox,
} from "@mui/material";
import {
  Edit,
  Close,
  CheckCircle,
  Search,
  Person,
  Email,
  Phone,
  Work,
  Money,
  Schedule,
  CalendarToday,
  Badge,
  LocationOn,
  Refresh,
  Visibility,
  PersonAdd,
  Download,
  Block,
  AccountBalance,
  Payments,
  HomeWork,
  DirectionsCar,
  Star,
  TrendingUp,
  AccountBalanceWallet,
} from "@mui/icons-material";
import { CheckBox } from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useAuth } from "../auth/AuthContext";
import * as XLSX from "xlsx";

// Employee Card Component for Mobile View
const EmployeeCard = ({
  employee,
  onEdit,
  onToggleStatus,
  onViewDetails,
  theme,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -2, boxShadow: theme.shadows[8] }}
      transition={{ duration: 0.2 }}
    >
      <Card
        sx={{
          mb: 2,
          borderLeft: `4px solid ${
            employee.IsActive
              ? theme.palette.success.main
              : theme.palette.error.main
          }`,
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: theme.shadows[8],
            transition: "all 0.2s ease",
          },
        }}
      >
        <CardContent>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              mb: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Avatar
                sx={{
                  bgcolor: employee.IsActive
                    ? theme.palette.primary.main
                    : theme.palette.grey[400],
                  mr: 2,
                  width: 48,
                  height: 48,
                }}
              >
                {employee.Name.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  {employee.Name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {employee.EmpId}
                </Typography>
              </Box>
            </Box>
            <Chip
              label={employee.IsActive ? "Active" : "Inactive"}
              color={employee.IsActive ? "success" : "error"}
              size="small"
            />
          </Box>

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={6}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <Phone
                  fontSize="small"
                  sx={{ mr: 1, color: theme.palette.primary.main }}
                />
                <Typography variant="body2">{employee.Mobile}</Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Work
                  fontSize="small"
                  sx={{ mr: 1, color: theme.palette.secondary.main }}
                />
                <Typography variant="body2">{employee.Role}</Typography>
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <Email
                  fontSize="small"
                  sx={{ mr: 1, color: theme.palette.info.main }}
                />
                <Typography variant="body2" sx={{ fontSize: "0.75rem" }}>
                  {employee.EmailId}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Schedule
                  fontSize="small"
                  sx={{ mr: 1, color: theme.palette.warning.main }}
                />
                <Typography variant="body2" sx={{ fontSize: "0.75rem" }}>
                  {employee.Shift}
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
            <Tooltip title="View Details">
              <IconButton
                size="small"
                color="info"
                onClick={() => onViewDetails(employee)}
              >
                <Visibility fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit Employee">
              <IconButton
                size="small"
                sx={{ color: "#8d0638ff" }}
                onClick={() => onEdit(employee)}
              >
                <Edit fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={employee.IsActive ? "Disable Employee" : "Permanently Disabled"}>
              <IconButton
                size="small"
                color={employee.IsActive ? "error" : "default"}
                onClick={() => onToggleStatus(employee)}
                disabled={!employee.IsActive}
              >
                {employee.IsActive ? (
                  <Block fontSize="small" />
                ) : (
                  <Close fontSize="small" />
                )}
              </IconButton>
            </Tooltip>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Stats Card Component
const StatsCard = ({ icon, title, value, color, subtitle }) => {
  const theme = useTheme();

  return (
    <Card
      component={motion.div}
      whileHover={{
        translateY: -5,
        boxShadow: theme.shadows[8],
        transition: { duration: 0.2 },
      }}
      sx={{
        height: "100%",
        borderLeft: `4px solid ${color}`,
        background: `linear-gradient(135deg, ${color}10 0%, ${color}05 100%)`,
      }}
    >
      <CardContent>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight="bold" color={color}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Avatar
            sx={{ bgcolor: `${color}20`, color: color, width: 48, height: 48 }}
          >
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );
};

// Colorful Salary Card Component
const SalaryCard = ({ title, amount, annualAmount, color, icon, isHighlighted = false }) => {
  return (
    <Card
      sx={{
        height: "100%",
        borderLeft: `5px solid ${color}`,
        background: isHighlighted
          ? `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`
          : `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
        boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
        borderRadius: 2,
        transition: "all 0.25s ease-in-out",
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
        },
      }}
    >
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                color: isHighlighted ? "rgba(255,255,255,0.9)" : "text.secondary",
                textTransform: "uppercase",
                letterSpacing: 0.5,
                display: "block",
                fontSize: "0.7rem",
              }}
            >
              {title}
            </Typography>
            <Typography
              variant="h6"
              sx={{
                fontWeight: "bold",
                my: 0.5,
                color: isHighlighted ? "#ffffff" : color,
                wordBreak: "break-word",
                fontSize: { xs: "1.1rem", md: "1.25rem" },
              }}
            >
              ₹{Number(amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Typography>
            {annualAmount !== undefined && (
              <Typography
                variant="caption"
                sx={{
                  color: isHighlighted ? "rgba(255,255,255,0.8)" : "text.secondary",
                  display: "block",
                  fontSize: "0.75rem",
                }}
              >
                ₹{Number(annualAmount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / annum
              </Typography>
            )}
          </Box>
          <Avatar
            sx={{
              bgcolor: isHighlighted ? "rgba(255,255,255,0.25)" : `${color}25`,
              color: isHighlighted ? "#ffffff" : color,
              width: 44,
              height: 44,
              ml: 1,
            }}
          >
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );
};

// Employee Details Component (View Only, Non-Editable)
const EmployeeDetails = ({ employee, open, onClose, salary }) => {
  const theme = useTheme();
  const [employeeSalary, setEmployeeSalary] = useState(null);
  const [loadingSalary, setLoadingSalary] = useState(false);

  useEffect(() => {
    if (employee && open) {
      const empId = (employee.EmpId || employee.empId || "").toString().trim();
      const existing = salary?.find(
        (s) => (s.empId || s.EmpId || "").toString().trim().toLowerCase() === empId.toLowerCase()
      );
      if (existing) {
        setEmployeeSalary(existing);
      } else if (empId) {
        setLoadingSalary(true);
        axios
          .get(`${BASE_URL}/salary/get_salary.php?empId=${empId}`)
          .then((res) => {
            if (res.data.success && res.data.data && res.data.data.length > 0) {
              setEmployeeSalary(res.data.data[0]);
            } else {
              setEmployeeSalary(null);
            }
          })
          .catch((err) => {
            console.error("Error fetching employee salary:", err);
            setEmployeeSalary(null);
          })
          .finally(() => setLoadingSalary(false));
      }
    } else {
      setEmployeeSalary(null);
    }
  }, [employee, open, salary]);

  const DetailRow = ({ icon, label, value }) => (
    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
      {icon}
      <Box sx={{ ml: 2, flex: 1 }}>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="body1" fontWeight="medium">
          {value || "Not specified"}
        </Typography>
      </Box>
    </Box>
  );

  if (!employee) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      TransitionComponent={Fade}
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: "90vh",
        },
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: "#8d0638ff",
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Person sx={{ mr: 1 }} />
          Employee Details - {employee.Name} ({employee.EmpId})
        </Box>
        <IconButton onClick={onClose} sx={{ color: "white" }}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Personal Information */}
          <Grid item xs={12}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ display: "flex", alignItems: "center" }}
            >
              <Person sx={{ mr: 1, color: theme.palette.primary.main }} />
              Personal Information
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 2,
                mb: 2,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", minWidth: 200 }}>
                <Avatar
                  sx={{
                    mr: 2,
                    width: 56,
                    height: 56,
                    bgcolor: theme.palette.primary.main,
                    fontSize: "1.4rem",
                  }}
                  src={employee.Pic ? employee.Pic : undefined}
                  alt={employee.Name}
                >
                  {!employee.Pic && employee.Name?.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {employee.Name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ID: {employee.EmpId}
                  </Typography>
                </Box>
              </Box>

              <DetailRow
                icon={<Phone sx={{ color: theme.palette.primary.main }} />}
                label="Mobile"
                value={employee.Mobile}
              />
              <DetailRow
                icon={<Email sx={{ color: theme.palette.info.main }} />}
                label="Email"
                value={employee.EmailId}
              />
              <DetailRow
                icon={<CalendarToday sx={{ color: theme.palette.warning.main }} />}
                size="small"
                    label="Date of Birth"
                value={employee.DOB}
              />
            </Box>
          </Grid>

          {/* Work Information */}
          <Grid item xs={12} md={6}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ display: "flex", alignItems: "center" }}
            >
              <Work sx={{ mr: 1, color: theme.palette.primary.main }} />
              Work Information
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <DetailRow
              icon={<Badge sx={{ color: theme.palette.secondary.main }} />}
              label="Role"
              value={employee.Role}
            />
            <DetailRow
              icon={<Work sx={{ color: theme.palette.info.main }} />}
              size="small"
                    label="Designation"
              value={employee.Designation}
            />
            <DetailRow
              icon={<Schedule sx={{ color: theme.palette.warning.main }} />}
              label="Shift"
              value={employee.Shift}
            />
            <DetailRow
              icon={<Schedule sx={{ color: theme.palette.info.main }} />}
              label="Week Off"
              value={employee.WeekOff}
            />
          </Grid>

          {/* Additional Information */}
          <Grid item xs={12} md={6}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ display: "flex", alignItems: "center" }}
            >
              <Badge sx={{ mr: 1, color: theme.palette.primary.main }} />
              Additional Information
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <DetailRow
              icon={<Badge sx={{ color: theme.palette.secondary.main }} />}
              label="Grade"
              value={employee.Grade}
            />
            <DetailRow
              icon={<AccountBalance sx={{ color: theme.palette.success.main }} />}
              size="small"
                    label="UAN"
              value={employee.UAN}
            />
            <DetailRow
              icon={<AccountBalance sx={{ color: theme.palette.info.main }} />}
              size="small"
                    label="ESI"
              value={employee.ESI}
            />
            <DetailRow
              icon={<CalendarToday sx={{ color: theme.palette.success.main }} />}
              size="small"
                    label="Date of Joining"
              value={employee.JoinDate}
            />
          </Grid>

          {/* Current Salary Structure Section (Colorful Cards, Read-Only) */}
          <Grid item xs={12}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ display: "flex", alignItems: "center", mt: 2 }}
            >
              <Money sx={{ mr: 1, color: theme.palette.primary.main }} />
              Current Salary Structure
            </Typography>
            <Divider sx={{ mb: 2.5 }} />

            {loadingSalary ? (
              <Box sx={{ display: "flex", alignItems: "center", py: 3, justifyContent: "center" }}>
                <CircularProgress size={28} sx={{ mr: 1.5, color: "#8d0638ff" }} />
                <Typography variant="body1" color="text.secondary">Loading salary structure...</Typography>
              </Box>
            ) : employeeSalary ? (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <SalaryCard
                    title="Basic Salary"
                    amount={employeeSalary.basic_salary}
                    annualAmount={employeeSalary.basic_salary_per_annum || parseFloat(employeeSalary.basic_salary || 0) * 12}
                    color="#10b981"
                    icon={<Payments />}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <SalaryCard
                    title="HRA"
                    amount={employeeSalary.hra}
                    annualAmount={employeeSalary.hra_per_annum || parseFloat(employeeSalary.hra || 0) * 12}
                    color="#3b82f6"
                    icon={<HomeWork />}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <SalaryCard
                    title="Conveyance"
                    amount={employeeSalary.conveyance}
                    annualAmount={employeeSalary.conveyance_per_annum || parseFloat(employeeSalary.conveyance || 0) * 12}
                    color="#f59e0b"
                    icon={<DirectionsCar />}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <SalaryCard
                    title="Special Allowance"
                    amount={employeeSalary.special_allowance}
                    annualAmount={employeeSalary.special_allowance_per_annum || parseFloat(employeeSalary.special_allowance || 0) * 12}
                    color="#8b5cf6"
                    icon={<Star />}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <SalaryCard
                    title="EPF (Deduction)"
                    amount={employeeSalary.epf}
                    annualAmount={employeeSalary.epf_per_annum || parseFloat(employeeSalary.epf || 0) * 12}
                    color="#ec4899"
                    icon={<AccountBalance />}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <SalaryCard
                    title="ESI (Deduction)"
                    amount={employeeSalary.esi}
                    annualAmount={employeeSalary.esi_per_annum || parseFloat(employeeSalary.esi || 0) * 12}
                    color="#06b6d4"
                    icon={<AccountBalance />}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <SalaryCard
                    title="Monthly Gross Salary"
                    amount={employeeSalary.gross_salary}
                    annualAmount={employeeSalary.gross_salary_per_annum || parseFloat(employeeSalary.gross_salary || 0) * 12}
                    color="#0284c7"
                    icon={<TrendingUp />}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <SalaryCard
                    title="Net Take Home"
                    amount={employeeSalary.net_take_home || employeeSalary.gross_salary}
                    annualAmount={(parseFloat(employeeSalary.net_take_home || employeeSalary.gross_salary || 0)) * 12}
                    color="#8d0638"
                    icon={<AccountBalanceWallet />}
                    isHighlighted={true}
                  />
                </Grid>
              </Grid>
            ) : (
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                No salary information available for this employee. You can configure salary in the <strong>Edit Employee</strong> modal.
              </Alert>
            )}
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2.5, bgcolor: "#f9f9f9" }}>
        <Button
          onClick={onClose}
          variant="contained"
          sx={{ bgcolor: "#8d0638ff", color: "white", "&:hover": { bgcolor: "#6b042d" } }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

function EmployeeList() {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [employees, setEmployees] = useState([]);
  const [offices, setOffices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [openDetails, setOpenDetails] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [formMode, setFormMode] = useState("add");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [filterRole, setFilterRole] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [salary, setSalary] = useState([]);
  const [formData, setFormData] = useState({
    EmpId: "",
    Name: "",
    Password: "",
    Mobile: "",
    EmailId: "",
    Role: "",
    OTP: "123456",
    IsOTPExpired: 1,
    IsGeofence: 0,
    Tenent_Id: "",
    IsActive: 1,
    OfficeId: null,
    OfficeName: "",
    LatLong: "",
    Distance: "", // Add Distance field
    OfficeIsActive: 1,
    RM: "", // Reporting Manager (will store EmpId)
    RMName: "", // Reporting Manager Name (for display)
    Shift: "",
    WeekOff: "",
    Designation: "",
    DOB: "",
    JoinDate: "",
    Grade: "",
    UAN: "",
    ESI: "",
    ProbationPeriod: "", // Added Probation Period field
    // Salary fields
    basic_salary: "",
    hra: "",
    conveyance: "",
    special_allowance: "",
  });

  // NEW: State for disable dialog
  const [disableDialogOpen, setDisableDialogOpen] = useState(false);
  const [disableReason, setDisableReason] = useState("");
  const [disableDate, setDisableDate] = useState("");
  const [employeeToDisable, setEmployeeToDisable] = useState(null);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [exporting, setExporting] = useState(false);

  const gradeOptions = [
    { value: "M1", label: "M1 - (Vice President(VP))" },
    { value: "M2", label: "M2 - (General Manager (GM))" },
    { value: "M3", label: "M3 - (Dy General Manager (DGM))" },
    { value: "M4", label: "M4 - (Factory Manager)" },
    { value: "M5", label: "M5 - (Sr Project Engineer / Sr Manager)" },
    { value: "M6", label: "M6 - (Manager / Sr. Engineer / Sr. Executive)" },
    { value: "M7", label: "M7 - (Engineer / Supervising Engineer)" },
    {
      value: "M8",
      label: "M8 - (Exe Trainee / DET / GET / MT / Sr. Supervisor)",
    },
    { value: "S1", label: "S1 - (Supervisor / Sr Welder / Sr Technician)" },
    { value: "S2", label: "S2 - (Welder / Fitter / Electrician / Supervisor)" },
    { value: "S3", label: "S3 - (Welder / Fitter / Electrician / Supervisor)" },
    { value: "S4", label: "S4 - (Helper / Assistant)" },
    { value: "S5", label: "S5 - (Helper / Assistant)" },
  ];

  // Get distinct roles from employees data
  const roleOptions1 = ["HR", "Employee"];
  const roleOptions = [
    ...new Set(employees.map((emp) => emp.Role).filter((role) => role)),
  ].sort();
  const weekDays = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  // Get active employees for RM dropdown
  const activeEmployees = employees.filter((emp) => emp.IsActive);

  useEffect(() => {
    fetchEmployees();
    fetchSalaryStructure();
    fetchOffices();
  }, []);

  const [lastEmpIdFromBackend, setLastEmpIdFromBackend] = useState("");

  const generateNextEmployeeId = (allEmployees, lastEmpIdHint = null) => {
    if (!allEmployees || allEmployees.length === 0) return "EMP0001";

    const existingIds = new Set(
      allEmployees.map((e) => (e.EmpId || "").toString().trim().toUpperCase())
    );

    // Determine the prefix and number padding
    let prefix = "EMP";
    let padLength = 4;

    const testId = lastEmpIdHint || (allEmployees[allEmployees.length - 1]?.EmpId || "");
    const match = testId.match(/^([A-Za-z_]+)([0-9]+)$/);
    if (match) {
      prefix = match[1];
      padLength = Math.max(match[2].length, 3);
    }

    // Find the highest number already used for this prefix
    let maxNum = 0;
    const regex = new RegExp(`^${prefix}([0-9]+)$`, "i");
    for (const emp of allEmployees) {
      const id = (emp.EmpId || "").toString().trim();
      const m = id.match(regex);
      if (m) {
        const val = parseInt(m[1], 10);
        if (!isNaN(val) && val > maxNum) {
          maxNum = val;
          if (m[1].length > padLength) padLength = m[1].length;
        }
      }
    }

    // Generate candidate and loop until guaranteed completely unique
    let nextNum = maxNum + 1;
    let candidate = `${prefix}${String(nextNum).padStart(padLength, "0")}`;

    while (existingIds.has(candidate.toUpperCase())) {
      nextNum++;
      candidate = `${prefix}${String(nextNum).padStart(padLength, "0")}`;
    }

    return candidate;
  };
  
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${BASE_URL}/employee/list_employee.php?Tenent_Id=${user.tenent_id}`
      );
      if (response.data.success) {
        setEmployees(response.data.data);

        if (response.data.message) {
          setLastEmpIdFromBackend(response.data.message);
        }
      } else {
        setError("Failed to fetch employees");
      }
    } catch (error) {
      setError("Error fetching employees: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSalaryStructure = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/salary/get_salary.php`
      );
      if (response.data.success) {
        setSalary(response.data.data);
      } else {
        console.error("Failed to fetch salary structure");
      }
    } catch (error) {
      console.error("Error fetching salary structure: " + error.message);
    }
  };

  const fetchOffices = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/employee/get_office.php`
      );
      if (response.data.success) {
        setOffices(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching offices:", error);
    }
  };

  const handleViewDetails = (employee) => {
    setSelectedEmployee(employee);
    setOpenDetails(true);
  };

  const handleCloseDetails = () => {
    setOpenDetails(false);
    setSelectedEmployee(null);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenForm = async (mode, employee = null) => {
    if (offices.length === 0) {
      try {
        await fetchOffices();
      } catch (e) {
        console.error("Error loading offices:", e);
      }
    }
    await openFormAfterOfficeLoad(mode, employee);
  };
  
  const openFormAfterOfficeLoad = async (mode, employee = null) => {
    setFormMode(mode);
    if (mode === "edit" && employee) {
      // Find the RM name if RM exists
      const rmEmployee = employees.find((emp) => emp.EmpId === employee.RM);
      const rmName = rmEmployee ? rmEmployee.Name : "";
      
      // IMPORTANT: Find the matching office object from offices array
      let officeObj = null;
      if (employee.OfficeId && offices.length > 0) {
        officeObj = offices.find(o => o.Id == employee.OfficeId);
      }

      // Prefill salary information for this employee
      const empId = (employee.EmpId || employee.empId || "").toString().trim();
      let empSalary = salary?.find(
        (s) => (s.empId || s.EmpId || "").toString().trim().toLowerCase() === empId.toLowerCase()
      );

      if (!empSalary && empId) {
        try {
          const res = await axios.get(
            `${BASE_URL}/salary/get_salary.php?empId=${empId}`
          );
          if (res.data.success && res.data.data && res.data.data.length > 0) {
            empSalary = res.data.data[0];
          }
        } catch (salErr) {
          console.error("Error prefetching salary:", salErr);
        }
      }
  
      setFormData({
        EmpId: employee.EmpId,
        Name: employee.Name,
        Password: "",
        Mobile: employee.Mobile,
        EmailId: employee.EmailId,
        Role: employee.new_role || employee.Role,
        OTP: "123456",
        IsOTPExpired: 1,
        IsGeofence: employee.IsGeofence || 0,
        Tenent_Id: user.tenent_id,
        IsActive: employee.IsActive || 1,
      
        OfficeId: officeObj ? officeObj.Id : null,
        OfficeName: officeObj ? officeObj.OfficeName : "",
        LatLong: officeObj ? officeObj.LatLong : "",
        Distance: officeObj
          ? officeObj.LatLong?.split(",")[2] || "0"
          : "",
      
        RM: employee.RM || "",
        RMName: rmName,
        Shift: employee.Shift || "",
        DOB: employee.DOB || "",
        JoinDate: employee.JoinDate || "",
        WeekOff: employee.WeekOff || "Sunday",
        Designation: employee.Designation || "",
        Grade: employee.Grade || "",
        UAN: employee.UAN || "",
        ESI: employee.ESI || "",
        ProbationPeriod: employee.ProbationPeriod || "",
        FatherName: employee.FatherName || "",
        PanNumber: employee.PanNumber || "",
        AadharNumber: employee.AadharNumber || "",
        basic_salary: employee.basic_salary ? String(parseFloat(employee.basic_salary)) : (empSalary?.basic_salary ? String(parseFloat(empSalary.basic_salary)) : ""),
        da: employee.da ? String(parseFloat(employee.da)) : "",
        hra: employee.hra ? String(parseFloat(employee.hra)) : (empSalary?.hra ? String(parseFloat(empSalary.hra)) : ""),
        conveyance: employee.conveyance ? String(parseFloat(employee.conveyance)) : (empSalary?.conveyance ? String(parseFloat(empSalary.conveyance)) : ""),
        special_allowance: employee.special_allowance ? String(parseFloat(employee.special_allowance)) : (empSalary?.special_allowance ? String(parseFloat(empSalary.special_allowance)) : ""),
        pf_deduction: employee.pf_deduction ? String(parseFloat(employee.pf_deduction)) : (empSalary?.epf ? String(parseFloat(empSalary.epf)) : ""),
        esi_deduction: employee.esi_deduction ? String(parseFloat(employee.esi_deduction)) : (empSalary?.esi ? String(parseFloat(empSalary.esi)) : ""),
        tds: employee.tds ? String(parseFloat(employee.tds)) : "",
        advance: employee.advance ? String(parseFloat(employee.advance)) : "",
        lwf: employee.lwf ? String(parseFloat(employee.lwf)) : "",
      });
      
    } else {
      // Auto-generate new employee ID for add mode (guaranteed unique)
      const nextEmpId = generateNextEmployeeId(employees, lastEmpIdFromBackend);

      // Verify and sync in real-time directly with backend database
      axios.get(`${BASE_URL}/employee/get_next_emp_id.php`)
        .then((res) => {
          if (res.data && res.data.success && res.data.nextEmpId) {
            setFormData((prev) => ({ ...prev, EmpId: res.data.nextEmpId }));
          }
        })
        .catch(() => {});
  
      setFormData({
        EmpId: nextEmpId,
        Name: "",
        Password: "",
        Mobile: "",
        EmailId: "",
        Role: "",
        OTP: "123456",
        IsOTPExpired: 1,
        IsGeofence: 0,
        Tenent_Id: user.tenent_id,
        IsActive: 1,
        OfficeId: null,
        OfficeName: "",
        LatLong: "",
        Distance: "",
        OfficeIsActive: 1,
        RM: "",
        RMName: "",
        Shift: "",
        DOB: "",
        JoinDate: "",
        WeekOff: "",
        Designation: "",
        Grade: "",
        UAN: "",
        ESI: "",
        ProbationPeriod: "",
        FatherName: "",
        PanNumber: "",
        AadharNumber: "",
        basic_salary: "",
        da: "",
        hra: "",
        conveyance: "",
        special_allowance: "",
        pf_deduction: "",
        esi_deduction: "",
        tds: "",
        advance: "",
        lwf: "",
      });
    }
    setOpenForm(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    // Check if offices are selected and get the distance
    if (!formData.OfficeName || !formData.LatLong) {
      alert("Please select an office");
      setSubmitting(false);
      return;
    }

   
    const latLongParts = formData.LatLong.split(",");
    const distance = latLongParts[2] || "0"; 

    const requiredFields = [
      "EmpId",
      "Name",
      "Mobile",
      "EmailId",
      "Role",
      "OfficeId",
      "Designation",
    ];
    
    for (const field of requiredFields) {
      if (!formData[field]) {
        const fieldLabels = {
          EmpId: "Employee ID",
          Name: "Full Name",
          Mobile: "Mobile Number",
          EmailId: "Email Address",
          Role: "Role",
          OfficeId: "Office",
          Designation: "Designation",
        };
        
        alert(`Please fill in all required fields. Missing: ${fieldLabels[field] || field}`);
        setSubmitting(false);
        return;
      }
    }
    
    // Additional check for office details (but don't block submission if they exist)
    if (!formData.OfficeName && formData.OfficeId) {
      // If OfficeId exists but OfficeName doesn't, try to find it from offices array
      const office = offices.find(o => o.Id == formData.OfficeId);
      if (office) {
        setFormData(prev => ({
          ...prev,
          OfficeName: office.OfficeName,
          LatLong: office.LatLong || "",
        }));
      }
    }
    
    
    const formattedFormData = {
      EmpId: formData.EmpId,
      Name: formData.Name,
      Password: formData.Password,
      Mobile: formData.Mobile,
      EmailId: formData.EmailId,
      new_role: formData.Role,
      OTP: formData.OTP || "123456",
      IsOTPExpired: formData.IsOTPExpired || 1,
      IsGeofence: formData.IsGeofence || 0,
      Tenent_Id: user.tenent_id,
      IsActive: formData.IsActive || 1,
      RM: formData.RM, // This should be EmpId of the selected RM
      Shift: formData.Shift || "9:00 AM - 6:00 PM",
      DOB: formData.DOB || "",
      JoinDate: formData.JoinDate || "",
      WeekOff: formData.WeekOff || "Sunday",
      Designation: formData.Designation,
      Grade: formData.Grade,
      UAN: formData.UAN,
      ESI: formData.ESI,
      ProbationPeriod: formData.ProbationPeriod || "", // Added Probation Period
      FatherName: formData.FatherName || "",
      PanNumber: formData.PanNumber || "",
      AadharNumber: formData.AadharNumber || "",
      basic_salary: parseFloat(formData.basic_salary) || 0,
      da: parseFloat(formData.da) || 0,
      hra: parseFloat(formData.hra) || 0,
      conveyance: parseFloat(formData.conveyance) || 0,
      special_allowance: parseFloat(formData.special_allowance) || 0,
      pf_deduction: parseFloat(formData.pf_deduction) || 0,
      esi_deduction: parseFloat(formData.esi_deduction) || 0,
      tds: parseFloat(formData.tds) || 0,
      advance: parseFloat(formData.advance) || 0,
      lwf: parseFloat(formData.lwf) || 0,
      Distance: distance,
      Offices: formData.OfficeId ? [
        {
          OfficeName: formData.OfficeName,
          LatLong: formData.LatLong,
          Distance: formData.Distance,
        }
      ] : [],
    };

    const url =
      formMode === "add"
        ? `${BASE_URL}/employee/add_employee.php`
        : `${BASE_URL}/employee/edit_employee.php`;

    try {
      // Step 1: Add/Update Employee
      console.log("Sending employee data:", formattedFormData); // Debug log
      const response = await axios.post(url, formattedFormData);

      // Check if employee operation was successful
      if (response.data.success) {
        // Step 2: If salary fields are filled, add salary data separately
        if (
          formData.basic_salary ||
          formData.da ||
          formData.hra ||
          formData.conveyance ||
          formData.special_allowance ||
          formData.pf_deduction ||
          formData.esi_deduction
        ) {
          try {
            await addSalaryData(formData);
            alert("Employee and salary information added successfully!");
          } catch (salaryError) {
            console.error(
              "Salary addition failed but employee was created:",
              salaryError
            );
            alert(
              "Employee added successfully, but there was an issue adding salary information."
            );
          }
        } else {
          alert("Employee added successfully!");
        }

        handleCloseForm();
        fetchEmployees();
        fetchSalaryStructure();
      } else {
        alert(response.data.message || "Failed to add employee");
      }
    } catch (error) {
      console.error(
        "Error:",
        error.response ? error.response.data : error.message
      );
      alert(
        `Error: ${error.response ? error.response.data.message : error.message}`
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Updated addSalaryData function
  const addSalaryData = async (employeeData) => {
    const basic = parseFloat(employeeData.basic_salary) || 0;
    const da = parseFloat(employeeData.da) || 0;
    const hra = parseFloat(employeeData.hra) || 0;
    const conveyance = parseFloat(employeeData.conveyance) || 0;
    const specialAllowance = parseFloat(employeeData.special_allowance) || 0;
    const pf = parseFloat(employeeData.pf_deduction) || 0;
    const esi = parseFloat(employeeData.esi_deduction) || 0;
    const tds = parseFloat(employeeData.tds) || 0;
    const advance = parseFloat(employeeData.advance) || 0;
    const lwf = parseFloat(employeeData.lwf) || 0;

    const grossSalary = basic + da + hra + conveyance + specialAllowance;
    const totalDeductions = pf + esi + tds + advance + lwf;
    const netTakeHome = grossSalary - totalDeductions;

    const salaryPayload = {
      empId: employeeData.EmpId,
      emp_name: employeeData.Name,
      designation: employeeData.Designation,
      department: employeeData.Role,
      grade: employeeData.Grade,
      date_of_joining: employeeData.JoinDate,
      basic_salary: basic + da,
      basic_salary_per_annum: (basic + da) * 12,
      hra: hra,
      hra_per_annum: hra * 12,
      conveyance: conveyance,
      conveyance_per_annum: conveyance * 12,
      special_allowance: specialAllowance,
      special_allowance_per_annum: specialAllowance * 12,
      gross_salary: grossSalary,
      gross_salary_per_annum: grossSalary * 12,
      epf: pf,
      epf_per_annum: pf * 12,
      esi: esi,
      esi_per_annum: esi * 12,
      total_benefits: 0,
      total_benefits_per_annum: 0,
      total_cost_of_company: grossSalary,
      net_take_home: netTakeHome,
    };

    const response = await axios.post(
      `${BASE_URL}/salary/add_salary.php`,
      salaryPayload
    );

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to add salary");
    }

    return response.data;
  };

  const handleOfficeChange = (event, value) => {
    if (value) {
      // Extract distance from LatLong (assuming format: "lat,long,distance")
      const latLongParts = value.LatLong.split(",");
      const distance = latLongParts[2] || "0";
      
      setFormData({
        ...formData,
        OfficeId: value.Id,
        OfficeName: value.OfficeName,
        LatLong: value.LatLong,
        Distance: distance,
      });
    } else {
      setFormData({
        ...formData,
        OfficeId: null,
        OfficeName: "",
        LatLong: "",
        Distance: "",
      });
    }
  };

  // Handle RM selection
  const handleRMChange = (event, value) => {
    if (value) {
      setFormData({
        ...formData,
        RM: value.EmpId, // Store EmpId in RM field
        RMName: value.Name, // Store Name for display
      });
    } else {
      setFormData({
        ...formData,
        RM: "",
        RMName: "",
      });
    }
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setError("");
  };

  // NEW: Open disable dialog
  const handleOpenDisableDialog = (employee) => {
    if (employee.IsActive) {
      setEmployeeToDisable(employee);
      setDisableReason("");
      setDisableDate(new Date().toISOString().split('T')[0]); // Set today's date as default
      setDisableDialogOpen(true);
    }
  };

  // NEW: Close disable dialog
  const handleCloseDisableDialog = () => {
    setDisableDialogOpen(false);
    setEmployeeToDisable(null);
    setDisableReason("");
    setDisableDate("");
  };

  // UPDATED: Handle employee status toggle
  const handleToggleEmployeeStatus = async (employee) => {
    if (!employee || !employee.EmpId) {
      console.error("Please provide both Employee ID and action");
      return;
    }

    // If employee is active, open disable dialog instead of directly disabling
    if (employee.IsActive) {
      handleOpenDisableDialog(employee);
      return;
    }

    // If employee is already disabled, show message that they cannot be re-enabled
    if (!employee.IsActive) {
      alert("This employee has been permanently disabled and cannot be re-enabled.");
      return;
    }
  };

  // NEW: Submit disable with reason and date
  const handleSubmitDisable = async () => {
    if (!employeeToDisable || !disableReason || !disableDate) {
      alert("Please provide both reason and date for disabling");
      return;
    }

    try {
      const response = await axios.post(
        `${BASE_URL}/employee/disable_employee.php`,
        {
          EmpId: employeeToDisable.EmpId,
          action: "disable",
          office_leave_date: disableDate,
          reason: disableReason,
        }
      );

      if (response.data.success) {
        alert("Employee has been permanently disabled.");
        fetchEmployees();
        fetchSalaryStructure();
        handleCloseDisableDialog();
      } else {
        alert("Failed to disable employee: " + response.data.message);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error disabling employee: " + error.message);
    }
  };

 
const exportToExcel = () => {
  if (filteredEmployees.length === 0) {
    alert("No data to export");
    return;
  }

  setExporting(true);
  
  try {
    // Prepare data with the requested fields including OfficeName
    const exportData = filteredEmployees.map(employee => ({
      "Grade": employee.Grade || 'N/A',
      "Name": employee.Name || 'N/A',
      "ID": employee.EmpId || 'N/A',
      "Designation": employee.Designation || 'N/A',
      "Mobile No": employee.Mobile || 'N/A',
      "Office": employee.OfficeName || 'N/A' // Added OfficeName field
    }));
    
    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);
    
    // Set column widths for better formatting
    const wscols = [
      { wch: 10 }, // Grade
      { wch: 25 }, // Name
      { wch: 15 }, // ID
      { wch: 25 }, // Designation
      { wch: 15 }, // Mobile No
      { wch: 25 }  // Office (new column)
    ];
    ws['!cols'] = wscols;
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Employee List");
    
    // Generate filename with current date
    const date = new Date();
    const formattedDate = `${date.getDate()}_${date.getMonth() + 1}_${date.getFullYear()}`;
    const filename = `Employee_List_${formattedDate}.xlsx`;
    
    // Export to Excel
    XLSX.writeFile(wb, filename);
    
  } catch (error) {
    console.error("Error exporting to Excel:", error);
    alert("Failed to export to Excel. Please try again.");
  } finally {
    setExporting(false);
  }
};

  const filteredEmployees = employees.filter((employee) => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const matchesSearch = Object.keys(employee).some((key) => {
      const value = employee[key];
      return (
        value != null &&
        value.toString().toLowerCase().includes(lowerCaseSearchTerm)
      );
    });

    const matchesRole = filterRole === "" || employee.Role === filterRole;
    const matchesStatus =
      filterStatus === "" || (employee.IsActive ?? '').toString() === filterStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Calculate stats
  const totalEmployees = employees.length;
  const activeEmployeesCount = employees.filter((emp) => emp.IsActive).length;
  const inactiveEmployees = totalEmployees - activeEmployeesCount;
  const hrCount = employees.filter((emp) => emp.Role === "HR").length;

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }
  const selectedRole = roleOptions1.includes(formData.Role)
    ? formData.Role
    : null;
    
    

  return (
    <Box
      sx={{
        px: { xs: 1, md: 2 },
        py: { xs: 1, md: 1 },
        backgroundColor: "#f5f5f5",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 1800 }}>
        <Paper
          elevation={4}
          sx={{
            p: { xs: 2, md: 3 },
            mb: 3,
            borderRadius: 3,
            bgcolor: "background.paper",
            background: "linear-gradient(135deg, #f8f0f4 0%, #fff 100%)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
              flexWrap: "wrap",
            }}
          >
            <Typography
              variant="h4"
              fontWeight="bold"
              color="#8d0638ff"
              sx={{ flexGrow: 1 }}
            >
              Employee Management
            </Typography>

            <Box sx={{ display: "flex", gap: 1, mt: { xs: 2, md: 0 } }}>
              <Tooltip title="Refresh Data">
                <IconButton
                  onClick={fetchEmployees}
                  sx={{
                    bgcolor: "#fff",
                    color: "#8d0638ff",
                    "&:hover": { bgcolor: "#f2e6eb" },
                  }}
                >
                  <Refresh />
                </IconButton>
              </Tooltip>
              
              {/* Export Button - Simple single click */}
              <Button
                variant="outlined"
                startIcon={exporting ? <CircularProgress size={20} /> : <Download />}
                onClick={exportToExcel}
                disabled={exporting || filteredEmployees.length === 0}
                sx={{
                  borderColor: "#8d0638ff",
                  color: "#8d0638ff",
                  "&:hover": {
                    borderColor: "#6b042d",
                    bgcolor: "#f8f0f4",
                  },
                  borderRadius: 2,
                  textTransform: "none",
                  minWidth: "120px",
                }}
              >
                {exporting ? "Exporting..." : "Export"}
              </Button>
              
              <Button
                variant="contained"
                startIcon={<PersonAdd />}
                onClick={() => handleOpenForm("add")}
                sx={{
                  bgcolor: "#8d0638ff",
                  color: "white",
                  "&:hover": { bgcolor: "#6b042d" },
                  borderRadius: 2,
                  textTransform: "none",
                }}
              >
                Add Employee
              </Button>
            </Box>
          </Box>

          <Grid
            container
            spacing={2}
            alignItems="center"
            sx={{
              mb: 1,
              "& .MuiInputBase-root": { borderRadius: 2 },
            }}
          >
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  bgcolor: "#fff",
                  boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
                  "&:hover": { bgcolor: "#fefefe" },
                }}
              />
            </Grid>

            <Grid item xs={6} md={3}>
              <Autocomplete
                options={roleOptions}
                value={filterRole}
                onChange={(event, newValue) => setFilterRole(newValue || "")}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Filter by Role"
                    variant="outlined"
                  />
                )}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "#fff",
                    borderRadius: 2,
                  },
                }}
              />
            </Grid>

            <Grid item xs={6} md={3}>
              <FormControl fullWidth sx={{ bgcolor: "#fff", borderRadius: 2 }}>
                <InputLabel>Filter by Status</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  label="Filter by Status"
                >
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="1">Active</MenuItem>
                  <MenuItem value="0">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        <Paper elevation={2} sx={{ borderRadius: 2 }}>
          {isMobile ? (
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Employee List ({filteredEmployees.length})
              </Typography>
              <AnimatePresence>
                {filteredEmployees
                  .sort((a, b) => a.Name.localeCompare(b.Name))
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((employee) => (
                    <EmployeeCard
                      key={employee.EmpId}
                      employee={employee}
                      onEdit={(emp) => handleOpenForm("edit", emp)}
                      onToggleStatus={handleToggleEmployeeStatus}
                      onViewDetails={handleViewDetails}
                      theme={theme}
                    />
                  ))}
              </AnimatePresence>
            </Box>
          ) : (
            // Desktop Table View
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: "#8d0638ff" }}>
                  <TableRow>
                    <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Badge sx={{ mr: 1 }} />
                        Employee ID
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Person sx={{ mr: 1 }} />
                        Name
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Phone sx={{ mr: 1 }} />
                        Mobile
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Email sx={{ mr: 1 }} />
                        Email
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Work sx={{ mr: 1 }} />
                        Role
                      </Box>
                    </TableCell>
                    {/* <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Schedule sx={{ mr: 1 }} />
                        Shift
                      </Box>
                    </TableCell> */}
                    <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                      Status
                    </TableCell>
                    <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <AnimatePresence>
                    {filteredEmployees
                      .sort((a, b) => a.Name.localeCompare(b.Name))
                      .slice(
                        page * rowsPerPage,
                        page * rowsPerPage + rowsPerPage
                      )
                      .map((employee, index) => (
                        <motion.tr
                          key={employee.EmpId}
                          component={TableRow}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ delay: index * 0.05 }}
                          sx={{
                            "&:hover": {
                              bgcolor: theme.palette.action.hover,
                              transform: "scale(1.01)",
                              transition: "all 0.2s ease",
                            },
                          }}
                        >
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              {employee.EmpId}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <Avatar
                                sx={{
                                  mr: 2,
                                  width: 32,
                                  height: 32,
                                  bgcolor: theme.palette.primary.main,
                                }}
                                src={employee.Pic ? employee.Pic : undefined} // show image if available
                                alt={employee.Name}
                              >
                                {!employee.Pic &&
                                  employee.Name?.charAt(0).toUpperCase()}
                              </Avatar>

                              <Typography variant="body2" fontWeight="medium">
                                {employee.Name}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {employee.Mobile}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography
                              variant="body2"
                              sx={{
                                maxWidth: 200,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {employee.EmailId}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {employee.Role}
                            </Typography>
                          </TableCell>
                          {/* <TableCell>
                            <Typography variant="body2">{employee.Shift}</Typography>
                          </TableCell> */}
                          <TableCell>
                            <Chip
                              label={employee.IsActive ? "Active" : "Inactive"}
                              color={employee.IsActive ? "success" : "error"}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: "flex", gap: 0.5 }}>
                              <Tooltip title="View Details">
                                <IconButton
                                  size="small"
                                  color="info"
                                  onClick={() => handleViewDetails(employee)}
                                >
                                  <Visibility fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Edit Employee">
                                <IconButton
                                  size="small"
                                  sx={{ color: "#8d0638ff" }}
                                  onClick={() =>
                                    handleOpenForm("edit", employee)
                                  }
                                >
                                  <Edit fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip
                                title={employee.IsActive ? "Disable Employee" : "Permanently Disabled"}
                              >
                                <IconButton
                                  size="small"
                                  color={employee.IsActive ? "error" : "default"}
                                  onClick={() =>
                                    handleToggleEmployeeStatus(employee)
                                  }
                                  disabled={!employee.IsActive}
                                >
                                  {employee.IsActive ? (
                                    <Block fontSize="small" />
                                  ) : (
                                    <Close fontSize="small" />
                                  )}
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </motion.tr>
                      ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </TableContainer>
          )}

          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={filteredEmployees.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>

        {/* NEW: Disable Employee Dialog */}
        <Dialog
          open={disableDialogOpen}
          onClose={handleCloseDisableDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle
            sx={{
              bgcolor: "#8d0638ff",
              color: "white",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Block sx={{ mr: 1 }} />
              Disable Employee
            </Box>
            <IconButton onClick={handleCloseDisableDialog} sx={{ color: "white" }}>
              <Close />
            </IconButton>
          </DialogTitle>
          
          <DialogContent sx={{ p: 3 }}>
            <Alert severity="warning" sx={{ mb: 2 }}>
              <strong>Warning:</strong> Once disabled, this employee cannot be re-enabled.
              This action is permanent.
            </Alert>
            
            <Typography variant="body1" gutterBottom>
              You are about to disable <strong>{employeeToDisable?.Name}</strong> ({employeeToDisable?.EmpId})
            </Typography>
            
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Disable Date"
                  type="date"
                  value={disableDate}
                  onChange={(e) => setDisableDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Reason for Disabling"
                  value={disableReason}
                  onChange={(e) => setDisableReason(e.target.value)}
                  multiline
                  rows={3}
                  placeholder="e.g., Left organization, Terminated, Resigned, etc."
                  required
                />
              </Grid>
            </Grid>
          </DialogContent>
          
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCloseDisableDialog} variant="outlined">
              Cancel
            </Button>
            <Button
              onClick={handleSubmitDisable}
              variant="contained"
              color="error"
              disabled={!disableReason || !disableDate}
              sx={{ bgcolor: "#8d0638ff", color: "white" }}
            >
              Confirm Disable
            </Button>
          </DialogActions>
        </Dialog>

        <EmployeeDetails
          employee={selectedEmployee}
          open={openDetails}
          onClose={handleCloseDetails}
          salary={salary}
        />

        <Dialog
          open={openForm}
          onClose={handleCloseForm}
          maxWidth="md"
          fullWidth
          TransitionComponent={Fade}
          PaperProps={{
            sx: {
              borderRadius: 2,
              maxHeight: "90vh",
            },
          }}
        >
          <DialogTitle
            sx={{
              bgcolor: "#8d0638ff",
              color: "white",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <PersonAdd sx={{ mr: 1 }} />
              {formMode === "add" ? "Add New Employee" : "Edit Employee"}
            </Box>
            <IconButton onClick={handleCloseForm} sx={{ color: "white" }}>
              <Close />
            </IconButton>
          </DialogTitle>

          <DialogContent sx={{ p: 3 }}>
            <form onSubmit={handleFormSubmit}>
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ display: "flex", alignItems: "center" }}
                  >
                    <Person sx={{ mr: 1, color: theme.palette.primary.main }} />
                    Personal Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Employee ID"
                    value={formData.EmpId}
                    onChange={(e) =>
                      setFormData({ ...formData, EmpId: e.target.value })
                    }
                    required
                    disabled={formMode === "edit"}
                    helperText={formMode === "add" ? "Auto-generated unique ID (you can also edit this)" : ""}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Badge color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Full Name"
                    value={formData.Name}
                    onChange={(e) =>
                      setFormData({ ...formData, Name: e.target.value })
                    }
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Password"
                    type="password"
                    value={formData.Password}
                    onChange={(e) =>
                      setFormData({ ...formData, Password: e.target.value })
                    }
                    required
                    disabled={formMode === "edit"}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Mobile Number"
                    value={formData.Mobile}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value.length <= 10) {
                        setFormData({ ...formData, Mobile: value });
                      }
                    }}
                    required
                    type="number"
                    inputProps={{ maxLength: 10 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Phone color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Email Address"
                    type="email"
                    value={formData.EmailId}
                    onChange={(e) =>
                      setFormData({ ...formData, EmailId: e.target.value })
                    }
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Designation"
                    value={formData.Designation}
                    onChange={(e) =>
                      setFormData({ ...formData, Designation: e.target.value })
                    }
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Work color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Date of Birth"
                    type="date"
                    value={formData.DOB}
                    onChange={(e) =>
                      setFormData({ ...formData, DOB: e.target.value })
                    }
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarToday color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Date of Joining"
                    type="date"
                    value={formData.JoinDate}
                    onChange={(e) =>
                      setFormData({ ...formData, JoinDate: e.target.value })
                    }
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarToday color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Father's Name"
                    value={formData.FatherName}
                    onChange={(e) =>
                      setFormData({ ...formData, FatherName: e.target.value })
                    }
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="PAN / ID Number"
                    value={formData.PanNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, PanNumber: e.target.value })
                    }
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Badge color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                {/* Work Information Section */}
                <Grid item xs={12}>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ display: "flex", alignItems: "center", mt: 2 }}
                  >
                    <Work sx={{ mr: 1, color: theme.palette.primary.main }} />
                    Work Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                </Grid>

                {/* Grade */}
                <Grid item xs={12} md={6}>
                  <Autocomplete
                    size="small"
                    options={gradeOptions}
                    value={
                      gradeOptions.find((g) => g.value === formData.Grade) ||
                      null
                    }
                    onChange={(_, newValue) =>
                      setFormData({ ...formData, Grade: newValue?.value || "" })
                    }
                    getOptionLabel={(option) => option.label}
                    renderInput={(params) => (
                      <TextField {...params} size="small" label="Grade" required fullWidth />
                    )}
                  />
                </Grid>

                {/* Role */}
                <Grid item xs={12} md={6}>
                <Autocomplete
  size="small"
  options={roleOptions1}
  value={selectedRole}
  onChange={(_, newValue) =>
    setFormData({ ...formData, Role: newValue || "" })
  }
  renderInput={(params) => (
    <TextField {...params} size="small" label="Role" required fullWidth />
  )}
/>

                </Grid>


                {/* NEW: Reporting Manager Field */}
                <Grid item xs={12} md={6}>
                  <Autocomplete
                    size="small"
                    options={activeEmployees}
                    value={
                      activeEmployees.find(
                        (emp) => emp.EmpId === formData.RM
                      ) || null
                    }
                    onChange={handleRMChange}
                    getOptionLabel={(option) =>
                      `${option.Name} (${option.EmpId})`
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        size="small"
                        label="Reporting Manager"
                        fullWidth
                        helperText="Select from active employees"
                      />
                    )}
                    renderOption={(props, option) => (
                      <li {...props}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Avatar
                            sx={{
                              mr: 2,
                              width: 24,
                              height: 24,
                              bgcolor: theme.palette.primary.main,
                            }}
                          >
                            {option.Name?.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="body2">
                              {option.Name}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {option.EmpId} • {option.Role}
                            </Typography>
                          </Box>
                        </Box>
                      </li>
                    )}
                  />
                </Grid>

                {/* Week Off (Multi Select) */}
                <Grid item xs={12} md={6}>
                  <Autocomplete
                    size="small"
                    multiple
                    options={weekDays}
                    disableCloseOnSelect
                    value={formData.WeekOff ? formData.WeekOff.split(",") : []}
                    onChange={(_, newValue) =>
                      setFormData({ ...formData, WeekOff: newValue.join(",") })
                    }
                    renderOption={(props, option, { selected }) => (
                      <li {...props}>
                        <Checkbox checked={selected} sx={{ mr: 1 }} />
                        {option}
                      </li>
                    )}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        size="small"
                        label="Week Off"
                        required
                        fullWidth
                      />
                    )}
                  />
                </Grid>

               {/* Office Selection - Single Select */}
<Grid item xs={12} md={6}>
  <FormControl fullWidth size="small" required>
    <InputLabel>Office</InputLabel>
    <Select
      size="small"
      value={formData.OfficeId?.toString() || ""}
      onChange={(e) => {
        const selectedOfficeId = e.target.value;
        
        if (!selectedOfficeId) {
          setFormData({
            ...formData,
            OfficeId: "",
            OfficeName: "",
            LatLong: "",
            Distance: "",
          });
          return;
        }
        
        const selectedOffice = offices.find(o => ((o.Id || o.id) ?? '').toString() === selectedOfficeId);
        
        if (selectedOffice) {
          const latLongParts = selectedOffice.LatLong?.split(",") || [];
          const distance = latLongParts[2] || "0";
          
          setFormData({
            ...formData,
            OfficeId: selectedOffice.Id || selectedOffice.id,
            OfficeName: selectedOffice.OfficeName,
            LatLong: selectedOffice.LatLong,
            Distance: distance,
          });
        }
      }}
      label="Office"
    >
      <MenuItem value="">
        <em>Select an office</em>
      </MenuItem>
      {offices.map((office) => (
        <MenuItem key={office.Id || office.id} value={((office.Id || office.id) ?? '').toString()}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <LocationOn sx={{ mr: 1, color: "text.secondary" }} />
            {office.OfficeName}
          </Box>
        </MenuItem>
      ))}
    </Select>
  </FormControl>
</Grid>

                {/* Salary Information Section */}
                <Grid item xs={12}>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ display: "flex", alignItems: "center", mt: 2 }}
                  >
                    <Money sx={{ mr: 1, color: theme.palette.primary.main }} />
                    Salary Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Basic Salary"
                    type="number"
                    value={formData.basic_salary}
                    onChange={(e) =>
                      setFormData({ ...formData, basic_salary: e.target.value })
                    }
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Money color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="HRA"
                    type="number"
                    value={formData.hra}
                    onChange={(e) =>
                      setFormData({ ...formData, hra: e.target.value })
                    }
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Money color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Conveyance"
                    type="number"
                    value={formData.conveyance}
                    onChange={(e) =>
                      setFormData({ ...formData, conveyance: e.target.value })
                    }
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Money color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Special Allowance"
                    type="number"
                    value={formData.special_allowance}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        special_allowance: e.target.value,
                      })
                    }
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Money color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Day Allowance"
                    type="number"
                    value={formData.da}
                    onChange={(e) =>
                      setFormData({ ...formData, da: e.target.value })
                    }
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Money color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="PF / EPF Deduction"
                    type="number"
                    value={formData.pf_deduction}
                    onChange={(e) =>
                      setFormData({ ...formData, pf_deduction: e.target.value })
                    }
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AccountBalanceWallet color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="ESI Deduction"
                    type="number"
                    value={formData.esi_deduction}
                    onChange={(e) =>
                      setFormData({ ...formData, esi_deduction: e.target.value })
                    }
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AccountBalanceWallet color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ display: "flex", alignItems: "center", mt: 2 }}
                  >
                    <Money sx={{ mr: 1, color: theme.palette.primary.main }} />
                    UAN/ESI Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="UAN"
                    value={formData.UAN}
                    onChange={(e) =>
                      setFormData({ ...formData, UAN: e.target.value })
                    }
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Money color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="ESI"
                    value={formData.ESI}
                    onChange={(e) =>
                      setFormData({ ...formData, ESI: e.target.value })
                    }
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Money color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>
            </form>
          </DialogContent>

          <DialogActions sx={{ p: 3, bgcolor: "#f5f5f5" }}>
            <Button onClick={handleCloseForm} variant="outlined">
              Cancel
            </Button>
            <Button
              onClick={handleFormSubmit}
              variant="contained"
              disabled={submitting}
              startIcon={
                submitting ? <CircularProgress size={20} /> : <CheckCircle />
              }
              sx={{ bgcolor: "#8d0638ff", color: "white" }}
            >
              {submitting
                ? "Saving..."
                : formMode === "add"
                ? "Add Employee"
                : "Update Employee"}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}

export default EmployeeList;