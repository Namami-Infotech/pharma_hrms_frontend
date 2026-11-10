"use client";
import React, { useState, useEffect } from 'react';
import { BASE_URL } from "../../api/endpoints";
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Button,
    TextField,
    CircularProgress,
    Box,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Typography,
    Alert,
    IconButton,
} from '@mui/material';
import { LocationOn, CloudUpload, Delete, Close } from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../auth/AuthContext';
import { useGeolocated } from 'react-geolocated';
   
const BRAND_COLOR = '#f37021';

function AddDealers({ open, onClose, onDealerAdded }) {
    const { user } = useAuth();
    const { coords } = useGeolocated({
        positionOptions: { enableHighAccuracy: true },
        userDecisionTimeout: 5000,
    });

    const [fields, setFields] = useState([]);
    const [formData, setFormData] = useState({});
    const [latLong, setLatLong] = useState('');
    const [loadingFields, setLoadingFields] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [formErrors, setFormErrors] = useState({});

    // Fetch dynamic checkpoints whenever the dialog opens
    useEffect(() => {
        if (open) {
            fetchFields();
            setErrorMsg('');
            setSuccessMsg('');
            setFormErrors({});
        }
    }, [open]);

    // Update GPS coordinates
    useEffect(() => {
        if (coords) {
            setLatLong(`${coords.latitude},${coords.longitude}`);
        } else if (navigator.geolocation && !latLong) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setLatLong(`${pos.coords.latitude},${pos.coords.longitude}`),
                (err) => console.log('Geolocation note:', err.message)
            );
        }
    }, [coords, latLong]);

    const fetchFields = async () => {
        setLoadingFields(true);
        try {
            const res = await axios.get(`${BASE_URL}/dealer/get_dealer_fields.php`);
            if (res.data && res.data.success) {
                let fetchedFields = res.data.data || [];
                // Ensure State field is always present as mandatory field
                const hasStateField = fetchedFields.some(f =>
                    (f.Description || '').toLowerCase().includes('state') ||
                    (f.Caption || '').toLowerCase().includes('state') ||
                    String(f.Id) === '7'
                );
                if (!hasStateField) {
                    fetchedFields.push({
                        Id: 7,
                        Description: 'Dealer State',
                        Mandatory: 1,
                        Active: 1,
                        TypeId: 1
                    });
                }

                // Logical ordering: Company -> Address -> Doctor Name -> Contact -> Email -> State -> Remarks
                const getFieldOrderScore = (f) => {
                    const desc = (f.Description || '').toLowerCase();
                    const caption = (f.Caption || '').toLowerCase();
                    if (desc.includes('company') || caption.includes('company')) return 10;
                    if (desc.includes('address') || caption.includes('address')) return 20;
                    if (desc.includes('dealer name') || desc.includes('doctor') || caption.includes('doctor')) return 30;
                    if (desc.includes('contact') || desc.includes('phone') || desc.includes('mobile') || caption.includes('phone')) return 40;
                    if (desc.includes('mail') || desc.includes('email') || caption.includes('email')) return 50;
                    if (desc.includes('state') || caption.includes('state') || String(f.Id) === '7') return 60;
                    if (desc.includes('remark') || caption.includes('remark')) return 1000;
                    return 70;
                };

                fetchedFields = [...fetchedFields].sort((a, b) => getFieldOrderScore(a) - getFieldOrderScore(b));
                setFields(fetchedFields);

                // Initialize form values
                const initial = {};
                fetchedFields.forEach(f => {
                    initial[f.Id] = f.Value || '';
                });
                setFormData(initial);
            } else {
                setErrorMsg(res.data.message || 'Failed to load form fields.');
            }
        } catch (err) {
            console.error('Error fetching dealer fields:', err);
            setErrorMsg('Unable to connect to server to fetch form fields.');
        } finally {
            setLoadingFields(false);
        }
    };

    const handleInputChange = (fieldId, value) => {
        setFormData(prev => ({
            ...prev,
            [fieldId]: value
        }));
        if (formErrors[fieldId]) {
            setFormErrors(prev => {
                const updated = { ...prev };
                delete updated[fieldId];
                return updated;
            });
        }
    };

    const handleImageUpload = (fieldId, e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            handleInputChange(fieldId, reader.result);
        };
        reader.readAsDataURL(file);
    };

    const validateForm = () => {
        const errors = {};
        for (const field of fields) {
            const descLower = (field.Description || '').toLowerCase();
            const captionLower = (field.Caption || '').toLowerCase();
            const val = formData[field.Id];
            const strVal = val !== undefined && val !== null ? String(val).trim() : '';

            // 1. Mandatory check (including State as mandatory)
            const isState = descLower.includes('state') || captionLower.includes('state') || String(field.Id) === '7';
            const isMandatory = field.Mandatory || isState;

            if (isMandatory) {
                if (!strVal) {
                    const displayName = isState ? 'State' : (descLower.includes('dealer name') ? 'Doctor Name' : field.Description);
                    errors[field.Id] = `${displayName} is required.`;
                    continue;
                }
            }

            // 2. Phone / Mobile Number validation
            if (strVal && (descLower.includes('contact') || descLower.includes('phone') || descLower.includes('mobile'))) {
                const digitsOnly = strVal.replace(/\D/g, '');
                if (digitsOnly.length < 10 || digitsOnly.length > 15) {
                    errors[field.Id] = 'Please enter a valid 10-digit mobile number.';
                }
            }

            // 3. Email ID validation
            if (strVal && (descLower.includes('mail') || descLower.includes('email'))) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(strVal)) {
                    errors[field.Id] = 'Please enter a valid email address.';
                }
            }
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async () => {
        setErrorMsg('');
        setSuccessMsg('');

        if (!validateForm()) {
            setErrorMsg('Please correct the highlighted fields.');
            return;
        }

        setSubmitting(true);
        try {
            const currentEmpId = user?.emp_id || user?.EmpId || user?.id || '';
            const payload = {
                checkpoints: formData,
                latLong: latLong || '',
                addedByEmpId: currentEmpId,
                empId: currentEmpId,
            };

            const response = await axios.post(`${BASE_URL}/dealer/add_dealers.php`, payload);

            if (response.data && response.data.success) {
                setSuccessMsg('Doctor registered successfully!');
                setTimeout(() => {
                    if (onDealerAdded) onDealerAdded();
                    onClose();
                }, 800);
            } else {
                setErrorMsg(response.data.message || 'Failed to add doctor.');
            }
        } catch (err) {
            console.error('Error adding doctor:', err);
            setErrorMsg(err.response?.data?.message || err.message || 'Error saving doctor details.');
        } finally {
            setSubmitting(false);
        }
    };

    // Helper to render individual dynamic input based on field metadata
    const renderFieldInput = (field) => {
        const descLower = (field.Description || '').toLowerCase();
        const captionLower = (field.Caption || '').toLowerCase();
        const nameLower = (field.Name || '').toLowerCase();
        const validationLower = (field.Validation || '').toLowerCase();
        const typeNameLower = (field.TypeName || '').toLowerCase();
        const isState = descLower.includes('state') || captionLower.includes('state') || nameLower.includes('state') || String(field.Id) === '7';
        const isRequired = !!field.Mandatory || isState;
        const hasError = !!formErrors[field.Id];
        const helperText = formErrors[field.Id] || '';
        const value = formData[field.Id] !== undefined ? formData[field.Id] : '';

        // UI label replacement (frontend only, does not affect API payload or field.Id)
        let uiLabel = field.Description;
        if (descLower.includes('dealer name')) {
            uiLabel = 'Doctor Name';
        } else if (isState) {
            uiLabel = 'State';
        } else if (descLower.includes('contact') || descLower.includes('phone') || descLower.includes('mobile')) {
            uiLabel = 'Contact Info / Mobile';
        } else if (descLower.includes('mail') || descLower.includes('email')) {
            uiLabel = 'Email ID';
        }

        // 1. State / Doctor State (Select Dropdown with Indian States, opens at bottom with scroll)
        // Checked FIRST to prevent Checkpoint 7 with 'Long Text' validation from being hijacked by textarea
        if (isState) {
            const INDIAN_STATES = [
                "Andaman and Nicobar Islands",
                "Andhra Pradesh",
                "Arunachal Pradesh",
                "Assam",
                "Bihar",
                "Chandigarh",
                "Chhattisgarh",
                "Dadra and Nagar Haveli and Daman and Diu",
                "Delhi",
                "Goa",
                "Gujarat",
                "Haryana",
                "Himachal Pradesh",
                "Jammu and Kashmir",
                "Jharkhand",
                "Karnataka",
                "Kerala",
                "Ladakh",
                "Lakshadweep",
                "Madhya Pradesh",
                "Maharashtra",
                "Manipur",
                "Meghalaya",
                "Mizoram",
                "Nagaland",
                "Odisha",
                "Puducherry",
                "Punjab",
                "Rajasthan",
                "Sikkim",
                "Tamil Nadu",
                "Telangana",
                "Tripura",
                "Uttar Pradesh",
                "Uttarakhand",
                "West Bengal"
            ];
            return (
                <FormControl key={field.Id} fullWidth size="small" required={isRequired} error={hasError}>
                    <InputLabel id={`label-state-${field.Id}`}>{uiLabel} *</InputLabel>
                    <Select
                        labelId={`label-state-${field.Id}`}
                        label={`${uiLabel} *`}
                        value={value || ''}
                        onChange={(e) => handleInputChange(field.Id, e.target.value)}
                        MenuProps={{
                            PaperProps: {
                                sx: {
                                    maxHeight: 250,
                                    overflowY: 'auto',
                                    '&::-webkit-scrollbar': {
                                        width: '6px',
                                    },
                                    '&::-webkit-scrollbar-thumb': {
                                        backgroundColor: '#ccc',
                                        borderRadius: '4px',
                                    },
                                },
                            },
                            anchorOrigin: {
                                vertical: 'bottom',
                                horizontal: 'left',
                            },
                            transformOrigin: {
                                vertical: 'top',
                                horizontal: 'left',
                            },
                        }}
                    >
                        <MenuItem value="" disabled>
                            <em>Select State</em>
                        </MenuItem>
                        {INDIAN_STATES.map((st) => (
                            <MenuItem key={st} value={st}>
                                {st}
                            </MenuItem>
                        ))}
                    </Select>
                    {hasError && (
                        <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                            {helperText}
                        </Typography>
                    )}
                </FormControl>
            );
        }

        // 2. Address & Remarks (ALWAYS Text, multiline)
        if (
            descLower.includes('address') ||
            descLower.includes('remark') ||
            validationLower.includes('long text')
        ) {
            return (
                <TextField
                    key={field.Id}
                    fullWidth
                    size="small"
                    type="text"
                    label={uiLabel}
                    required={isRequired}
                    error={hasError}
                    helperText={helperText}
                    value={value}
                    multiline
                    rows={2}
                    onChange={(e) => handleInputChange(field.Id, e.target.value)}
                />
            );
        }

        // 2. Contact / Phone / Mobile (Tel input, accepts phone numbers without spinners or date picker)
        if (
            descLower.includes('contact') ||
            descLower.includes('phone') ||
            descLower.includes('mobile') ||
            descLower.includes('alt contact')
        ) {
            return (
                <TextField
                    key={field.Id}
                    fullWidth
                    size="small"
                    type="tel"
                    label={uiLabel}
                    required={isRequired}
                    error={hasError}
                    helperText={helperText}
                    value={value}
                    inputProps={{ maxLength: 15 }}
                    onChange={(e) => handleInputChange(field.Id, e.target.value)}
                />
            );
        }

        // 3. Email / Mail Id
        if (
            descLower.includes('mail') ||
            descLower.includes('email') ||
            validationLower === 'email' ||
            field.TypeId === 7
        ) {
            return (
                <TextField
                    key={field.Id}
                    fullWidth
                    size="small"
                    type="email"
                    label={uiLabel}
                    required={isRequired}
                    error={hasError}
                    helperText={helperText}
                    value={value}
                    onChange={(e) => handleInputChange(field.Id, e.target.value)}
                />
            );
        }

        // 4. Image / File field
        if (
            field.TypeId === 4 ||
            validationLower.includes('image') ||
            validationLower.includes('file')
        ) {
            return (
                <Box key={field.Id} sx={{ border: '1px dashed #ccc', borderRadius: 1.5, p: 1.5, textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ display: 'block', mb: 1, fontWeight: 600, color: hasError ? 'error.main' : 'text.secondary' }}>
                        {field.Description} {isRequired && '*'}
                    </Typography>
                    {value ? (
                        <Box sx={{ position: 'relative', display: 'inline-block' }}>
                            <img
                                src={value}
                                alt={field.Description}
                                style={{ maxHeight: 90, maxWidth: '100%', borderRadius: 4, objectFit: 'contain' }}
                            />
                            <IconButton
                                size="small"
                                onClick={() => handleInputChange(field.Id, '')}
                                sx={{ position: 'absolute', top: -8, right: -8, bgcolor: 'error.main', color: '#fff', '&:hover': { bgcolor: 'error.dark' } }}
                            >
                                <Delete fontSize="small" />
                            </IconButton>
                        </Box>
                    ) : (
                        <Button
                            variant="outlined"
                            component="label"
                            size="small"
                            startIcon={<CloudUpload />}
                            sx={{ borderColor: BRAND_COLOR, color: BRAND_COLOR }}
                        >
                            Upload Image
                            <input
                                type="file"
                                hidden
                                accept="image/*"
                                onChange={(e) => handleImageUpload(field.Id, e)}
                            />
                        </Button>
                    )}
                    {hasError && (
                        <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
                            {helperText}
                        </Typography>
                    )}
                </Box>
            );
        }

        // 5. Dropdown field
        if (field.TypeId === 5 || field.Options) {
            const rawOptions = field.Options ? field.Options.split(',') : [];
            const options = rawOptions.map(opt => opt.trim()).filter(Boolean);

            if (options.length > 0) {
                return (
                    <FormControl key={field.Id} fullWidth size="small" required={isRequired} error={hasError}>
                        <InputLabel id={`label-${field.Id}`}>{field.Description}</InputLabel>
                        <Select
                            labelId={`label-${field.Id}`}
                            label={field.Description}
                            value={value}
                            onChange={(e) => handleInputChange(field.Id, e.target.value)}
                            MenuProps={{
                                PaperProps: {
                                    sx: {
                                        maxHeight: 250,
                                        overflowY: 'auto',
                                        '&::-webkit-scrollbar': {
                                            width: '6px',
                                        },
                                        '&::-webkit-scrollbar-thumb': {
                                            backgroundColor: '#ccc',
                                            borderRadius: '4px',
                                        },
                                    },
                                },
                                anchorOrigin: {
                                    vertical: 'bottom',
                                    horizontal: 'left',
                                },
                                transformOrigin: {
                                    vertical: 'top',
                                    horizontal: 'left',
                                },
                            }}
                        >
                            {options.map((opt, idx) => (
                                <MenuItem key={idx} value={opt}>
                                    {opt}
                                </MenuItem>
                            ))}
                        </Select>
                        {hasError && (
                            <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                                {helperText}
                            </Typography>
                        )}
                    </FormControl>
                );
            }
        }

        // 6. Explicit Date field (ONLY when description or validation specifically says date)
        if (
            descLower.includes('date') ||
            validationLower === 'date' ||
            typeNameLower === 'date'
        ) {
            return (
                <TextField
                    key={field.Id}
                    fullWidth
                    size="small"
                    type="date"
                    label={field.Description}
                    required={isRequired}
                    error={hasError}
                    helperText={helperText}
                    value={value}
                    InputLabelProps={{ shrink: true }}
                    onChange={(e) => handleInputChange(field.Id, e.target.value)}
                />
            );
        }

        // 7. Explicit Numeric field (e.g., Quantity, Amount, Pin Code)
        if (
            (validationLower === 'number' || validationLower === 'numeric' || typeNameLower === 'number') &&
            !descLower.includes('contact') &&
            !descLower.includes('phone') &&
            !descLower.includes('address')
        ) {
            return (
                <TextField
                    key={field.Id}
                    fullWidth
                    size="small"
                    type="number"
                    label={field.Description}
                    required={isRequired}
                    error={hasError}
                    helperText={helperText}
                    value={value}
                    onChange={(e) => handleInputChange(field.Id, e.target.value)}
                />
            );
        }

        // 8. Default fallback: Standard Text field
        return (
            <TextField
                key={field.Id}
                fullWidth
                size="small"
                type="text"
                label={uiLabel}
                required={isRequired}
                error={hasError}
                helperText={helperText}
                value={value}
                onChange={(e) => handleInputChange(field.Id, e.target.value)}
            />
        );
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: { xs: 2, sm: 2.5 },
                    width: { xs: "calc(100% - 24px)", sm: "auto" },
                    m: { xs: 1.5, sm: 2 },
                    overflow: "hidden",
                },
            }}
        >
            <DialogTitle
                sx={{
                    backgroundColor: BRAND_COLOR,
                    color: "white",
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    py: 1.5,
                    px: { xs: 2, sm: 3 },
                }}
            >
                <Box>
                    <Typography variant="h6" fontWeight={700}>
                        Add New Doctor
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.85)' }}>
                        Doctor registration details
                    </Typography>
                </Box>
                <IconButton onClick={onClose} size="small" sx={{ color: 'white' }}>
                    <Close />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers sx={{ p: { xs: 2, sm: 3 }, minHeight: 360, overflowX: "hidden" }}>
                {errorMsg && (
                    <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setErrorMsg('')}>
                        {errorMsg}
                    </Alert>
                )}

                {successMsg && (
                    <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
                        {successMsg}
                    </Alert>
                )}

                {loadingFields ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 6 }}>
                        <CircularProgress size={36} sx={{ color: BRAND_COLOR, mr: 2 }} />
                        <Typography variant="body2" color="text.secondary">
                            Loading dynamic fields from database...
                        </Typography>
                    </Box>
                ) : fields.length === 0 ? (
                    <Alert severity="warning">
                        No active dealer checkpoint fields found in the database. Please configure checkpoints first.
                    </Alert>
                ) : (
                    <Grid container spacing={2.5} sx={{ width: "100%", m: 0 }}>
                        {fields.map((field) => {
                            const descLower = (field.Description || '').toLowerCase();
                            const isWide = descLower.includes('address') || descLower.includes('remark') || field.TypeId === 4;
                            return (
                                <Grid item xs={12} sm={isWide ? 12 : 6} key={field.Id}>
                                    {renderFieldInput(field)}
                                </Grid>
                            );
                        })}
                    </Grid>
                )}
            </DialogContent>

            <DialogActions
                sx={{
                    px: { xs: 2, sm: 3 },
                    py: { xs: 1.5, sm: 2 },
                    display: 'flex',
                    flexDirection: { xs: 'column-reverse', sm: 'row' },
                    justifyContent: 'space-between',
                    alignItems: { xs: 'stretch', sm: 'center' },
                    gap: 1.5,
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                    <LocationOn sx={{ fontSize: 16, mr: 0.5, color: latLong ? '#10b981' : 'text.disabled' }} />
                    <Typography variant="caption" color="text.secondary">
                        {latLong ? `GPS: ${latLong} ` : "Acquiring GPS..."}
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, width: { xs: '100%', sm: 'auto' } }}>
                    <Button onClick={onClose} color="inherit" disabled={submitting} sx={{ flex: { xs: 1, sm: 'none' } }}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        disabled={submitting || loadingFields || fields.length === 0}
                        sx={{
                            backgroundColor: BRAND_COLOR,
                            color: "white",
                            px: 3,
                            fontWeight: 600,
                            flex: { xs: 1, sm: 'none' },
                            "&:hover": {
                                backgroundColor: '#d85d13',
                            }
                        }}
                    >
                        {submitting ? (
                            <>
                                <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                                Saving...
                            </>
                        ) : (
                            'Save Doctor'
                        )}
                    </Button>
                </Box>
            </DialogActions>
        </Dialog>
    );
}

export default AddDealers;
