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
            borderRadius: 2.5,
            overflow: 'hidden',
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: '#f37021',
          color: '#ffffff',
          py: 2,
          px: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
            <Receipt sx={{ fontSize: 24 }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
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

        <DialogContent sx={{ p: 3, bgcolor: '#ffffff' }}>
          {loading && <LinearProgress sx={{ mb: 2 }} />}

          <AnimatePresence>
            {expenseEntries.map((entry, index) => (
              <Box
                key={index}
                sx={{
                  mb: index < expenseEntries.length - 1 ? 2.5 : 1,
                  p: 2.5,
                  borderRadius: 2,
                  bgcolor: '#fafafa',
                  border: '1px solid #e5e7eb',
                }}
              >
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Chip
                    icon={<Receipt sx={{ fontSize: 16 }} />}
                    label={`Expense #${index + 1}`}
                    size="small"
                    sx={{ color: "#f37021", borderColor: "rgba(243, 112, 33,0.3)", fontWeight: 600 }}
                    variant="outlined"
                  />
                  {expenseEntries.length > 1 && (
                    <Tooltip title="Remove Entry">
                      <IconButton
                        onClick={() => handleRemoveEntry(index)}
                        color="error"
                        size="small"
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
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
                  </Grid>

                  <Grid item xs={12} sm={6}>
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
                  </Grid>

                  <Grid item xs={12} sm={6}>
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
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <ReceiptUpload
                      entry={entry}
                      index={index}
                      onDrop={(files) => onDrop(files, index)}
                    />
                  </Grid>
                </Grid>

                {entry.imagePreview && (
                  <Box mt={2}>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', mb: 0.5 }}>
                      Receipt Preview:
                    </Typography>
                    <img
                      src={entry.imagePreview || "/placeholder.svg"}
                      alt="Receipt preview"
                      style={{
                        maxWidth: '160px',
                        maxHeight: '120px',
                        borderRadius: '6px',
                        border: '1px solid #e5e7eb'
                      }}
                    />
                  </Box>
                )}
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
          px: 3, 
          py: 2, 
          borderTop: '1px solid #e5e7eb', 
          bgcolor: '#f9fafb',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 1.5,
        }}>
          <Button
            onClick={onClose}
            disabled={loading}
            sx={{
              color: '#6b7280',
              fontWeight: 600,
              textTransform: 'none',
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

// Receipt Upload Component
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
        border: '2px dashed',
        borderColor: isDragActive ? 'primary.main' : 'grey.300',
        borderRadius: 2,
        p: 2,
        textAlign: 'center',
        cursor: 'pointer',
        backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
        transition: 'all 0.3s ease',
        '&:hover': {
          borderColor: 'primary.main',
          backgroundColor: 'action.hover'
        }
      }}
    >
      <input {...getInputProps()} />
      <CloudUpload sx={{ fontSize: 40, color: 'grey.400', mb: 1 }} />
      <Typography variant="body2" color="textSecondary">
        {isDragActive ? 'Drop receipt here' : 'Upload Receipt'}
      </Typography>
      <Typography variant="caption" color="textSecondary">
        Drag & drop or click to select
      </Typography>
    </Box>
  );
}

export default ApplyExpense;
