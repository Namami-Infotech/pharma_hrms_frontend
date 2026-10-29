"use client";

import React, { useState, useEffect } from "react";
import { BASE_URL } from "../../api/endpoints";
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
  IconButton,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert,
  CircularProgress,
  InputAdornment,
} from "@mui/material";
import {
  Close,
  Save,
  Medication,
  LocalPharmacy,
  Inventory2,
  Science,
} from "@mui/icons-material";
import axios from "axios";

// Common pharma units
const STANDARD_UNITS = [
  "Strip",
  "Box",
  "Bottle",
  "Vial",
  "Tube",
  "Tablet",
  "Capsule",
  "Ampoule",
  "Sachet",
  "Pack",
  "Pcs",
];

// Common pharma categories
const STANDARD_CATEGORIES = [
  "Antibiotics",
  "Analgesics / Antipyretics",
  "Cardiovascular",
  "Gastrointestinal",
  "Respiratory",
  "Topical Pain Relief",
  "Nutraceuticals / Supplements",
  "Injections",
  "Anti-diabetic",
  "Dermatology",
  "General",
];

function ProductModal({ open, onClose, product, onSuccess }) {
  const [formData, setFormData] = useState({
    name: "",
    unit: "Strip",
    packaging: "",
    price: "",
    product_code: "",
    hsn: "3004",
    category: "General",
    composition: "",
    description: "",
    status: "Active",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        unit: product.unit || "Strip",
        packaging: product.packaging || "",
        price: product.price !== undefined ? product.price : "",
        product_code: product.product_code || "",
        hsn: product.hsn || "3004",
        category: product.category || "General",
        composition: product.composition || "",
        description: product.description || "",
        status: product.status || "Active",
      });
    } else {
      setFormData({
        name: "",
        unit: "Strip",
        packaging: "",
        price: "",
        product_code: "",
        hsn: "3004",
        category: "General",
        composition: "",
        description: "",
        status: "Active",
      });
    }
    setError("");
  }, [product, open]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!formData.name.trim()) {
      setError("Please enter the Product Name.");
      return;
    }
    if (!formData.unit.trim()) {
      setError("Please specify the Product Unit (e.g. Strip, Box, Bottle).");
      return;
    }
    if (!formData.packaging.trim()) {
      setError("Please enter the Packaging (e.g. 10x10 Tablets, 100ml Bottle).");
      return;
    }
    if (
      formData.price === "" ||
      isNaN(parseFloat(formData.price)) ||
      parseFloat(formData.price) < 0
    ) {
      setError("Please enter a valid non-negative Price.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      let res;
      if (product && product.id) {
        res = await axios.post(
          `${BASE_URL}/product/update_product.php`,
          { ...formData, id: product.id }
        );
      } else {
        res = await axios.post(
          `${BASE_URL}/product/add_product.php`,
          formData
        );
      }

      if (res.data.success) {
        onSuccess(
          res.data.message ||
            (product ? "Product updated successfully" : "Product added successfully")
        );
        onClose();
      } else {
        setError(res.data.message || "Failed to save product.");
      }
    } catch (err) {
      console.error("Error saving product:", err);
      setError(
        err.response?.data?.message || err.message || "Failed to save product."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          width: "100%",
          maxWidth: { xs: "95%", sm: "680px", md: "780px" },
          borderRadius: 2.5,
          boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
        },
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: "#8d0638",
          color: "#ffffff",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: { xs: 2.5, sm: 3.5 },
          py: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
          <Medication sx={{ fontSize: 26 }} />
          <Typography variant="h6" fontWeight="bold">
            {product ? `Edit Product (${product.product_code || product.name})` : "Add New Pharmaceutical Product"}
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: "#ffffff" }} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent dividers sx={{ p: { xs: 2.5, sm: 4 } }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={3}>
            {/* Product Name */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Product Name *"
                placeholder="e.g. Paracetamol 650mg Tablets"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocalPharmacy sx={{ color: "action.active", fontSize: 22 }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Unit */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Unit *</InputLabel>
                <Select
                  value={formData.unit}
                  label="Unit *"
                  onChange={(e) => handleChange("unit", e.target.value)}
                >
                  {STANDARD_UNITS.map((u) => (
                    <MenuItem key={u} value={u}>
                      {u}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Packaging */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Packaging *"
                placeholder="e.g. 10x10 Tablets, 100ml Bottle"
                value={formData.packaging}
                onChange={(e) => handleChange("packaging", e.target.value)}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Inventory2 sx={{ color: "action.active", fontSize: 22 }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Price (Rate in ₹) */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Price / Rate (₹) *"
                placeholder="0.00"
                value={formData.price}
                onChange={(e) => handleChange("price", e.target.value)}
                required
                inputProps={{ min: 0, step: "0.01" }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Typography fontWeight="bold" color="#8d0638" sx={{ fontSize: 18 }}>₹</Typography>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* HSN Code */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="HSN Code"
                placeholder="3004"
                value={formData.hsn}
                onChange={(e) => handleChange("hsn", e.target.value)}
              />
            </Grid>

            {/* Therapeutic Category */}
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Therapeutic Category</InputLabel>
                <Select
                  value={formData.category}
                  label="Therapeutic Category"
                  onChange={(e) => handleChange("category", e.target.value)}
                >
                  {STANDARD_CATEGORIES.map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      {cat}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Composition (Salt / Active Ingredients) */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Composition (Salt / Formulation) *"
                placeholder="e.g. Paracetamol IP 650mg, Amoxicillin 500mg + Clavulanate 125mg"
                value={formData.composition}
                onChange={(e) => handleChange("composition", e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Science sx={{ color: "action.active", fontSize: 22 }} />
                    </InputAdornment>
                  ),
                }}
                helperText="Active pharmaceutical ingredients / salt formulation"
              />
            </Grid>

            {/* Description / Notes */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Description / Usage Notes"
                placeholder="e.g. Effective relief for fever and mild to moderate pain"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions
          sx={{
            px: { xs: 2.5, sm: 4 },
            py: 2.5,
            bgcolor: "#f8fafc",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Button
            onClick={onClose}
            variant="outlined"
            color="inherit"
            disabled={loading}
            sx={{ px: 3, py: 1, textTransform: "none", fontWeight: 600 }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <Save />}
            disabled={loading}
            sx={{
              bgcolor: "#8d0638",
              "&:hover": { bgcolor: "#6b042d" },
              fontWeight: 700,
              px: 4,
              py: 1,
              textTransform: "none",
              boxShadow: "0 4px 14px rgba(141,6,56,0.3)",
            }}
          >
            {loading ? "Saving..." : product ? "Update Product" : "Save Product"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default ProductModal;
