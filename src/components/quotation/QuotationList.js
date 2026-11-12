"use client";

import React, { useState, useEffect } from "react";
import { BASE_URL } from "../../api/endpoints";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Avatar,
  TablePagination,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import {
  Add,
  Search,
  Visibility,
  Edit,
  Delete,
  RequestQuote,
  CheckCircle,
  HourglassEmpty,
  Cancel,
  Refresh,
  Receipt,
  Schedule,
} from "@mui/icons-material";
import axios from "axios";
import { useAuth } from "../auth/AuthContext";
import QuotationModal from "./QuotationModal";
import QuotationSlip from "./QuotationSlip";

// Stat Card component matching HRMS theme
const StatCard = ({ title, value, color, icon, subtitle }) => {
  return (
    <Card
      sx={{
        height: "100%",
        borderLeft: `4px solid ${color}`,
        background: `linear-gradient(135deg, ${alpha(color, 0.08)} 0%, ${alpha(color, 0.02)} 100%)`,
        borderRadius: 2,
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
      }}
    >
      <CardContent sx={{ p: { xs: 1, sm: 1.5 }, "&:last-child": { pb: { xs: 1, sm: 1.5 } } }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 0.5 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight="600"
              sx={{ fontSize: { xs: "0.68rem", sm: "0.75rem" }, display: "block" }}
              noWrap
            >
              {title}
            </Typography>
            <Typography
              variant="h6"
              fontWeight="bold"
              color={color}
              sx={{ my: { xs: 0.05, sm: 0.15 }, fontSize: { xs: "1.05rem", sm: "1.2rem" } }}
            >
              {value}
            </Typography>
            {subtitle && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: { xs: "0.62rem", sm: "0.72rem" }, display: "block" }}
                noWrap
              >
                {subtitle}
              </Typography>
            )}
          </Box>
          <Avatar
            sx={{
              bgcolor: alpha(color, 0.12),
              color: color,
              width: { xs: 30, sm: 36 },
              height: { xs: 30, sm: 36 },
              flexShrink: 0,
            }}
          >
            {React.cloneElement(icon, { sx: { fontSize: { xs: 16, sm: 20 } } })}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );
};

function QuotationList() {
  const { user } = useAuth();
  const isAdmin = ["Admin", "admin", "SuperAdmin"].includes(user?.role);
  const isRM = user?.is_rm || user?.isRM || Boolean(user?.subordinates && user.subordinates.length > 0);
  const canApproveQuotation = isAdmin || isRM;

  const [quotations, setQuotations] = useState([]);
  const [stats, setStats] = useState({
    totalQuotations: 0,
    totalValue: 0,
    sentCount: 0,
    approvedCount: 0,
    pendingApprovalCount: 0,
    rejectedCount: 0,
    draftCount: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Approval Threshold Configuration
  const [threshold, setThreshold] = useState(35000);
  const [thresholdDialogOpen, setThresholdDialogOpen] = useState(false);
  const [newThresholdInput, setNewThresholdInput] = useState("35000");
  const [savingThreshold, setSavingThreshold] = useState(false);
  const [approvingId, setApprovingId] = useState(null);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Modals & Single View
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuotation, setEditingQuotation] = useState(null);
  const [viewingQuotation, setViewingQuotation] = useState(null);

  // Delete Confirm Dialog
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchThreshold = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/quotation/settings.php`);
      if (res.data && res.data.success && res.data.data) {
        const val = res.data.data.quotation_approval_threshold !== undefined ? res.data.data.quotation_approval_threshold : 35;
        setThreshold(val);
        setNewThresholdInput(val.toString());
      }
    } catch (e) {
      console.warn("Failed to fetch threshold:", e);
    }
  };

  const handleSaveThreshold = async () => {
    const num = parseFloat(newThresholdInput);
    if (isNaN(num) || num < 0 || num > 100) {
      setError("Please enter a valid discount percentage (0 - 100%).");
      return;
    }
    setSavingThreshold(true);
    try {
      const res = await axios.post(`${BASE_URL}/quotation/settings.php`, {
        quotation_approval_threshold: num,
      });
      if (res.data && res.data.success) {
        setThreshold(num);
        setThresholdDialogOpen(false);
        setSuccessMsg(`Approval discount threshold updated to ${num}%.`);
      } else {
        setError(res.data?.message || "Failed to update threshold.");
      }
    } catch (err) {
      setError("Error updating threshold.");
    } finally {
      setSavingThreshold(false);
    }
  };

  const handleApproveQuotation = async (id) => {
    setApprovingId(id);
    try {
      const approverName = user?.username || user?.Name || user?.name || user?.EmpName || user?.emp_name || user?.emp_id || user?.EmpId || "";
      const currentEmpId = user?.emp_id || user?.EmpId || "";
      const currentRole = user?.role || user?.Role || "";
      const res = await axios.post(`${BASE_URL}/quotation/approve_quotation.php`, {
        id,
        approved_by: approverName,
        emp_id: currentEmpId,
        role: currentRole,
      });
      if (res.data && res.data.success) {
        setSuccessMsg(res.data.message || "Quotation approved and sent to client email.");
        fetchQuotations();
      } else {
        setError(res.data?.message || "Failed to approve quotation.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error approving quotation.");
    } finally {
      setApprovingId(null);
    }
  };

  const fetchQuotations = async () => {
    setLoading(true);
    setError("");
    try {
      const tenantId = user?.tenent_id || 1;
      const empId = user?.emp_id || user?.EmpId || "";
      const userRole = user?.role || user?.Role || "";

      let url = `${BASE_URL}/quotation/list_quotations.php?Tenent_Id=${tenantId}`;
      if (empId) url += `&empId=${encodeURIComponent(empId)}`;
      if (userRole) url += `&role=${encodeURIComponent(userRole)}`;
      if (statusFilter !== "All") url += `&status=${statusFilter}`;

      const res = await axios.get(url);
      if (res.data.success) {
        setQuotations(res.data.data || []);
        if (res.data.stats) setStats(res.data.stats);
      } else {
        setError(res.data.message || "Failed to load quotations.");
      }
    } catch (err) {
      console.error("Error fetching quotations:", err);
      setError("Error loading quotations from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
    fetchThreshold();
  }, [statusFilter, user?.emp_id, user?.EmpId, user?.role]);

  useEffect(() => {
    setPage(0);
  }, [search, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
  };

  const searchWords = search.toLowerCase().trim().split(/\s+/).filter(Boolean);

  const filteredQuotations = quotations.filter((quote) => {
    if (statusFilter !== "All" && (quote.status || "").toLowerCase() !== statusFilter.toLowerCase()) {
      return false;
    }
    if (searchWords.length === 0) return true;

    const itemsText = Array.isArray(quote.items)
      ? quote.items.map((i) => `${i.product_name || i.name || ""} ${i.packaging || ""} ${i.unit || ""}`).join(" ")
      : "";

    const searchable = [
      quote.quotation_no,
      quote.client_name,
      quote.client_phone,
      quote.client_email,
      quote.client_address,
      quote.subject,
      quote.prepared_by,
      quote.created_by_name,
      quote.approved_by,
      quote.status,
      quote.total_amount ? String(quote.total_amount) : "",
      itemsText,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchWords.every((word) => searchable.includes(word));
  });

  const handleOpenCreate = () => {
    setEditingQuotation(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (quote) => {
    if (quote && quote.status !== "Draft") {
      setError("Quotation cannot be edited once it has been sent or submitted for approval.");
      return;
    }
    setEditingQuotation(quote);
    setIsModalOpen(true);
  };

  const handleViewSlip = (quote) => {
    setViewingQuotation(quote);
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const approverName = user?.username || user?.Name || user?.name || user?.EmpName || user?.emp_name || user?.emp_id || user?.EmpId || "";
      const currentEmpId = user?.emp_id || user?.EmpId || "";
      const currentRole = user?.role || user?.Role || "";
      const res = await axios.post(
        `${BASE_URL}/quotation/update_quotation.php`,
        {
          id,
          status: newStatus,
          approved_by: newStatus === "Approved" ? approverName : null,
          emp_id: currentEmpId,
          role: currentRole,
        }
      );
      if (res.data.success) {
        setSuccessMsg(`Status updated to ${newStatus}.`);
        fetchQuotations();
      } else {
        setError(res.data?.message || "Failed to update status.");
      }
    } catch (err) {
      console.error("Error updating status:", err);
      setError(err.response?.data?.message || "Failed to update status.");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await axios.post(
        `${BASE_URL}/quotation/delete_quotation.php`,
        { id: deleteId }
      );
      if (res.data.success) {
        setSuccessMsg("Quotation deleted successfully.");
        setDeleteId(null);
        fetchQuotations();
      } else {
        setError(res.data.message || "Failed to delete quotation.");
      }
    } catch (err) {
      console.error("Error deleting quotation:", err);
      setError("Failed to delete quotation.");
    } finally {
      setDeleting(false);
    }
  };

  const getStatusChip = (st) => {
    switch ((st || "").toLowerCase()) {
      case "pending approval":
      case "pending":
        return (
          <Chip
            size="small"
            label="Pending Approval"
            icon={<Schedule sx={{ fontSize: "14px !important" }} />}
            sx={{
              bgcolor: "#fef3c7",
              color: "#b45309",
              fontWeight: 700,
              fontSize: "11px",
              border: "1px solid #fde68a",
            }}
          />
        );
      case "approved":
        return (
          <Chip
            size="small"
            label="Approved"
            icon={<CheckCircle sx={{ fontSize: "14px !important" }} />}
            sx={{
              bgcolor: "#dcfce7",
              color: "#15803d",
              fontWeight: 700,
              fontSize: "11px",
            }}
          />
        );
      case "sent":
        return (
          <Chip
            size="small"
            label="Sent"
            icon={<HourglassEmpty sx={{ fontSize: "14px !important" }} />}
            sx={{
              bgcolor: "#dbeafe",
              color: "#1d4ed8",
              fontWeight: 700,
              fontSize: "11px",
            }}
          />
        );
      case "rejected":
        return (
          <Chip
            size="small"
            label="Rejected"
            icon={<Cancel sx={{ fontSize: "14px !important" }} />}
            sx={{
              bgcolor: "#fee2e2",
              color: "#b91c1c",
              fontWeight: 700,
              fontSize: "11px",
            }}
          />
        );
      default:
        return (
          <Chip
            size="small"
            label="Draft"
            sx={{
              bgcolor: "#f3f4f6",
              color: "#4b5563",
              fontWeight: 700,
              fontSize: "11px",
            }}
          />
        );
    }
  };

  // If user clicked "View Slip", show the full Aberdure Pharma quotation slip
  if (viewingQuotation) {
    return (
      <QuotationSlip
        quotation={viewingQuotation}
        onBack={() => setViewingQuotation(null)}
        onEdit={(q) => {
          setViewingQuotation(null);
          handleOpenEdit(q);
        }}
      />
    );
  }

  return (
    <Box sx={{ p: 1.5, width: "100%", height: "100%", display: "flex", flexDirection: "column", overflow: "hidden", boxSizing: "border-box" }}>
      {/* Notifications */}
      {successMsg && (
        <Alert
          severity="success"
          onClose={() => setSuccessMsg("")}
          sx={{ mb: 1.5, borderRadius: 2, flexShrink: 0 }}
        >
          {successMsg}
        </Alert>
      )}
      {error && (
        <Alert
          severity="error"
          onClose={() => setError("")}
          sx={{ mb: 1.5, borderRadius: 2, flexShrink: 0 }}
        >
          {error}
        </Alert>
      )}

      {/* 1. Header Summary Stats Cards (2x2 on mobile, 4 in 1 row on desktop) */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr 1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr 1fr" },
          gap: { xs: 1, sm: 1.2 },
          mb: 0.75,
          flexShrink: 0,
          width: "100%",
        }}
      >
        <StatCard
          title="Total Quotations"
          value={stats.totalQuotations || 0}
          color="#f37021"
          icon={<RequestQuote />}
          subtitle={`Val: ₹${(stats.totalValue || 0).toLocaleString("en-IN")}`}
        />
        <StatCard
          title="Approved"
          value={stats.approvedCount || 0}
          color="#10b981"
          icon={<CheckCircle />}
          subtitle="Orders won"
        />
        <StatCard
          title="Sent / Pending"
          value={stats.sentCount || 0}
          color="#3b82f6"
          icon={<HourglassEmpty />}
          subtitle="Awaiting confirm"
        />
        <StatCard
          title="Drafts & Others"
          value={(stats.draftCount || 0) + (stats.rejectedCount || 0)}
          color="#f59e0b"
          icon={<Receipt />}
          subtitle={`Draft: ${stats.draftCount || 0} | Rej: ${stats.rejectedCount || 0}`}
        />
      </Box>

      {/* 2. Unified Search, Filter & Actions Toolbar */}
      <Card sx={{ mt: 0.5, mb: 1.5, flexShrink: 0, p: 1.2, px: 1.5, borderRadius: 2, border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 1.2,
            width: "100%",
          }}
        >
          {/* Left: Search + Status Filter */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, flexWrap: "wrap", flex: 1, minWidth: { xs: "100%", md: 450 } }}>
            <Box sx={{ flex: 1, minWidth: { xs: "100%", sm: 240 } }}>
              <form onSubmit={handleSearchSubmit} style={{ width: "100%" }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search by Quote No, Doctor, Phone..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  InputProps={{
                    startAdornment: <Search sx={{ color: "action.active", mr: 1, fontSize: 18 }} />,
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 1.8,
                      fontSize: "0.85rem",
                      height: 36,
                    },
                  }}
                />
              </form>
            </Box>

            <FormControl
              size="small"
              sx={{
                width: { xs: "100%", sm: 170 },
                flexShrink: 0,
              }}
            >
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
                sx={{ borderRadius: 1.8, height: 36, fontSize: "0.85rem" }}
              >
                <MenuItem value="All">All Statuses</MenuItem>
                <MenuItem value="Pending Approval">Pending Approval</MenuItem>
                <MenuItem value="Sent">Sent</MenuItem>
                <MenuItem value="Approved">Approved</MenuItem>
                <MenuItem value="Draft">Draft</MenuItem>
                <MenuItem value="Rejected">Rejected</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Right: Refresh + New Quotation */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", width: { xs: "100%", sm: "auto" }, justifyContent: { xs: "flex-start", sm: "flex-end" } }}>
            <Tooltip title="Refresh list">
              <IconButton
                onClick={fetchQuotations}
                color="primary"
                size="small"
                sx={{
                  border: "1px solid #e2e8f0",
                  borderRadius: 1.8,
                  bgcolor: "#ffffff",
                  width: 36,
                  height: 36,
                  "&:hover": { bgcolor: "#f8fafc", borderColor: "#cbd5e1" },
                }}
              >
                <Refresh fontSize="small" />
              </IconButton>
            </Tooltip>

            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleOpenCreate}
              size="small"
              sx={{
                bgcolor: "#f37021",
                "&:hover": { bgcolor: "#d95300" },
                borderRadius: 1.8,
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.82rem",
                px: 2,
                height: 36,
                whiteSpace: "nowrap",
                boxShadow: "0 2px 6px rgba(243, 112, 33, 0.25)",
                flex: { xs: 1, sm: "none" },
              }}
            >
              New Quotation
            </Button>
          </Box>
        </Box>
      </Card>

      {/* 3. Quotation Data Table */}
      <Paper
        elevation={0}
        sx={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          borderRadius: 2,
          boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
          border: "1px solid #e2e8f0",
          overflow: "hidden",
        }}
      >
        <TableContainer sx={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress sx={{ color: "#f37021" }} />
          </Box>
        ) : filteredQuotations.length === 0 ? (
          <Box sx={{ p: 6, textAlign: "center" }}>
            <Typography variant="body1" color="text.secondary">
              No quotations found matching your criteria.
            </Typography>
            <Button
              variant="outlined"
              startIcon={<Add />}
              onClick={handleOpenCreate}
              sx={{
                mt: 2,
                borderColor: "#f37021",
                color: "#f37021",
                textTransform: "none",
              }}
            >
              Create First Quotation
            </Button>
          </Box>
        ) : (
          <Table stickyHeader size="small" sx={{ minWidth: 920 }}>
            <TableHead sx={{ bgcolor: "#f8fafc", "& th": { bgcolor: "#f8fafc" } }}>
                <TableRow sx={{ "& th": { whiteSpace: "nowrap", py: 1.4, color: "#475569", fontSize: "0.82rem" } }}>
                  <TableCell sx={{ fontWeight: 800 }}>Quotation No</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Doctor / Hospital</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 800, textAlign: "center" }}>Items</TableCell>
                  <TableCell sx={{ fontWeight: 800, textAlign: "right" }}>Total (₹)</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Created By</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Approved By</TableCell>
                  <TableCell sx={{ fontWeight: 800, textAlign: "center" }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 800, textAlign: "center" }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredQuotations
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row) => {
                    const currentEmpId = String(user?.emp_id || user?.EmpId || "").trim();
                    const currentEmpName = String(user?.Name || user?.username || user?.name || "").trim().toLowerCase();
                    const isOwnQuotation = (!isAdmin) && (
                      (row.emp_id && String(row.emp_id).trim() === currentEmpId) ||
                      (row.EmpId && String(row.EmpId).trim() === currentEmpId) ||
                      (row.prepared_by && (String(row.prepared_by).trim() === currentEmpId || String(row.prepared_by).trim().toLowerCase() === currentEmpName)) ||
                      (row.created_by_name && String(row.created_by_name).trim().toLowerCase() === currentEmpName)
                    );
                    const isLockedStatus = ["approved", "sent"].includes((row.status || "").toLowerCase());

                    return (
                      <TableRow
                        key={row.id}
                        hover
                        sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                      >
                      <TableCell sx={{ fontWeight: 700, color: "#f37021", whiteSpace: "nowrap" }}>
                        {row.quotation_no}
                      </TableCell>
                      <TableCell sx={{ minWidth: 180 }}>
                        <Typography variant="body2" fontWeight="600">
                          {row.client_name}
                        </Typography>
                        <Box sx={{ display: "flex", gap: 0.8, alignItems: "center", flexWrap: "wrap", mt: 0.3 }}>
                          {row.client_phone && (
                            <Typography variant="caption" color="text.secondary">
                              {row.client_phone}
                            </Typography>
                          )}
                          {(row.State || row.client_state) && (
                            <Typography variant="caption" sx={{ color: "#f37021", fontWeight: 700 }}>
                              • {row.State || row.client_state}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {row.quotation_date ? row.quotation_date.slice(0, 10) : "NA"}
                      </TableCell>
                      <TableCell sx={{ textAlign: "center", whiteSpace: "nowrap" }}>
                        <Chip
                          size="small"
                          label={`${Array.isArray(row.items) ? row.items.length : 0} Products`}
                          variant="outlined"
                          sx={{ fontSize: "11px", height: 22 }}
                        />
                      </TableCell>
                      <TableCell sx={{ textAlign: "right", fontWeight: 800, fontSize: "13.5px", whiteSpace: "nowrap" }}>
                        ₹
                        {parseFloat(row.total_amount || 0).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        <Typography variant="body2" fontWeight="600" sx={{ color: "#1e293b", fontSize: "0.82rem" }}>
                          {row.created_by_name || (row.prepared_by && row.prepared_by !== "Aberdure Sales Team" && row.prepared_by !== "Sales Team" ? row.prepared_by : null) || row.emp_id || "—"}
                        </Typography>
                        {row.emp_id && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: "block", fontSize: "11px" }}>
                            ID: {row.emp_id}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {row.status === "Approved" && (row.approved_by || row.approved_by_name) ? (
                          <Box>
                            <Chip
                              label={row.approved_by || row.approved_by_name}
                              size="small"
                              color="success"
                              variant="outlined"
                              sx={{ fontWeight: 600, fontSize: "11px", height: "22px" }}
                            />
                            {row.approval_date && (
                              <Typography variant="caption" display="block" color="text.secondary" sx={{ fontSize: "10px", mt: 0.3 }}>
                                {new Date(row.approval_date).toLocaleDateString("en-IN", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric"
                                })}
                              </Typography>
                            )}
                          </Box>
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            —
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell sx={{ textAlign: "center", whiteSpace: "nowrap" }}>
                        {canApproveQuotation && !isLockedStatus && !isOwnQuotation ? (
                          <FormControl size="small" variant="standard">
                            <Select
                              value={row.status || "Sent"}
                              onChange={(e) => handleStatusChange(row.id, e.target.value)}
                              disableUnderline
                              renderValue={() => getStatusChip(row.status)}
                              sx={{ "& .MuiSelect-select": { py: 0 } }}
                            >
                              <MenuItem value="Draft">Draft</MenuItem>
                              <MenuItem value="Pending Approval">Pending Approval</MenuItem>
                              <MenuItem value="Sent">Sent</MenuItem>
                              <MenuItem value="Approved">Approved</MenuItem>
                              <MenuItem value="Rejected">Rejected</MenuItem>
                            </Select>
                          </FormControl>
                        ) : (
                          getStatusChip(row.status)
                        )}
                      </TableCell>
                      <TableCell sx={{ textAlign: "center", whiteSpace: "nowrap" }}>
                        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 0.5 }}>
                          {canApproveQuotation && !isLockedStatus && !isOwnQuotation && (row.status === "Pending Approval" || (row.status || "").toLowerCase() === "pending") && (
                            <Tooltip title="Approve & Send to Client Email">
                              <span>
                                <Button
                                  size="small"
                                  variant="contained"
                                  disabled={approvingId === row.id}
                                  startIcon={
                                    approvingId === row.id ? (
                                      <CircularProgress size={12} color="inherit" />
                                    ) : (
                                      <CheckCircle sx={{ fontSize: "14px !important" }} />
                                    )
                                  }
                                  onClick={() => handleApproveQuotation(row.id)}
                                  sx={{
                                    bgcolor: "#10b981",
                                    "&:hover": { bgcolor: "#059669" },
                                    fontSize: "11px",
                                    py: 0.3,
                                    px: 1,
                                    textTransform: "none",
                                    fontWeight: 700,
                                    minWidth: "auto",
                                    boxShadow: "none",
                                    mr: 0.5,
                                  }}
                                >
                                  {approvingId === row.id ? "Approving..." : "Approve"}
                                </Button>
                              </span>
                            </Tooltip>
                          )}

                          <Tooltip title="View / Print Quotation Slip">
                            <IconButton
                              size="small"
                              sx={{ color: "#f37021" }}
                              onClick={() => handleViewSlip(row)}
                            >
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          {/* Edit and Delete are only visible for Draft quotations; once sent or submitted, they are hidden */}
                          {row.status === "Draft" && (
                            <>
                              <Tooltip title="Edit Quotation">
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() => handleOpenEdit(row)}
                                >
                                  <Edit fontSize="small" />
                                </IconButton>
                              </Tooltip>

                              <Tooltip title="Delete Quotation">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => setDeleteId(row.id)}
                                >
                                  <Delete fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </TableContainer>

        {!loading && (
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredQuotations.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            sx={{ flexShrink: 0, borderTop: "1px solid #e2e8f0" }}
          />
        )}
      </Paper>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <QuotationModal
          open={isModalOpen}
          quotation={editingQuotation}
          approvalThreshold={threshold}
          onClose={() => setIsModalOpen(false)}
          onSuccess={(msg) => {
            setSuccessMsg(msg);
            fetchQuotations();
          }}
        />
      )}

      {/* Approval Threshold Configuration Dialog */}
      <Dialog
        open={thresholdDialogOpen}
        onClose={() => setThresholdDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            m: { xs: 2, sm: "auto" },
            width: { xs: "calc(100% - 32px)", sm: "auto" },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: "bold", bgcolor: "#f37021", color: "#ffffff", py: 1.5 }}>
          Discount Approval Threshold Configuration
        </DialogTitle>
        <DialogContent sx={{ pt: 3, mt: 1 }}>
          <DialogContentText sx={{ mb: 2.5, fontSize: "13px" }}>
            If any product discount in a quotation is <strong>greater than this percentage (default 35%)</strong>, it requires RM approval first before sending. Quotations with discounts at or below this limit are automatically emailed directly to the client with CC to RM.
          </DialogContentText>
          <TextField
            fullWidth
            size="small"
            label="Discount Threshold (%)"
            type="number"
            value={newThresholdInput}
            onChange={(e) => setNewThresholdInput(e.target.value)}
            InputProps={{
              endAdornment: <Typography sx={{ ml: 1, fontWeight: 700, color: "#f37021" }}>%</Typography>
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setThresholdDialogOpen(false)} disabled={savingThreshold}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveThreshold}
            variant="contained"
            disabled={savingThreshold}
            sx={{
              bgcolor: "#f37021",
              "&:hover": { bgcolor: "#d95300" },
              fontWeight: 700,
              px: 2.5,
            }}
          >
            {savingThreshold ? "Saving..." : "Save Limit"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        PaperProps={{
          sx: {
            borderRadius: 2,
            m: { xs: 2, sm: "auto" },
            width: { xs: "calc(100% - 32px)", sm: "auto" },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: "bold" }}>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this quotation? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteId(null)} disabled={deleting}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default QuotationList;
