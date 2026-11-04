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
  CheckCircle,
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
  composition: "",
  hsn: "3004",
  qty: 1,
  rate: 0,
  discount: 0,
  gst: 5,
  amount: 0,
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

function QuotationModal({ open, onClose, quotation, onSuccess, approvalThreshold = 35 }) {
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
    prepared_by: "",
    status: "Sent",
    tax_type: "CGST/SGST",
    tax_percent: 0,
    discount_percent: 0,
    terms_conditions: DEFAULT_TERMS,
    notes: "",
  });

  const [items, setItems] = useState([
    {
      description: "Amoxicillin & Potassium Clavulanate 625mg",
      composition: "Amoxicillin IP 500mg + Potassium Clavulanate IP 125mg",
      hsn: "3004",
      qty: 25,
      rate: 420,
      discount: 5,
      gst: 5,
      amount: 10473.75,
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
              state: (d.State || d["Dealer State"] || d.state || "").toString().trim(),
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
    const loggedInName = user?.username || user?.Name || user?.name || user?.EmpName || user?.emp_name || user?.emp_id || user?.EmpId || "";

    if (quotation) {
      const qTaxType = quotation.tax_type || (
        quotation.client_gst && !quotation.client_gst.trim().startsWith("07") && quotation.client_address && !quotation.client_address.toLowerCase().includes("delhi")
          ? "IGST"
          : "CGST/SGST"
      );

      setFormData({
        client_name: quotation.client_name || "",
        client_email: quotation.client_email || "",
        client_phone: quotation.client_phone || "",
        client_address: quotation.client_address || "",
        client_state: quotation.State || quotation.client_state || "",
        State: quotation.State || quotation.client_state || "",
        client_gst: quotation.client_gst || "",
        subject: quotation.subject || "Quotation for Supply of Pharmaceutical Products",
        quotation_date: quotation.quotation_date ? quotation.quotation_date.slice(0, 10) : "",
        valid_until: quotation.valid_until ? quotation.valid_until.slice(0, 10) : "",
        prepared_by: quotation.prepared_by || loggedInName,
        status: quotation.status || "Sent",
        tax_type: qTaxType,
        tax_percent: quotation.tax_percent !== undefined ? parseFloat(quotation.tax_percent) : 0,
        discount_percent: quotation.discount_percent !== undefined ? parseFloat(quotation.discount_percent) : 0,
        terms_conditions: quotation.terms_conditions || DEFAULT_TERMS,
        notes: quotation.notes || "",
      });

      let parsed = [];
      try {
        parsed = typeof quotation.items === "string" ? JSON.parse(quotation.items) : (quotation.items || []);
      } catch (_) {}

      const formattedLoadedItems = (parsed.length > 0 ? parsed : [{ ...EMPTY_ITEM }]).map(it => {
        const qty = parseFloat(it.qty) || 0;
        const rate = parseFloat(it.rate) || 0;
        const disc = parseFloat(it.discount) || 0;
        const gst = it.gst !== undefined ? parseFloat(it.gst) : 5;
        const raw = qty * rate;
        const taxable = raw - (raw * disc) / 100;
        const gstAmt = (taxable * gst) / 100;
        const amt = it.amount !== undefined ? parseFloat(it.amount) : Math.round((taxable + gstAmt) * 100) / 100;

        return {
          ...it,
          composition: it.composition || "",
          gst: gst,
          amount: amt
        };
      });

      setItems(formattedLoadedItems);

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
        status: "Sent",
        tax_type: "CGST/SGST",
        tax_percent: 0,
        discount_percent: 0,
        terms_conditions: DEFAULT_TERMS,
        notes: "",
      });
      setSelectedClient(null);
      setItems([
        {
          description: "Amoxicillin & Potassium Clavulanate 625mg",
          composition: "Amoxicillin IP 500mg + Potassium Clavulanate IP 125mg",
          hsn: "3004",
          qty: 25,
          rate: 420,
          discount: 5,
          gst: 5,
          amount: 10473.75,
        },
      ]);
    }
    setError("");
    setShowPreview(false);
  }, [quotation, open, user, clients]);

  // When a doctor is chosen from dropdown, auto-populate details & check state (Same State: Delhi -> CGST/SGST, Different State -> IGST)
  const handleClientSelect = (clientObj) => {
    setSelectedClient(clientObj);
    if (clientObj) {
      const clientState = (clientObj.state || "").trim().toLowerCase();
      const clientGst = (clientObj.gst || "").trim();
      const clientAddr = (clientObj.address || "").toLowerCase();

      // Check same state (Delhi) vs different state
      let isSameState = true;
      if (clientState) {
        // If state is Delhi / New Delhi / DL -> Same state, otherwise different state (IGST)
        isSameState = clientState.includes("delhi") || clientState === "dl";
      } else {
        // Fallback to GSTIN prefix (07 = Delhi) or address
        isSameState = clientGst.startsWith("07") || clientAddr.includes("delhi");
      }

      const detectedTaxType = isSameState ? "CGST/SGST" : "IGST";

      setFormData((prev) => ({
        ...prev,
        client_name: clientObj.name,
        client_phone: clientObj.phone,
        client_email: clientObj.email,
        client_address: clientObj.address,
        client_state: clientObj.state || "",
        client_gst: clientObj.gst || prev.client_gst,
        tax_type: detectedTaxType,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        client_name: "",
        client_phone: "",
        client_email: "",
        client_address: "",
        client_state: "",
        client_gst: "",
        tax_type: "CGST/SGST",
      }));
    }
  };

  // Line item change with per-product GST calculation
  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;

    const qty = parseFloat(updated[index].qty) || 0;
    const rate = parseFloat(updated[index].rate) || 0;
    const disc = parseFloat(updated[index].discount) || 0;
    const gst = parseFloat(updated[index].gst !== undefined ? updated[index].gst : 5);

    const raw = qty * rate;
    const taxable = raw - (raw * disc) / 100;
    const gstAmt = (taxable * gst) / 100;
    updated[index].amount = Math.round((taxable + gstAmt) * 100) / 100;

    setItems(updated);
  };

  // When a product is chosen from the product master dropdown
  const handleProductSelect = (index, productObj) => {
    const updated = [...items];
    if (productObj) {
      updated[index].description = productObj.name || "";
      updated[index].composition = productObj.composition || "";
      updated[index].hsn = productObj.hsn || "3004";
      updated[index].rate = parseFloat(productObj.price || 0);
      updated[index].gst = productObj.gst !== undefined ? parseFloat(productObj.gst) : 5;
    } else {
      updated[index].description = "";
      updated[index].composition = "";
      updated[index].hsn = "3004";
      updated[index].rate = 0;
      updated[index].gst = 5;
    }

    const qty = parseFloat(updated[index].qty) || 0;
    const rate = parseFloat(updated[index].rate) || 0;
    const disc = parseFloat(updated[index].discount) || 0;
    const gst = parseFloat(updated[index].gst !== undefined ? updated[index].gst : 5);

    const raw = qty * rate;
    const taxable = raw - (raw * disc) / 100;
    const gstAmt = (taxable * gst) / 100;
    updated[index].amount = Math.round((taxable + gstAmt) * 100) / 100;

    setItems(updated);
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        description: "",
        composition: "",
        hsn: "3004",
        qty: 1,
        rate: 0,
        discount: 0,
        gst: 5,
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
  const isInterState = formData.tax_type === "IGST";
  const grandTotal = Math.round(
    items.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0) * 100
  ) / 100;
  const totalTaxable = Math.round(
    items.reduce((acc, curr) => {
      const qty = parseFloat(curr.qty) || 0;
      const rate = parseFloat(curr.rate) || 0;
      const disc = parseFloat(curr.discount) || 0;
      const raw = qty * rate;
      return acc + (raw - (raw * disc) / 100);
    }, 0) * 100
  ) / 100;
  const totalTaxAmount = Math.max(0, Math.round((grandTotal - totalTaxable) * 100) / 100);

  // Build payload for preview or submission
  const buildQuotationPayload = () => {
    const loggedInName = user?.username || user?.Name || user?.name || user?.EmpName || user?.emp_name || user?.emp_id || user?.EmpId || "";
    const thresholdLimit = parseFloat(approvalThreshold) || 35;
    const hasHighDiscount = items.some((it) => (parseFloat(it.discount) || 0) > thresholdLimit);

    return {
      ...formData,
      emp_id: user?.EmpId || user?.emp_id || user?.id,
      prepared_by: quotation?.prepared_by || loggedInName,
      status: quotation?.status || (hasHighDiscount ? "Pending Approval" : "Sent"),
      items,
      subtotal: totalTaxable,
      discount_percent: 0,
      discount_amount: 0,
      tax_amount: totalTaxAmount,
      total_amount: grandTotal,
      tax_type: isInterState ? "IGST" : "CGST/SGST",
      State: formData.client_state || formData.State || "",
      client_state: formData.client_state || formData.State || "",
      totalInWords: numberToWords(grandTotal),
      quotation_no: quotation?.quotation_no || "QT-PREVIEW",
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
      setError("Please choose a Doctor / Hospital from the dropdown before previewing.");
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
      setError("Please select a Doctor from the dropdown.");
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
            bgcolor: "#f37021",
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
              bgcolor: "#f37021",
              "&:hover": { bgcolor: "#d95300" },
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
          bgcolor: "#f37021",
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
              color: "#f37021",
              textTransform: "uppercase",
              letterSpacing: 0.5,
              mb: 1.5,
            }}
          >
            1. Doctor
          </Typography>

          <Grid container spacing={2} sx={{ mb: 2.5 }}>
            {/* Doctor Dropdown (Full Width) */}
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
                    label="Doctor *"
                    placeholder="Search doctor..."
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
                        {formData.client_state && (
                          <Chip
                            size="small"
                            label={`State: ${formData.client_state} (${formData.tax_type})`}
                            sx={{ 
                              fontSize: "11px", 
                              bgcolor: formData.tax_type === "IGST" ? "rgba(184, 22, 82, 0.1)" : "rgba(243, 112, 33, 0.1)",
                              color: formData.tax_type === "IGST" ? "#b81652" : "#f37021",
                              fontWeight: 600,
                            }}
                          />
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>

          {/* 2. Product Line Items */}
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
                color: "#f37021",
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
                borderColor: "#f37021",
                color: "#f37021",
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
                  <TableCell sx={{ fontWeight: 800, width: isInterState ? "34%" : "30%", color: "#1e293b" }}>Product *</TableCell>
                  <TableCell sx={{ fontWeight: 800, width: "9%", color: "#1e293b", textAlign: "center" }}>HSN</TableCell>
                  <TableCell sx={{ fontWeight: 800, width: "9%", color: "#1e293b", textAlign: "center" }}>Qty</TableCell>
                  <TableCell sx={{ fontWeight: 800, width: "12%", color: "#1e293b", textAlign: "right" }}>Rate (₹)</TableCell>
                  <TableCell sx={{ fontWeight: 800, width: "8%", color: "#1e293b", textAlign: "center" }}>Disc %</TableCell>
                  {!isInterState ? (
                    <>
                      <TableCell sx={{ fontWeight: 800, width: "9%", color: "#1e293b", textAlign: "center" }}>CGST %</TableCell>
                      <TableCell sx={{ fontWeight: 800, width: "9%", color: "#1e293b", textAlign: "center" }}>SGST %</TableCell>
                    </>
                  ) : (
                    <TableCell sx={{ fontWeight: 800, width: "12%", color: "#1e293b", textAlign: "center" }}>IGST %</TableCell>
                  )}
                  <TableCell sx={{ fontWeight: 800, width: "14%", color: "#1e293b", textAlign: "right" }}>
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
                        getOptionLabel={(opt) => {
                          if (!opt) return "";
                          if (typeof opt === "string") return opt;
                          return opt.composition ? `${opt.name} (${opt.composition})` : opt.name || "";
                        }}
                        isOptionEqualToValue={(option, val) =>
                          option.name === (typeof val === "string" ? val : val?.name)
                        }
                        value={
                          productsList.find((p) => p.name === it.description) ||
                          (it.description ? { name: it.description, composition: it.composition } : null)
                        }
                        onChange={(_, selectedPrd) => handleProductSelect(idx, selectedPrd)}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            placeholder="Select product..."
                            required
                          />
                        )}
                        renderOption={(props, option) => (
                          <li {...props} key={option.id || option.product_code || option.name}>
                            <Box sx={{ width: "100%" }}>
                              <Typography variant="body2" fontWeight="600">
                                {option.name} {option.composition ? `(${option.composition})` : ""}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                GST: {option.gst !== undefined ? option.gst : 5}% • {option.unit ? `${option.unit} • ` : ""}₹{parseFloat(option.price || 0).toFixed(2)}
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

                    {/* Qty */}
                    <TableCell sx={{ textAlign: "center" }}>
                      <TextField
                        size="small"
                        value={it.qty !== undefined && it.qty !== null ? it.qty : ""}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, "");
                          handleItemChange(idx, "qty", val === "" ? "" : parseInt(val, 10));
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

                    {/* Rate (Auto from Product, Read-only) */}
                    <TableCell sx={{ textAlign: "right" }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: "#0f172a" }}>
                        ₹{parseFloat(it.rate || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </Typography>
                    </TableCell>

                    {/* Disc % */}
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
                          width: 60,
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

                    {/* Dynamic GST Columns */}
                    {!isInterState ? (
                      <>
                        <TableCell sx={{ textAlign: "center" }}>
                          <Chip
                            size="small"
                            label={`${((parseFloat(it.gst !== undefined ? it.gst : 5)) / 2).toFixed(1).replace(/\.0$/, "")}%`}
                            sx={{ bgcolor: "#eff6ff", color: "#1d4ed8", fontWeight: 700, fontSize: "11px" }}
                          />
                        </TableCell>
                        <TableCell sx={{ textAlign: "center" }}>
                          <Chip
                            size="small"
                            label={`${((parseFloat(it.gst !== undefined ? it.gst : 5)) / 2).toFixed(1).replace(/\.0$/, "")}%`}
                            sx={{ bgcolor: "#eff6ff", color: "#1d4ed8", fontWeight: 700, fontSize: "11px" }}
                          />
                        </TableCell>
                      </>
                    ) : (
                      <TableCell sx={{ textAlign: "center" }}>
                        <Chip
                          size="small"
                          label={`${parseFloat(it.gst !== undefined ? it.gst : 5)}%`}
                          sx={{ bgcolor: "#eff6ff", color: "#1d4ed8", fontWeight: 700, fontSize: "11px" }}
                        />
                      </TableCell>
                    )}

                    {/* Line Total */}
                    <TableCell sx={{ textAlign: "right", fontWeight: 600, fontSize: "13.5px", color: "#0f172a" }}>
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
              <Paper variant="outlined" sx={{ p: 2.5, bgcolor: "#f9fafb", borderRadius: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#334155" }}>
                    GRAND TOTAL:
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: "#ea580c" }}>
                    ₹{grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </Typography>
                </Box>

                <Divider sx={{ my: 1.5, borderColor: "#e2e8f0" }} />

                <Box sx={{ fontSize: "12px", color: "#64748b" }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.8 }}>
                    <span>Tax Regime:</span>
                    <strong style={{ color: "#0f172a" }}>
                      {!isInterState ? "Intrastate (Delhi: CGST + SGST)" : "Interstate (Outside Delhi: IGST)"}
                    </strong>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Total Products:</span>
                    <strong style={{ color: "#0f172a" }}>{items.length} Item(s)</strong>
                  </Box>
                </Box>

                {!quotation && (
                  <Box sx={{ mt: 2, textAlign: "right" }}>
                    {items.some((it) => (parseFloat(it.discount) || 0) > 35) ? (
                      <Chip
                        size="small"
                        icon={<Schedule sx={{ fontSize: "14px !important" }} />}
                        label="Item discount > 35% (Requires RM Approval)"
                        sx={{
                          bgcolor: "#fef3c7",
                          color: "#b45309",
                          fontWeight: 700,
                          fontSize: "11px",
                          border: "1px solid #fde68a",
                        }}
                      />
                    ) : (
                      <Chip
                        size="small"
                        icon={<CheckCircle sx={{ fontSize: "14px !important" }} />}
                        label="All discounts ≤ 35% (Direct Send to Client & CC to RM)"
                        sx={{
                          bgcolor: "#ecfdf5",
                          color: "#047857",
                          fontWeight: 700,
                          fontSize: "11px",
                          border: "1px solid #a7f3d0",
                        }}
                      />
                    )}
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
                borderColor: "#f37021",
                color: "#f37021",
                textTransform: "none",
                fontWeight: 600,
                "&:hover": { borderColor: "#d95300", bgcolor: "rgba(243, 112, 33,0.04)" },
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
                bgcolor: "#f37021",
                "&:hover": { bgcolor: "#d95300" },
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
