import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: {
            main: '#f37021',
            light: '#ff8833',
            dark: '#d95300',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#1e293b',
        },
        text: {
            primary: '#1e293b',
            secondary: '#64748b',
        },
    },
    typography: {
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", sans-serif',
        // All main heading tags unified to 1.5rem (24px) in brand color #f37021
        h1: {
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#f37021',
            lineHeight: 1.3,
            letterSpacing: '-0.01em',
        },
        h2: {
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#f37021',
            lineHeight: 1.3,
            letterSpacing: '-0.01em',
        },
        h3: {
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#f37021',
            lineHeight: 1.3,
            letterSpacing: '-0.01em',
        },
        h4: {
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#f37021',
            lineHeight: 1.3,
            letterSpacing: '-0.01em',
        },
        h5: {
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#f37021',
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
        // All body text unified to 0.875rem (14px) and color #1e293b
        body1: {
            fontSize: '0.875rem',
            color: '#1e293b',
            lineHeight: 1.5,
        },
        body2: {
            fontSize: '0.875rem',
            color: '#1e293b',
            lineHeight: 1.5,
        },
        subtitle1: {
            fontSize: '0.875rem',
            color: '#475569',
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
                    color: '#f37021',
                },
                h2: {
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    color: '#f37021',
                },
                h3: {
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    color: '#f37021',
                },
                h4: {
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    color: '#f37021',
                },
                h5: {
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    color: '#f37021',
                },
                h6: {
                    fontSize: '1.125rem',
                    fontWeight: 600,
                },
                body1: {
                    fontSize: '0.875rem',
                    color: '#1e293b',
                },
                body2: {
                    fontSize: '0.875rem',
                    color: '#1e293b',
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
