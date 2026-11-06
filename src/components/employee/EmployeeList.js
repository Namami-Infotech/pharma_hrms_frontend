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
  Switch,
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
  Paid,
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
  isAdmin = false,
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
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Tooltip
                title={
                  !isAdmin
                    ? "Only Admin can change employee status"
                    : employee.IsActive
                    ? "Click to deactivate employee"
                    : "Click to activate employee"
                }
              >
                <span>
                  <Switch
                    size="small"
                    checked={Boolean(employee.IsActive)}
                    disabled={!isAdmin}
                    onChange={() => onToggleStatus(employee)}
                    sx={{
                      "& .MuiSwitch-switchBase.Mui-checked": {
                        color: "#10b981",
                      },
                      "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                        backgroundColor: "#10b981",
                      },
                    }}
                  />
                </span>
              </Tooltip>
              <Typography
                variant="caption"
                sx={{
                  ml: 0.5,
                  fontWeight: "bold",
                  color: employee.IsActive ? "success.main" : "text.secondary",
                }}
              >
                {employee.IsActive ? "Active" : "Inactive"}
              </Typography>
            </Box>
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
                <Typography variant="body2">
                  {['Admin', 'admin', 'superadmin', 'SuperAdmin'].includes(employee.Role || employee.new_role || employee.actual_role) ? 'Admin' : 'Employee'}
                </Typography>
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

          <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 1 }}>
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
                sx={{ color: "#f37021" }}
                onClick={() => onEdit(employee)}
              >
                <Edit fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={!isAdmin ? "Only Admin can change status" : employee.IsActive ? "Deactivate Employee" : "Activate Employee"}>
              <span>
                <Switch
                  size="small"
                  checked={Boolean(employee.IsActive)}
                  disabled={!isAdmin}
                  onChange={() => onToggleStatus(employee)}
                  sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": {
                      color: "#10b981",
                    },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                      backgroundColor: "#10b981",
                    },
                  }}
                />
              </span>
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
          bgcolor: "#f37021",
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

      <DialogContent sx={{ p: 3, pt: "28px !important" }}>
        <Grid container spacing={3} sx={{ mt: 0.5 }}>
          {/* Personal Information */}
          <Grid item xs={12}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ display: "flex", alignItems: "center", mt: 1 }}
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
              value={['Admin', 'admin', 'superadmin', 'SuperAdmin'].includes(employee.Role || employee.new_role || employee.actual_role) ? 'Admin' : 'Employee'}
            />
            <DetailRow
              icon={<Work sx={{ color: theme.palette.info.main }} />}
              size="small"
                    label="Designation"
              value={employee.Designation}
            />
            <DetailRow
              icon={<Work sx={{ color: theme.palette.success.main }} />}
              size="small"
                    label="Department"
              value={employee.Department || employee.department || "-"}
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
              icon={<AccountBalance sx={{ color: theme.palette.success.main }} />}
              size="small"
                    label="UAN"
              value={employee.UAN || "-"}
            />
            <DetailRow
              icon={<AccountBalance sx={{ color: theme.palette.info.main }} />}
              size="small"
                    label="ESI"
              value={employee.ESI || "-"}
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
                <CircularProgress size={28} sx={{ mr: 1.5, color: "#f37021" }} />
                <Typography variant="body1" color="text.secondary">Loading salary structure...</Typography>
              </Box>
            ) : employeeSalary ? (
              <Grid container spacing={3} sx={{ mt: 0.5 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <DetailRow
                    icon={<Payments sx={{ color: theme.palette.success.main }} />}
                    label="Basic Salary"
                    value={`₹${parseFloat(employeeSalary.basic_salary || employee?.basic_salary || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })} / month`}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <DetailRow
                    icon={<Paid sx={{ color: "#ea580c" }} />}
                    label="Daily Allowance (DA)"
                    value={`₹${parseFloat(employeeSalary.da !== undefined && employeeSalary.da !== null ? employeeSalary.da : (employee?.da || 0)).toLocaleString("en-IN", { minimumFractionDigits: 2 })} / day`}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <DetailRow
                    icon={<HomeWork sx={{ color: theme.palette.info.main }} />}
                    label="HRA"
                    value={`₹${parseFloat(employeeSalary.hra || employee?.hra || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })} / month`}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <DetailRow
                    icon={<DirectionsCar sx={{ color: theme.palette.warning.main }} />}
                    label="Conveyance"
                    value={`₹${parseFloat(employeeSalary.conveyance || employee?.conveyance || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })} / month`}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <DetailRow
                    icon={<Star sx={{ color: theme.palette.secondary.main }} />}
                    label="Special Allowance"
                    value={`₹${parseFloat(employeeSalary.special_allowance || employee?.special_allowance || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })} / month`}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <DetailRow
                    icon={<AccountBalance sx={{ color: theme.palette.error.main }} />}
                    label="EPF (Deduction)"
                    value={`₹${parseFloat(employeeSalary.epf || employee?.pf_deduction || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })} / month`}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <DetailRow
                    icon={<AccountBalance sx={{ color: theme.palette.info.main }} />}
                    label="ESI (Deduction)"
                    value={`₹${parseFloat(employeeSalary.esi || employee?.esi_deduction || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })} / month`}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <DetailRow
                    icon={<AccountBalanceWallet sx={{ color: theme.palette.error.main }} />}
                    label="Other Deduction"
                    value={`₹${parseFloat(employeeSalary.other_deduction || employee?.other_deduction || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })} / month`}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <DetailRow
                    icon={<TrendingUp sx={{ color: theme.palette.primary.main }} />}
                    label="Monthly Gross Salary"
                    value={`₹${parseFloat(employeeSalary.gross_salary || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })} / month`}
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
          sx={{ bgcolor: "#f37021", color: "white", "&:hover": { bgcolor: "#d95300" } }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

function EmployeeList() {
  const { user } = useAuth();
  const userRole = (user?.Role || user?.role || "").toString().toLowerCase();
  const isAdmin = userRole === "admin" || userRole === "superadmin";
  const isRM = user?.is_rm || user?.isRM || Boolean(user?.subordinates && user.subordinates.length > 0);
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
  const [formErrors, setFormErrors] = useState({});
  const [formGeneralError, setFormGeneralError] = useState("");

  const maxAllowedDOB = (() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 18);
    return d.toISOString().split("T")[0];
  })();

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
    if (formGeneralError) {
      setFormGeneralError("");
    }
  };
  const [filterRole, setFilterRole] = useState("");
  const [filterStatus, setFilterStatus] = useState("1");
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
    Shift: "9:00 AM - 6:00 PM",
    WeekOff: "",
    Designation: "",
    Department: "",
    DOB: "",
    JoinDate: "",
    Grade: "",
    UAN: "",
    ESI: "",
    ProbationPeriod: "", // Added Probation Period field
    // Salary fields
    basic_salary: "",
    da: "",
    hra: "",
    conveyance: "",
    special_allowance: "",
    pf_deduction: "",
    esi_deduction: "",
    other_deduction: "",
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
  const roleOptions1 = ["Admin", "Employee"];
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
    if (!allEmployees || allEmployees.length === 0) return "AP0001";

    const existingIds = new Set(
      allEmployees.map((e) => (e.EmpId || "").toString().trim().toUpperCase())
    );

    // Determine the prefix and number padding
    let prefix = "AP";
    let padLength = 4;

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
        const allEmployees = response.data.data;
        const isAdmin = ["Admin", "admin", "SuperAdmin"].includes(user?.role);
        const isRM = user?.is_rm || user?.isRM || Boolean(user?.subordinates && user.subordinates.length > 0);

        let visibleEmployees = allEmployees;
        if (!isAdmin) {
          if (isRM) {
            // RM can see themselves AND all subordinates reporting to them
            visibleEmployees = allEmployees.filter(
              (emp) => emp.EmpId === user.emp_id || emp.RM === user.emp_id || (user?.subordinates && user.subordinates.includes(emp.EmpId))
            );
          } else {
            // Plain employee only sees themselves
            visibleEmployees = allEmployees.filter(
              (emp) => emp.EmpId === user.emp_id
            );
          }
        }

        setEmployees(visibleEmployees);

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
    setFormErrors({});
    setFormGeneralError("");
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
        Shift: employee.Shift || "9:00 AM - 6:00 PM",
        DOB: employee.DOB || "",
        JoinDate: employee.JoinDate || "",
        WeekOff: employee.WeekOff || "Sunday",
        Designation: employee.Designation || "",
        Department: employee.Department || employee.department || "",
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
        other_deduction: employee.other_deduction ? String(parseFloat(employee.other_deduction)) : (empSalary?.other_deduction ? String(parseFloat(empSalary.other_deduction)) : ""),
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
        Shift: "9:00 AM - 6:00 PM",
        DOB: "",
        JoinDate: "",
        WeekOff: "",
        Designation: "",
        Department: "",
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
        other_deduction: "",
        tds: "",
        advance: "",
        lwf: "",
      });
    }
    setOpenForm(true);
  };

  const validateEmployeeForm = () => {
    const errs = {};

    // 1. Employee ID
    if (!formData.EmpId || !String(formData.EmpId).trim()) {
      errs.EmpId = "Employee ID is required.";
    }

    // 2. Full Name
    if (!formData.Name || !String(formData.Name).trim()) {
      errs.Name = "Full Name is required.";
    } else if (!/^[A-Za-z ]{2,}$/.test(formData.Name.trim())) {
      errs.Name = "Full Name must contain at least 2 letters (letters and spaces only).";
    }

    // 3. Password (add mode only)
    if (formMode === "add") {
      if (!formData.Password) {
        errs.Password = "Password is required.";
      } else if (formData.Password.length < 6) {
        errs.Password = "Password must be at least 6 characters.";
      }
    }

    // 4. Mobile Number
    const mobileStr = String(formData.Mobile || "").trim();
    if (!mobileStr) {
      errs.Mobile = "Mobile Number is required.";
    } else if (!/^\d{10}$/.test(mobileStr)) {
      errs.Mobile = "Mobile Number must contain exactly 10 digits.";
    }

    // 5. Email Address
    const emailStr = String(formData.EmailId || "").trim();
    if (!emailStr) {
      errs.EmailId = "Email Address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr)) {
      errs.EmailId = "Please enter a valid Email Address.";
    }

    // 6. Designation
    if (!formData.Designation || !String(formData.Designation).trim()) {
      errs.Designation = "Designation is required.";
    }

    // 7. Date of Birth (DOB) - MUST BE AT LEAST 18 YEARS OLD
    if (!formData.DOB) {
      errs.DOB = "Date of Birth is required.";
    } else {
      const birthDate = new Date(formData.DOB);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      if (isNaN(age)) {
        errs.DOB = "Please select a valid Date of Birth.";
      } else if (age < 18) {
        errs.DOB = `Employee must be at least 18 years old (current age: ${age < 0 ? 0 : age} yrs).`;
      }
    }

    // 8. Date of Joining
    if (!formData.JoinDate) {
      errs.JoinDate = "Date of Joining is required.";
    }

    // 9. PAN Card Number (10 chars: 5 letters, 4 digits, 1 letter)
    if (formData.PanNumber && String(formData.PanNumber).trim()) {
      const panUpper = String(formData.PanNumber).trim().toUpperCase();
      if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panUpper)) {
        errs.PanNumber = "PAN must be 10 characters: 5 letters, 4 digits, 1 letter (e.g. ABCDE1234F).";
      }
    }

    // 10. Role
    if (!formData.Role || !String(formData.Role).trim()) {
      errs.Role = "Role is required.";
    }

    // 11. Shift
    if (!formData.Shift || !String(formData.Shift).trim()) {
      formData.Shift = "9:00 AM - 6:00 PM";
    }

    // 12. Week Off
    if (!formData.WeekOff || !String(formData.WeekOff).trim()) {
      errs.WeekOff = "Week Off is required.";
    }

    // 13. Salary fields (Mandatory and Optional)
    const mandatorySalaryKeys = [
      { key: "basic_salary", label: "Basic Salary" },
      { key: "hra", label: "HRA" },
      { key: "conveyance", label: "Conveyance" },
      { key: "da", label: "Day Allowance" },
    ];
    mandatorySalaryKeys.forEach(({ key, label }) => {
      const val = formData[key];
      if (val === "" || val === undefined || val === null) {
        errs[key] = `${label} is required.`;
      } else if (isNaN(Number(val)) || Number(val) < 0) {
        errs[key] = `${label} must be a valid non-negative number.`;
      }
    });

    // Optional salary fields: Special Allowance, PF, ESI, Other Deduction (Not Mandatory)
    const optionalSalaryKeys = [
      { key: "special_allowance", label: "Special Allowance" },
      { key: "pf_deduction", label: "PF / EPF Deduction" },
      { key: "esi_deduction", label: "ESI Deduction" },
      { key: "other_deduction", label: "Other Deduction" },
    ];
    optionalSalaryKeys.forEach(({ key, label }) => {
      const val = formData[key];
      if (val !== "" && val !== undefined && val !== null) {
        if (isNaN(Number(val)) || Number(val) < 0) {
          errs[key] = `${label} must be a valid non-negative number.`;
        }
      }
    });

    // 14. UAN & ESI (Optional, validated only if provided)
    const uanVal = String(formData.UAN || "").trim();
    if (uanVal && uanVal !== "0" && !/^\d{12}$/.test(uanVal)) {
      errs.UAN = "UAN must be exactly 12 numeric digits.";
    }

    const esiVal = String(formData.ESI || "").trim();
    if (esiVal && esiVal !== "0" && !/^\d{10,17}$/.test(esiVal)) {
      errs.ESI = "ESI must be a 10 to 17-digit number.";
    }

    return errs;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormGeneralError("");

    const validationErrors = validateEmployeeForm();
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      setSubmitting(false);

      const firstKey = Object.keys(validationErrors)[0];
      setFormGeneralError(`Please fix the highlighted errors: ${validationErrors[firstKey]}`);

      setTimeout(() => {
        const el =
          document.querySelector(`[name="${firstKey}"]`) ||
          document.getElementById(`field-${firstKey}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          if (el.focus) el.focus();
        }
      }, 100);

      return;
    }

    setFormErrors({});
    setSubmitting(true);

    const distance = "0";
    
    const formattedFormData = {
      EmpId: formData.EmpId,
      Name: formData.Name,
      Password: formData.Password,
      Mobile: formData.Mobile,
      EmailId: formData.EmailId,
      Role: formData.Role,
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
      Department: formData.Department || "",
      Grade: formData.Grade,
      UAN: formData.UAN,
      ESI: formData.ESI,
      ProbationPeriod: formData.ProbationPeriod || "",
      FatherName: formData.FatherName || "",
      PanNumber: (formData.PanNumber || "").toUpperCase(),
      AadharNumber: formData.AadharNumber || "",
      basic_salary: parseFloat(formData.basic_salary) || 0,
      da: parseFloat(formData.da) || 0,
      hra: parseFloat(formData.hra) || 0,
      conveyance: parseFloat(formData.conveyance) || 0,
      special_allowance: parseFloat(formData.special_allowance) || 0,
      pf_deduction: parseFloat(formData.pf_deduction) || 0,
      esi_deduction: parseFloat(formData.esi_deduction) || 0,
      other_deduction: parseFloat(formData.other_deduction) || 0,
      tds: parseFloat(formData.tds) || 0,
      advance: parseFloat(formData.advance) || 0,
      lwf: parseFloat(formData.lwf) || 0,
      Distance: distance,
      Offices: [],
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
    const otherDeduction = parseFloat(employeeData.other_deduction) || 0;
    const tds = parseFloat(employeeData.tds) || 0;
    const advance = parseFloat(employeeData.advance) || 0;
    const lwf = parseFloat(employeeData.lwf) || 0;

    const grossSalary = basic + da + hra + conveyance + specialAllowance;
    const totalDeductions = pf + esi + otherDeduction + tds + advance + lwf;
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
      other_deduction: otherDeduction,
      other_deduction_per_annum: otherDeduction * 12,
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
    setFormErrors({});
    setFormGeneralError("");
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

  // UPDATED: Handle employee status toggle (Admin only)
  const handleToggleEmployeeStatus = async (employee) => {
    if (!isAdmin) {
      alert("Only administrators have permission to change employee active/inactive status.");
      return;
    }
    if (!employee || !employee.EmpId) {
      console.error("Please provide both Employee ID and action");
      return;
    }

    // If employee is active, open disable dialog to set leave date & reason
    if (employee.IsActive) {
      handleOpenDisableDialog(employee);
      return;
    }

    // If employee is inactive, activate them
    if (!employee.IsActive) {
      try {
        const response = await axios.post(`${BASE_URL}/employee/disable_employee.php`, {
          EmpId: employee.EmpId,
          action: "enable",
        });
        if (response.data.success) {
          alert("Employee has been activated successfully.");
          fetchEmployees();
        } else {
          alert(response.data.message || "Failed to activate employee.");
        }
      } catch (err) {
        console.error("Error activating employee:", err);
        alert("Error activating employee: " + (err.response?.data?.message || err.message));
      }
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
    // Helper to format dates cleanly as DD-MM-YYYY
    const fmtDate = (d) => {
      if (!d) return "N/A";
      try {
        const dt = new Date(d);
        if (isNaN(dt.getTime())) return String(d).slice(0, 10);
        const day = String(dt.getDate()).padStart(2, "0");
        const month = String(dt.getMonth() + 1).padStart(2, "0");
        const year = dt.getFullYear();
        return `${day}-${month}-${year}`;
      } catch (_) {
        return String(d).slice(0, 10);
      }
    };

    // Prepare data arranged in the exact order when adding an employee (excluding Password and Father's Name)
    const exportData = filteredEmployees.map((employee) => {
      // Find salary structure fallback if available
      const sal = Array.isArray(salary)
        ? salary.find((s) => String(s.empId).trim() === String(employee.EmpId).trim() || String(s.emp_name).trim().toLowerCase() === String(employee.Name).trim().toLowerCase())
        : null;

      // Find reporting manager display name
      const rmEmp = Array.isArray(employees)
        ? employees.find((e) => String(e.EmpId).trim() === String(employee.RM).trim())
        : null;
      const rmDisplay = rmEmp
        ? `${rmEmp.Name} (${rmEmp.EmpId})`
        : (employee.RM && String(employee.RM).trim() !== "" ? employee.RM : "N/A");

      const basicSal = parseFloat(employee.basic_salary !== undefined && employee.basic_salary !== null && employee.basic_salary !== "" ? employee.basic_salary : (sal?.basic_salary || 0));
      const hraVal = parseFloat(employee.hra !== undefined && employee.hra !== null && employee.hra !== "" ? employee.hra : (sal?.hra || 0));
      const convVal = parseFloat(employee.conveyance !== undefined && employee.conveyance !== null && employee.conveyance !== "" ? employee.conveyance : (sal?.conveyance || 0));
      const specialVal = parseFloat(employee.special_allowance !== undefined && employee.special_allowance !== null && employee.special_allowance !== "" ? employee.special_allowance : (sal?.special_allowance || 0));
      const daVal = parseFloat(employee.da !== undefined && employee.da !== null && employee.da !== "" ? employee.da : 0);
      const pfVal = parseFloat(employee.pf_deduction !== undefined && employee.pf_deduction !== null && employee.pf_deduction !== "" ? employee.pf_deduction : (sal?.epf || 0));
      const esiVal = parseFloat(employee.esi_deduction !== undefined && employee.esi_deduction !== null && employee.esi_deduction !== "" ? employee.esi_deduction : (sal?.esi || 0));
      const otherVal = parseFloat(employee.other_deduction !== undefined && employee.other_deduction !== null && employee.other_deduction !== "" ? employee.other_deduction : (sal?.other_deduction || 0));

      return {
        // 1. Personal Information (Password & Father's Name excluded)
        "Employee ID": employee.EmpId || "N/A",
        "Full Name": employee.Name || "N/A",
        "Mobile Number": employee.Mobile || "N/A",
        "Email Address": employee.EmailId || "N/A",
        "Designation": employee.Designation || "N/A",
        "Date of Birth": fmtDate(employee.DOB),
        "Date of Joining": fmtDate(employee.JoinDate),
        "PAN / ID Number": employee.PanNumber || "N/A",

        // 2. Work Information
        "Role": employee.new_role || employee.Role || "N/A",
        "Reporting Manager": rmDisplay,
        "Week Off": employee.WeekOff || "N/A",

        // 3. Salary Information
        "Basic Salary": basicSal,
        "HRA": hraVal,
        "Conveyance": convVal,
        "Special Allowance": specialVal,
        "Day Allowance": daVal,
        "PF / EPF Deduction": pfVal,
        "ESI Deduction": esiVal,
        "Other Deduction": otherVal,

        // 4. UAN/ESI Information
        "UAN": employee.UAN || "N/A",
        "ESI": employee.ESI || "N/A",

        // 5. Status
        "Status": Number(employee.IsActive) === 1 ? "Active" : "Inactive",
      };
    });
    
    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);
    
    // Set column widths for better formatting
    const wscols = [
      { wch: 15 }, // Employee ID
      { wch: 22 }, // Full Name
      { wch: 15 }, // Mobile Number
      { wch: 26 }, // Email Address
      { wch: 22 }, // Designation
      { wch: 15 }, // Date of Birth
      { wch: 15 }, // Date of Joining
      { wch: 16 }, // PAN / ID Number
      { wch: 18 }, // Role
      { wch: 24 }, // Reporting Manager
      { wch: 18 }, // Week Off
      { wch: 14 }, // Basic Salary
      { wch: 12 }, // HRA
      { wch: 14 }, // Conveyance
      { wch: 16 }, // Special Allowance
      { wch: 14 }, // Day Allowance
      { wch: 18 }, // PF / EPF Deduction
      { wch: 16 }, // ESI Deduction
      { wch: 16 }, // UAN
      { wch: 18 }, // ESI
      { wch: 12 }, // Status
    ];
    ws['!cols'] = wscols;
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Employee Report");
    
    // Generate filename with current date
    const date = new Date();
    const formattedDate = `${date.getDate()}_${date.getMonth() + 1}_${date.getFullYear()}`;
    const filename = `Employee_Report_${formattedDate}.xlsx`;
    
    // Export to Excel
    XLSX.writeFile(wb, filename);
    
  } catch (error) {
    console.error("Error exporting to Excel:", error);
    alert("Failed to export to Excel. Please try again.");
  } finally {
    setExporting(false);
  }
};

  const sortEmployeesMostRecent = (a, b) => {
    // 1. Primary: Sort by database primary key ID descending (most recently created row first)
    const idA = Number(a.id);
    const idB = Number(b.id);
    if (!isNaN(idA) && !isNaN(idB) && idA > 0 && idB > 0 && idA !== idB) {
      return idB - idA;
    }

    // 2. Secondary: Sort by CreateDate descending
    if (a.CreateDate && b.CreateDate) {
      const timeDiff = new Date(b.CreateDate) - new Date(a.CreateDate);
      if (!isNaN(timeDiff) && timeDiff !== 0) return timeDiff;
    }

    // 3. Fallback: Sort by numeric sequence in EmpId descending (e.g. AP0010 before AP0001)
    const numA = parseInt(String(a.EmpId || "").replace(/\D/g, ""), 10);
    const numB = parseInt(String(b.EmpId || "").replace(/\D/g, ""), 10);
    if (!isNaN(numA) && !isNaN(numB) && numA !== numB) {
      return numB - numA;
    }

    return 0;
  };

  const filteredEmployees = employees
    .filter((employee) => {
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
      filterStatus === "" ||
      (Number(employee.IsActive) === 1 ? "1" : "0") === filterStatus;

    return matchesSearch && matchesRole && matchesStatus;
  }).sort(sortEmployeesMostRecent);

  // Calculate stats
  const totalEmployees = employees.length;
  const activeEmployeesCount = employees.filter((emp) => emp.IsActive).length;
  const inactiveEmployees = totalEmployees - activeEmployeesCount;
  const adminCount = employees.filter((emp) => ["Admin", "admin", "SuperAdmin"].includes(emp.Role)).length;

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
            <Box sx={{ flexGrow: 1 }}>
              <Typography
                variant="h5"
                sx={{ fontWeight: 700, color: "#0f172a", letterSpacing: -0.3 }}
              >
                Employee Management
              </Typography>
              <Typography variant="body2" sx={{ color: "#64748b", mt: 0.3, fontSize: "0.85rem" }}>
                Manage company staff, designations, departments, and employee directory
              </Typography>
            </Box>

            <Box sx={{ display: "flex", gap: 1, mt: { xs: 2, md: 0 } }}>
              <Tooltip title="Refresh Data">
                <IconButton
                  onClick={fetchEmployees}
                  sx={{
                    bgcolor: "#fff",
                    color: "#f37021",
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
                  borderColor: "#f37021",
                  color: "#f37021",
                  "&:hover": {
                    borderColor: "#d95300",
                    bgcolor: "#f8f0f4",
                  },
                  borderRadius: 2,
                  textTransform: "none",
                  minWidth: "120px",
                }}
              >
                {exporting ? "Exporting..." : "Export"}
              </Button>
              
              {isAdmin && (
                <Button
                  variant="contained"
                  startIcon={<PersonAdd />}
                  onClick={() => handleOpenForm("add")}
                  sx={{
                    bgcolor: "#f37021",
                    color: "white",
                    "&:hover": { bgcolor: "#d95300" },
                    borderRadius: 2,
                    textTransform: "none",
                  }}
                >
                  Add Employee
                </Button>
              )}
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
              <FormControl fullWidth size="small" sx={{ bgcolor: "#fff", borderRadius: 2 }}>
                <InputLabel>Employee Status</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  label="Employee Status"
                >
                  <MenuItem value="1">Active Only</MenuItem>
                  <MenuItem value="0">Inactive Only</MenuItem>
                  <MenuItem value="">All Employees</MenuItem>
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
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((employee) => (
                    <EmployeeCard
                      key={employee.EmpId}
                      employee={employee}
                      onEdit={(emp) => handleOpenForm("edit", emp)}
                      onToggleStatus={handleToggleEmployeeStatus}
                      onViewDetails={handleViewDetails}
                      theme={theme}
                      isAdmin={isAdmin}
                    />
                  ))}
              </AnimatePresence>
            </Box>
          ) : (
            // Desktop Table View
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: "#f37021" }}>
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
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {['Admin', 'admin', 'superadmin', 'SuperAdmin'].includes(employee.Role || employee.new_role || employee.actual_role) ? 'Admin' : 'Employee'}
                            </Typography>
                          </TableCell>
                          {/* <TableCell>
                            <Typography variant="body2">{employee.Shift}</Typography>
                          </TableCell> */}
                          <TableCell>
                            <Chip
                              size="small"
                              label={employee.IsActive ? "Active" : "Inactive"}
                              sx={{
                                fontWeight: 700,
                                fontSize: "11px",
                                height: "22px",
                                bgcolor: employee.IsActive ? "rgba(16, 185, 129, 0.12)" : "rgba(148, 163, 184, 0.12)",
                                color: employee.IsActive ? "#059669" : "#64748b",
                                border: `1px solid ${employee.IsActive ? "rgba(16, 185, 129, 0.3)" : "rgba(148, 163, 184, 0.25)"}`,
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
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
                                  sx={{ color: "#f37021" }}
                                  onClick={() =>
                                    handleOpenForm("edit", employee)
                                  }
                                >
                                  <Edit fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip
                                title={
                                  !isAdmin
                                    ? "Only Admin can change status"
                                    : employee.IsActive
                                    ? "Deactivate Employee"
                                    : "Activate Employee"
                                }
                              >
                                <span>
                                  <Switch
                                    size="small"
                                    checked={Boolean(employee.IsActive)}
                                    disabled={!isAdmin}
                                    onChange={() => handleToggleEmployeeStatus(employee)}
                                    sx={{
                                      "& .MuiSwitch-switchBase.Mui-checked": {
                                        color: "#10b981",
                                      },
                                      "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                                        backgroundColor: "#10b981",
                                      },
                                    }}
                                  />
                                </span>
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
              bgcolor: "#f37021",
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
              sx={{ bgcolor: "#f37021", color: "white" }}
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
              bgcolor: "#f37021",
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
            {formGeneralError && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setFormGeneralError("")}>
                {formGeneralError}
              </Alert>
            )}
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
                    name="EmpId"
                    id="field-EmpId"
                    value={formData.EmpId}
                    onChange={(e) => handleFieldChange("EmpId", e.target.value)}
                    required
                    disabled
                    error={Boolean(formErrors.EmpId)}
                    helperText={formErrors.EmpId || (formMode === "add" ? "Auto-generated unique ID" : "")}
                    InputProps={{
                      readOnly: true,
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
                    name="Name"
                    id="field-Name"
                    value={formData.Name}
                    onChange={(e) => handleFieldChange("Name", e.target.value)}
                    required
                    error={Boolean(formErrors.Name)}
                    helperText={formErrors.Name}
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
                    name="Password"
                    id="field-Password"
                    type="password"
                    value={formData.Password}
                    onChange={(e) => handleFieldChange("Password", e.target.value)}
                    required={formMode === "add"}
                    disabled={formMode === "edit"}
                    error={Boolean(formErrors.Password)}
                    helperText={formErrors.Password}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Mobile Number"
                    name="Mobile"
                    id="field-Mobile"
                    value={formData.Mobile}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                      handleFieldChange("Mobile", val);
                    }}
                    required
                    type="tel"
                    error={Boolean(formErrors.Mobile)}
                    helperText={formErrors.Mobile}
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
                    name="EmailId"
                    id="field-EmailId"
                    type="email"
                    value={formData.EmailId}
                    onChange={(e) => handleFieldChange("EmailId", e.target.value)}
                    required
                    error={Boolean(formErrors.EmailId)}
                    helperText={formErrors.EmailId}
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
                    size="small"
                    label="Designation"
                    name="Designation"
                    id="field-Designation"
                    value={formData.Designation}
                    onChange={(e) => handleFieldChange("Designation", e.target.value)}
                    required
                    error={Boolean(formErrors.Designation)}
                    helperText={formErrors.Designation}
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
                    size="small"
                    label="Date of Birth"
                    name="DOB"
                    id="field-DOB"
                    type="date"
                    value={formData.DOB}
                    onChange={(e) => handleFieldChange("DOB", e.target.value)}
                    required
                    error={Boolean(formErrors.DOB)}
                    helperText={formErrors.DOB || "Must be at least 18 years old"}
                    inputProps={{ max: maxAllowedDOB }}
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
                    label="Date of Joining"
                    name="JoinDate"
                    id="field-JoinDate"
                    type="date"
                    value={formData.JoinDate}
                    onChange={(e) => handleFieldChange("JoinDate", e.target.value)}
                    required
                    error={Boolean(formErrors.JoinDate)}
                    helperText={formErrors.JoinDate}
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
                    name="FatherName"
                    id="field-FatherName"
                    value={formData.FatherName}
                    onChange={(e) => handleFieldChange("FatherName", e.target.value)}
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
                    name="PanNumber"
                    id="field-PanNumber"
                    value={formData.PanNumber}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10);
                      handleFieldChange("PanNumber", val);
                    }}
                    error={Boolean(formErrors.PanNumber)}
                    helperText={formErrors.PanNumber || "Format: 5 letters, 4 digits, 1 letter (e.g. ABCDE1234F)"}
                    inputProps={{ maxLength: 10, style: { textTransform: "uppercase" } }}
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

                {/* Grade field intentionally disabled. */}

                {/* Role */}
                <Grid item xs={12} md={6}>
                  <Autocomplete
                    size="small"
                    options={roleOptions1}
                    value={selectedRole}
                    onChange={(_, newValue) => handleFieldChange("Role", newValue || "")}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        size="small"
                        label="Role"
                        name="Role"
                        id="field-Role"
                        required
                        fullWidth
                        error={Boolean(formErrors.Role)}
                        helperText={formErrors.Role}
                      />
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
                    onChange={(_, newValue) => handleFieldChange("WeekOff", newValue.join(","))}
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
                        name="WeekOff"
                        id="field-WeekOff"
                        required
                        fullWidth
                        error={Boolean(formErrors.WeekOff)}
                        helperText={formErrors.WeekOff}
                      />
                    )}
                  />
                </Grid>

                {/* Department */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Department"
                    name="Department"
                    id="field-Department"
                    value={formData.Department || ""}
                    onChange={(e) => handleFieldChange("Department", e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Work color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>



                {/* Office field intentionally disabled. */}

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
                    name="basic_salary"
                    id="field-basic_salary"
                    type="number"
                    required
                    value={formData.basic_salary}
                    onChange={(e) => handleFieldChange("basic_salary", e.target.value)}
                    error={Boolean(formErrors.basic_salary)}
                    helperText={formErrors.basic_salary}
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
                    name="hra"
                    id="field-hra"
                    type="number"
                    required
                    value={formData.hra}
                    onChange={(e) => handleFieldChange("hra", e.target.value)}
                    error={Boolean(formErrors.hra)}
                    helperText={formErrors.hra}
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
                    name="conveyance"
                    id="field-conveyance"
                    type="number"
                    required
                    value={formData.conveyance}
                    onChange={(e) => handleFieldChange("conveyance", e.target.value)}
                    error={Boolean(formErrors.conveyance)}
                    helperText={formErrors.conveyance}
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
                    label="Special Allowance (Optional)"
                    name="special_allowance"
                    id="field-special_allowance"
                    type="number"
                    value={formData.special_allowance}
                    onChange={(e) => handleFieldChange("special_allowance", e.target.value)}
                    error={Boolean(formErrors.special_allowance)}
                    helperText={formErrors.special_allowance}
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
                    name="da"
                    id="field-da"
                    type="number"
                    required
                    value={formData.da}
                    onChange={(e) => handleFieldChange("da", e.target.value)}
                    error={Boolean(formErrors.da)}
                    helperText={formErrors.da}
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
                    label="PF / EPF Deduction (Optional)"
                    name="pf_deduction"
                    id="field-pf_deduction"
                    type="number"
                    value={formData.pf_deduction}
                    onChange={(e) => handleFieldChange("pf_deduction", e.target.value)}
                    error={Boolean(formErrors.pf_deduction)}
                    helperText={formErrors.pf_deduction}
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
                    label="ESI Deduction (Optional)"
                    name="esi_deduction"
                    id="field-esi_deduction"
                    type="number"
                    value={formData.esi_deduction}
                    onChange={(e) => handleFieldChange("esi_deduction", e.target.value)}
                    error={Boolean(formErrors.esi_deduction)}
                    helperText={formErrors.esi_deduction}
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
                    label="Other Deduction (Optional)"
                    name="other_deduction"
                    id="field-other_deduction"
                    type="number"
                    value={formData.other_deduction}
                    onChange={(e) => handleFieldChange("other_deduction", e.target.value)}
                    error={Boolean(formErrors.other_deduction)}
                    helperText={formErrors.other_deduction}
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
                    size="small"
                    label="UAN"
                    name="UAN"
                    id="field-UAN"
                    value={formData.UAN}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "").slice(0, 12);
                      handleFieldChange("UAN", val);
                    }}
                    error={Boolean(formErrors.UAN)}
                    helperText={formErrors.UAN || "12 numeric digits (optional)"}
                    inputProps={{ maxLength: 12 }}
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
                    label="ESI"
                    name="ESI"
                    id="field-ESI"
                    value={formData.ESI}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "").slice(0, 17);
                      handleFieldChange("ESI", val);
                    }}
                    error={Boolean(formErrors.ESI)}
                    helperText={formErrors.ESI || "10-17 digits (optional)"}
                    inputProps={{ maxLength: 17 }}
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
              sx={{ bgcolor: "#f37021", color: "white" }}
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