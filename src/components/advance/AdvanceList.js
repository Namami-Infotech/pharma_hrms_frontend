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
          <Typography variant="h5" sx={{ fontWeight: 700, color: "#111827" }}>
            Advance Payment Management
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Tooltip title="Refresh list">
            <IconButton
              onClick={fetchAdvances}
              disabled={loading}
              sx={{
                bgcolor: "#ffffff",
                border: "1px solid #e5e7eb",
                "&:hover": { bgcolor: "#f9fafb" },
              }}
            >
              <Refresh />
            </IconButton>
          </Tooltip>

          <Button
            variant="contained"
            startIcon={<Add sx={{ fontSize: "20px !important" }} />}
            onClick={() => setOpenApplyModal(true)}
            sx={{
              bgcolor: "#8d0638",
              color: "#ffffff",
              "&:hover": {
                bgcolor: "#6b042d",
                boxShadow: "0 4px 14px rgba(141,6,56,0.35)",
              },
              fontWeight: 600,
              fontSize: "0.9rem",
              textTransform: "none",
              borderRadius: 2,
              px: 2.5,
              py: 0.9,
              boxShadow: "0 2px 8px rgba(141,6,56,0.25)",
              transition: "all 0.2s ease-in-out",
            }}
          >
            Request Advance
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card
            sx={{
              borderRadius: 2.5,
              boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
              border: "1px solid #f3f4f6",
              bgcolor: "#ffffff",
            }}
          >
            <CardContent sx={{ p: 2.5, display: "flex", alignItems: "center", gap: 2 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  bgcolor: "rgba(141, 6, 56, 0.1)",
                  color: "#8d0638",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <AccountBalanceWallet sx={{ fontSize: 26 }} />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: "#6b7280", fontWeight: 600, textTransform: "uppercase" }}>
                  My Advance Requests
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: "#111827", mt: 0.3 }}>
                  {totalMyCount}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card
            sx={{
              borderRadius: 2.5,
              boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
              border: "1px solid #f3f4f6",
              bgcolor: "#ffffff",
            }}
          >
            <CardContent sx={{ p: 2.5, display: "flex", alignItems: "center", gap: 2 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  bgcolor: "rgba(245, 158, 11, 0.1)",
                  color: "#d97706",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <AssignmentTurnedIn sx={{ fontSize: 26 }} />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: "#6b7280", fontWeight: 600, textTransform: "uppercase" }}>
                  Pending RM Approvals
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: "#d97706", mt: 0.3 }}>
                  {pendingApprovalsCount}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card
            sx={{
              borderRadius: 2.5,
              boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
              border: "1px solid #f3f4f6",
              bgcolor: "#ffffff",
            }}
          >
            <CardContent sx={{ p: 2.5, display: "flex", alignItems: "center", gap: 2 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  bgcolor: "rgba(16, 185, 129, 0.1)",
                  color: "#10b981",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Paid sx={{ fontSize: 26 }} />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: "#6b7280", fontWeight: 600, textTransform: "uppercase" }}>
                  Total Approved Amount
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: "#10b981", mt: 0.3 }}>
                  ₹{approvedAdvancesTotal.toLocaleString("en-IN")}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content Card with Navigation Tabs */}
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
          border: "1px solid #e5e7eb",
          overflow: "hidden",
        }}
      >
        {/* Navigation Tabs Header */}
        <Paper
          elevation={0}
          sx={{
            borderBottom: "1px solid #e5e7eb",
            bgcolor: "#fafafa",
            px: 2,
          }}
        >
          <Tabs
            value={activeTab}
            onChange={(e, val) => setActiveTab(val)}
            indicatorColor="primary"
            textColor="primary"
            sx={{
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.95rem",
                minHeight: 52,
                px: 2.5,
              },
              "& .Mui-selected": {
                color: "#8d0638 !important",
              },
              "& .MuiTabs-indicator": {
                backgroundColor: "#8d0638",
                height: 3,
                borderRadius: "3px 3px 0 0",
              },
            }}
          >
            <Tab
              icon={<Person sx={{ fontSize: 20 }} />}
              iconPosition="start"
              label={`My Requests (${myRequests.length})`}
            />

            {canViewApprovals && (
              <Tab
                icon={<AssignmentTurnedIn sx={{ fontSize: 20 }} />}
                iconPosition="start"
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <span>Team Approvals</span>
                    {pendingApprovalsCount > 0 && (
                      <Chip
                        label={pendingApprovalsCount}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: "11px",
                          fontWeight: 700,
                          bgcolor: "#d97706",
                          color: "#ffffff",
                        }}
                      />
                    )}
                  </Box>
                }
              />
            )}
          </Tabs>
        </Paper>

        {/* Filter & Search Bar */}
        <Box
          sx={{
            p: 2.5,
            borderBottom: "1px solid #f3f4f6",
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <TextField
            size="small"
            placeholder="Search by Employee, Amount, Reason..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: "#9ca3af" }} />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: { xs: "100%", sm: 300 } }}
          />

          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="All">All Statuses</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Approved">Approved</MenuItem>
                <MenuItem value="Rejected">Rejected</MenuItem>
              </Select>
            </FormControl>
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
                    <CircularProgress size={36} sx={{ color: "#8d0638", mb: 1 }} />
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
                        <Typography variant="body2" sx={{ fontWeight: 700, color: "#8d0638" }}>
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
                            bgcolor: "rgba(141,6,56,0.06)",
                            color: "#8d0638",
                            border: "1px solid rgba(141,6,56,0.2)",
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
                            <Box sx={{ display: "flex", gap: 1 }}>
                              <Button
                                size="small"
                                variant="contained"
                                startIcon={<ThumbUp sx={{ fontSize: 16 }} />}
                                onClick={() => handleOpenActionDialog(row, "Approved")}
                                sx={{
                                  bgcolor: "#10b981",
                                  "&:hover": { bgcolor: "#059669" },
                                  textTransform: "none",
                                  fontWeight: 600,
                                  fontSize: "12px",
                                  py: 0.5,
                                  px: 1.5,
                                }}
                              >
                                Approve
                              </Button>

                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<ThumbDown sx={{ fontSize: 16 }} />}
                                onClick={() => handleOpenActionDialog(row, "Rejected")}
                                sx={{
                                  borderColor: "#ef4444",
                                  color: "#ef4444",
                                  "&:hover": { borderColor: "#dc2626", bgcolor: "#fef2f2" },
                                  textTransform: "none",
                                  fontWeight: 600,
                                  fontSize: "12px",
                                  py: 0.5,
                                  px: 1.5,
                                }}
                              >
                                Reject
                              </Button>
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
