import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Grid,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Snackbar,
  Tooltip,
} from "@mui/material";
import {
  Add,
  Refresh,
  Search,
  CheckCircle,
  Cancel,
  Pending,
  AccountBalanceWallet,
  AssignmentTurnedIn,
  Person,
  InfoOutlined,
  Paid,
  ThumbUp,
  ThumbDown,
  Check,
  Close,
  FilterList,
  TrendingUp,
} from "@mui/icons-material";
import { ADVANCE_API } from "../../api/endpoints";
import { useAuth } from "../auth/AuthContext";
import ApplyAdvanceModal from "./ApplyAdvanceModal";

const MONTH_NAMES = [
  "",
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const AdvanceList = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0); // 0: My Requests, 1: Team Approvals

  const [myRequests, setMyRequests] = useState([]);
  const [teamRequests, setTeamRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [openApplyModal, setOpenApplyModal] = useState(false);

  // Approval / Rejection dialog state
  const [actionDialog, setActionDialog] = useState({
    open: false,
    item: null,
    type: "", // 'Approved' | 'Rejected'
    remarks: "",
    submitting: false,
  });

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Notifications
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const getStoredUser = () => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch (_) {
      return {};
    }
  };
  const storedUser = getStoredUser();
  const empId = user?.emp_id || user?.EmpId || user?.empId || user?.empid || user?.id || storedUser.emp_id || storedUser.EmpId || "";
  const role = user?.role || user?.Role || storedUser.role || storedUser.Role || "";
  const isAdmin = ["Admin", "admin", "SuperAdmin"].includes(role);

  const fetchAdvances = useCallback(async () => {
    if (!empId) return;
    setLoading(true);
    setError("");

    try {
      const res = await axios.get(ADVANCE_API.GET_ADVANCES, {
        params: {
          empId,
          role,
        },
      });

      if (res.data?.success) {
        setMyRequests(res.data.myRequests || []);
        setTeamRequests(res.data.teamRequests || []);
      } else {
        setError(res.data?.message || "Failed to fetch advance requests.");
      }
    } catch (err) {
      console.error("Fetch advances error:", err);
      setError(err.response?.data?.message || err.message || "Failed to load advance requests.");
    } finally {
      setLoading(false);
    }
  }, [empId, role]);

  useEffect(() => {
    fetchAdvances();
  }, [fetchAdvances]);

  const handleOpenActionDialog = (item, type) => {
    setActionDialog({
      open: true,
      item,
      type,
      remarks: "",
      submitting: false,
    });
  };

  const handleCloseActionDialog = () => {
    setActionDialog({
      open: false,
      item: null,
      type: "",
      remarks: "",
      submitting: false,
    });
  };

  const handleConfirmAction = async () => {
    const { item, type, remarks } = actionDialog;
    if (!item) return;

    setActionDialog((prev) => ({ ...prev, submitting: true }));

    try {
      const payload = {
        id: item.id,
        status: type,
        approved_by: empId,
        role: role,
        remarks: remarks || "",
      };

      const res = await axios.post(ADVANCE_API.APPROVE_ADVANCE, payload);

      if (res.data?.success) {
        setSnackbar({
          open: true,
          message: res.data.message || `Advance request has been ${type.toLowerCase()}.`,
          severity: type === "Approved" ? "success" : "info",
        });
        handleCloseActionDialog();
        fetchAdvances();
      } else {
        setSnackbar({
          open: true,
          message: res.data?.message || `Failed to ${type.toLowerCase()} request.`,
          severity: "error",
        });
        setActionDialog((prev) => ({ ...prev, submitting: false }));
      }
    } catch (err) {
      console.error("Approve advance error:", err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || err.message || "Error processing request.",
        severity: "error",
      });
      setActionDialog((prev) => ({ ...prev, submitting: false }));
    }
  };

  const renderStatusChip = (status) => {
    const s = String(status || "").toLowerCase();
    if (s === "approved") {
      return (
        <Chip
          icon={<CheckCircle sx={{ fontSize: 16 }} />}
          label="Approved"
          size="small"
          sx={{
            bgcolor: "#ecfdf5",
            color: "#059669",
            fontWeight: 600,
            border: "1px solid #a7f3d0",
          }}
        />
      );
    }
    if (s === "rejected") {
      return (
        <Chip
          icon={<Cancel sx={{ fontSize: 16 }} />}
          label="Rejected"
          size="small"
          sx={{
            bgcolor: "#fef2f2",
            color: "#dc2626",
            fontWeight: 600,
            border: "1px solid #fecaca",
          }}
        />
      );
    }
    return (
      <Chip
        icon={<Pending sx={{ fontSize: 16 }} />}
        label="Pending"
        size="small"
        sx={{
          bgcolor: "#fffbeb",
          color: "#d97706",
          fontWeight: 600,
          border: "1px solid #fde68a",
        }}
      />
    );
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  // Determine current list to display based on active tab
  const currentList = activeTab === 0 ? myRequests : teamRequests;

  // Filter list
  const filteredList = currentList.filter((item) => {
    const matchesStatus =
      statusFilter === "All" ||
      String(item.status).toLowerCase() === statusFilter.toLowerCase();

    const term = searchTerm.toLowerCase();
    const matchesSearch =
      !term ||
      String(item.EmpId || "").toLowerCase().includes(term) ||
      String(item.employee_name || "").toLowerCase().includes(term) ||
      String(item.reason || "").toLowerCase().includes(term) ||
      String(item.amount || "").includes(term);

    return matchesStatus && matchesSearch;
  });

  // Calculate Quick Stats
  const totalMyCount = myRequests.length;
  const pendingApprovalsCount = teamRequests.filter(
    (r) => String(r.status).toLowerCase() === "pending"
  ).length;
  const approvedAdvancesTotal = (activeTab === 0 ? myRequests : teamRequests)
    .filter((r) => String(r.status).toLowerCase() === "approved")
    .reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);

  const canViewApprovals = isAdmin || teamRequests.length > 0;

  return (
    <Box sx={{ width: "100%" }}>
      {/* Top Banner / Actions Bar */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: "#0f172a", letterSpacing: -0.3 }}>
            Advance Payment Management
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b", mt: 0.4, fontSize: "0.875rem" }}>
            Manage employee advance requests, approval workflows, and deductions
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
          <Tooltip title="Refresh list">
            <IconButton
              onClick={fetchAdvances}
              disabled={loading}
              sx={{
                bgcolor: "#ffffff",
                border: "1px solid #e2e8f0",
                color: "#64748b",
                width: 40,
                height: 40,
                borderRadius: 2,
                "&:hover": { bgcolor: "#f8fafc", color: "#0f172a" },
              }}
            >
              <Refresh sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>

          <Button
            variant="contained"
            startIcon={<Add sx={{ fontSize: "20px !important" }} />}
            onClick={() => setOpenApplyModal(true)}
            sx={{
              bgcolor: "#f37021",
              color: "#ffffff",
              "&:hover": {
                bgcolor: "#d95300",
                boxShadow: "0 4px 14px rgba(243, 112, 33, 0.35)",
              },
              fontWeight: 600,
              fontSize: "0.875rem",
              textTransform: "none",
              borderRadius: 2,
              px: 2.5,
              py: 1,
              boxShadow: "0 2px 8px rgba(243, 112, 33, 0.25)",
              transition: "all 0.2s ease-in-out",
            }}
          >
            Request Advance
          </Button>
        </Box>
      </Box>

      {/* Stats Cards - Clean Minimal Style */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {/* Card 1: My Advance Requests */}
        <Grid item xs={12} sm={4}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: "0 1px 3px rgba(0,0,0,0.02), 0 2px 8px rgba(0,0,0,0.03)",
              border: "1px solid #eef2f6",
              bgcolor: "#ffffff",
              p: 2.5,
              transition: "transform 0.2s, box-shadow 0.2s",
              "&:hover": {
                boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
              },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "#64748b" }}>
              <AccountBalanceWallet sx={{ fontSize: 18, color: "#f37021" }} />
              <Typography sx={{ fontSize: "0.85rem", fontWeight: 600, color: "#64748b" }}>
                My Advance Requests
              </Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: "#0f172a", mt: 1.5, mb: 0.8, fontSize: "1.85rem" }}>
              {totalMyCount}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, fontSize: "0.78rem", fontWeight: 600, color: "#10b981" }}>
              <TrendingUp sx={{ fontSize: 15 }} />
              <span>Active requests in system</span>
            </Box>
          </Card>
        </Grid>

        {/* Card 2: Pending RM Approvals */}
        <Grid item xs={12} sm={4}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: "0 1px 3px rgba(0,0,0,0.02), 0 2px 8px rgba(0,0,0,0.03)",
              border: "1px solid #eef2f6",
              bgcolor: "#ffffff",
              p: 2.5,
              transition: "transform 0.2s, box-shadow 0.2s",
              "&:hover": {
                boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
              },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "#64748b" }}>
              <AssignmentTurnedIn sx={{ fontSize: 18, color: "#d97706" }} />
              <Typography sx={{ fontSize: "0.85rem", fontWeight: 600, color: "#64748b" }}>
                Pending RM Approvals
              </Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: "#0f172a", mt: 1.5, mb: 0.8, fontSize: "1.85rem" }}>
              {pendingApprovalsCount}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, fontSize: "0.78rem", fontWeight: 600, color: pendingApprovalsCount > 0 ? "#f59e0b" : "#10b981" }}>
              {pendingApprovalsCount > 0 ? (
                <>
                  <InfoOutlined sx={{ fontSize: 15 }} />
                  <span>Requires your attention</span>
                </>
              ) : (
                <>
                  <CheckCircle sx={{ fontSize: 15 }} />
                  <span>All caught up</span>
                </>
              )}
            </Box>
          </Card>
        </Grid>

        {/* Card 3: Total Approved Amount */}
        <Grid item xs={12} sm={4}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: "0 1px 3px rgba(0,0,0,0.02), 0 2px 8px rgba(0,0,0,0.03)",
              border: "1px solid #eef2f6",
              bgcolor: "#ffffff",
              p: 2.5,
              transition: "transform 0.2s, box-shadow 0.2s",
              "&:hover": {
                boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
              },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "#64748b" }}>
              <Paid sx={{ fontSize: 18, color: "#10b981" }} />
              <Typography sx={{ fontSize: "0.85rem", fontWeight: 600, color: "#64748b" }}>
                Total Approved Amount
              </Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: "#0f172a", mt: 1.5, mb: 0.8, fontSize: "1.85rem" }}>
              ₹{approvedAdvancesTotal.toLocaleString("en-IN")}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, fontSize: "0.78rem", fontWeight: 600, color: "#0ea5e9" }}>
              <TrendingUp sx={{ fontSize: 15 }} />
              <span>Deducted via salary slip</span>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content Card */}
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          border: "1px solid #eef2f6",
          overflow: "hidden",
          bgcolor: "#ffffff",
        }}
      >
        {/* Clean Unified Toolbar with Tabs and Inline Search/Filter */}
        <Box
          sx={{
            px: { xs: 2, sm: 2.5 },
            py: 1.2,
            borderBottom: "1px solid #f1f5f9",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          {/* Tabs */}
          <Tabs
            value={activeTab}
            onChange={(e, val) => setActiveTab(val)}
            indicatorColor="primary"
            textColor="primary"
            sx={{
              minHeight: 44,
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.9rem",
                minHeight: 44,
                px: 2,
                color: "#64748b",
              },
              "& .Mui-selected": {
                color: "#f37021 !important",
              },
              "& .MuiTabs-indicator": {
                backgroundColor: "#f37021",
                height: 2.5,
                borderRadius: "2px 2px 0 0",
              },
            }}
          >
            <Tab
              icon={<Person sx={{ fontSize: 18 }} />}
              iconPosition="start"
              label={`My Requests (${myRequests.length})`}
            />

            {canViewApprovals && (
              <Tab
                icon={<AssignmentTurnedIn sx={{ fontSize: 18 }} />}
                iconPosition="start"
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <span>Team Approvals</span>
                    {pendingApprovalsCount > 0 && (
                      <Chip
                        label={pendingApprovalsCount}
                        size="small"
                        sx={{
                          height: 19,
                          fontSize: "11px",
                          fontWeight: 700,
                          bgcolor: "#f59e0b",
                          color: "#ffffff",
                        }}
                      />
                    )}
                  </Box>
                }
              />
            )}
          </Tabs>

          {/* Clean Search and Filter Controls */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              flexWrap: "wrap",
            }}
          >
            {/* Search Input */}
            <TextField
              size="small"
              placeholder="Search by name, amount, reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: "#94a3b8", fontSize: 19 }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                width: { xs: "100%", sm: 260 },
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  bgcolor: "#f8fafc",
                  fontSize: "0.85rem",
                  height: 38,
                  transition: "all 0.2s",
                  border: "1px solid #e2e8f0",
                  "&:hover": {
                    bgcolor: "#ffffff",
                    borderColor: "#cbd5e1",
                  },
                  "&.Mui-focused": {
                    bgcolor: "#ffffff",
                    borderColor: "#f37021",
                  },
                },
                "& fieldset": {
                  border: "none",
                },
              }}
            />

            {/* Clean Status Filter */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                bgcolor: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: 2,
                px: 1.2,
                height: 38,
                transition: "all 0.2s",
                "&:hover": {
                  bgcolor: "#ffffff",
                  borderColor: "#cbd5e1",
                },
              }}
            >
              <FilterList sx={{ color: "#94a3b8", fontSize: 18, mr: 0.8 }} />
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                variant="standard"
                disableUnderline
                sx={{
                  fontSize: "0.85rem",
                  fontWeight: 500,
                  color: "#334155",
                  minWidth: 105,
                  "& .MuiSelect-select": {
                    py: 0,
                    pr: "24px !important",
                  },
                }}
              >
                <MenuItem value="All">All Statuses</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Approved">Approved</MenuItem>
                <MenuItem value="Rejected">Rejected</MenuItem>
              </Select>
            </Box>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ m: 2.5 }}>
            {error}
          </Alert>
        )}

        {/* Table Content */}
        <TableContainer>
          <Table sx={{ minWidth: 750 }}>
            <TableHead sx={{ bgcolor: "#f9fafb" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: "#374151", py: 1.8 }}>#</TableCell>
                {activeTab === 1 && (
                  <TableCell sx={{ fontWeight: 700, color: "#374151" }}>Employee</TableCell>
                )}
                <TableCell sx={{ fontWeight: 700, color: "#374151" }}>Amount</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#374151" }}>Month</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#374151" }}>Reason</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#374151" }}>Applied On</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#374151" }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#374151" }}>
                  {activeTab === 1 ? "RM Action" : "Approval Details"}
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={activeTab === 1 ? 8 : 7} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={36} sx={{ color: "#f37021", mb: 1 }} />
                    <Typography variant="body2" sx={{ color: "#6b7280" }}>
                      Loading advance requests...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : filteredList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={activeTab === 1 ? 8 : 7} align="center" sx={{ py: 6 }}>
                    <InfoOutlined sx={{ fontSize: 44, color: "#9ca3af", mb: 1 }} />
                    <Typography variant="body1" sx={{ fontWeight: 600, color: "#4b5563" }}>
                      No advance requests found
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#6b7280" }}>
                      {activeTab === 0
                        ? "You haven't submitted any advance payment requests yet."
                        : "No subordinate advance requests awaiting your action."}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredList.map((row, index) => {
                  const isPending = String(row.status).toLowerCase() === "pending";
                  const deductionPeriod = `${MONTH_NAMES[row.deduction_month] || row.deduction_month} ${row.deduction_year}`;

                  return (
                    <TableRow
                      key={row.id}
                      hover
                      sx={{
                        "&:last-child td, &:last-child th": { border: 0 },
                        transition: "background-color 0.2s",
                      }}
                    >
                      <TableCell sx={{ fontWeight: 600, color: "#111827" }}>
                        #{index + 1}
                      </TableCell>

                      {/* Employee details (Only in Team Approvals Tab) */}
                      {activeTab === 1 && (
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: "#111827" }}>
                            {row.employee_name || row.EmpId}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "#6b7280", display: "block" }}>
                            ID: {row.EmpId} {row.designation ? `• ${row.designation}` : ""}
                          </Typography>
                        </TableCell>
                      )}

                      {/* Amount */}
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: "#f37021" }}>
                          ₹{parseFloat(row.amount || 0).toLocaleString("en-IN")}
                        </Typography>
                      </TableCell>

                      {/* Deduction Month */}
                      <TableCell>
                        <Chip
                          label={deductionPeriod}
                          size="small"
                          sx={{
                            fontWeight: 600,
                            bgcolor: "rgba(243, 112, 33,0.06)",
                            color: "#f37021",
                            border: "1px solid rgba(243, 112, 33,0.2)",
                          }}
                        />
                      </TableCell>

                      {/* Reason */}
                      <TableCell sx={{ maxWidth: 220 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            color: "#374151",
                            whiteSpace: "normal",
                            wordBreak: "break-word",
                          }}
                        >
                          {row.reason}
                        </Typography>
                      </TableCell>

                      {/* Applied On */}
                      <TableCell sx={{ color: "#6b7280", fontSize: "13px" }}>
                        {formatDate(row.created_at)}
                      </TableCell>

                      {/* Status */}
                      <TableCell>{renderStatusChip(row.status)}</TableCell>

                      {/* Action / Approval Details Column */}
                      <TableCell>
                        {activeTab === 1 ? (
                          isPending ? (
                            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                              <Tooltip title="Approve Request" arrow>
                                <IconButton
                                  size="small"
                                  onClick={() => handleOpenActionDialog(row, "Approved")}
                                  sx={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: "50%",
                                    bgcolor: "rgba(16, 185, 129, 0.12)",
                                    color: "#059669",
                                    border: "1px solid rgba(16, 185, 129, 0.25)",
                                    transition: "all 0.2s ease-in-out",
                                    "&:hover": {
                                      bgcolor: "#10b981",
                                      color: "#ffffff",
                                      boxShadow: "0 2px 8px rgba(16, 185, 129, 0.35)",
                                      transform: "scale(1.08)",
                                    },
                                  }}
                                >
                                  <Check sx={{ fontSize: 18 }} />
                                </IconButton>
                              </Tooltip>

                              <Tooltip title="Reject Request" arrow>
                                <IconButton
                                  size="small"
                                  onClick={() => handleOpenActionDialog(row, "Rejected")}
                                  sx={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: "50%",
                                    bgcolor: "rgba(239, 68, 68, 0.1)",
                                    color: "#dc2626",
                                    border: "1px solid rgba(239, 68, 68, 0.25)",
                                    transition: "all 0.2s ease-in-out",
                                    "&:hover": {
                                      bgcolor: "#ef4444",
                                      color: "#ffffff",
                                      boxShadow: "0 2px 8px rgba(239, 68, 68, 0.35)",
                                      transform: "scale(1.08)",
                                    },
                                  }}
                                >
                                  <Close sx={{ fontSize: 18 }} />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          ) : (
                            <Box>
                              <Typography variant="caption" sx={{ color: "#374151", fontWeight: 600, display: "block" }}>
                                {row.approver_name ? `By: ${row.approver_name}` : `By: ${row.approved_by || "Admin"}`}
                              </Typography>
                              <Typography variant="caption" sx={{ color: "#9ca3af", display: "block" }}>
                                {formatDate(row.approval_date)}
                              </Typography>
                            </Box>
                          )
                        ) : (
                          /* My Requests Tab: Details */
                          <Box>
                            {row.approved_by ? (
                              <>
                                <Typography variant="caption" sx={{ color: "#374151", fontWeight: 600, display: "block" }}>
                                  {row.approver_name ? `Action by: ${row.approver_name}` : `Action by: ${row.approved_by}`}
                                </Typography>
                                <Typography variant="caption" sx={{ color: "#9ca3af", display: "block" }}>
                                  Date: {formatDate(row.approval_date)}
                                </Typography>
                              </>
                            ) : (
                              <Typography variant="caption" sx={{ color: "#9ca3af", fontStyle: "italic" }}>
                                Awaiting RM Review
                              </Typography>
                            )}
                            {row.remarks && (
                              <Typography variant="caption" sx={{ color: "#4b5563", display: "block", fontStyle: "italic" }}>
                                Note: {row.remarks}
                              </Typography>
                            )}
                          </Box>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Apply Advance Request Modal */}
      <ApplyAdvanceModal
        open={openApplyModal}
        onClose={() => setOpenApplyModal(false)}
        onSuccess={(msg) => {
          setSnackbar({
            open: true,
            message: msg || "Advance payment request submitted successfully.",
            severity: "success",
          });
          fetchAdvances();
        }}
      />

      {/* RM Approval / Rejection Confirmation Dialog */}
      <Dialog
        open={actionDialog.open}
        onClose={actionDialog.submitting ? undefined : handleCloseActionDialog}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2.5 } }}
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
            color: actionDialog.type === "Approved" ? "#059669" : "#dc2626",
            pb: 1,
          }}
        >
          {actionDialog.type === "Approved"
            ? "Approve Advance Payment Request"
            : "Reject Advance Payment Request"}
        </DialogTitle>

        <DialogContent sx={{ pt: 1.5 }}>
          {actionDialog.item && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ color: "#374151", mb: 0.5 }}>
                Employee: <strong>{actionDialog.item.employee_name || actionDialog.item.EmpId}</strong>
              </Typography>
              <Typography variant="body2" sx={{ color: "#374151", mb: 0.5 }}>
                Requested Amount: <strong>₹{parseFloat(actionDialog.item.amount || 0).toLocaleString("en-IN")}</strong>
              </Typography>
              <Typography variant="body2" sx={{ color: "#374151", mb: 1.5 }}>
                Deduction Month:{" "}
                <strong>
                  {MONTH_NAMES[actionDialog.item.deduction_month]} {actionDialog.item.deduction_year}
                </strong>
              </Typography>

              {actionDialog.type === "Approved" ? (
                <Alert severity="success" sx={{ mb: 2, fontSize: "12px" }}>
                  Once approved, ₹{actionDialog.item.amount} will be automatically deducted from this employee's Salary Slip for{" "}
                  {MONTH_NAMES[actionDialog.item.deduction_month]} {actionDialog.item.deduction_year}.
                </Alert>
              ) : (
                <Alert severity="warning" sx={{ mb: 2, fontSize: "12px" }}>
                  Are you sure you want to reject this advance payment request?
                </Alert>
              )}
            </Box>
          )}

          <TextField
            fullWidth
            size="small"
            label="Remarks / Note (Optional)"
            placeholder="Add any comments or remarks for the employee..."
            value={actionDialog.remarks}
            onChange={(e) =>
              setActionDialog((prev) => ({ ...prev, remarks: e.target.value }))
            }
            multiline
            rows={2}
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            onClick={handleCloseActionDialog}
            disabled={actionDialog.submitting}
            sx={{ color: "#6b7280", textTransform: "none", fontWeight: 600 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={actionDialog.submitting}
            onClick={handleConfirmAction}
            sx={{
              bgcolor: actionDialog.type === "Approved" ? "#10b981" : "#ef4444",
              "&:hover": {
                bgcolor: actionDialog.type === "Approved" ? "#059669" : "#dc2626",
              },
              textTransform: "none",
              fontWeight: 600,
              px: 2.5,
            }}
          >
            {actionDialog.submitting ? "Processing..." : `Confirm ${actionDialog.type}`}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar Alert */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: "100%", borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdvanceList;
