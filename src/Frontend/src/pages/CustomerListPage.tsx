import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  styled,
  tableCellClasses,
  Button,
  TextField,
  Box,
} from "@mui/material";
import { useEffect, useState, useCallback } from "react";
import { SkeletonTableRows } from "../components/SkeletonTableRows";
import { EmptyTableRows } from "../components/EmptyTableRows";
import { SnackbarError } from "../components/SnackBarError";

interface CustomerListQuery {
  id: number;
  name: string;
  address: string;
  email: string;
  phone: string;
  iban: string;
}

export default function CustomerListPage() {
  const [list, setList] = useState<CustomerListQuery[]>([]);
  // react state to keep search term
  const [searchTerm, setSearchTerm] = useState<string>("");
  // react state to set debounced search term and avoid calling api
  // to get customer list immediately after modifying search term field.
  // (i will wait at least 500 milliseconds after modyfing the field,
  // before fetching data again)
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);

  // Debounce search term with timeout
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm]);

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      setError(null);
      setSnackbarOpen(false);
      let url = "/api/customers/list";
      if (debouncedSearchTerm) {
        url = `/api/customers/list?SearchText=${encodeURIComponent(debouncedSearchTerm)}`;
      }

      try {
        const response = await fetch(url);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
            throw new Error(`Failed to fetch customers: ${response.status} ${response.statusText} - ${errorData.message || 'Server error'}`);
        }
        const data = await response.json();
        setList(data as CustomerListQuery[]);
      } catch (error) {
        console.error("Error fetching customers list:", error);
        setError("Error fetching customers list.");
        // Open Snackbar on error
        setSnackbarOpen(true);
        // Clear list on error
        setList([]);
      } finally {
        // Set loading to false
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [debouncedSearchTerm]);

  // Handle Snackbar close event
  const handleSnackbarClose = () => {
    // hide SnackBar
    setSnackbarOpen(false);
    // Clear error message when snackbar closes
    setError(null);
  };

  // function to escape 'special' XML characters
  // (with useCallback to memoize the function)
  const escapeXml = useCallback((unsafe: string): string => {
    return unsafe.replace(/[<>&'"]/g, function (c) {
      switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case '\'': return '&apos;';
        case '"': return '&quot;';
        default: return c;
      }
    });
  }, []);

  // function to export xml with data from list
  // (with useCallback to memoize the function)
  const exportToXml = useCallback(() => {
    if (list.length === 0) {
      alert("No data to export.");
      return;
    }

    let xmlString = '<?xml version="1.0" encoding="UTF-8"?>\n<Customers>\n';

    list.forEach((customer) => {
      xmlString += '  <Customer>\n';
      xmlString += `    <Id>${escapeXml(String(customer.id))}</Id>\n`;
      xmlString += `    <Name>${escapeXml(customer.name)}</Name>\n`;
      xmlString += `    <Address>${escapeXml(customer.address)}</Address>\n`;
      xmlString += `    <Email>${escapeXml(customer.email)}</Email>\n`;
      xmlString += `    <Phone>${escapeXml(customer.phone)}</Phone>\n`;
      xmlString += `    <Iban>${escapeXml(customer.iban)}</Iban>\n`;
      xmlString += '  </Customer>\n';
    });

    xmlString += '</Customers>';

    const blob = new Blob([xmlString], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "customers.xml";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [list, escapeXml]);

  // Number of rows and columns for the skeleton table
  const skeletonRowCount = 5;
  const skeletonColumnCount = 5;

  return (
    <>
      <Typography variant="h4" sx={{ textAlign: "center", mt: 4, mb: 4 }}>
        Customers
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, mx: 2 }}>
        <TextField
          label="Search Customers (Name or Email)"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ width: 'auto', flexGrow: 1, mr: 2 }}
        />
        <Button
          variant="contained"
          onClick={exportToXml}
          // while loading data, export button is disabled
          disabled={loading}
        >
          Export to XML
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="customer table">
          <TableHead>
            <TableRow>
              <StyledTableHeadCell>Name</StyledTableHeadCell>
              <StyledTableHeadCell>Address</StyledTableHeadCell>
              <StyledTableHeadCell>Email</StyledTableHeadCell>
              <StyledTableHeadCell>Phone</StyledTableHeadCell>
              <StyledTableHeadCell>Iban</StyledTableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <SkeletonTableRows
                skeletonRowCount={skeletonRowCount}
                skeletonColumnCount={skeletonColumnCount}
              />
            ) : (
              list.map((row) => (
                <TableRow
                  key={row.id}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.address}</TableCell>
                  <TableCell>{row.email}</TableCell>
                  <TableCell>{row.phone}</TableCell>
                  <TableCell>{row.iban}</TableCell>
                </TableRow>
              ))
            )}
            {!loading && list.length === 0 && (
              <EmptyTableRows
                colspan={skeletonColumnCount}
                noDataFoundMessage={"No customers found."}
              />
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <SnackbarError
        snackbarOpen={snackbarOpen}
        handleSnackbarClose={handleSnackbarClose}
        errorTxt={error}
      />
    </>
  );
}

const StyledTableHeadCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.common.white,
  },
}));