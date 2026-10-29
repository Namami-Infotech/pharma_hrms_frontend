import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: {
            main: '#8d0638',
            light: '#b02a5b',
            dark: '#620023',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#f50057',
        },
        text: {
            primary: '#2d3748',
            secondary: '#64748b',
        },
    },
    typography: {
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", sans-serif',
        // All main heading tags unified to 1.5rem (24px) in brand color #8d0638
        h1: {
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#8d0638',
            lineHeight: 1.3,
            letterSpacing: '-0.01em',
        },
        h2: {
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#8d0638',
            lineHeight: 1.3,
            letterSpacing: '-0.01em',
        },
        h3: {
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#8d0638',
            lineHeight: 1.3,
            letterSpacing: '-0.01em',
        },
        h4: {
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#8d0638',
            lineHeight: 1.3,
            letterSpacing: '-0.01em',
        },
        h5: {
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#8d0638',
            lineHeight: 1.3,
            letterSpacing: '-0.01em',
        },
        // Subheadings & Modal titles
        h6: {
            fontSize: '1.125rem',
            fontWeight: 600,
            color: '#1a202c',
            lineHeight: 1.4,
        },
        // All body text unified to 0.875rem (14px) and color #2d3748
        body1: {
            fontSize: '0.875rem',
            color: '#2d3748',
            lineHeight: 1.5,
        },
        body2: {
            fontSize: '0.875rem',
            color: '#2d3748',
            lineHeight: 1.5,
        },
        subtitle1: {
            fontSize: '0.875rem',
            color: '#4a5568',
        },
        subtitle2: {
            fontSize: '0.8125rem',
            color: '#64748b',
        },
        button: {
            fontSize: '0.875rem',
            fontWeight: 600,
            textTransform: 'none',
        },
    },
    components: {
        MuiTypography: {
            styleOverrides: {
                h1: {
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    color: '#8d0638',
                },
                h2: {
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    color: '#8d0638',
                },
                h3: {
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    color: '#8d0638',
                },
                h4: {
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    color: '#8d0638',
                },
                h5: {
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    color: '#8d0638',
                },
                h6: {
                    fontSize: '1.125rem',
                    fontWeight: 600,
                },
                body1: {
                    fontSize: '0.875rem',
                    color: '#2d3748',
                },
                body2: {
                    fontSize: '0.875rem',
                    color: '#2d3748',
                },
            },
        },
        // Compact form input configurations
        MuiTextField: {
            defaultProps: {
                size: 'small',
            },
        },
        MuiFormControl: {
            defaultProps: {
                size: 'small',
            },
        },
        MuiSelect: {
            defaultProps: {
                size: 'small',
            },
        },
        MuiAutocomplete: {
            defaultProps: {
                size: 'small',
            },
        },
        MuiOutlinedInput: {
            defaultProps: {
                size: 'small',
            },
            styleOverrides: {
                root: {
                    borderRadius: 6,
                },
                input: {
                    padding: '8px 12px',
                    fontSize: '0.875rem',
                },
                inputSizeSmall: {
                    padding: '7px 12px',
                    fontSize: '0.875rem',
                },
            },
        },
        MuiInputLabel: {
            styleOverrides: {
                root: {
                    fontSize: '0.875rem',
                },
                sizeSmall: {
                    fontSize: '0.85rem',
                },
            },
        },
    },
});

export default theme;
