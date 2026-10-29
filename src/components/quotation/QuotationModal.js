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
  Divider,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Alert,
  CircularProgress,
  Autocomplete,
  Chip,
  Card,
  CardContent,
} from "@mui/material";
import {
  Add,
  Delete,
  Close,
  Save,
  Visibility,
  Business,
  Phone,
  Email,
  LocationOn,
  Receipt,
  ArrowBack,
  Schedule,
} from "@mui/icons-material";
import axios from "axios";
import { useAuth } from "../auth/AuthContext";
import QuotationSlip from "./QuotationSlip";

const DEFAULT_TERMS =
  "1. Prices are valid for 30 days from the date of quotation.\n" +
  "2. Goods delivery within 3-5 business days upon order confirmation.\n" +
  "3. GST as applicable at the time of invoicing.\n" +
  "4. Payment terms: 30 days credit from invoice date / advance as agreed.\n" +
  "5. Subject to Delhi jurisdiction.";

const EMPTY_ITEM = {
  description: "",
  hsn: "3004",
  pack: "10x10 Strips",
  qty: 10,
  rate: 100,
  discount: 0,
  amount: 1000,
};

const numberToWords = (num) => {
  const a = [
    "", "One ", "Two ", "Three ", "Four ", "Five ", "Six ", "Seven ", "Eight ", "Nine ", "Ten ",
    "Eleven ", "Twelve ", "Thirteen ", "Fourteen ", "Fifteen ", "Sixteen ", "Seventeen ", "Eighteen ", "Nineteen "
  ];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  const inWords = (n) => {
    if ((n = n.toString()).length > 9) return "overflow";
    const nArr = ("000000000" + n).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!nArr) return "";
    let str = "";
    str += nArr[1] !== "00" && nArr[1] !== 0 ? (a[Number(nArr[1])] || b[nArr[1][0]] + " " + a[nArr[1][1]]) + "Crore " : "";
    str += nArr[2] !== "00" && nArr[2] !== 0 ? (a[Number(nArr[2])] || b[nArr[2][0]] + " " + a[nArr[2][1]]) + "Lakh " : "";
    str += nArr[3] !== "00" && nArr[3] !== 0 ? (a[Number(nArr[3])] || b[nArr[3][0]] + " " + a[nArr[3][1]]) + "Thousand " : "";
    str += nArr[4] !== "00" && nArr[4] !== 0 ? (a[Number(nArr[4])] || b[nArr[4][0]] + " " + a[nArr[4][1]]) + "Hundred " : "";
    str += nArr[5] !== "00" && nArr[5] !== 0 ? (str !== "" ? "and " : "") + (a[Number(nArr[5])] || b[nArr[5][0]] + " " + a[nArr[5][1]]) : "";
    return str.trim();
  };

  const val = Math.round(Number(num) || 0);
  if (val <= 0) return "Zero Rupees Only";
  return inWords(val) + " Rupees Only";
};

function QuotationModal({ open, onClose, quotation, onSuccess, approvalThreshold = 35000 }) {
  const { user } = useAuth();

  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [loadingClients, setLoadingClients] = useState(false);
  const [productsList, setProductsList] = useState([]);

  const [formData, setFormData] = useState({
    client_name: "",
    client_email: "",
    client_phone: "",
    client_address: "",
    client_gst: "",
    subject: "Quotation for Supply of Pharmaceutical Products",
    quotation_date: new Date().toISOString().slice(0, 10),
    valid_until: "",
    prepared_by: "Aberdure Sales Team",
    status: "Sent",
    tax_type: "GST",
    tax_percent: 12,
    discount_percent: 0,
    terms_conditions: DEFAULT_TERMS,
    notes: "",
  });

  const [items, setItems] = useState([
    {
      description: "Paracetamol 650mg Tablets",
      hsn: "3004",
      pack: "10x10 Strips",
      qty: 50,
      rate: 180,
      discount: 0,
      amount: 9000,
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  // 1. Fetch clients/dealers and available products from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingClients(true);
        const [dealersRes, productsRes] = await Promise.all([
          axios.get(`${BASE_URL}/dealer/get_dealers.php`),
          axios.get(`${BASE_URL}/product/get_products.php?status=Active`),
        ]);

        if (dealersRes.data && dealersRes.data.success && Array.isArray(dealersRes.data.data)) {
          const formatted = dealersRes.data.data.map((d) => {
            const compName = (d.CompanyName || d["Company Name"] || "").trim();
            const dlrName = (d.DealerName || d["Dealer Name"] || "").trim();
            const displayName = compName ? (dlrName ? `${compName} (${dlrName})` : compName) : (dlrName || `Client #${d.DealerID}`);

            return {
              id: d.DealerID || d.ActivityId,
              name: compName || dlrName || displayName,
              displayName: displayName,
              phone: (d.ContactInfo || d["Contact Info"] || "").toString().trim(),
              email: (d.MailId || d["Mail Id"] || "").toString().trim(),
              address: (d.Address || "").toString().trim(),
              gst: (d.GST || d.GSTIN || d.Pan || "").toString().trim(),
              raw: d,
            };
          });
          setClients(formatted);
        }

        if (productsRes.data && productsRes.data.success && Array.isArray(productsRes.data.data)) {
          setProductsList(productsRes.data.data);
        }
      } catch (err) {
        console.error("Error fetching data for quotation:", err);
      } finally {
        setLoadingClients(false);
      }
    };

    if (open) {
      fetchData();
    }
  }, [open]);

  // 2. Initialize form data
  useEffect(() => {
    const loggedInName = user?.Name || user?.name || user?.EmpId || "Aberdure Sales Team";

    if (quotation) {
      setFormData({
        client_name: quotation.client_name || "",
        client_email: quotation.client_email || "",
        client_phone: quotation.client_phone || "",
        client_address: quotation.client_address || "",
        client_gst: quotation.client_gst || "",
        subject: quotation.subject || "Quotation for Supply of Pharmaceutical Products",
        quotation_date: quotation.quotation_date ? quotation.quotation_date.slice(0, 10) : "",
        valid_until: quotation.valid_until ? quotation.valid_until.slice(0, 10) : "",
        prepared_by: quotation.prepared_by || loggedInName,
        status: quotation.status || "Sent",
        tax_type: quotation.tax_type || "GST",
        tax_percent: quotation.tax_percent !== undefined ? parseFloat(quotation.tax_percent) : 12,
        discount_percent: quotation.discount_percent !== undefined ? parseFloat(quotation.discount_percent) : 0,
        terms_conditions: quotation.terms_conditions || DEFAULT_TERMS,
        notes: quotation.notes || "",
      });

      let parsed = [];
      try {
        parsed = typeof quotation.items === "string" ? JSON.parse(quotation.items) : (quotation.items || []);
      } catch (_) {}
      setItems(parsed.length > 0 ? parsed : [{ ...EMPTY_ITEM }]);

      // Match client in dropdown if available
      if (clients.length > 0 && quotation.client_name) {
        const found = clients.find(
          (c) => c.name.toLowerCase() === quotation.client_name.toLowerCase() ||
                 c.displayName.toLowerCase().includes(quotation.client_name.toLowerCase())
        );
        if (found) setSelectedClient(found);
      }
    } else {
      // Default valid 30 days ahead
      const v = new Date();
      v.setDate(v.getDate() + 30);
      setFormData({
        client_name: "",
        client_email: "",
        client_phone: "",
        client_address: "",
        client_gst: "",
        subject: "Quotation for Supply of Pharmaceutical Products",
        quotation_date: new Date().toISOString().slice(0, 10),
        valid_until: v.toISOString().slice(0, 10),
        prepared_by: loggedInName,
        status: "Sent", // Always default to "Sent" as requested
        tax_type: "GST",
        tax_percent: 12,
        discount_percent: 0,
        terms_conditions: DEFAULT_TERMS,
        notes: "",
      });
      setSelectedClient(null);
      setItems([
        {
          description: "Amoxicillin & Potassium Clavulanate 625mg",
          hsn: "3004",
          pack: "10x10 Strips",
          qty: 25,
          rate: 420,
          discount: 5,
          amount: 9975,
        },
      ]);
    }
    setError("");
    setShowPreview(false);
  }, [quotation, open, user, clients]);

  // When a client is chosen from dropdown, auto-populate client details
  const handleClientSelect = (clientObj) => {
    setSelectedClient(clientObj);
    if (clientObj) {
      setFormData((prev) => ({
        ...prev,
        client_name: clientObj.name,
        client_phone: clientObj.phone,
        client_email: clientObj.email,
        client_address: clientObj.address,
        client_gst: clientObj.gst || prev.client_gst,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        client_name: "",
        client_phone: "",
        client_email: "",
        client_address: "",
        client_gst: "",
      }));
    }
  };

  // Line item change
  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;

    const qty = parseFloat(updated[index].qty) || 0;
    const rate = parseFloat(updated[index].rate) || 0;
    const disc = parseFloat(updated[index].discount) || 0;
    const raw = qty * rate;
    const net = raw - (raw * disc) / 100;
    updated[index].amount = Math.round(net * 100) / 100;

    setItems(updated);
  };

  // When a product is chosen from the product master dropdown
  const handleProductSelect = (index, productObj) => {
    const updated = [...items];
    if (productObj) {
      updated[index].description = productObj.name;
      updated[index].hsn = productObj.hsn || "3004";
      updated[index].pack = productObj.packaging || productObj.unit || "Pack";
      updated[index].rate = parseFloat(productObj.price || 0);
    } else {
      updated[index].description = "";
      updated[index].hsn = "";
      updated[index].pack = "";
      updated[index].rate = 0;
    }

    const qty = parseFloat(updated[index].qty) || 0;
    const rate = parseFloat(updated[index].rate) || 0;
    const disc = parseFloat(updated[index].discount) || 0;
    const raw = qty * rate;
    const net = raw - (raw * disc) / 100;
    updated[index].amount = Math.round(net * 100) / 100;

    setItems(updated);
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        description: "",
        hsn: "",
        pack: "",
        qty: 1,
        rate: 0,
        discount: 0,
        amount: 0,
      },
    ]);
  };

  const handleDeleteItem = (index) => {
    if (items.length === 1) {
      alert("At least one product item is required.");
      return;
    }
    setItems(items.filter((_, idx) => idx !== index));
  };

  // Financial calculations
  const subtotal = items.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
  const discountPercent = parseFloat(formData.discount_percent) || 0;
  const discountAmount = Math.round(((subtotal * discountPercent) / 100) * 100) / 100;
  const afterDiscount = Math.max(0, subtotal - discountAmount);
  const taxPercent = parseFloat(formData.tax_percent) || 0;
  const taxAmount = Math.round(((afterDiscount * taxPercent) / 100) * 100) / 100;
  const grandTotal = Math.round((afterDiscount + taxAmount) * 100) / 100;

  // Build payload for preview or submission
  const buildQuotationPayload = () => {
    const loggedInName = user?.Name || user?.name || user?.EmpId || "Aberdure Sales Team";
    const isInterState = formData.tax_type === "IGST";
    const cgstPercent = isInterState ? 0 : taxPercent / 2;
    const sgstPercent = isInterState ? 0 : taxPercent / 2;
    const cgstAmount = isInterState ? 0 : Math.round((taxAmount / 2) * 100) / 100;
    const sgstAmount = isInterState ? 0 : Math.round((taxAmount / 2) * 100) / 100;

    return {
      ...formData,
      prepared_by: quotation?.prepared_by || loggedInName,
      status: quotation?.status || "Sent", // Default status: Sent
      items,
      subtotal,
      discount_amount: discountAmount,
      tax_amount: taxAmount,
      total_amount: grandTotal,
      cgstPercent,
      sgstPercent,
      cgstAmount,
      sgstAmount,
      igstPercent: isInterState ? taxPercent : 0,
      igstAmount: isInterState ? taxAmount : 0,
      totalInWords: numberToWords(grandTotal),
      quotation_no: quotation?.quotation_no || "AP/QT/PREVIEW",
      company: {
        name: "M/S ABERDURE PHARMA",
        tagline: "Quality Medicines For Better Health",
        address:
          "1ST FLOOR, SHOP 28 PROP.NO 920-21 WARD NO 07 KH NO 1151/3, BISHAN SWAROOP COMPLEX, MEHRAULI MAIN MARKET, MEHRAULI, NEW DELHI, SOUTH DELHI, DELHI, 110030",
        phone: "+91 98112 23344, +91 11 2664 4556",
        email: "info@aberdurepharma.com",
        gstin: "07AAXFA1234B1Z9",
        dlNo: "DL-20B/21B-12345/67",
      },
    };
  };

  const handleOpenPreview = () => {
    if (!formData.client_name.trim()) {
      setError("Please choose a Client / Hospital from the dropdown before previewing.");
      return;
    }
    if (items.some((it) => !it.description.trim() || Number(it.qty) <= 0)) {
      setError("Please ensure all items have a description and valid quantity.");
      return;
    }
    setError("");
    setShowPreview(true);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!formData.client_name.trim()) {
      setError("Please select a Client from the dropdown.");
      return;
    }

    if (items.some((it) => !it.description.trim() || Number(it.qty) <= 0)) {
      setError("Please ensure all items have a description and valid quantity.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload = buildQuotationPayload();

      let res;
      if (quotation && quotation.id) {
        payload.id = quotation.id;
        res = await axios.post(
          `${BASE_URL}/quotation/update_quotation.php`,
          payload
        );
      } else {
        if (!payload.quotation_no || payload.quotation_no.includes("PREVIEW")) {
          delete payload.quotation_no;
        }
        res = await axios.post(
          `${BASE_URL}/quotation/create_quotation.php`,
          payload
        );
      }

      if (res.data.success) {
        onSuccess(res.data.message || "Quotation saved successfully with status: Sent");
        onClose();
      } else {
        setError(res.data.message || "Failed to save quotation.");
      }
    } catch (err) {
      console.error("Error saving quotation:", err);
      setError(err.response?.data?.message || err.message || "Error saving quotation.");
    } finally {
      setLoading(false);
    }
  };

  // Preview Dialog Overlay
  if (showPreview) {
    const previewData = buildQuotationPayload();
    return (
      <Dialog open={open} onClose={() => setShowPreview(false)} maxWidth="lg" fullWidth>
        <DialogTitle
          sx={{
            bgcolor: "#8d0638",
            color: "#ffffff",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            py: 1.5,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Visibility />
            <Typography variant="h6" fontWeight="bold">
              Preview
            </Typography>
          </Box>
          <IconButton onClick={() => setShowPreview(false)} sx={{ color: "#ffffff" }} size="small">
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: { xs: 1.5, sm: 3 } }}>
          <QuotationSlip
            quotation={previewData}
            onBack={() => setShowPreview(false)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: "#f9fafb" }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => setShowPreview(false)}
            variant="outlined"
            sx={{
              borderColor: "#d1d5db",
              color: "#374151",
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Back
          </Button>
          <Button
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <Save />}
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
            sx={{
              bgcolor: "#8d0638",
              "&:hover": { bgcolor: "#6b042d" },
              fontWeight: 700,
              px: 3,
            }}
          >
            {loading ? "Saving..." : quotation ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          bgcolor: "#8d0638",
          color: "#ffffff",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          py: 1.5,
        }}
      >
        <Typography variant="h6" fontWeight="bold">
          {quotation ? "Edit" : "Create"}
        </Typography>
        <IconButton onClick={onClose} sx={{ color: "#ffffff" }} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent dividers sx={{ p: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {/* 1. Client Selection */}
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 800,
              color: "#8d0638",
              textTransform: "uppercase",
              letterSpacing: 0.5,
              mb: 1.5,
            }}
          >
            1. Client
          </Typography>

          <Grid container spacing={2} sx={{ mb: 2.5 }}>
            {/* Client Dropdown (Full Width) */}
            <Grid item xs={12}>
              <Autocomplete
                size="small"
                loading={loadingClients}
                options={clients}
                getOptionLabel={(option) => option.displayName || option.name || ""}
                isOptionEqualToValue={(option, val) => option.id === val.id || option.name === val.name}
                value={
                  selectedClient ||
                  clients.find((c) => c.name.toLowerCase() === formData.client_name.toLowerCase()) ||
                  null
                }
                onChange={(_, newValue) => handleClientSelect(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Client *"
                    placeholder="Search client..."
                    required
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <>
                          <Business sx={{ color: "action.active", mr: 1 }} />
                          {params.InputProps.startAdornment}
                        </>
                      ),
                      endAdornment: (
                        <>
                          {loadingClients ? <CircularProgress color="inherit" size={18} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
            </Grid>

            {/* Auto-populated Client Summary Card */}
            {formData.client_name && (
              <Grid item xs={12}>
                <Card
                  variant="outlined"
                  sx={{
                    bgcolor: "#f8fafc",
                    borderColor: "#e2e8f0",
                    borderRadius: 2,
                  }}
                >
                  <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 1 }}>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold" color="#1e293b">
                          {formData.client_name}
                        </Typography>
                        {formData.client_address && (
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.3, fontSize: "12px", color: "#64748b" }}>
                            <LocationOn sx={{ fontSize: "14px" }} />
                            <span>{formData.client_address}</span>
                          </Box>
                        )}
                      </Box>

                      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                        {formData.client_phone && (
                          <Chip
                            size="small"
                            icon={<Phone sx={{ fontSize: "13px !important" }} />}
                            label={formData.client_phone}
                            sx={{ fontSize: "11px", bgcolor: "#f1f5f9" }}
                          />
                        )}
                        {formData.client_email && (
                          <Chip
                            size="small"
                            icon={<Email sx={{ fontSize: "13px !important" }} />}
                            label={formData.client_email}
                            sx={{ fontSize: "11px", bgcolor: "#f1f5f9" }}
                          />
                        )}
                        {formData.client_gst && (
                          <Chip
                            size="small"
                            icon={<Receipt sx={{ fontSize: "13px !important" }} />}
                            label={`GSTIN: ${formData.client_gst}`}
                            sx={{ fontSize: "11px", bgcolor: "#f1f5f9" }}
                          />
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>

          {/* 2. Quotation Validity */}
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 800,
              color: "#8d0638",
              textTransform: "uppercase",
              letterSpacing: 0.5,
              mb: 1.5,
            }}
          >
            2. Dates
          </Typography>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="Date"
                InputLabelProps={{ shrink: true }}
                value={formData.quotation_date}
                onChange={(e) => setFormData({ ...formData, quotation_date: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="Valid Until"
                InputLabelProps={{ shrink: true }}
                value={formData.valid_until}
                onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
              />
            </Grid>
          </Grid>

          {/* 3. Product Line Items */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1,
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 800,
                color: "#8d0638",
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              3. Products
            </Typography>
            <Button
              size="small"
              startIcon={<Add />}
              variant="outlined"
              onClick={handleAddItem}
              sx={{
                borderColor: "#8d0638",
                color: "#8d0638",
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              Add Item
            </Button>
          </Box>

          <Paper variant="outlined" sx={{ mb: 3, overflowX: "auto" }}>
            <Table size="small">
              <TableHead sx={{ bgcolor: "#f9fafb" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800, width: "36%", color: "#1e293b" }}>Product *</TableCell>
                  <TableCell sx={{ fontWeight: 800, width: "10%", color: "#1e293b", textAlign: "center" }}>HSN</TableCell>
                  <TableCell sx={{ fontWeight: 800, width: "14%", color: "#1e293b" }}>Packing</TableCell>
                  <TableCell sx={{ fontWeight: 800, width: "10%", color: "#1e293b", textAlign: "center" }}>Qty</TableCell>
                  <TableCell sx={{ fontWeight: 800, width: "12%", color: "#1e293b", textAlign: "right" }}>Rate (₹)</TableCell>
                  <TableCell sx={{ fontWeight: 800, width: "10%", color: "#1e293b", textAlign: "center" }}>Disc %</TableCell>
                  <TableCell sx={{ fontWeight: 800, width: "12%", color: "#1e293b", textAlign: "right" }}>
                    Total (₹)
                  </TableCell>
                  <TableCell sx={{ width: "4%" }}></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((it, idx) => (
                  <TableRow key={idx} hover>
                    {/* Product Dropdown */}
                    <TableCell>
                      <Autocomplete
                        size="small"
                        options={productsList}
                        getOptionLabel={(opt) => (typeof opt === "string" ? opt : opt.name || "")}
                        isOptionEqualToValue={(option, val) =>
                          option.name === (typeof val === "string" ? val : val?.name)
                        }
                        value={productsList.find((p) => p.name === it.description) || null}
                        onChange={(_, selectedPrd) => handleProductSelect(idx, selectedPrd)}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            placeholder="Select product..."
                            required
                          />
                        )}
                        renderOption={(props, option) => (
                          <li {...props} key={option.id || option.product_code}>
                            <Box sx={{ width: "100%" }}>
                              <Typography variant="body2" fontWeight="600">{option.name}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {option.composition ? `${option.composition} • ` : ""}{option.packaging} • {option.unit} • ₹{parseFloat(option.price || 0).toFixed(2)}
                              </Typography>
                            </Box>
                          </li>
                        )}
                      />
                    </TableCell>

                    {/* HSN (Auto from Product, Read-only) */}
                    <TableCell sx={{ textAlign: "center" }}>
                      <Chip
                        size="small"
                        label={it.hsn || "3004"}
                        sx={{ bgcolor: "#f1f5f9", fontWeight: 700, fontSize: "11px", color: "#334155" }}
                      />
                    </TableCell>

                    {/* Packing (Auto from Product, Read-only) */}
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "#334155" }}>
                        {it.pack || "—"}
                      </Typography>
                    </TableCell>

                    {/* Qty (Text field accepting only numbers, visible without spinners) */}
                    <TableCell sx={{ textAlign: "center" }}>
                      <TextField
                        size="small"
                        value={it.qty !== undefined && it.qty !== null ? it.qty : ""}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, "");
                          handleItemChange(idx, "qty", val === "" ? "" : parseInt(val, 10));
                        }}
                        sx={{
                          width: 70,
                          "& .MuiInputBase-input": {
                            textAlign: "center",
                            fontWeight: 800,
                            fontSize: "14px",
                            color: "#0f172a",
                            py: 0.8,
                          },
                        }}
                      />
                    </TableCell>

                    {/* Rate (Auto from Product, Read-only) */}
                    <TableCell sx={{ textAlign: "right" }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: "#0f172a" }}>
                        ₹{parseFloat(it.rate || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </Typography>
                    </TableCell>

                    {/* Disc % (Text field accepting only numbers, visible without spinners) */}
                    <TableCell sx={{ textAlign: "center" }}>
                      <TextField
                        size="small"
                        value={it.discount !== undefined && it.discount !== null ? it.discount : ""}
                        onChange={(e) => {
                          let val = e.target.value.replace(/[^0-9.]/g, "");
                          if (parseFloat(val) > 100) val = "100";
                          handleItemChange(idx, "discount", val);
                        }}
                        sx={{
                          width: 65,
                          "& .MuiInputBase-input": {
                            textAlign: "center",
                            fontWeight: 800,
                            fontSize: "14px",
                            color: "#0f172a",
                            py: 0.8,
                          },
                        }}
                      />
                    </TableCell>

                    {/* Line Total */}
                    <TableCell sx={{ textAlign: "right", fontWeight: 800, color: "#8d0638" }}>
                      ₹{parseFloat(it.amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </TableCell>

                    {/* Delete Line */}
                    <TableCell>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteItem(idx)}
                        disabled={items.length === 1}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>

          {/* 4. Financial Calculation Summary */}
          <Grid container spacing={3} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Terms"
                value={formData.terms_conditions}
                onChange={(e) => setFormData({ ...formData, terms_conditions: e.target.value })}
                multiline
                rows={4}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                size="small"
                label="Notes"
                placeholder="Special notes..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                multiline
                rows={2}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: "#f9fafb", borderRadius: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
                  <Typography variant="body2" color="text.secondary">
                    Subtotal:
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    ₹{subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </Typography>
                </Box>

                <Grid container spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Discount %"
                      value={
                        formData.discount_percent !== undefined && formData.discount_percent !== null
                          ? formData.discount_percent
                          : 0
                      }
                      onChange={(e) => {
                        let val = e.target.value.replace(/[^0-9.]/g, "");
                        if (parseFloat(val) > 100) val = "100";
                        setFormData({ ...formData, discount_percent: val });
                      }}
                      sx={{
                        "& .MuiInputBase-input": {
                          fontWeight: 800,
                          fontSize: "14px",
                          color: "#0f172a",
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={6} sx={{ textAlign: "right" }}>
                    <Typography variant="body2" color="error">
                      -₹{discountAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </Typography>
                  </Grid>
                </Grid>

                <Grid container spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                  <Grid item xs={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel>GST</InputLabel>
                      <Select
                        value={formData.tax_percent}
                        label="GST"
                        onChange={(e) =>
                          setFormData({ ...formData, tax_percent: Number(e.target.value) })
                        }
                      >
                        <MenuItem value={0}>0%</MenuItem>
                        <MenuItem value={5}>5%</MenuItem>
                        <MenuItem value={12}>12%</MenuItem>
                        <MenuItem value={18}>18%</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={6} sx={{ textAlign: "right" }}>
                    <Typography variant="body2" color="text.secondary">
                      +₹{taxAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </Typography>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 1.5, borderColor: "#000000" }} />

                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="subtitle1" fontWeight="bold" color="#8d0638">
                    Grand Total:
                  </Typography>
                  <Typography variant="h6" fontWeight="bold" color="#8d0638">
                    ₹{grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </Typography>
                </Box>

                {!quotation && grandTotal > approvalThreshold && (
                  <Box sx={{ mt: 1.5, textAlign: "right" }}>
                    <Chip
                      size="small"
                      icon={<Schedule sx={{ fontSize: "14px !important" }} />}
                      label={`Exceeds limit ₹${approvalThreshold.toLocaleString("en-IN")} (Needs Approval)`}
                      sx={{
                        bgcolor: "#fef3c7",
                        color: "#b45309",
                        fontWeight: 700,
                        fontSize: "11px",
                        border: "1px solid #fde68a",
                      }}
                    />
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 2, display: "flex", justifyContent: "space-between" }}>
          <Button onClick={onClose} variant="outlined" color="inherit" disabled={loading}>
            Cancel
          </Button>

          <Box sx={{ display: "flex", gap: 1.5 }}>
            {/* Preview Button Before Creating */}
            <Button
              variant="outlined"
              startIcon={<Visibility />}
              onClick={handleOpenPreview}
              disabled={loading}
              sx={{
                borderColor: "#8d0638",
                color: "#8d0638",
                textTransform: "none",
                fontWeight: 600,
                "&:hover": { borderColor: "#6b042d", bgcolor: "rgba(141,6,56,0.04)" },
              }}
            >
              Preview
            </Button>

            {/* Create/Save Button */}
            <Button
              type="submit"
              variant="contained"
              startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <Save />}
              disabled={loading}
              sx={{
                bgcolor: "#8d0638",
                "&:hover": { bgcolor: "#6b042d" },
                fontWeight: 700,
                px: 3,
              }}
            >
              {loading ? "Saving..." : quotation ? "Update" : "Create"}
            </Button>
          </Box>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default QuotationModal;
