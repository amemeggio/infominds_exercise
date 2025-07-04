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
} from "@mui/material";
import { useEffect, useState } from "react";

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

  useEffect(() => {
    fetch("/api/customers/list")
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        setList(data as CustomerListQuery[]);
      })
  }, []);

  // function to escape 'special' XML characters
  const escapeXml = (unsafe: string): string => {
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
  };

  // function to export xml with data from list
  const exportToXml = () => {
    if (list.length === 0) {
      alert("No data to export.");
      return;
    }

    let xmlString = '<?xml version="1.0" encoding="UTF-8"?>\n<Customers>\n';

    list.forEach((customer) => {
      xmlString += '  <Customer>\n';
      // Apply escapeXml to each data field
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
  };

  return (
    <>
      <Typography variant="h4" sx={{ textAlign: "center", mt: 4, mb: 4 }}>
        Customers
      </Typography>

      <Button
        variant="contained"
        onClick={exportToXml}
        sx={{ mb: 2, ml: 2 }}
      >
        Export to XML
      </Button>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
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
            {list.map((row) => (
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
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}

const StyledTableHeadCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.common.white,
  },
}));