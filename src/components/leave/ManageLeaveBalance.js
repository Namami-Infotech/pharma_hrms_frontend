import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Box,
  Typography,
  MenuItem,
  CircularProgress,
  Alert,
  IconButton,
  Card,
  CardContent,
  Divider,
} from "@mui/material";
import { Close, AccountBalanceWallet, Save, Refresh } from "@mui/icons-material";
import axios from "axios";
import { BASE_URL } from "../../api/endpoints";
import { useAuth } from "../auth/AuthContext";

const LEAVE_TYPES = [
  { key: "CL", label: "Casual Leave (CL)", color: "#2563eb", desc: "Short-notice personal leaves" },
  { key: "SL", label: "Sick Leave (SL)", color: "#059669", desc: "Medical / sickness leaves" },
  { key: "EL", label: "Earned Leave (EL)", color: "#d97706", desc: "Earned or accrued annual leave" },
  { key: "PL", label: "Privilege Leave (PL)", color: "#7c3aed", desc: "Planned vacation leaves" },
  { key: "BL", label: "Bereavement Leave (BL)", color: "#dc2626", desc: "Compassionate bereavement leaves" },
  { key: "CompOff", label: "Comp Off", color: "#0891b2", desc: "Compensatory days off" },
];

export default function ManageLeaveBalance({ open, onClose, employees = [], onUpdated }) {
  const { user } = useAuth();
  const [selectedEmpId, setSelectedEmpId] = useState("");
  const [balances, setBalances] = useState({
    CL: 0,
    SL: 0,
    EL: 0,
    PL: 0,
    BL: 0,
    CompOff: 0,
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    if (open) {
      setMessage({ text: "", type: "" });
      if (employees.length > 0 && !selectedEmpId) {
        setSelectedEmpId(employees[0].EmpId || employees[0].empid || "");
      }
    }
  }, [open, employees]);

  useEffect(() => {
    if (selectedEmpId && open) {
      fetchEmployeeBalance(selectedEmpId);
    }
  }, [selectedEmpId, open]);

  const fetchEmployeeBalance = async (empid) => {
    setLoading(true);
    setMessage({ text: "", type: "" });
    try {
      const res = await axios.get(`${BASE_URL}/leave/balance_leave.php`, {
        params: { empid, Tenent_Id: user?.tenent_id || 1 },
      });

      if (res.data?.success && res.data?.data) {
        const d = res.data.data;
        setBalances({
          CL: parseFloat(d.CL ?? d.cl ?? 0),
          SL: parseFloat(d.SL ?? d.sl ?? 0),
          EL: parseFloat(d.EL ?? d.el ?? 0),
          PL: parseFloat(d.PL ?? d.pl ?? 0),
          BL: parseFloat(d.BL ?? d.bl ?? 0),
          CompOff: parseFloat(d.CompOff ?? d.compoff ?? 0),
        });
      } else {
        setBalances({ CL: 0, SL: 0, EL: 0, PL: 0, BL: 0, CompOff: 0 });
      }
    } catch (err) {
      console.error("Error fetching balance:", err);
      setMessage({ text: "Failed to load balance for this employee.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key, value) => {
    const num = Math.max(0, parseFloat(value) || 0);
    setBalances((prev) => ({ ...prev, [key]: num }));
  };

  const handleSave = async () => {
    if (!selectedEmpId) {
      setMessage({ text: "Please select an employee.", type: "error" });
      return;
    }

    setSaving(true);
    setMessage({ text: "", type: "" });
    try {
      const payload = {
        empid: selectedEmpId,
        SL: balances.SL,
        EL: balances.EL,
        CL: balances.CL,
        PL: balances.PL,
        BL: balances.BL,
        CompOff: balances.CompOff,
        Tenent_Id: user?.tenent_id || 1,
      };

      const res = await axios.post(`${BASE_URL}/leave/update_balance.php`, payload);
      if (res.data?.success) {
        setMessage({ text: "Leave balance updated successfully!", type: "success" });
        if (onUpdated) onUpdated();
      } else {
        setMessage({ text: res.data?.message || "Failed to update balance.", type: "error" });
      }
    } catch (err) {
      console.error("Error updating leave balance:", err);
      setMessage({ text: err.response?.data?.message || "Server error while updating.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          bgcolor: "#8d0638ff",
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          py: 1.5,
          px: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <AccountBalanceWallet fontSize="small" />
          <Typography variant="h6" fontWeight="bold">
            Manage Employee Leave Balance
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: "white" }}>
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3, bgcolor: "#f8fafc" }}>
        {message.text && (
          <Alert severity={message.type} sx={{ mb: 2 }} onClose={() => setMessage({ text: "", type: "" })}>
            {message.text}
          </Alert>
        )}

        {/* Employee Selector */}
        <Card sx={{ mb: 3, borderRadius: 2, border: "1px solid #e2e8f0" }}>
          <CardContent sx={{ p: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={8}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Select Employee"
                  value={selectedEmpId}
                  onChange={(e) => setSelectedEmpId(e.target.value)}
                  disabled={loading || saving}
                >
                  {employees.map((emp) => {
                    const id = emp.EmpId || emp.empid || emp.id;
                    const name = emp.Name || emp.name || `${emp.first_name || ""} ${emp.last_name || ""}`.trim() || id;
                    return (
                      <MenuItem key={id} value={id}>
                        {name} ({id})
                      </MenuItem>
                    );
                  })}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={() => fetchEmployeeBalance(selectedEmpId)}
                  disabled={loading || !selectedEmpId}
                  size="medium"
                  fullWidth
                >
                  Refresh Balance
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Leave Allocation Cards */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
            <CircularProgress size={40} sx={{ color: "#8d0638ff" }} />
          </Box>
        ) : (
          <Box>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5, fontWeight: 600 }}>
              Adjust Available Balance (Days) for Selected Employee:
            </Typography>
            <Grid container spacing={2}>
              {LEAVE_TYPES.map((lt) => (
                <Grid item xs={12} sm={6} md={4} key={lt.key}>
                  <Card
                    sx={{
                      borderRadius: 2,
                      borderLeft: `4px solid ${lt.color}`,
                      boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                    }}
                  >
                    <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                      <Typography variant="body2" fontWeight="bold" sx={{ color: lt.color, mb: 0.5 }}>
                        {lt.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1.5 }}>
                        {lt.desc}
                      </Typography>
                      <TextField
                        type="number"
                        size="small"
                        fullWidth
                        inputProps={{ min: 0, step: 0.5 }}
                        value={balances[lt.key] ?? 0}
                        onChange={(e) => handleChange(lt.key, e.target.value)}
                        disabled={saving}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 2, px: 3, bgcolor: "#fff", display: "flex", justifyContent: "flex-end", gap: 1 }}>
        <Button onClick={onClose} variant="outlined" color="inherit" disabled={saving}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <Save />}
          disabled={saving || loading || !selectedEmpId}
          sx={{
            bgcolor: "#8d0638ff",
            color: "white",
            "&:hover": { bgcolor: "#6d0430ff" },
            px: 3,
          }}
        >
          {saving ? "Saving..." : "Save Leave Balance"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
