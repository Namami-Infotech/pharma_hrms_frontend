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
  InputAdornment,
} from "@mui/material";
import {
  Add,
  Search,
  Edit,
  Delete,
  Medication,
  CheckCircle,
  Refresh,
  Inventory2,
  Category,
  LocalPharmacy,
} from "@mui/icons-material";
import axios from "axios";
import ProductModal from "./ProductModal";

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

const STANDARD_UNITS = [
  "All",
  "Strip",
  "Box",
  "Bottle",
  "Vial",
  "Tube",
  "Tablet",
  "Capsule",
  "Ampoule",
  "Pack",
];

const STANDARD_CATEGORIES = [
  "All",
  "Antibiotics",
  "Analgesics / Antipyretics",
  "Cardiovascular",
  "Gastrointestinal",
  "Respiratory",
  "Topical Pain Relief",
  "Nutraceuticals / Supplements",
  "Injections",
  "General",
];

function ProductList() {
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    inactiveProducts: 0,
    avgPrice: 0,
    totalCategories: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Filters
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [unitFilter, setUnitFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Delete Confirm Dialog
  const [deleteId, setDeleteId] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    setError("");
    try {
      let url = `${BASE_URL}/product/get_products.php?Tenent_Id=1`;
      if (statusFilter !== "All") url += `&status=${statusFilter}`;
      if (categoryFilter !== "All") url += `&category=${encodeURIComponent(categoryFilter)}`;
      if (unitFilter !== "All") url += `&unit=${encodeURIComponent(unitFilter)}`;
      if (search.trim()) url += `&search=${encodeURIComponent(search.trim())}`;

      const res = await axios.get(url);
      if (res.data.success) {
        setProducts(res.data.data || []);
        if (res.data.stats) setStats(res.data.stats);
      } else {
        setError(res.data.message || "Failed to load products.");
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Error loading products from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [categoryFilter, unitFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (prd) => {
    setEditingProduct(prd);
    setIsModalOpen(true);
  };

  const handleDeletePrompt = (prd) => {
    setDeletingProduct(prd);
    setDeleteId(prd.id);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await axios.post(
        `${BASE_URL}/product/delete_product.php`,
        { id: deleteId }
      );
      if (res.data.success) {
        setSuccessMsg(res.data.message || "Product marked as Inactive successfully.");
        setDeleteId(null);
        setDeletingProduct(null);
        fetchProducts();
      } else {
        setError(res.data.message || "Failed to update product status.");
      }
    } catch (err) {
      console.error("Error deactivating product:", err);
      setError("Failed to deactivate product.");
    } finally {
      setDeleting(false);
    }
  };

  const handleStatusToggle = async (prd) => {
    const nextStatus = prd.status === "Active" ? "Inactive" : "Active";
    try {
      const res = await axios.post(
        `${BASE_URL}/product/update_product.php`,
        { id: prd.id, status: nextStatus }
      );
      if (res.data.success) {
        setSuccessMsg(`Status of ${prd.name} updated to ${nextStatus}.`);
        fetchProducts();
      }
    } catch (err) {
      console.error("Error toggling status:", err);
      setError("Failed to update status.");
    }
  };

  return (
    <Box sx={{ p: { xs: 1.5, sm: 2.5 } }}>
      {/* Page Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight="bold" sx={{ color: "#8d0638", display: "flex", alignItems: "center", gap: 1 }}>
            <Medication sx={{ fontSize: 30 }} />
            Pharmaceutical Products Master
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your medicine inventory, pricing, packaging, and units for quotations and billing
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchProducts}
            sx={{
              borderColor: "#8d0638",
              color: "#8d0638",
              textTransform: "none",
              fontWeight: 600,
              "&:hover": { borderColor: "#6b042d", bgcolor: "rgba(141,6,56,0.04)" },
            }}
          >
            Refresh
          </Button>

          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleOpenCreate}
            sx={{
              bgcolor: "#8d0638",
              color: "#ffffff",
              textTransform: "none",
              fontWeight: 700,
              px: 2.5,
              "&:hover": { bgcolor: "#6b042d" },
              boxShadow: "0 4px 12px rgba(141,6,56,0.25)",
            }}
          >
            Add Product
          </Button>
        </Box>
      </Box>

      {/* Alerts */}
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

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="TOTAL PRODUCTS"
            value={stats.totalProducts}
            color="#8d0638"
            icon={<LocalPharmacy />}
            subtitle="Cataloged medicines"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="ACTIVE / FORMULARY"
            value={stats.activeProducts}
            color="#16a34a"
            icon={<CheckCircle />}
            subtitle="Available for sales"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="AVERAGE PRICE"
            value={`₹${parseFloat(stats.avgPrice || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
            color="#0284c7"
            icon={<Inventory2 />}
            subtitle="Per unit rate"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="CATEGORIES"
            value={stats.totalCategories}
            color="#d97706"
            icon={<Category />}
            subtitle="Therapeutic groups"
          />
        </Grid>
      </Grid>

      {/* Filters Card */}
      <Card sx={{ mb: 3, borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
        <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
          <form onSubmit={handleSearchSubmit}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search by name, composition, code..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search sx={{ color: "action.active" }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={4} md={2.5}>
                <FormControl fullWidth size="small">
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={categoryFilter}
                    label="Category"
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  >
                    {STANDARD_CATEGORIES.map((cat) => (
                      <MenuItem key={cat} value={cat}>
                        {cat}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={6} sm={4} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Unit</InputLabel>
                  <Select
                    value={unitFilter}
                    label="Unit"
                    onChange={(e) => setUnitFilter(e.target.value)}
                  >
                    {STANDARD_UNITS.map((u) => (
                      <MenuItem key={u} value={u}>
                        {u}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={6} sm={4} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    label="Status"
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <MenuItem value="All">All Status</MenuItem>
                    <MenuItem value="Active">Active</MenuItem>
                    <MenuItem value="Inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={1.5}>
                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  sx={{
                    bgcolor: "#8d0638",
                    "&:hover": { bgcolor: "#6b042d" },
                    textTransform: "none",
                    fontWeight: 600,
                  }}
                >
                  Search
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card sx={{ borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
        <TableContainer component={Paper} elevation={0}>
          <Table size="medium">
            <TableHead sx={{ bgcolor: "#f8fafc" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800, color: "#1e293b", py: 1.5 }}>Code</TableCell>
                <TableCell sx={{ fontWeight: 800, color: "#1e293b" }}>Product Name</TableCell>
                <TableCell sx={{ fontWeight: 800, color: "#1e293b" }}>Composition</TableCell>
                <TableCell sx={{ fontWeight: 800, color: "#1e293b" }}>Unit</TableCell>
                <TableCell sx={{ fontWeight: 800, color: "#1e293b" }}>Packaging</TableCell>
                <TableCell sx={{ fontWeight: 800, color: "#1e293b", textAlign: "right" }}>Price (₹)</TableCell>
                <TableCell sx={{ fontWeight: 800, color: "#1e293b" }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 800, color: "#1e293b" }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 800, color: "#1e293b", textAlign: "center" }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} sx={{ textAlign: "center", py: 5 }}>
                    <CircularProgress size={32} sx={{ color: "#8d0638", mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      Loading products catalog...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} sx={{ textAlign: "center", py: 5 }}>
                    <LocalPharmacy sx={{ fontSize: 44, color: "#cbd5e1", mb: 1 }} />
                    <Typography variant="subtitle1" fontWeight="bold" color="text.secondary">
                      No products found
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Add your first pharmaceutical product to start creating quotations.
                    </Typography>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<Add />}
                      onClick={handleOpenCreate}
                      sx={{ bgcolor: "#8d0638", "&:hover": { bgcolor: "#6b042d" } }}
                    >
                      Add Product
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                products
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((prd) => (
                    <TableRow
                      key={prd.id}
                      hover
                      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    >
                      {/* Code */}
                      <TableCell>
                        <Chip
                          size="small"
                          label={prd.product_code || `PRD-${prd.id}`}
                          sx={{
                            fontWeight: 700,
                            fontSize: "11px",
                            bgcolor: "#f1f5f9",
                            color: "#0f172a",
                          }}
                        />
                      </TableCell>

                      {/* Name */}
                      <TableCell sx={{ maxWidth: 220 }}>
                        <Typography variant="subtitle2" fontWeight="700" color="#1e293b">
                          {prd.name}
                        </Typography>
                        {prd.hsn && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                            HSN: {prd.hsn}
                          </Typography>
                        )}
                      </TableCell>

                      {/* Composition */}
                      <TableCell sx={{ maxWidth: 240 }}>
                        <Typography
                          variant="body2"
                          color="#334155"
                          sx={{
                            fontWeight: 500,
                            fontSize: "0.85rem",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "normal",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                          }}
                          title={prd.composition || ""}
                        >
                          {prd.composition || <Typography component="span" variant="caption" color="text.secondary" fontStyle="italic">Not specified</Typography>}
                        </Typography>
                      </TableCell>

                      {/* Unit */}
                      <TableCell>
                        <Chip
                          size="small"
                          label={prd.unit}
                          sx={{
                            bgcolor: "rgba(141,6,56,0.08)",
                            color: "#8d0638",
                            fontWeight: 600,
                            fontSize: "11px",
                          }}
                        />
                      </TableCell>

                      {/* Packaging */}
                      <TableCell>
                        <Typography variant="body2" fontWeight="600" color="#334155">
                          {prd.packaging}
                        </Typography>
                      </TableCell>

                      {/* Price (Rate in ₹) */}
                      <TableCell sx={{ textAlign: "right" }}>
                        <Typography variant="subtitle2" fontWeight="800" color="#8d0638">
                          ₹{parseFloat(prd.price || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </Typography>
                      </TableCell>

                      {/* Category */}
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">
                          {prd.category || "General"}
                        </Typography>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <Chip
                          size="small"
                          label={prd.status}
                          onClick={() => handleStatusToggle(prd)}
                          sx={{
                            cursor: "pointer",
                            bgcolor: prd.status === "Active" ? "#dcfce7" : "#f1f5f9",
                            color: prd.status === "Active" ? "#15803d" : "#64748b",
                            fontWeight: 700,
                            fontSize: "11px",
                          }}
                        />
                      </TableCell>

                      {/* Actions */}
                      <TableCell sx={{ textAlign: "center" }}>
                        <Box sx={{ display: "flex", justifyContent: "center", gap: 0.5 }}>
                          <Tooltip title="Edit Product">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenEdit(prd)}
                              sx={{ color: "#0284c7" }}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Deactivate (Mark Inactive)">
                            <IconButton
                              size="small"
                              onClick={() => handleDeletePrompt(prd)}
                              sx={{ color: "#ef4444" }}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={products.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Card>

      {/* Modal for Add / Edit Product */}
      {isModalOpen && (
        <ProductModal
          open={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingProduct(null);
          }}
          product={editingProduct}
          onSuccess={(msg) => {
            setSuccessMsg(msg);
            fetchProducts();
          }}
        />
      )}

      {/* Deactivate / Inactive Confirmation Dialog */}
      <Dialog open={Boolean(deleteId)} onClose={() => setDeleteId(null)}>
        <DialogTitle sx={{ color: "#b91c1c", fontWeight: "bold" }}>
          Deactivate Product
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to mark{" "}
            <strong>{deletingProduct?.name}</strong> ({deletingProduct?.product_code}) as{" "}
            <span style={{ color: "#b91c1c", fontWeight: "bold" }}>Inactive</span>?
            <br />
            The product will not be deleted from the database.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteId(null)} color="inherit" disabled={deleting}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={deleting}
          >
            {deleting ? "Updating..." : "Mark as Inactive"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ProductList;
