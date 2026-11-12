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
  Switch,
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
      <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
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
  "Caps",
  "Softgel Caps",
  "Suspension",
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

  const fetchProducts = async () => {
    setLoading(true);
    setError("");
    try {
      let url = `${BASE_URL}/product/get_products.php?Tenent_Id=1`;
      if (statusFilter !== "All") url += `&status=${statusFilter}`;
      if (categoryFilter !== "All") url += `&category=${encodeURIComponent(categoryFilter)}`;
      if (unitFilter !== "All") url += `&unit=${encodeURIComponent(unitFilter)}`;

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
  }, [unitFilter, statusFilter, categoryFilter]);

  useEffect(() => {
    setPage(0);
  }, [search, statusFilter, unitFilter, categoryFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
  };

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (prd) => {
    setEditingProduct(prd);
    setIsModalOpen(true);
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

  const searchWords = search.toLowerCase().trim().split(/\s+/).filter(Boolean);

  const filteredProducts = products
    .filter((prd) => {
      if (statusFilter !== "All" && prd.status !== statusFilter) return false;
      if (unitFilter !== "All" && prd.unit !== unitFilter) return false;
      if (categoryFilter !== "All" && prd.category !== categoryFilter) return false;

      if (searchWords.length === 0) return true;

      const searchable = [
        prd.name,
        prd.product_code,
        prd.composition,
        prd.packaging,
        prd.unit,
        prd.category,
        prd.description,
        prd.hsn,
        prd.price ? String(prd.price) : "",
        prd.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchWords.every((word) => searchable.includes(word));
    })
    .sort((a, b) =>
      (a.name || "").localeCompare(b.name || "", undefined, { sensitivity: "base" })
    );

  return (
    <Box
      sx={{
        p: { xs: 1, sm: 1.5 },
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
      {/* Alerts */}
      {successMsg && (
        <Alert
          severity="success"
          onClose={() => setSuccessMsg("")}
          sx={{ mb: 1.2, borderRadius: 2, flexShrink: 0 }}
        >
          {successMsg}
        </Alert>
      )}

      {error && (
        <Alert
          severity="error"
          onClose={() => setError("")}
          sx={{ mb: 1.2, borderRadius: 2, flexShrink: 0 }}
        >
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" },
          gap: { xs: 1, sm: 1.2 },
          mb: 1.2,
          width: "100%",
          flexShrink: 0,
        }}
      >
        <StatCard
          title="TOTAL PRODUCTS"
          value={stats.totalProducts}
          color="#f37021"
          icon={<LocalPharmacy />}
          subtitle="Cataloged medicines"
        />
        <StatCard
          title="ACTIVE / FORMULARY"
          value={stats.activeProducts}
          color="#16a34a"
          icon={<CheckCircle />}
          subtitle="Available for sales"
        />
        <StatCard
          title="AVERAGE PRICE"
          value={`₹${parseFloat(stats.avgPrice || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
          color="#0284c7"
          icon={<Inventory2 />}
          subtitle="Per unit rate"
        />
      </Box>

      {/* Unified Search, Filter & Actions Toolbar */}
      <Card sx={{ mb: 1.2, borderRadius: 2, border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", flexShrink: 0 }}>
        <CardContent sx={{ p: 1.2, px: 1.5, "&:last-child": { pb: 1.2 } }}>
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
            {/* Left: Search + Unit Filter + Status Filter */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, flexWrap: "wrap", flex: 1, minWidth: { xs: "100%", md: 500 } }}>
              <TextField
                size="small"
                placeholder="Search by name, composition, code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: "action.active", fontSize: 18 }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  width: { xs: "100%", sm: 220, md: 260 },
                  "& .MuiOutlinedInput-root": { borderRadius: 1.8, height: 36, fontSize: "0.82rem" },
                }}
              />

              <FormControl size="small" sx={{ width: { xs: "100%", sm: 130 } }}>
                <InputLabel>Unit</InputLabel>
                <Select
                  value={unitFilter}
                  label="Unit"
                  onChange={(e) => setUnitFilter(e.target.value)}
                  sx={{ borderRadius: 1.8, height: 36, fontSize: "0.82rem" }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        maxHeight: 220,
                        "&::-webkit-scrollbar": { width: "6px" },
                        "&::-webkit-scrollbar-thumb": {
                          backgroundColor: "#cbd5e1",
                          borderRadius: "3px",
                        },
                      },
                    },
                  }}
                >
                  {STANDARD_UNITS.map((u) => (
                    <MenuItem key={u} value={u}>
                      {u}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ width: { xs: "100%", sm: 130 } }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                  sx={{ borderRadius: 1.8, height: 36, fontSize: "0.82rem" }}
                >
                  <MenuItem value="All">All Status</MenuItem>
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Right: Refresh + Add Product */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", width: { xs: "100%", sm: "auto" }, justifyContent: { xs: "flex-start", sm: "flex-end" } }}>
              <Button
                variant="outlined"
                startIcon={<Refresh sx={{ fontSize: 18 }} />}
                onClick={fetchProducts}
                size="small"
                sx={{
                  borderColor: "#e2e8f0",
                  color: "#334155",
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "0.82rem",
                  height: 36,
                  borderRadius: 1.8,
                  "&:hover": { borderColor: "#cbd5e1", bgcolor: "#f8fafc" },
                }}
              >
                Refresh
              </Button>

              <Button
                variant="contained"
                startIcon={<Add sx={{ fontSize: 18 }} />}
                onClick={handleOpenCreate}
                size="small"
                sx={{
                  bgcolor: "#f37021",
                  color: "#ffffff",
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "0.82rem",
                  px: 2,
                  height: 36,
                  borderRadius: 1.8,
                  "&:hover": { bgcolor: "#d95300" },
                  boxShadow: "0 2px 6px rgba(243, 112, 33, 0.25)",
                }}
              >
                Add Product
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card
        sx={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          borderRadius: 2,
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          border: "1px solid #e2e8f0",
          overflow: "hidden",
        }}
      >
        <TableContainer component={Paper} elevation={0} sx={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
          <Table stickyHeader size="small">
            <TableHead sx={{ bgcolor: "#f8fafc", "& th": { bgcolor: "#f8fafc" } }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800, color: "#1e293b", py: 1.5 }}>Code</TableCell>
                <TableCell sx={{ fontWeight: 800, color: "#1e293b" }}>Product Name</TableCell>
                <TableCell sx={{ fontWeight: 800, color: "#1e293b" }}>Composition</TableCell>
                <TableCell sx={{ fontWeight: 800, color: "#1e293b", textAlign: "center" }}>HSN Code</TableCell>
                <TableCell sx={{ fontWeight: 800, color: "#1e293b" }}>Unit</TableCell>
                <TableCell sx={{ fontWeight: 800, color: "#1e293b", textAlign: "right" }}>Price (₹)</TableCell>
                <TableCell sx={{ fontWeight: 800, color: "#1e293b", textAlign: "center" }}>GST (%)</TableCell>
                <TableCell sx={{ fontWeight: 800, color: "#1e293b" }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 800, color: "#1e293b", textAlign: "center" }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} sx={{ textAlign: "center", py: 5 }}>
                    <CircularProgress size={32} sx={{ color: "#f37021", mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      Loading products catalog...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : filteredProducts.length === 0 ? (
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
                      sx={{ bgcolor: "#f37021", "&:hover": { bgcolor: "#d95300" } }}
                    >
                      Add Product
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts
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

                      {/* HSN Code */}
                      <TableCell sx={{ textAlign: "center" }}>
                        <Chip
                          size="small"
                          label={prd.hsn || "3004"}
                          sx={{
                            fontWeight: 700,
                            fontSize: "11px",
                            bgcolor: "#f8fafc",
                            color: "#475569",
                            border: "1px solid #e2e8f0",
                          }}
                        />
                      </TableCell>

                      {/* Unit */}
                      <TableCell>
                        <Chip
                          size="small"
                          label={prd.unit}
                          sx={{
                            bgcolor: "rgba(243, 112, 33,0.08)",
                            color: "#f37021",
                            fontWeight: 600,
                            fontSize: "11px",
                          }}
                        />
                      </TableCell>

                      {/* Price (Rate in ₹) */}
                      <TableCell sx={{ textAlign: "right" }}>
                        <Typography variant="subtitle2" fontWeight="800" color="#f37021">
                          ₹{parseFloat(prd.price || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </Typography>
                      </TableCell>

                      {/* GST (%) */}
                      <TableCell sx={{ textAlign: "center" }}>
                        <Chip
                          size="small"
                          label={`${prd.gst !== undefined ? prd.gst : 5}%`}
                          sx={{
                            fontWeight: 700,
                            fontSize: "11px",
                            bgcolor: "#eff6ff",
                            color: "#1d4ed8",
                          }}
                        />
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
                        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 1 }}>
                          <Tooltip title="Edit Product">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenEdit(prd)}
                              sx={{ color: "#0284c7" }}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title={prd.status === "Active" ? "Active (Click to deactivate)" : "Inactive (Click to activate)"}>
                            <Switch
                              size="small"
                              color="success"
                              checked={prd.status === "Active"}
                              onChange={() => handleStatusToggle(prd)}
                            />
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
          count={filteredProducts.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          sx={{ flexShrink: 0 }}
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
    </Box>
  );
}

export default ProductList;
