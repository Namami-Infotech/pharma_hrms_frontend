import React, { useState } from "react";
import axios from "axios";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Typography,
  Box,
  Alert,
  CircularProgress,
  InputAdornment,
} from "@mui/material";
import {
  AccountBalanceWallet,
  CalendarMonth,
  Close,
  Send,
} from "@mui/icons-material";
import { ADVANCE_API } from "../../api/endpoints";
import { useAuth } from "../auth/AuthContext";


const ApplyAdvanceModal = ({ open, onClose, onSuccess }) => {
  const { user } = useAuth();
  const now = new Date();
  const nextMonthDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const defaultYear = nextMonthDate.getFullYear();
  const defaultMonth = String(nextMonthDate.getMonth() + 1).padStart(2, "0");
  const defaultMonthYear = `${defaultYear}-${defaultMonth}`;
  const minMonthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const [formData, setFormData] = useState({
    amount: "",
    monthYear: defaultMonthYear,
    reason: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const amt = parseFloat(formData.amount);
    if (!amt || amt <= 0) {
      setError("Please enter a valid advance payment amount (greater than 0).");
      return;
    }

    if (!formData.reason || !formData.reason.trim()) {
      setError("Please provide a reason or purpose for the advance payment request.");
      return;
    }

    const [yearStr, monthStr] = (formData.monthYear || "").split("-");
    const deductionMonth = parseInt(monthStr, 10);
    const deductionYear = parseInt(yearStr, 10);

    if (!deductionMonth || !deductionYear) {
      setError("Please select a valid deduction month and year.");
      return;
    }

    let empId = user?.emp_id || user?.EmpId || user?.empId || user?.empid || user?.id || "";
    let tenantId = user?.tenent_id || user?.Tenent_Id || 1;

    if (!empId) {
      try {
        const stored = JSON.parse(localStorage.getItem("user") || "{}");
        empId = stored.emp_id || stored.EmpId || stored.empId || stored.empid || stored.id || "";
        if (!tenantId || tenantId === 1) {
          tenantId = stored.tenent_id || stored.Tenent_Id || 1;
        }
      } catch (_) {}
    }

    if (!empId) {
      setError("Unable to identify logged-in employee ID. Please re-login.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload = {
        empId,
        emp_id: empId,
        amount: amt,
        deductionMonth,
        deductionYear,
        reason: formData.reason.trim(),
        Tenent_Id: tenantId,
      };

      const res = await axios.post(ADVANCE_API.APPLY_ADVANCE, payload);

      if (res.data?.success) {
        onSuccess(res.data.message || "Advance payment request submitted successfully.");
        handleClose();
      } else {
        setError(res.data?.message || "Failed to submit advance request.");
      }
    } catch (err) {
      console.error("Apply advance error:", err);
      setError(err.response?.data?.message || err.message || "Network error submitting advance request.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      amount: "",
      monthYear: defaultMonthYear,
      reason: "",
    });
    setError("");
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2.5,
          overflow: "hidden",
        },
      }}
    >
      {/* Dialog Header */}
      <DialogTitle
        sx={{
          bgcolor: "#f37021",
          color: "#ffffff",
          py: 2,
          px: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
          <AccountBalanceWallet sx={{ fontSize: 26 }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Request Advance Payment
          </Typography>
        </Box>
        <Button
          onClick={handleClose}
          disabled={loading}
          sx={{
            minWidth: "auto",
            p: 0.5,
            color: "#ffffff",
            "&:hover": { bgcolor: "rgba(255,255,255,0.15)" },
          }}
        >
          <Close />
        </Button>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ p: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2.5, borderRadius: 1.5 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={2.5}>
            {/* Advance Amount */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Advance Amount (₹)"
                name="amount"
                type="number"
                value={formData.amount}
                onChange={handleChange}
                placeholder="e.g. 5000"
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Typography sx={{ fontWeight: "bold", color: "#f37021" }}>₹</Typography>
                    </InputAdornment>
                  ),
                }}
                helperText="Enter the total advance amount you wish to request"
              />
            </Grid>

            {/* Deduction Month & Year Combined Picker */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                type="month"
                label="Deduction Month & Year"
                name="monthYear"
                value={formData.monthYear}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                inputProps={{
                  min: minMonthYear,
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarMonth sx={{ fontSize: 20, color: "#f37021" }} />
                    </InputAdornment>
                  ),
                }}
                helperText="Select the month & year when this advance should be deducted from your salary"
              />
            </Grid>

            {/* Reason */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Reason / Purpose"
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                placeholder="Explain the purpose of this advance payment request..."
                required
                helperText="Provide sufficient reason for faster approval by your RM"
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, borderTop: "1px solid #e5e7eb", bgcolor: "#f9fafb" }}>
          <Button
            onClick={handleClose}
            disabled={loading}
            sx={{
              color: "#6b7280",
              fontWeight: 600,
              textTransform: "none",
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <Send />}
            sx={{
              bgcolor: "#f37021",
              "&:hover": { bgcolor: "#d95300" },
              fontWeight: 600,
              textTransform: "none",
              px: 3,
            }}
          >
            {loading ? "Submitting..." : "Submit Request"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ApplyAdvanceModal;
