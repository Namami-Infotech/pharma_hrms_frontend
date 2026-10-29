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
  Tune,
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
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" color="text.secondary" fontWeight="600">
              {title}
            </Typography>
            <Typography variant="h6" fontWeight="bold" color={color} sx={{ my: 0.3 }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.72rem" }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          <Avatar
            sx={{
              bgcolor: alpha(color, 0.12),
              color: color,
              width: 40,
              height: 40,
            }}
          >
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );
};

function QuotationList() {
  const { user } = useAuth();

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
        const val = res.data.data.quotation_approval_threshold || 35000;
        setThreshold(val);
        setNewThresholdInput(val.toString());
      }
    } catch (e) {
      console.warn("Failed to fetch threshold:", e);
    }
  };

  const handleSaveThreshold = async () => {
    const num = parseFloat(newThresholdInput);
    if (isNaN(num) || num < 0) {
      setError("Please enter a valid amount.");
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
        setSuccessMsg(`Approval threshold updated to ₹${num.toLocaleString("en-IN")}.`);
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
      const res = await axios.post(`${BASE_URL}/quotation/approve_quotation.php`, { id });
      if (res.data && res.data.success) {
        setSuccessMsg(res.data.message || "Quotation approved and sent to client email.");
        fetchQuotations();
      } else {
        setError(res.data?.message || "Failed to approve quotation.");
      }
    } catch (err) {
      setError("Error approving quotation.");
    } finally {
      setApprovingId(null);
    }
  };

  const fetchQuotations = async () => {
    setLoading(true);
    setError("");
    try {
      const tenantId = user?.tenent_id || 1;
      let url = `${BASE_URL}/quotation/list_quotations.php?Tenent_Id=${tenantId}`;
      if (statusFilter !== "All") url += `&status=${statusFilter}`;
      if (search.trim()) url += `&search=${encodeURIComponent(search.trim())}`;

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
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchQuotations();
  };

  const handleOpenCreate = () => {
    setEditingQuotation(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (quote) => {
    setEditingQuotation(quote);
    setIsModalOpen(true);
  };

  const handleViewSlip = (quote) => {
    setViewingQuotation(quote);
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await axios.post(
        `${BASE_URL}/quotation/update_quotation.php`,
        { id, status: newStatus }
      );
      if (res.data.success) {
        setSuccessMsg(`Status updated to ${newStatus}.`);
        fetchQuotations();
      }
    } catch (err) {
      console.error("Error updating status:", err);
      setError("Failed to update status.");
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
    <Box sx={{ width: "100%" }}>
      {/* Notifications */}
      {successMsg && (
        <Alert
          severity="success"
          onClose={() => setSuccessMsg("")}
          sx={{ mb: 2.5, borderRadius: 2 }}
        >
          {successMsg}
        </Alert>
      )}
      {error && (
        <Alert
          severity="error"
          onClose={() => setError("")}
          sx={{ mb: 2.5, borderRadius: 2 }}
        >
          {error}
        </Alert>
      )}

      {/* 1. Header Summary Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Quotations"
            value={stats.totalQuotations || 0}
            color="#8d0638"
            icon={<RequestQuote />}
            subtitle={`Total Value: ₹${(stats.totalValue || 0).toLocaleString("en-IN")}`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Approved (Orders Won)"
            value={stats.approvedCount || 0}
            color="#10b981"
            icon={<CheckCircle />}
            subtitle="Client accepted quotes"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Sent / Pending"
            value={stats.sentCount || 0}
            color="#3b82f6"
            icon={<HourglassEmpty />}
            subtitle="Awaiting client confirmation"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Drafts & Others"
            value={(stats.draftCount || 0) + (stats.rejectedCount || 0)}
            color="#f59e0b"
            icon={<Receipt />}
            subtitle={`Draft: ${stats.draftCount || 0} | Rejected: ${stats.rejectedCount || 0}`}
          />
        </Grid>
      </Grid>

      {/* 2. Top Filter & Action Bar */}
      <Card sx={{ mb: 3, p: 2, borderRadius: 2, boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}>
        <Grid container spacing={2} alignItems="center">
          {/* Search */}
          <Grid item xs={12} sm={5} md={4}>
            <form onSubmit={handleSearchSubmit}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search by Quote No, Client, Phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ color: "action.active", mr: 1 }} />,
                }}
              />
            </form>
          </Grid>

          {/* Status Filter */}
          <Grid item xs={6} sm={3} md={2.5}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="All">All Statuses</MenuItem>
                <MenuItem value="Pending Approval">Pending Approval</MenuItem>
                <MenuItem value="Sent">Sent</MenuItem>
                <MenuItem value="Approved">Approved</MenuItem>
                <MenuItem value="Draft">Draft</MenuItem>
                <MenuItem value="Rejected">Rejected</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Actions */}
          <Grid
            item
            xs={12}
            sm={4}
            md={5.5}
            sx={{ display: "flex", gap: 1.5, justifyContent: "flex-end", alignItems: "center" }}
          >
            <Tooltip title="View or change Quotation Approval Limit">
              <Button
                variant="outlined"
                size="small"
                startIcon={<Tune sx={{ fontSize: "16px !important" }} />}
                onClick={() => {
                  setNewThresholdInput(threshold.toString());
                  setThresholdDialogOpen(true);
                }}
                sx={{
                  borderColor: "#8d0638",
                  color: "#8d0638",
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "12px",
                  py: 0.8,
                  "&:hover": { borderColor: "#6b042d", bgcolor: "rgba(141,6,56,0.04)" },
                }}
              >
                Limit: ₹{threshold.toLocaleString("en-IN")}
              </Button>
            </Tooltip>

            <IconButton onClick={fetchQuotations} color="primary" title="Refresh">
              <Refresh />
            </IconButton>

            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleOpenCreate}
              sx={{
                bgcolor: "#8d0638",
                "&:hover": { bgcolor: "#6b042d" },
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
                px: 2.5,
              }}
            >
              New Quotation
            </Button>
          </Grid>
        </Grid>
      </Card>

      {/* 3. Quotation Data Table */}
      <TableContainer component={Paper} elevation={1} sx={{ borderRadius: 2 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress sx={{ color: "#8d0638" }} />
          </Box>
        ) : quotations.length === 0 ? (
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
                borderColor: "#8d0638",
                color: "#8d0638",
                textTransform: "none",
              }}
            >
              Create First Quotation
            </Button>
          </Box>
        ) : (
          <>
            <Table size="medium">
              <TableHead sx={{ bgcolor: "#f8fafc" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800 }}>Quotation No</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Client / Hospital</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Issue Date</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Valid Till</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Items</TableCell>
                  <TableCell sx={{ fontWeight: 800, textAlign: "right" }}>Total (₹)</TableCell>
                  <TableCell sx={{ fontWeight: 800, textAlign: "center" }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 800, textAlign: "center" }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {quotations
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row) => (
                    <TableRow
                      key={row.id}
                      hover
                      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    >
                      <TableCell sx={{ fontWeight: 700, color: "#8d0638" }}>
                        {row.quotation_no}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="600">
                          {row.client_name}
                        </Typography>
                        {row.client_phone && (
                          <Typography variant="caption" color="text.secondary">
                            {row.client_phone}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {row.quotation_date ? row.quotation_date.slice(0, 10) : "NA"}
                      </TableCell>
                      <TableCell>
                        {row.valid_until ? row.valid_until.slice(0, 10) : "NA"}
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={`${Array.isArray(row.items) ? row.items.length : 0} Products`}
                          variant="outlined"
                          sx={{ fontSize: "11px" }}
                        />
                      </TableCell>
                      <TableCell sx={{ textAlign: "right", fontWeight: 800, fontSize: "14px" }}>
                        ₹
                        {parseFloat(row.total_amount || 0).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell sx={{ textAlign: "center" }}>
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
                      </TableCell>
                      <TableCell sx={{ textAlign: "center" }}>
                        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 0.5 }}>
                          {(row.status === "Pending Approval" || (row.status || "").toLowerCase() === "pending") && (
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
                              sx={{ color: "#8d0638" }}
                              onClick={() => handleViewSlip(row)}
                            >
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>

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
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>

            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={quotations.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
            />
          </>
        )}
      </TableContainer>

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
      >
        <DialogTitle sx={{ fontWeight: "bold", bgcolor: "#8d0638", color: "#ffffff", py: 1.5 }}>
          Approval Limit Configuration
        </DialogTitle>
        <DialogContent sx={{ pt: 3, mt: 1 }}>
          <DialogContentText sx={{ mb: 2.5, fontSize: "13px" }}>
            If a quotation amount is <strong>greater than this value</strong>, it requires approval first before sending. Quotations at or below this value are automatically emailed to the client upon creation.
          </DialogContentText>
          <TextField
            fullWidth
            size="small"
            label="Threshold Amount (₹)"
            type="number"
            value={newThresholdInput}
            onChange={(e) => setNewThresholdInput(e.target.value)}
            InputProps={{
              startAdornment: <Typography sx={{ mr: 1, fontWeight: 700, color: "#8d0638" }}>₹</Typography>
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
              bgcolor: "#8d0638",
              "&:hover": { bgcolor: "#6b042d" },
              fontWeight: 700,
              px: 2.5,
            }}
          >
            {savingThreshold ? "Saving..." : "Save Limit"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={Boolean(deleteId)} onClose={() => setDeleteId(null)}>
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
