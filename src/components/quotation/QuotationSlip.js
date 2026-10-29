"use client";

import React, { useRef, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Chip,
  Divider,
} from "@mui/material";
import {
  Download,
  Print,
  ArrowBack,
  Edit,
} from "@mui/icons-material";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

function QuotationSlip({ quotation, onBack, onEdit }) {
  const [downloading, setDownloading] = useState(false);
  const slipRef = useRef(null);

  if (!quotation) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography color="text.secondary">No quotation data to display.</Typography>
        <Button onClick={onBack} sx={{ mt: 2 }} variant="outlined">
          Back to List
        </Button>
      </Box>
    );
  }

  const comp = quotation.company || {
    name: "M/S ABERDURE PHARMA",
    tagline: "Quality Medicines For Better Health",
    address:
      "1ST FLOOR, SHOP 28 PROP.NO 920-21 WARD NO 07 KH NO 1151/3, BISHAN SWAROOP COMPLEX, MEHRAULI MAIN MARKET, MEHRAULI, NEW DELHI, SOUTH DELHI, DELHI, 110030",
    phone: "+91 98112 23344, +91 11 2664 4556",
    email: "info@aberdurepharma.com",
    gstin: "07AAXFA1234B1Z9",
    dlNo: "DL-20B/21B-12345/67",
  };

  const items = Array.isArray(quotation.items) ? quotation.items : [];

  const handleDownloadPDF = async () => {
    if (!slipRef.current) return;
    setDownloading(true);

    try {
      const element = slipRef.current;
      const canvas = await html2canvas(element, {
        scale: 2.2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
      pdf.save(`Quotation_${quotation.quotation_no.replace(/\//g, "_")}.pdf`);
    } catch (err) {
      console.error("Error generating PDF:", err);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dStr) => {
    if (!dStr) return "NA";
    try {
      const d = new Date(dStr);
      if (isNaN(d.getTime())) return dStr;
      return d.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch (_) {
      return dStr;
    }
  };

  const getStatusColor = (st) => {
    switch ((st || "").toLowerCase()) {
      case "approved":
        return "#10b981";
      case "sent":
        return "#3b82f6";
      case "rejected":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  return (
    <Box sx={{ width: "100%", maxWidth: "1000px", mx: "auto", pb: 5 }}>
      {/* Top Action Toolbar */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2.5,
          flexWrap: "wrap",
          gap: 1.5,
        }}
        className="no-print"
      >
        <Button
          startIcon={<ArrowBack />}
          variant="outlined"
          onClick={onBack}
          sx={{
            borderColor: "#d1d5db",
            color: "#374151",
            textTransform: "none",
            fontWeight: 600,
            borderRadius: 2,
            "&:hover": { borderColor: "#9ca3af", bgcolor: "#f3f4f6" },
          }}
        >
          Back
        </Button>

        <Box sx={{ display: "flex", gap: 1.5 }}>
          {onEdit && (
            <Button
              startIcon={<Edit />}
              variant="outlined"
              onClick={() => onEdit(quotation)}
              sx={{
                borderColor: "#8d0638",
                color: "#8d0638",
                textTransform: "none",
                fontWeight: 600,
                borderRadius: 2,
                "&:hover": { borderColor: "#6b042d", bgcolor: "rgba(141,6,56,0.04)" },
              }}
            >
              Edit
            </Button>
          )}

          <Button
            startIcon={<Print />}
            variant="outlined"
            onClick={handlePrint}
            sx={{
              borderColor: "#8d0638",
              color: "#8d0638",
              textTransform: "none",
              fontWeight: 600,
              borderRadius: 2,
              "&:hover": { borderColor: "#6b042d", bgcolor: "rgba(141,6,56,0.04)" },
            }}
          >
            Print
          </Button>

          <Button
            startIcon={
              downloading ? <CircularProgress size={16} color="inherit" /> : <Download />
            }
            variant="contained"
            onClick={handleDownloadPDF}
            disabled={downloading}
            sx={{
              bgcolor: "#8d0638",
              "&:hover": { bgcolor: "#6b042d" },
              textTransform: "none",
              fontWeight: 600,
              borderRadius: 2,
            }}
          >
            {downloading ? "Generating PDF..." : "Download PDF"}
          </Button>
        </Box>
      </Box>

      {/* Aberdure Pharma Printable Quotation Sheet */}
      <Paper
        ref={slipRef}
        elevation={3}
        sx={{
          bgcolor: "#ffffff",
          color: "#000000",
          border: "2px solid #000000",
          p: { xs: 2, sm: 3 },
          fontFamily: "'Segoe UI', Arial, sans-serif",
          position: "relative",
        }}
      >
        {/* Company Header */}
        <Box sx={{ textAlign: "center", borderBottom: "2px solid #000000", pb: 1.5, mb: 1 }}>
          <Typography
            sx={{
              fontSize: { xs: "20px", sm: "24px" },
              fontWeight: 900,
              letterSpacing: 1.5,
              color: "#8d0638",
              lineHeight: 1.2,
            }}
          >
            {comp.name}
          </Typography>
          <Typography
            sx={{
              fontSize: "11px",
              fontWeight: 600,
              color: "#4b5563",
              letterSpacing: 0.5,
              mb: 0.5,
            }}
          >
            {comp.tagline}
          </Typography>
          <Typography
            sx={{
              fontSize: "10.5px",
              lineHeight: 1.35,
              maxWidth: "800px",
              mx: "auto",
              color: "#1f2937",
            }}
          >
            {comp.address}
          </Typography>
          <Typography sx={{ fontSize: "10px", color: "#4b5563", mt: 0.5, fontWeight: 500 }}>
            <strong>GSTIN:</strong> {comp.gstin} | <strong>D.L. No:</strong> {comp.dlNo} |{" "}
            <strong>Email:</strong> {comp.email} | <strong>Phone:</strong> {comp.phone}
          </Typography>
        </Box>

        {/* Quotation Title Bar */}
        <Box
          sx={{
            bgcolor: "#f3f4f6",
            border: "1px solid #000000",
            py: 0.6,
            px: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1.5,
          }}
        >
          <Typography sx={{ fontSize: "14px", fontWeight: 800, letterSpacing: 1 }}>
            QUOTATION
          </Typography>
          <Chip
            size="small"
            label={quotation.status || "Sent"}
            sx={{
              fontWeight: 700,
              fontSize: "11px",
              bgcolor: getStatusColor(quotation.status),
              color: "#ffffff",
              height: 22,
            }}
          />
        </Box>

        {/* 2-Column Info Grid */}
        <Box
          sx={{
            display: "flex",
            border: "1px solid #000000",
            mb: 2,
            flexDirection: { xs: "column", sm: "row" },
          }}
        >
          {/* Left Column: Buyer / Client Info */}
          <Box
            sx={{
              width: { xs: "100%", sm: "55%" },
              borderRight: { xs: "none", sm: "1px solid #000000" },
              borderBottom: { xs: "1px solid #000000", sm: "none" },
              p: 1.2,
            }}
          >
            <Typography
              sx={{
                fontSize: "10.5px",
                fontWeight: 800,
                color: "#8d0638",
                textTransform: "uppercase",
                mb: 0.5,
                borderBottom: "1px dashed #d1d5db",
                pb: 0.3,
              }}
            >
              Quotation For
            </Typography>
            <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#111827" }}>
              {quotation.client_name}
            </Typography>
            {quotation.client_address && (
              <Typography sx={{ fontSize: "10.5px", color: "#374151", mt: 0.3 }}>
                {quotation.client_address}
              </Typography>
            )}
            <Box sx={{ mt: 0.6, fontSize: "10.5px", color: "#374151" }}>
              {quotation.client_phone && (
                <div>
                  <strong>Phone:</strong> {quotation.client_phone}
                </div>
              )}
              {quotation.client_email && (
                <div>
                  <strong>Email:</strong> {quotation.client_email}
                </div>
              )}
              {quotation.client_gst && (
                <div>
                  <strong>GSTIN:</strong> {quotation.client_gst}
                </div>
              )}
            </Box>
          </Box>

          {/* Right Column: Quotation Metadata */}
          <Box sx={{ width: { xs: "100%", sm: "45%" }, p: 1.2 }}>
            <Typography
              sx={{
                fontSize: "10.5px",
                fontWeight: 800,
                color: "#8d0638",
                textTransform: "uppercase",
                mb: 0.5,
                borderBottom: "1px dashed #d1d5db",
                pb: 0.3,
              }}
            >
              Quotation Details
            </Typography>
            <Box sx={{ fontSize: "11px", display: "flex", flexDirection: "column", gap: 0.4 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 600 }}>Quotation No:</span>
                <span style={{ fontWeight: 800, color: "#8d0638" }}>
                  {quotation.quotation_no}
                </span>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 600 }}>Date of Issue:</span>
                <span>{formatDate(quotation.quotation_date)}</span>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 600 }}>Valid Until:</span>
                <span style={{ fontWeight: 600, color: "#dc2626" }}>
                  {formatDate(quotation.valid_until)}
                </span>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 600 }}>Prepared By:</span>
                <span>{quotation.prepared_by || "Sales Executive"}</span>
              </Box>
              {quotation.subject && (
                <Box sx={{ display: "flex", justifyContent: "space-between", mt: 0.5 }}>
                  <span style={{ fontWeight: 600 }}>Subject:</span>
                  <span style={{ fontWeight: 500, textAlign: "right", maxWidth: "60%" }}>
                    {quotation.subject}
                  </span>
                </Box>
              )}
            </Box>
          </Box>
        </Box>

        {/* Line Items Table */}
        <Box sx={{ border: "1px solid #000000", mb: 1.5 }}>
          {/* Table Header */}
          <Box
            sx={{
              display: "flex",
              bgcolor: "#e5e7eb",
              fontWeight: 800,
              fontSize: "10.5px",
              borderBottom: "1px solid #000000",
              textAlign: "center",
              py: 0.6,
            }}
          >
            <Box sx={{ width: "6%", borderRight: "1px solid #000000" }}>S.N.</Box>
            <Box sx={{ width: "40%", borderRight: "1px solid #000000", textAlign: "left", pl: 1 }}>
              Product Description
            </Box>
            <Box sx={{ width: "10%", borderRight: "1px solid #000000" }}>HSN</Box>
            <Box sx={{ width: "12%", borderRight: "1px solid #000000" }}>Packing</Box>
            <Box sx={{ width: "8%", borderRight: "1px solid #000000" }}>Qty</Box>
            <Box sx={{ width: "12%", borderRight: "1px solid #000000" }}>Rate (₹)</Box>
            <Box sx={{ width: "12%" }}>Amount (₹)</Box>
          </Box>

          {/* Table Rows */}
          {items.map((item, idx) => (
            <Box
              key={idx}
              sx={{
                display: "flex",
                fontSize: "10.5px",
                borderBottom: idx !== items.length - 1 ? "1px solid #e5e7eb" : "none",
                py: 0.6,
                alignItems: "center",
                "&:nth-of-type(even)": { bgcolor: "#f9fafb" },
              }}
            >
              <Box sx={{ width: "6%", textAlign: "center", borderRight: "1px solid #e5e7eb" }}>
                {idx + 1}
              </Box>
              <Box
                sx={{
                  width: "40%",
                  pl: 1,
                  pr: 0.5,
                  fontWeight: 600,
                  borderRight: "1px solid #e5e7eb",
                }}
              >
                {item.description}
                {item.discount > 0 && (
                  <span style={{ fontSize: "9px", color: "#16a34a", marginLeft: "6px" }}>
                    ({item.discount}% off)
                  </span>
                )}
              </Box>
              <Box sx={{ width: "10%", textAlign: "center", borderRight: "1px solid #e5e7eb" }}>
                {item.hsn || "3004"}
              </Box>
              <Box sx={{ width: "12%", textAlign: "center", borderRight: "1px solid #e5e7eb" }}>
                {item.pack || "Box"}
              </Box>
              <Box
                sx={{
                  width: "8%",
                  textAlign: "center",
                  fontWeight: 600,
                  borderRight: "1px solid #e5e7eb",
                }}
              >
                {item.qty}
              </Box>
              <Box
                sx={{
                  width: "12%",
                  textAlign: "right",
                  pr: 1,
                  borderRight: "1px solid #e5e7eb",
                }}
              >
                {parseFloat(item.rate || 0).toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </Box>
              <Box sx={{ width: "12%", textAlign: "right", pr: 1, fontWeight: 700 }}>
                {parseFloat(item.amount || 0).toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </Box>
            </Box>
          ))}
        </Box>

        {/* Totals & Summary Calculation */}
        <Box
          sx={{
            display: "flex",
            border: "1px solid #000000",
            mb: 1.5,
            flexDirection: { xs: "column", sm: "row" },
          }}
        >
          {/* Left: Bank Details & Amount in Words */}
          <Box
            sx={{
              width: { xs: "100%", sm: "55%" },
              borderRight: { xs: "none", sm: "1px solid #000000" },
              borderBottom: { xs: "1px solid #000000", sm: "none" },
              p: 1.2,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <Box>
              <Typography sx={{ fontSize: "10px", fontWeight: 800, color: "#8d0638", mb: 0.3 }}>
                BANK ACCOUNT DETAILS FOR REMITTANCE:
              </Typography>
              <Box sx={{ fontSize: "9.5px", lineHeight: 1.5, color: "#374151" }}>
                <div>
                  <strong>Account Name:</strong> M/S ABERDURE PHARMA
                </div>
                <div>
                  <strong>Bank:</strong> HDFC Bank Ltd.
                </div>
                <div>
                  <strong>Account Number:</strong> 50200088991122
                </div>
                <div>
                  <strong>IFSC Code:</strong> HDFC0001234 (Mehrauli Branch)
                </div>
              </Box>
            </Box>

            <Box sx={{ mt: 1, pt: 0.8, borderTop: "1px dashed #d1d5db" }}>
              <Typography sx={{ fontSize: "9.5px", fontWeight: 700, color: "#4b5563" }}>
                AMOUNT IN WORDS:
              </Typography>
              <Typography
                sx={{
                  fontSize: "11px",
                  fontWeight: 800,
                  color: "#111827",
                  fontStyle: "italic",
                }}
              >
                {quotation.totalInWords || "Rupees Only"}
              </Typography>
            </Box>
          </Box>

          {/* Right: Financial Breakdown */}
          <Box sx={{ width: { xs: "100%", sm: "45%" }, p: 1.2 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, fontSize: "11px" }}>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <span>Subtotal:</span>
                <span style={{ fontWeight: 600 }}>
                  ₹
                  {parseFloat(quotation.subtotal || 0).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </Box>

              {parseFloat(quotation.discount_amount || 0) > 0 && (
                <Box sx={{ display: "flex", justifyContent: "space-between", color: "#16a34a" }}>
                  <span>Discount ({quotation.discount_percent}%):</span>
                  <span>
                    -₹
                    {parseFloat(quotation.discount_amount || 0).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </Box>
              )}

              {/* GST Breakdown */}
              {quotation.tax_type === "IGST" ? (
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <span>IGST ({quotation.tax_percent}%):</span>
                  <span>
                    ₹
                    {parseFloat(quotation.tax_amount || 0).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </Box>
              ) : (
                <>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <span>CGST ({quotation.cgstPercent || (parseFloat(quotation.tax_percent || 12) / 2)}%):</span>
                    <span>
                      ₹
                      {parseFloat(
                        quotation.cgstAmount || (parseFloat(quotation.tax_amount || 0) / 2)
                      ).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <span>SGST ({quotation.sgstPercent || (parseFloat(quotation.tax_percent || 12) / 2)}%):</span>
                    <span>
                      ₹
                      {parseFloat(
                        quotation.sgstAmount || (parseFloat(quotation.tax_amount || 0) / 2)
                      ).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </Box>
                </>
              )}

              <Divider sx={{ my: 0.4, borderColor: "#000000" }} />

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "14px",
                  fontWeight: 900,
                  color: "#8d0638",
                }}
              >
                <span>GRAND TOTAL:</span>
                <span>
                  ₹
                  {parseFloat(quotation.total_amount || 0).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Terms & Conditions and Signature Section */}
        <Box
          sx={{
            display: "flex",
            border: "1px solid #000000",
            flexDirection: { xs: "column", sm: "row" },
          }}
        >
          {/* Left: Terms & Conditions */}
          <Box
            sx={{
              width: { xs: "100%", sm: "65%" },
              borderRight: { xs: "none", sm: "1px solid #000000" },
              borderBottom: { xs: "1px solid #000000", sm: "none" },
              p: 1.2,
            }}
          >
            <Typography sx={{ fontSize: "10px", fontWeight: 800, color: "#8d0638", mb: 0.3 }}>
              TERMS & CONDITIONS:
            </Typography>
            <Typography
              component="div"
              sx={{
                fontSize: "9px",
                lineHeight: 1.45,
                color: "#374151",
                whiteSpace: "pre-line",
              }}
            >
              {quotation.terms_conditions ||
                "1. Prices are valid for 30 days from date of issue.\n2. Goods delivery within 3-5 business days upon PO receipt.\n3. GST as applicable at the time of supply.\n4. Subject to Delhi jurisdiction."}
            </Typography>
            {quotation.notes && (
              <Box sx={{ mt: 1, p: 0.6, bgcolor: "#fef3c7", borderRadius: 1, fontSize: "9px" }}>
                <strong>Note:</strong> {quotation.notes}
              </Box>
            )}
          </Box>

          {/* Right: Signature */}
          <Box
            sx={{
              width: { xs: "100%", sm: "35%" },
              p: 1.2,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              alignItems: "center",
              textAlign: "center",
              minHeight: 100,
            }}
          >
            <Typography sx={{ fontSize: "10px", fontWeight: 700 }}>
              For {comp.name}
            </Typography>

            <Box sx={{ mt: 4, width: "100%", borderTop: "1px solid #9ca3af", pt: 0.5 }}>
              <Typography sx={{ fontSize: "10px", fontWeight: 800 }}>
                Authorized Signatory
              </Typography>
              <Typography sx={{ fontSize: "8.5px", color: "#6b7280" }}>
                Sales & Commercial Operations
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Footer Note */}
        <Typography
          sx={{
            fontSize: "9px",
            textAlign: "center",
            color: "#6b7280",
            mt: 1,
            fontStyle: "italic",
          }}
        >
          This is a computer-generated quotation issued by Aberdure Pharma and does not require a physical signature.
        </Typography>
      </Paper>
    </Box>
  );
}

export default QuotationSlip;
