"use client";
import React, { useState, useEffect } from "react";
import { BASE_URL } from "../../api/endpoints";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Avatar,
  IconButton,
  Alert,
  CircularProgress,
  Divider,
  useTheme,
  InputAdornment,
  Stack,
  Fade,
} from "@mui/material";
import {
  Close,
  CalendarToday,
  Person,
  Description,
  Category,
  EventAvailable,
  Send,
  Preview,
  AccessTime,
  CheckCircle,
  Warning,
  Info,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useAuth } from "../auth/AuthContext";

// Allowed legitimate leave types definition
const VALID_LEAVE_TYPES = [
  { key: "SL", label: "Sick Leave (SL)" },
  { key: "EL", label: "Earned Leave (EL)" },
  { key: "CL", label: "Casual Leave (CL)" },
  { key: "PL", label: "Privilege Leave (PL)" },
  { key: "BL", label: "Bereavement Leave (BL)" },
  { key: "CompOff", label: "Comp Off" },
  { key: "HalfDay", label: "Half Day" },
  { key: "LWP", label: "Leave Without Pay (LWP)" },
];

// Compact Leave Balance Card
const LeaveBalanceCard = ({ category, balance, isSelected, onClick, value }) => {
  const theme = useTheme();
  const isSpecial = value === "HalfDay" || value === "LWP";

  const getBalanceColor = () => {
    if (isSpecial) return theme.palette.info.main;
    if (balance === 0) return theme.palette.error.main;
    if (balance <= 2) return theme.palette.warning.main;
    return theme.palette.success.main;
  };

  const getBalanceIcon = () => {
    if (isSpecial) return <Info fontSize="small" />;
    if (balance === 0) return <Warning fontSize="small" />;
    if (balance <= 2) return <Info fontSize="small" />;
    return <CheckCircle fontSize="small" />;
  };

  return (
    <Card
      component={motion.div}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      sx={{
        cursor: "pointer",
        border: isSelected ? "2px solid #8d0638ff" : `1px solid ${theme.palette.divider}`,
        bgcolor: isSelected ? "rgba(141, 6, 56, 0.05)" : "background.paper",
        borderRadius: 2,
        opacity: !isSpecial && balance === 0 ? 0.7 : 1,
        transition: "all 0.2s ease",
        "&:hover": {
          boxShadow: theme.shadows[3],
        },
      }}
    >
      <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box>
            <Typography variant="body2" fontWeight="700" sx={{ color: isSelected ? "#8d0638ff" : "text.primary" }}>
              {category}
            </Typography>
            <Typography variant="caption" color={getBalanceColor()} fontWeight="bold">
              {isSpecial ? "Always Available" : `${balance} day${balance !== 1 ? "s" : ""}`}
            </Typography>
          </Box>
          <Avatar sx={{ width: 28, height: 28, bgcolor: `${getBalanceColor()}20`, color: getBalanceColor() }}>
            {getBalanceIcon()}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );
};

// Leave Preview Component
const LeavePreview = ({ leaveDetails, categories, totalDays }) => {
  const theme = useTheme();
  const selectedCategory = categories.find((cat) => cat.value === leaveDetails.category);

  return (
    <Card sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
      <Box
        sx={{
          bgcolor: "#8d0638ff",
          color: "white",
          p: 2,
          display: "flex",
          alignItems: "center",
        }}
      >
        <Preview sx={{ mr: 1 }} />
        <Typography variant="h6">Application Summary</Typography>
      </Box>
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
              <Person fontSize="small" sx={{ mr: 1, color: "text.secondary" }} />
              <Typography variant="caption" color="text.secondary">
                EMPLOYEE ID
              </Typography>
            </Box>
            <Typography variant="body2" fontWeight="bold">
              {leaveDetails.empid || "Not specified"}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
              <Category fontSize="small" sx={{ mr: 1, color: "text.secondary" }} />
              <Typography variant="caption" color="text.secondary">
                LEAVE TYPE
              </Typography>
            </Box>
            <Chip
              label={selectedCategory?.label || leaveDetails.category || "Not selected"}
              color={leaveDetails.category ? "primary" : "default"}
              size="small"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
              <CalendarToday fontSize="small" sx={{ mr: 1, color: "text.secondary" }} />
              <Typography variant="caption" color="text.secondary">
                DURATION
              </Typography>
            </Box>
            <Typography variant="body2" fontWeight="bold">
              {totalDays} day{totalDays !== 1 ? "s" : ""}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
              <CalendarToday fontSize="small" sx={{ mr: 1, color: "text.secondary" }} />
              <Typography variant="caption" color="text.secondary">
                DATES
              </Typography>
            </Box>
            <Typography variant="body2">
              {leaveDetails.startDate} to {leaveDetails.endDate}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
              <Description fontSize="small" sx={{ mr: 1, color: "text.secondary" }} />
              <Typography variant="caption" color="text.secondary">
                REASON
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ fontStyle: leaveDetails.reason ? "normal" : "italic" }}>
              {leaveDetails.reason || "No reason provided"}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

function ApplyLeave({ open, onClose, onLeaveApplied }) {
  const { user } = useAuth();
  const theme = useTheme();

  const [leaveDetails, setLeaveDetails] = useState({
    empid: user?.emp_id || user?.EmpId || "",
    startDate: "",
    endDate: "",
    reason: "",
    status: "Pending",
    category: "",
  });

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    const currentEmpId = user?.emp_id || user?.EmpId;
    if (currentEmpId && open) {
      setLeaveDetails((prev) => ({
        ...prev,
        empid: currentEmpId,
      }));
      fetchLeaveBalances(currentEmpId);
    }
  }, [user, open]);

  const fetchLeaveBalances = async (empIdToFetch) => {
    try {
      setLoadingCategories(true);
      setError("");
      const response = await axios.get(
        `${BASE_URL}/leave/balance_leave.php?empid=${empIdToFetch}`
      );
      if (response.data.success) {
        const data = response.data.data || {};
        const availableCategories = VALID_LEAVE_TYPES.map((vt) => {
          let bal = 0;
          if (vt.key === "HalfDay" || vt.key === "LWP") {
            bal = 99; // Unlimited
          } else {
            bal = parseFloat(data[vt.key] ?? data[vt.key.toLowerCase()] ?? data[vt.key.toUpperCase()] ?? 0);
          }
          return {
            label: vt.label,
            value: vt.key,
            balance: isNaN(bal) ? 0 : bal,
          };
        });

        setCategories(availableCategories);

        // Pre-select first category that has positive balance
        const firstAvailable = availableCategories.find((c) => c.balance > 0);
        if (firstAvailable) {
          setLeaveDetails((prev) => ({
            ...prev,
            category: prev.category || firstAvailable.value,
          }));
        }
      } else {
        setError(response.data.message || "Failed to load leave balance");
      }
    } catch (err) {
      setError("Error fetching leave balances: " + err.message);
    } finally {
      setLoadingCategories(false);
    }
  };

  const calculateDays = () => {
    if (!leaveDetails.startDate || !leaveDetails.endDate) return 0;
    const start = new Date(leaveDetails.startDate);
    const end = new Date(leaveDetails.endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return 0;
    return Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
  };

  const handleChange = (field, value) => {
    setLeaveDetails((prev) => {
      const updated = { ...prev, [field]: value };
      // Auto-set end date if start date is changed and end date was empty or earlier than start date
      if (field === "startDate" && value) {
        if (!prev.endDate || new Date(prev.endDate) < new Date(value)) {
          updated.endDate = value;
        }
      }
      return updated;
    });

    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: "" }));
    }
    setError("");
  };

  const validateForm = () => {
    const errors = {};

    if (!leaveDetails.category) {
      errors.category = "Please select a leave category from above.";
    }

    if (!leaveDetails.startDate) {
      errors.startDate = "Start date is required.";
    }

    if (!leaveDetails.endDate) {
      errors.endDate = "End date is required.";
    }

    if (leaveDetails.startDate && leaveDetails.endDate) {
      if (new Date(leaveDetails.endDate) < new Date(leaveDetails.startDate)) {
        errors.endDate = "End date cannot be before start date.";
      }
    }

    if (!leaveDetails.reason || !leaveDetails.reason.trim()) {
      errors.reason = "Please enter reason for leave.";
    }

    // Check balance if not LWP or HalfDay
    const days = calculateDays();
    if (leaveDetails.category && leaveDetails.category !== "LWP" && leaveDetails.category !== "HalfDay") {
      const selectedCategory = categories.find((cat) => cat.value === leaveDetails.category);
      if (selectedCategory && days > selectedCategory.balance) {
        errors.category = `Insufficient balance. Available ${selectedCategory.label}: ${selectedCategory.balance} day(s), Requested: ${days} day(s).`;
      }
    }

    setValidationErrors(errors);
    if (Object.keys(errors).length > 0) {
      const firstErrorMessage = Object.values(errors)[0];
      setError(firstErrorMessage);
      return false;
    }

    setError("");
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    const currentEmpId = leaveDetails.empid || user?.emp_id || user?.EmpId;
    if (!currentEmpId) {
      setError("User authentication error: Employee ID missing.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const payload = {
        empid: currentEmpId,
        startDate: leaveDetails.startDate,
        endDate: leaveDetails.endDate,
        category: leaveDetails.category,
        reason: leaveDetails.reason,
        status: "Pending",
        Tenent_Id: user?.tenent_id || 1,
      };

      const response = await axios.post(`${BASE_URL}/leave/apply_leave.php`, payload);

      if (response.data.success) {
        onLeaveApplied();
        handleClose();
      } else {
        setError(response.data.message || "Failed to apply for leave.");
      }
    } catch (err) {
      console.error("Error applying leave:", err);
      setError("Error applying for leave: " + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setLeaveDetails({
      empid: user?.emp_id || user?.EmpId || "",
      startDate: "",
      endDate: "",
      reason: "",
      status: "Pending",
      category: "",
    });
    setError("");
    setValidationErrors({});
    setShowPreview(false);
    onClose();
  };

  const totalDays = calculateDays();

  return (
    <Dialog
      open={open}
      onClose={handleClose}
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
          p: 2.5,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <EventAvailable sx={{ mr: 1 }} />
          <Typography variant="h6" fontWeight="bold">
            Apply for Leave
          </Typography>
        </Box>
        <IconButton onClick={handleClose} sx={{ color: "white" }}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2.5 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        <Grid container spacing={2.5}>
          {/* Form Section */}
          <Grid item xs={12} md={showPreview ? 6 : 12}>
            <Stack spacing={2.5}>
              <TextField
                label="Employee ID"
                value={leaveDetails.empid}
                variant="outlined"
                size="small"
                fullWidth
                disabled
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person color="action" />
                    </InputAdornment>
                  ),
                }}
              />

              {/* Leave Balance Cards Grid */}
              <Box>
                <Typography variant="subtitle2" fontWeight="700" color="text.secondary" gutterBottom sx={{ display: "flex", alignItems: "center" }}>
                  <Category sx={{ mr: 0.8, fontSize: "1.1rem", color: "#8d0638ff" }} />
                  Select Leave Category & View Balance:
                </Typography>
                {loadingCategories ? (
                  <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
                    <CircularProgress size={28} />
                  </Box>
                ) : (
                  <Grid container spacing={1.5}>
                    {categories.map((category) => (
                      <Grid item xs={6} sm={4} md={3} key={category.value}>
                        <LeaveBalanceCard
                          category={category.label}
                          balance={category.balance}
                          value={category.value}
                          isSelected={leaveDetails.category === category.value}
                          onClick={() => handleChange("category", category.value)}
                        />
                      </Grid>
                    ))}
                  </Grid>
                )}
                {validationErrors.category && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, display: "block", fontWeight: 600 }}>
                    {validationErrors.category}
                  </Typography>
                )}
              </Box>

              {/* Date Pickers (Native, reliable) */}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    type="date"
                    label="Start Date"
                    fullWidth
                    size="small"
                    value={leaveDetails.startDate}
                    onChange={(e) => handleChange("startDate", e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    error={!!validationErrors.startDate}
                    helperText={validationErrors.startDate}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    type="date"
                    label="End Date"
                    fullWidth
                    size="small"
                    value={leaveDetails.endDate}
                    onChange={(e) => handleChange("endDate", e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    error={!!validationErrors.endDate}
                    helperText={validationErrors.endDate}
                  />
                </Grid>
              </Grid>

              {totalDays > 0 && (
                <Box sx={{ p: 1.5, bgcolor: "rgba(141, 6, 56, 0.08)", borderRadius: 1.5 }}>
                  <Typography variant="body2" color="#8d0638ff" fontWeight="600" sx={{ display: "flex", alignItems: "center" }}>
                    <AccessTime sx={{ mr: 1, fontSize: "1.1rem" }} />
                    Total leave duration: {totalDays} day{totalDays !== 1 ? "s" : ""}
                  </Typography>
                </Box>
              )}

              <TextField
                label="Reason for Leave"
                value={leaveDetails.reason}
                onChange={(e) => handleChange("reason", e.target.value)}
                variant="outlined"
                fullWidth
                multiline
                rows={3}
                placeholder="Please enter the reason for your leave application..."
                error={!!validationErrors.reason}
                helperText={validationErrors.reason || "Provide a detailed reason"}
              />
            </Stack>
          </Grid>

          {/* Preview Section */}
          <AnimatePresence>
            {showPreview && (
              <Grid item xs={12} md={6}>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.25 }}
                >
                  <LeavePreview
                    leaveDetails={leaveDetails}
                    categories={categories}
                    totalDays={totalDays}
                  />
                </motion.div>
              </Grid>
            )}
          </AnimatePresence>
        </Grid>
      </DialogContent>

      <DialogActions
        sx={{
          p: 2.5,
          bgcolor: "#f9fafb",
          borderTop: "1px solid #e5e7eb",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Button
          variant="outlined"
          size="small"
          startIcon={<Preview />}
          onClick={() => setShowPreview(!showPreview)}
          sx={{ textTransform: "none" }}
        >
          {showPreview ? "Hide Preview" : "Show Preview"}
        </Button>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button onClick={handleClose} variant="outlined" size="small" disabled={submitting} sx={{ textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            size="small"
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <Send />}
            sx={{
              bgcolor: "#8d0638ff",
              color: "white",
              fontWeight: 600,
              textTransform: "none",
              px: 2.5,
              "&:hover": {
                bgcolor: "#6d0430ff",
              },
            }}
          >
            {submitting ? "Submitting..." : "Submit Application"}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}

export default ApplyLeave;
