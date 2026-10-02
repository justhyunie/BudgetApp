import { createTheme } from "@mui/material/styles";
import { tokens } from "./tokens";

export const theme = createTheme({
  palette: {
    mode: "light",

    background: {
      default: tokens.colors.bg,
      paper: tokens.colors.surface,
    },

    text: {
      primary: tokens.colors.ink,
      secondary: tokens.colors.inkSoft,
    },

    primary: {
      main: tokens.colors.accent,
      dark: tokens.colors.accentDark,
      light: tokens.colors.accentSoft,
      contrastText: "#ffffff",
    },

    error: {
      main: tokens.colors.red,
      light: tokens.colors.redSoft,
    },

    divider: tokens.colors.line,
  },

  typography: {
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',

    h1: {
      fontSize: 30,
      fontWeight: 650,
      letterSpacing: "-0.045em",
    },

    h2: {
      fontSize: 22,
      fontWeight: 650,
      letterSpacing: "-0.03em",
    },

    h3: {
      fontSize: 18,
      fontWeight: 650,
    },

    body1: {
      fontSize: 14,
      lineHeight: 1.5,
    },

    body2: {
      fontSize: 13,
      lineHeight: 1.5,
    },

    button: {
      fontSize: 12,
      fontWeight: 650,
      textTransform: "none",
    },
  },

  shape: {
    borderRadius: tokens.radius.md,
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: tokens.colors.bg,
        },
      },
    },

    MuiButton: {
      styleOverrides: {
        root: {
          minHeight: 40,
          borderRadius: tokens.radius.sm,
          padding: "8px 14px",
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
  },
});