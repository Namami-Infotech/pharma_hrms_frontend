'use client';
import { BASE_URL } from "../../api/endpoints";

import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  IconButton,
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Avatar,
  Fade,
  Slide,
  Alert,
  LinearProgress,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Snackbar,
  Tooltip,
  Divider,
  Grid,
  Paper,
  Badge,
  Zoom,
  InputAdornment,
} from '@mui/material';
import {
  AddCircleOutline,
  RemoveCircleOutline,
  CloudUpload,
  Receipt,
  AttachMoney,
  CalendarToday,
  Category,
  Delete,
  Preview,
  CheckCircle,
  Error as ErrorIcon,
  Info,
  Close,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { useAuth } from '../auth/AuthContext';

const expenseCategories = [
  { value: 'Travel', label: 'Travel', icon: '✈️', color: '#2196F3' },
  { value: 'Food', label: 'Food & Dining', icon: '🍽️', color: '#FF9800' },
  { value: 'Accommodation', label: 'Accommodation', icon: '🏨', color: '#9C27B0' },
  { value: 'Transportation', label: 'Transportation', icon: '🚗', color: '#4CAF50' },
  { value: 'Office Supplies', label: 'Office Supplies', icon: '📝', color: '#607D8B' },
  { value: 'Communication', label: 'Communication', icon: '📞', color: '#E91E63' },
  { value: 'Training', label: 'Training', icon: '📚', color: '#3F51B5' },
  { value: 'Other', label: 'Other', icon: '📋', color: '#795548' }
];

function ApplyExpense({ open, onClose, onExpenseApplied }) {
  const { user } = useAuth();
  const [expenseEntries, setExpenseEntries] = useState([
    { 
      empId: user?.emp_id || '', 
      expenseDate: '', 
      expenseType: '', 
      expenseAmount: '', 
      image: null, 
      imagePreview: null,
      Status: "Pending" 
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleChange = (index, field, value) => {
    const newEntries = [...expenseEntries];
    newEntries[index][field] = value;
    setExpenseEntries(newEntries);
    
    // Clear error for this field
    if (errors[`${index}-${field}`]) {
      const newErrors = { ...errors };
      delete newErrors[`${index}-${field}`];
      setErrors(newErrors);
    }
  };

  const handleAddEntry = () => {
    setExpenseEntries([
      ...expenseEntries, 
      { 
        empId: user?.emp_id || '', 
        expenseDate: '', 
        expenseType: '', 
        expenseAmount: '', 
        image: null, 
        imagePreview: null,
        Status: "Pending" 
      }
    ]);
  };

  const handleRemoveEntry = (index) => {
    const newEntries = expenseEntries.filter((_, i) => i !== index);
    setExpenseEntries(newEntries);
  };

  const onDrop = useCallback((acceptedFiles, index) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newEntries = [...expenseEntries];
        newEntries[index].image = reader.result;
        newEntries[index].imagePreview = reader.result;
        setExpenseEntries(newEntries);
      };
      reader.readAsDataURL(file);
    }
  }, [expenseEntries]);

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    expenseEntries.forEach((entry, index) => {
      if (!entry.expenseDate) {
        newErrors[`${index}-expenseDate`] = 'Date is required';
        isValid = false;
      }
      if (!entry.expenseType) {
        newErrors[`${index}-expenseType`] = 'Category is required';
        isValid = false;
      }
      if (!entry.expenseAmount || parseFloat(entry.expenseAmount) <= 0) {
        newErrors[`${index}-expenseAmount`] = 'Valid amount is required';
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      setSnackbar({
        open: true,
        message: 'Please fix the errors before submitting',
        severity: 'error'
      });
      return;
    }

    if (!user || !user.emp_id) {
      setSnackbar({
        open: true,
        message: 'User is not authenticated',
        severity: 'error'
      });
      return;
    }

    setLoading(true);
    try {
      const payload = { expenses: expenseEntries };
      const response = await axios.post(
        `${BASE_URL}/expense/apply_expense.php`, 
        payload
      );
      
      if (response.data.success) {
        setSnackbar({
          open: true,
          message: 'Expenses submitted successfully!',
          severity: 'success'
        });
        onExpenseApplied();
        setTimeout(() => onClose(), 1500);
      } else {
        setSnackbar({
          open: true,
          message: response.data.message || 'Failed to submit expenses',
          severity: 'error'
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Error submitting expenses. Please try again.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const getTotalAmount = () => {
    return expenseEntries.reduce((total, entry) => {
      return total + (parseFloat(entry.expenseAmount) || 0);
    }, 0);
  };

  const getCategoryIcon = (category) => {
    const cat = expenseCategories.find(c => c.value === category);
    return cat ? cat.icon : '📋';
  };

  const getCategoryColor = (category) => {
    const cat = expenseCategories.find(c => c.value === category);
    return cat ? cat.color : '#795548';
  };

  return (
    <>
      <Dialog 
        open={open} 
        onClose={loading ? undefined : onClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: { xs: 2, sm: 2.5 },
            width: { xs: "calc(100% - 24px)", sm: "auto" },
            m: { xs: 1.5, sm: 2 },
            overflow: "hidden",
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: '#f37021',
          color: '#ffffff',
          py: { xs: 1.5, sm: 2 },
          px: { xs: 2, sm: 3 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
            <Receipt sx={{ fontSize: { xs: 22, sm: 24 } }} />
            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: { xs: "1.05rem", sm: "1.25rem" } }}>
              Apply Expense
            </Typography>
          </Box>
          <IconButton 
            onClick={onClose} 
            disabled={loading}
            sx={{ color: '#ffffff', p: 0.5, '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' } }}
          >
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent
          sx={{
            p: { xs: 2, sm: 3 },
            pt: { xs: "20px !important", sm: "24px !important" },
            bgcolor: '#ffffff',
            overflowX: "hidden",
          }}
        >
          {loading && <LinearProgress sx={{ mb: 2 }} />}

          <AnimatePresence>
            {expenseEntries.map((entry, index) => (
              <Box
                key={index}
                sx={{
                  mt: index === 0 ? 0.5 : 0,
                  mb: index < expenseEntries.length - 1 ? 2.5 : 1,
                  p: { xs: 1.5, sm: 2.5 },
                  borderRadius: 2,
                  bgcolor: '#fafafa',
                  border: '1px solid #e5e7eb',
                }}
              >
                {expenseEntries.length > 1 && (
                  <Box display="flex" justifyContent="flex-end" alignItems="center" mb={1}>
                    <Tooltip title="Remove Entry">
                      <IconButton
                        onClick={() => handleRemoveEntry(index)}
                        color="error"
                        size="small"
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                )}

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                    gap: 2,
                    width: "100%",
                  }}
                >
                  <TextField
                    label="Expense Date"
                    type="date"
                    value={entry.expenseDate}
                    onChange={(e) => handleChange(index, 'expenseDate', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    variant="outlined"
                    size="small"
                    fullWidth
                    error={!!errors[`${index}-expenseDate`]}
                    helperText={errors[`${index}-expenseDate`]}
                    InputProps={{
                      startAdornment: <CalendarToday sx={{ mr: 1, fontSize: 18, color: 'action.active' }} />
                    }}
                  />

                  <FormControl fullWidth size="small" error={!!errors[`${index}-expenseType`]}>
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={entry.expenseType}
                      onChange={(e) => handleChange(index, 'expenseType', e.target.value)}
                      label="Category"
                      startAdornment={<Category sx={{ mr: 1, fontSize: 18, color: 'action.active' }} />}
                      MenuProps={{ PaperProps: { sx: { maxHeight: 260 } } }}
                    >
                      {expenseCategories.map((category) => (
                        <MenuItem key={category.value} value={category.value}>
                          <Box display="flex" alignItems="center">
                            <span style={{ marginRight: 8, fontSize: '1.1em' }}>
                              {category.icon}
                            </span>
                            {category.label}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                    {errors[`${index}-expenseType`] && (
                      <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1 }}>
                        {errors[`${index}-expenseType`]}
                      </Typography>
                    )}
                  </FormControl>

                  <TextField
                    label="Amount (₹)"
                    type="number"
                    placeholder="0.00"
                    value={entry.expenseAmount}
                    onChange={(e) => handleChange(index, 'expenseAmount', e.target.value)}
                    variant="outlined"
                    size="small"
                    fullWidth
                    error={!!errors[`${index}-expenseAmount`]}
                    helperText={errors[`${index}-expenseAmount`]}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Typography sx={{ fontWeight: 'bold', color: '#f37021' }}>₹</Typography>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <ReceiptUpload
                    entry={entry}
                    index={index}
                    onDrop={(files) => onDrop(files, index)}
                  />
                </Box>

                
              </Box>
            ))}
          </AnimatePresence>

          <Box display="flex" justifyContent="center" mt={2}>
            <Button
              onClick={handleAddEntry}
              variant="outlined"
              size="small"
              startIcon={<AddCircleOutline />}
              sx={{
                borderColor: '#f37021',
                color: '#f37021',
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 1.5,
                '&:hover': {
                  borderColor: '#d95300',
                  backgroundColor: 'rgba(243, 112, 33, 0.04)'
                }
              }}
            >
              Add Another Expense
            </Button>
          </Box>
        </DialogContent>

        <DialogActions sx={{ 
          px: { xs: 2, sm: 3 }, 
          py: { xs: 1.5, sm: 2 }, 
          borderTop: '1px solid #e5e7eb', 
          bgcolor: '#f9fafb',
          display: 'flex',
          flexDirection: { xs: "column-reverse", sm: "row" },
          gap: { xs: 1, sm: 1.5 },
        }}>
          <Button
            onClick={onClose}
            disabled={loading}
            sx={{
              color: '#6b7280',
              fontWeight: 600,
              textTransform: 'none',
              width: { xs: "100%", sm: "auto" },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading}
            sx={{
              bgcolor: '#f37021',
              '&:hover': { bgcolor: '#d95300' },
              fontWeight: 600,
              textTransform: 'none',
              px: 3,
              py: 0.8,
              borderRadius: 1.5,
              width: { xs: "100%", sm: "auto" },
            }}
          >
            {loading ? 'Submitting...' : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}

// Receipt Upload Component - Compact box with inline thumbnail preview
function ReceiptUpload({ entry, index, onDrop }) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    multiple: false
  });

  return (
    <Box
      {...getRootProps()}
      sx={{
        border: '1.5px dashed',
        borderColor: entry.imagePreview ? '#f37021' : (isDragActive ? '#f37021' : '#d1d5db'),
        borderRadius: '4px',
        px: 1.5,
        height: '40px',
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        backgroundColor: entry.imagePreview ? 'rgba(243, 112, 33, 0.04)' : (isDragActive ? 'rgba(243, 112, 33, 0.08)' : '#fcfcfc'),
        transition: 'all 0.2s ease',
        overflow: 'hidden',
        '&:hover': {
          borderColor: '#f37021',
          backgroundColor: 'rgba(243, 112, 33, 0.05)'
        }
      }}
    >
      <input {...getInputProps()} />
      {entry.imagePreview ? (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, overflow: 'hidden' }}>
            <img
              src={entry.imagePreview}
              alt="Receipt"
              style={{
                height: '28px',
                width: '32px',
                objectFit: 'cover',
                borderRadius: '3px',
                border: '1px solid #e5e7eb'
              }}
            />
            <Typography variant="caption" sx={{ fontSize: '0.74rem', color: '#16a34a', fontWeight: 600, whiteSpace: 'nowrap' }}>
              ✓ Receipt Added
            </Typography>
          </Box>
          <Typography variant="caption" sx={{ fontSize: '0.7rem', color: '#f37021', fontWeight: 600, ml: 1 }}>
            Change
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
          <CloudUpload sx={{ fontSize: 18, color: isDragActive ? '#f37021' : '#9ca3af' }} />
          <Typography variant="body2" sx={{ fontSize: '0.78rem', color: 'text.secondary', fontWeight: 500 }}>
            {isDragActive ? 'Drop receipt here' : 'Upload Receipt (Drag/Click)'}
          </Typography>
        </Box>
      )}
    </Box>
  );
}

export default ApplyExpense;
