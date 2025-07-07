import {
  Snackbar,
  Alert,
} from "@mui/material";

interface SnackbarErrorProps {
  snackbarOpen: boolean;
  handleSnackbarClose: () => void;
  errorTxt: string | null;
}

export const SnackbarError = ({
  snackbarOpen,
  handleSnackbarClose,
  errorTxt,
}: SnackbarErrorProps) => {
  return (
    <Snackbar
      open={snackbarOpen}
      autoHideDuration={5000}
      onClose={handleSnackbarClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert
        onClose={handleSnackbarClose}
        severity="error"
        variant="filled"
        sx={{ width: '100%' }}
      >
        {errorTxt}
      </Alert>
    </Snackbar>
  );
};