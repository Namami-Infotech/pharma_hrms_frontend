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
} from "@mui/icons-material";
import { CheckBox } from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useAuth } from "../auth/AuthContext";

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
          borderLeft: `4px solid ${employee.IsActive ? theme.palette.success.main : theme.palette.error.main}`,
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
            <Tooltip title={employee.IsActive ? "Deactivate" : "Activate"}>
              <IconButton
                size="small"
                color={employee.IsActive ? "error" : "success"}
                onClick={() => onToggleStatus(employee)}
              >
                {employee.IsActive ? (
                  <Close fontSize="small" />
                ) : (
                  <CheckCircle fontSize="small" />
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

// Employee Details Component
const EmployeeDetails = ({ employee, open, onClose, salary }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [salaryData, setSalaryData] = useState({
    basic_salary: "",
    hra: "",
    conveyance: "",
    special_allowance: "",
    epf: "",
    esi: "",
  });
  const [calculatedData, setCalculatedData] = useState({});
  const [addingSalary, setAddingSalary] = useState(false);

  useEffect(() => {
    if (employee && open) {
      // Pre-fill with existing salary data if available
      const employeeSalary = salary?.find((s) => s.empId === employee.EmpId);
      if (employeeSalary) {
        setSalaryData({
          basic_salary: employeeSalary.basic_salary || "",
          hra: employeeSalary.hra || "",
          conveyance: employeeSalary.conveyance || "",
          special_allowance: employeeSalary.special_allowance || "",
          epf: employeeSalary.epf || "",
          esi: employeeSalary.esi || "",
        });
      } else {
        // Reset salary data when dialog opens
        setSalaryData({
          basic_salary: "",
          hra: "",
          conveyance: "",
          special_allowance: "",
          epf: "",
          esi: "",
        });
      }
      setCalculatedData({});
    }
  }, [employee, open, salary]);

  // Calculate derived values when salary inputs change
  useEffect(() => {
    const basic = parseFloat(salaryData.basic_salary) || 0;
    const hra = parseFloat(salaryData.hra) || 0;
    const conveyance = parseFloat(salaryData.conveyance) || 0;
    const specialAllowance = parseFloat(salaryData.special_allowance) || 0;
    const epf = parseFloat(salaryData.epf) || 0;
    const esi = parseFloat(salaryData.esi) || 0;

    const grossSalary = basic + hra + conveyance + specialAllowance;
    const totalBenefits = epf + esi;
    const netTakeHome = grossSalary - totalBenefits;
    const totalCostOfCompany = grossSalary + totalBenefits;

    setCalculatedData({
      gross_salary: grossSalary,
      gross_salary_per_annum: grossSalary * 12,
      total_benefits: totalBenefits,
      total_benefits_per_annum: totalBenefits * 12,
      net_take_home: netTakeHome,
      total_cost_of_company: totalCostOfCompany,
      basic_salary_per_annum: basic * 12,
      hra_per_annum: hra * 12,
      conveyance_per_annum: conveyance * 12,
      special_allowance_per_annum: specialAllowance * 12,
      epf_per_annum: epf * 12,
      esi_per_annum: esi * 12,
    });
  }, [salaryData]);

  const handleSalaryInputChange = (field, value) => {
    setSalaryData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddSalary = async () => {
    if (!employee) return;

    setAddingSalary(true);
    try {
      const payload = {
        empId: employee.EmpId,
        emp_name: employee.Name,
        designation: employee.Designation,
        department: employee.Role,
        grade: employee.Grade,
        date_of_joining: employee.JoinDate,
        basic_salary: parseFloat(salaryData.basic_salary) || 0,
        basic_salary_per_annum: calculatedData.basic_salary_per_annum || 0,
        hra: parseFloat(salaryData.hra) || 0,
        hra_per_annum: calculatedData.hra_per_annum || 0,
        conveyance: parseFloat(salaryData.conveyance) || 0,
        conveyance_per_annum: calculatedData.conveyance_per_annum || 0,
        special_allowance: parseFloat(salaryData.special_allowance) || 0,
        special_allowance_per_annum:
          calculatedData.special_allowance_per_annum || 0,
        gross_salary: calculatedData.gross_salary || 0,
        gross_salary_per_annum: calculatedData.gross_salary_per_annum || 0,
        epf: parseFloat(salaryData.epf) || 0,
        epf_per_annum: calculatedData.epf_per_annum || 0,
        esi: parseFloat(salaryData.esi) || 0,
        esi_per_annum: calculatedData.esi_per_annum || 0,
        total_benefits: calculatedData.total_benefits || 0,
        total_benefits_per_annum: calculatedData.total_benefits_per_annum || 0,
        total_cost_of_company: calculatedData.total_cost_of_company || 0,
        net_take_home: calculatedData.net_take_home || 0,
      };

      const response = await axios.post(
        `${BASE_URL}/salary/add_salary.php`,
        payload,
      );

      if (response.data.success) {
        alert("Salary information added successfully!");
        // Reset form
        setSalaryData({
          basic_salary: "",
          hra: "",
          conveyance: "",
          special_allowance: "",
          epf: "",
          esi: "",
        });
        onClose(); // Close the dialog after successful addition
      } else {
        alert("Failed to add salary information: " + response.data.message);
      }
    } catch (error) {
      console.error("Error adding salary:", error);
      alert("Error adding salary information: " + error.message);
    } finally {
      setAddingSalary(false);
    }
  };

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

  const SalaryInputField = ({ label, value, onChange, field, ...props }) => (
    <Grid item xs={12} sm={6}>
      <TextField
        fullWidth
        label={label}
        type="number"
        value={value}
        onChange={(e) => onChange(field, e.target.value)}
        variant="outlined"
        size="small"
        {...props}
      />
    </Grid>
  );

  const CalculatedField = ({ label, value }) => (
    <Grid item xs={12} sm={6}>
      <Box
        sx={{
          p: 1,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 1,
          bgcolor: theme.palette.background.default,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="body1" fontWeight="bold">
          ₹{value?.toLocaleString("en-IN") || 0}
        </Typography>
      </Box>
    </Grid>
  );

  // Get employee salary data
  const employeeSalary = salary?.find((s) => s.empId === employee?.EmpId);

  if (!employee) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      TransitionComponent={Fade}
      PaperProps={{ sx: { borderRadius: 3, maxHeight: "90vh" } }}
    >
      <DialogTitle
        sx={{
          bgcolor: "#8d0638ff",
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Person /> <Typography variant="h6">Employee Details</Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: "white" }}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: { xs: 2, md: 4 } }}>
        <Grid container spacing={4}>
          <Grid item xs={12} sx={{ mb: 2 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                flexWrap: "wrap",
                justifyContent: "flex-start",
              }}
            >
              <Avatar
                sx={{
                  width: 64,
                  height: 64,
                  bgcolor: theme.palette.primary.main,
                }}
                src={employee.Pic}
              >
                {!employee.Pic && employee.Name?.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight="bold">
                  {employee.Name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {employee.EmpId}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Personal Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <DetailRow
                icon={<Phone />}
                label="Mobile"
                value={employee.Mobile}
              />
              <DetailRow
                icon={<Email />}
                label="Email"
                value={employee.EmailId}
              />
              <DetailRow
                icon={<CalendarToday />}
                label="Date of Birth"
                value={employee.DOB}
              />
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Work Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <DetailRow
                icon={<Work />}
                label="Designation"
                value={employee.Designation}
              />
              <DetailRow icon={<Badge />} label="Role" value={employee.Role} />
              <DetailRow
                icon={<Schedule />}
                label="Shift"
                value={employee.Shift}
              />
              <DetailRow
                icon={<Schedule />}
                label="Week Off"
                value={employee.WeekOff}
              />
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card variant="outlined" sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Additional Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <DetailRow
                icon={<Badge />}
                label="Grade"
                value={employee.Grade}
              />
              <DetailRow icon={<Money />} label="UAN" value={employee.UAN} />
              <DetailRow icon={<Money />} label="ESI" value={employee.ESI} />
              <DetailRow
                icon={<CalendarToday />}
                label="Date of Joining"
                value={employee.JoinDate}
              />
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card variant="outlined" sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Salary Information
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {employeeSalary ? (
                <Grid container spacing={2}>
                  {[
                    {
                      label: "Basic Salary",
                      value: employeeSalary.basic_salary,
                    },
                    { label: "HRA", value: employeeSalary.hra },
                    { label: "Conveyance", value: employeeSalary.conveyance },
                    {
                      label: "Special Allowance",
                      value: employeeSalary.special_allowance,
                    },
                    {
                      label: "Gross Salary",
                      value: employeeSalary.gross_salary,
                    },
                  ].map((item) => (
                    <Grid item xs={12} sm={6} md={3} key={item.label}>
                      <Card
                        sx={{
                          bgcolor: theme.palette.primary.light,
                          color: "white",
                        }}
                      >
                        <CardContent>
                          <Typography variant="body2">{item.label}</Typography>
                          <Typography variant="h6" fontWeight="bold">
                            ₹{item.value}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Alert severity="info">No salary information available.</Alert>
              )}
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card variant="outlined" sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                {employeeSalary ? "Update Salary" : "Add Salary"}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <SalaryInputField
                  label="Basic Salary"
                  value={salaryData.basic_salary}
                  onChange={handleSalaryInputChange}
                  field="basic_salary"
                />
                <SalaryInputField
                  label="HRA"
                  value={salaryData.hra}
                  onChange={handleSalaryInputChange}
                  field="hra"
                />
                <SalaryInputField
                  label="Conveyance"
                  value={salaryData.conveyance}
                  onChange={handleSalaryInputChange}
                  field="conveyance"
                />
                <SalaryInputField
                  label="Special Allowance"
                  value={salaryData.special_allowance}
                  onChange={handleSalaryInputChange}
                  field="special_allowance"
                />
              </Grid>

              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                <Button
                  variant="contained"
                  sx={{ bgcolor: "#8d0638ff", color: "white" }}
                  onClick={handleAddSalary}
                  disabled={addingSalary || !salaryData.basic_salary}
                  startIcon={
                    addingSalary ? <CircularProgress size={20} /> : null
                  }
                >
                  {addingSalary
                    ? "Saving..."
                    : employeeSalary
                      ? "Update Salary"
                      : "Add Salary"}
                </Button>
              </Box>
            </Card>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3, bgcolor: "#f5f5f5" }}>
        <Button
          onClick={onClose}
          variant="contained"
          sx={{ bgcolor: "#8d0638ff", color: "white" }}
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
    OTP: "",
    IsOTPExpired: 1,
    IsGeofence: 0,
    Tenent_Id: "",
    IsActive: 1,
    OfficeId: null,
    OfficeName: "",
    LatLong: "",
    Distance: "", // Add Distance field
    OfficeIsActive: 1,
    RM: "",
    Shift: "",
    WeekOff: "",
    Designation: "",
    DOB: "",
    JoinDate: "",
    Grade: "",
    UAN: "",
    ESI: "",
    // Salary fields
    basic_salary: "",
    hra: "",
    conveyance: "",
    special_allowance: "",
  });

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
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

  const roleOptions = ["HR", "Employee"];
  const weekDays = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  useEffect(() => {
    fetchEmployees();
    fetchSalaryStructure();
    fetchOffices();
  }, []);

  const generateNextEmployeeId = (lastEmpId) => {
    if (!lastEmpId) return "SGM0001";

    // Extract the numeric part and increment
    const prefix = lastEmpId.substring(0, 3); // "SGM"
    const numberPart = lastEmpId.substring(3); // "0001"

    // Convert to number, increment, and pad with leading zeros
    const nextNumber = parseInt(numberPart) + 1;
    const paddedNumber = nextNumber.toString().padStart(4, "0");

    return `${prefix}${paddedNumber}`;
  };
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${BASE_URL}/employee/list_employee.php?Tenent_Id=${user.tenent_id}`,
      );
      if (response.data.success) {
        setEmployees(response.data.data);

        // Store the last employee ID for auto-generation
        if (response.data.message) {
          // If you need to use the last ID elsewhere, you can store it in state
          const lastEmpId = response.data.message;
          console.log("Last Employee ID:", lastEmpId);

          // Auto-generate next ID when opening add form
          const nextEmpId = generateNextEmployeeId(lastEmpId);
          console.log("Next Employee ID:", nextEmpId);

          // You can set this in state or use it directly when needed
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
        `${BASE_URL}/salary/get_salary.php`,
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
        `${BASE_URL}/employee/get_office.php`,
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

  const handleOpenForm = (mode, employee = null) => {
    setFormMode(mode);
    if (mode === "edit" && employee) {
      const employeeSalary = salary.find((s) => s.empId === employee.EmpId);

      setFormData({
        EmpId: employee.EmpId,
        Name: employee.Name,
        // ... rest of your existing edit code
      });
    } else {
      // Auto-generate new employee ID for add mode
      const lastEmpId =
        employees.length > 0
          ? employees[employees.length - 1].EmpId
          : "SGM0000";
      const nextEmpId = generateNextEmployeeId(lastEmpId);

      setFormData({
        EmpId: nextEmpId, // Auto-generated ID
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
        Shift: "",
        DOB: "",
        JoinDate: "",
        WeekOff: "",
        Designation: "",
        Grade: "",
        UAN: "",
        ESI: "",
        basic_salary: "",
        hra: "",
        conveyance: "",
        special_allowance: "",
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

    // Extract distance from LatLong (assuming format: "lat,long,distance")
    const latLongParts = formData.LatLong.split(",");
    const distance = latLongParts[2] || "0"; // Get the distance part or default to "0"

    const requiredFields = [
      "EmpId",
      "Name",
      "Mobile",
      "EmailId",
      "Role",
      "OfficeName",
      "LatLong",
    ];
    for (const field of requiredFields) {
      if (!formData[field]) {
        alert(`Please fill in all required fields. Missing: ${field}`);
        setSubmitting(false);
        return;
      }
    }

    const formattedFormData = {
      EmpId: formData.EmpId,
      Name: formData.Name,
      Password: formData.Password,
      Mobile: formData.Mobile,
      EmailId: formData.EmailId,
      Role: formData.Role,
      OTP: formData.OTP || "123456",
      IsOTPExpired: formData.IsOTPExpired || 1,
      IsGeofence: formData.IsGeofence || 0,
      Tenent_Id: user.tenent_id,
      IsActive: formData.IsActive || 1,
      RM: formData.RM,
      Shift: formData.Shift || "9:00 AM - 6:00 PM",
      DOB: formData.DOB || "",
      JoinDate: formData.JoinDate || "",
      WeekOff: formData.WeekOff || "Sunday",
      Designation: formData.Designation,
      Grade: formData.Grade,
      UAN: formData.UAN,
      ESI: formData.ESI,
      Distance: distance,
      Offices: [
        {
          OfficeName: formData.OfficeName,
          LatLong: formData.LatLong,
          Distance: distance, // Add Distance field
        },
      ],
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
          formData.hra ||
          formData.conveyance ||
          formData.special_allowance
        ) {
          try {
            await addSalaryData(formData);
            alert("Employee and salary information added successfully!");
          } catch (salaryError) {
            console.error(
              "Salary addition failed but employee was created:",
              salaryError,
            );
            alert(
              "Employee added successfully, but there was an issue adding salary information.",
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
        error.response ? error.response.data : error.message,
      );
      alert(
        `Error: ${error.response ? error.response.data.message : error.message}`,
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Updated addSalaryData function
  const addSalaryData = async (employeeData) => {
    const basic = parseFloat(employeeData.basic_salary) || 0;
    const hra = parseFloat(employeeData.hra) || 0;
    const conveyance = parseFloat(employeeData.conveyance) || 0;
    const specialAllowance = parseFloat(employeeData.special_allowance) || 0;

    const grossSalary = basic + hra + conveyance + specialAllowance;

    const salaryPayload = {
      empId: employeeData.EmpId,
      emp_name: employeeData.Name,
      designation: employeeData.Designation,
      department: employeeData.Role,
      grade: employeeData.Grade,
      date_of_joining: employeeData.JoinDate,
      basic_salary: basic,
      basic_salary_per_annum: basic * 12,
      hra: hra,
      hra_per_annum: hra * 12,
      conveyance: conveyance,
      conveyance_per_annum: conveyance * 12,
      special_allowance: specialAllowance,
      special_allowance_per_annum: specialAllowance * 12,
      gross_salary: grossSalary,
      gross_salary_per_annum: grossSalary * 12,
      epf: 0,
      epf_per_annum: 0,
      esi: 0,
      esi_per_annum: 0,
      total_benefits: 0,
      total_benefits_per_annum: 0,
      total_cost_of_company: grossSalary,
      net_take_home: grossSalary,
    };

    const response = await axios.post(
      `${BASE_URL}/salary/add_salary.php`,
      salaryPayload,
    );

    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to add salary");
    }

    return response.data;
  };

  const handleOfficeChange = (event) => {
    const selectedOfficeIds = event.target.value;
    
    // Ensure IDs are strings for comparison
    const stringIds = selectedOfficeIds.map(id => id.toString());
    const selectedOffices = offices.filter((o) =>
      stringIds.includes(o.Id.toString())
    );
  
    // Extract distance from the first office's LatLong
    const firstOffice = selectedOffices[0];
    const latLongParts = firstOffice?.LatLong?.split(",") || [];
    const distance = latLongParts[2] || "0";
  
    setFormData((prevFormData) => ({
      ...prevFormData,
      OfficeId: selectedOfficeIds.join(","), // Store IDs
      OfficeName: selectedOffices.map((o) => o.OfficeName).join(","), // Store names for display
      LatLong: selectedOffices.map((o) => o.LatLong).join("|"),
      Distance: distance,
    }));
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setError("");
  };

  const handleToggleEmployeeStatus = async (employee) => {
    if (!employee || !employee.EmpId) {
      console.error("Please provide both Employee ID and action");
      return;
    }

    try {
      const action = employee.IsActive ? "disable" : "enable";
      const response = await axios.post(
        `${BASE_URL}/employee/disable_employee.php`,
        {
          EmpId: employee.EmpId,
          action: action,
        },
      );

      if (response.data.success) {
        fetchEmployees();
        fetchSalaryStructure();
      } else {
        console.error("Error:", response.data.message);
      }
    } catch (error) {
      console.error("Error:", error);
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
      filterStatus === "" || employee.IsActive.toString() === filterStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Calculate stats
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter((emp) => emp.IsActive).length;
  const inactiveEmployees = totalEmployees - activeEmployees;
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

  return (
    <Box
      sx={{
        px: { xs: 2, md: 4 },
        py: { xs: 2, md: 3 },
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
              <FormControl fullWidth sx={{ bgcolor: "#fff", borderRadius: 2 }}>
                <InputLabel>Filter by Role</InputLabel>
                <Select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  label="Filter by Role"
                >
                  <MenuItem value="">All Roles</MenuItem>
                  <MenuItem value="HR">HR</MenuItem>
                  <MenuItem value="Employee">Employee</MenuItem>
                </Select>
              </FormControl>
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

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                background: "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
                p: 1,
                borderRadius: 2,
                boxShadow: 1,
              }}
            >
              <CardContent sx={{ p: 1 }}>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Box>
                    <Typography
                      color="text.secondary"
                      variant="caption"
                      fontWeight={500}
                    >
                      Total Employees
                    </Typography>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      sx={{ lineHeight: 1 }}
                    >
                      {totalEmployees}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      All registered
                    </Typography>
                  </Box>
                  <Person sx={{ fontSize: 22, color: "#8d0638ff" }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                background: "linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)",
                p: 1,
                borderRadius: 2,
                boxShadow: 1,
              }}
            >
              <CardContent sx={{ p: 1 }}>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Box>
                    <Typography
                      color="text.secondary"
                      variant="caption"
                      fontWeight={500}
                    >
                      Active Employees
                    </Typography>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      color="success.main"
                      sx={{ lineHeight: 1 }}
                    >
                      {activeEmployees}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {totalEmployees > 0
                        ? `${((activeEmployees / totalEmployees) * 100).toFixed(1)}%`
                        : "0%"}
                    </Typography>
                  </Box>
                  <CheckCircle color="success" sx={{ fontSize: 22 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                background: "linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)",
                p: 1,
                borderRadius: 2,
                boxShadow: 1,
              }}
            >
              <CardContent sx={{ p: 1 }}>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Box>
                    <Typography
                      color="text.secondary"
                      variant="caption"
                      fontWeight={500}
                    >
                      Inactive Employees
                    </Typography>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      color="error.main"
                      sx={{ lineHeight: 1 }}
                    >
                      {inactiveEmployees}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {totalEmployees > 0
                        ? `${((inactiveEmployees / totalEmployees) * 100).toFixed(1)}%`
                        : "0%"}
                    </Typography>
                  </Box>
                  <Close color="error" sx={{ fontSize: 22 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                background: "linear-gradient(135deg, #fff3e0 0%, #ffcc80 100%)",
                p: 1,
                borderRadius: 2,
                boxShadow: 1,
              }}
            >
              <CardContent sx={{ p: 1 }}>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Box>
                    <Typography
                      color="text.secondary"
                      variant="caption"
                      fontWeight={500}
                    >
                      HR Personnel
                    </Typography>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      color="warning.main"
                      sx={{ lineHeight: 1 }}
                    >
                      {hrCount}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      HR Dept
                    </Typography>
                  </Box>
                  <Work color="warning" sx={{ fontSize: 22 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

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
                        page * rowsPerPage + rowsPerPage,
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
                            <Chip
                              label={employee.Role}
                              color={
                                employee.Role === "HR" ? "primary" : "default"
                              }
                              size="small"
                              variant="outlined"
                            />
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
                              {/* <Tooltip title="Edit Employee">
                              <IconButton size="small" sx={{ color: "#8d0638ff" }} onClick={() => handleOpenForm("edit", employee)}>
                                <Edit fontSize="small" />
                              </IconButton>
                            </Tooltip> */}
                              <Tooltip
                                title={
                                  employee.IsActive ? "Deactivate" : "Activate"
                                }
                              >
                                <IconButton
                                  size="small"
                                  color={
                                    employee.IsActive ? "error" : "success"
                                  }
                                  onClick={() =>
                                    handleToggleEmployeeStatus(employee)
                                  }
                                >
                                  {employee.IsActive ? (
                                    <Close fontSize="small" />
                                  ) : (
                                    <CheckCircle fontSize="small" />
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
                    label="Employee ID"
                    value={formData.EmpId}
                    onChange={(e) =>
                      setFormData({ ...formData, EmpId: e.target.value })
                    }
                    required
                    disabled
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
                {/* Yash */}
                <Grid item xs={12} md={6}>
                  <Autocomplete
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
                      <TextField {...params} label="Grade" required fullWidth />
                    )}
                  />
                </Grid>

                {/* Role */}
                <Grid item xs={12} md={6}>
                  <Autocomplete
                    options={roleOptions}
                    value={formData.Role || ""}
                    onChange={(_, newValue) =>
                      setFormData({ ...formData, Role: newValue || "" })
                    }
                    renderInput={(params) => (
                      <TextField {...params} label="Role" required fullWidth />
                    )}
                  />
                </Grid>

                {/* Week Off (Multi Select) */}
                <Grid item xs={12} md={6}>
                  <Autocomplete
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
                        label="Week Off"
                        required
                        fullWidth
                      />
                    )}
                  />
                </Grid>

                {/* Office (Multi Select with Label + Icon) */}
                <Grid item xs={12} md={6}>
  <FormControl fullWidth required>
    <InputLabel>Office</InputLabel>
    <Select
      multiple
      value={formData.OfficeId ? formData.OfficeId.split(",").map(id => id.trim()) : []}
      onChange={handleOfficeChange}
      label="Office"
      renderValue={(selected) => {
        // Get office names for the selected IDs
        const selectedOffices = offices.filter(office => 
          selected.includes(office.Id.toString())
        );
        
        if (selectedOffices.length === 0) {
          return <Typography variant="body2" color="text.secondary">Select offices...</Typography>;
        }
        
        return selectedOffices.map(office => office.OfficeName).join(", ");
      }}
      MenuProps={{
        PaperProps: {
          style: {
            maxHeight: 300,
          },
        },
      }}
    >
      {offices.map((office) => (
        <MenuItem key={office.Id} value={office.Id}>
          <Checkbox
            checked={
              formData.OfficeId 
                ? formData.OfficeId.split(",").map(id => id.trim()).includes(office.Id.toString())
                : false
            }
          />
          <ListItemText 
            primary={office.OfficeName}
            secondary={office.Address || ""}
          />
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
      </Box>{" "}
    </Box>
  );
}

export default EmployeeList;
