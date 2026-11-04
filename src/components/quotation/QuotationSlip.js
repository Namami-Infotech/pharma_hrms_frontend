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

  // Determine GST Tax Type: Delhi (07) = Same State (CGST + SGST), Outside Delhi = Interstate (IGST)
  const isInterState =
    quotation.tax_type === "IGST" ||
    (quotation.client_gst &&
      !quotation.client_gst.trim().startsWith("07") &&
      quotation.client_address &&
      !quotation.client_address.toLowerCase().includes("delhi"));

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
          {onEdit && quotation.status === "Draft" && (
            <Button
              startIcon={<Edit />}
              variant="outlined"
              onClick={() => onEdit(quotation)}
              sx={{
                borderColor: "#f37021",
                color: "#f37021",
                textTransform: "none",
                fontWeight: 600,
                borderRadius: 2,
                "&:hover": { borderColor: "#d95300", bgcolor: "rgba(243, 112, 33,0.04)" },
              }}
            >
              Edit
            </Button>
          )}



          <Button
            startIcon={
              downloading ? <CircularProgress size={16} color="inherit" /> : <Download />
            }
            variant="contained"
            onClick={handleDownloadPDF}
            disabled={downloading}
            sx={{
              bgcolor: "#f37021",
              "&:hover": { bgcolor: "#d95300" },
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
              color: "#f37021",
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
                color: "#f37021",
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
                color: "#f37021",
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
                <span style={{ fontWeight: 800, color: "#f37021" }}>
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
        <Box sx={{ border: "1px solid #000000", mb: 1.5, overflow: "hidden" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              tableLayout: "fixed",
              fontFamily: "inherit",
              margin: 0,
              padding: 0,
            }}
          >
            <colgroup>
              <col style={{ width: "5%" }} />
              <col style={{ width: isInterState ? "41%" : "37%" }} />
              <col style={{ width: "9%" }} />
              <col style={{ width: isInterState ? "8%" : "7%" }} />
              <col style={{ width: isInterState ? "13%" : "12%" }} />
              <col style={{ width: isInterState ? "7%" : "6%" }} />
              {!isInterState ? (
                <>
                  <col style={{ width: "6%" }} />
                  <col style={{ width: "6%" }} />
                </>
              ) : (
                <col style={{ width: "7%" }} />
              )}
              <col style={{ width: isInterState ? "14%" : "13%" }} />
            </colgroup>
            <thead>
              <tr
                style={{
                  backgroundColor: "#e5e7eb",
                  fontWeight: 800,
                  fontSize: "10.5px",
                  borderBottom: "1px solid #000000",
                }}
              >
                <th style={{ padding: "6px 2px", textAlign: "center", borderRight: "1px solid #000000", fontWeight: 800 }}>
                  S.N.
                </th>
                <th style={{ padding: "6px 8px", textAlign: "left", borderRight: "1px solid #000000", fontWeight: 800 }}>
                  Product Description
                </th>
                <th style={{ padding: "6px 2px", textAlign: "center", borderRight: "1px solid #000000", fontWeight: 800 }}>
                  HSN
                </th>
                <th style={{ padding: "6px 2px", textAlign: "center", borderRight: "1px solid #000000", fontWeight: 800 }}>
                  Qty
                </th>
                <th style={{ padding: "6px 8px", textAlign: "right", borderRight: "1px solid #000000", fontWeight: 800 }}>
                  Rate (₹)
                </th>
                <th style={{ padding: "6px 2px", textAlign: "center", borderRight: "1px solid #000000", fontWeight: 800 }}>
                  Disc %
                </th>
                {!isInterState ? (
                  <>
                    <th style={{ padding: "6px 2px", textAlign: "center", borderRight: "1px solid #000000", fontWeight: 800 }}>
                      CGST %
                    </th>
                    <th style={{ padding: "6px 2px", textAlign: "center", borderRight: "1px solid #000000", fontWeight: 800 }}>
                      SGST %
                    </th>
                  </>
                ) : (
                  <th style={{ padding: "6px 2px", textAlign: "center", borderRight: "1px solid #000000", fontWeight: 800 }}>
                    IGST %
                  </th>
                )}
                <th style={{ padding: "6px 8px", textAlign: "right", fontWeight: 800 }}>
                  Amount (₹)
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => {
                const gstVal = parseFloat(item.gst !== undefined ? item.gst : 5);
                const cgstVal = (gstVal / 2).toFixed(1).replace(/\.0$/, "");
                const sgstVal = (gstVal / 2).toFixed(1).replace(/\.0$/, "");

                return (
                  <tr
                    key={idx}
                    style={{
                      fontSize: "10.5px",
                      borderBottom: idx !== items.length - 1 ? "1px solid #000000" : "none",
                      backgroundColor: idx % 2 === 1 ? "#f9fafb" : "#ffffff",
                    }}
                  >
                    <td style={{ padding: "6px 2px", textAlign: "center", borderRight: "1px solid #000000" }}>
                      {idx + 1}
                    </td>
                    <td style={{ padding: "6px 8px", textAlign: "left", borderRight: "1px solid #000000" }}>
                      <span style={{ fontWeight: 600, color: "#111827" }}>
                        {item.description || item.name}
                      </span>
                      {item.composition ? (
                        <span style={{ fontWeight: 500, color: "#4b5563", marginLeft: "4px" }}>
                          ({item.composition})
                        </span>
                      ) : null}
                      {parseFloat(item.discount || 0) > 0 && (
                        <span style={{ fontSize: "9px", color: "#16a34a", marginLeft: "6px", fontWeight: 600 }}>
                          ({item.discount}% off)
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "6px 2px", textAlign: "center", borderRight: "1px solid #000000" }}>
                      {item.hsn || "3004"}
                    </td>
                    <td style={{ padding: "6px 2px", textAlign: "center", fontWeight: 600, borderRight: "1px solid #000000" }}>
                      {item.qty}
                    </td>
                    <td style={{ padding: "6px 8px", textAlign: "right", borderRight: "1px solid #000000" }}>
                      {parseFloat(item.rate || 0).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td style={{ padding: "6px 2px", textAlign: "center", borderRight: "1px solid #000000" }}>
                      {item.discount ? `${item.discount}%` : "—"}
                    </td>
                    {!isInterState ? (
                      <>
                        <td
                          style={{
                            padding: "6px 2px",
                            textAlign: "center",
                            borderRight: "1px solid #000000",
                            color: "#1e40af",
                            fontWeight: 600,
                          }}
                        >
                          {`${cgstVal}%`}
                        </td>
                        <td
                          style={{
                            padding: "6px 2px",
                            textAlign: "center",
                            borderRight: "1px solid #000000",
                            color: "#1e40af",
                            fontWeight: 600,
                          }}
                        >
                          {`${sgstVal}%`}
                        </td>
                      </>
                    ) : (
                      <td
                        style={{
                          padding: "6px 2px",
                          textAlign: "center",
                          borderRight: "1px solid #000000",
                          color: "#1e40af",
                          fontWeight: 600,
                        }}
                      >
                        {`${gstVal}%`}
                      </td>
                    )}
                    <td style={{ padding: "6px 8px", textAlign: "right", fontWeight: 700 }}>
                      {parseFloat(item.amount || 0).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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
              <Typography sx={{ fontSize: "10px", fontWeight: 800, color: "#f37021", mb: 0.3 }}>
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

          {/* Right: Financial Breakdown (Subtotal & GST removed, only Grand Total displayed) */}
          <Box
            sx={{
              width: { xs: "100%", sm: "45%" },
              p: 1.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
                fontSize: "14px",
                fontWeight: 900,
                color: "#f37021",
                p: 1,
                bgcolor: "#fff7ed",
                borderRadius: 1,
                border: "1px solid #fed7aa",
              }}
            >
              <span style={{ fontSize: "13px", fontWeight: 800 }}>GRAND TOTAL:</span>
              <span style={{ fontSize: "16px", fontWeight: 900 }}>
                ₹
                {parseFloat(quotation.total_amount || 0).toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </span>
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
            <Typography sx={{ fontSize: "10px", fontWeight: 800, color: "#f37021", mb: 0.3 }}>
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

            <Box sx={{ mt: 3, width: "100%", borderTop: "1px solid #9ca3af", pt: 0.5 }}>
              <Typography sx={{ fontSize: "10px", fontWeight: 800 }}>
                {quotation.prepared_by || "Authorized Signatory"}
              </Typography>
              <Typography sx={{ fontSize: "8.5px", color: "#6b7280" }}>
                Prepared By {quotation.emp_id ? `(${quotation.emp_id})` : ""}
              </Typography>
              {quotation.approved_by && (
                <Typography sx={{ fontSize: "8.5px", color: "#16a34a", fontWeight: 700, mt: 0.5 }}>
                  ✓ Approved By: {quotation.approved_by}
                </Typography>
              )}
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
