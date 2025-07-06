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
  Skeleton,
} from "@mui/material";
import { useEffect, useState } from "react";

interface SupplierListQuery {
  id: number;
  name: string;
  address: string;
  email: string;
  phone: string;
}

export default function SupplierListPage() {
  const [list, setList] = useState<SupplierListQuery[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {    
      const fetchSuppliers = async () => {
      setLoading(true);
      const url = "/api/suppliers/list";

      try {
        const response = await fetch(url);
        const data = await response.json();
        setList(data as SupplierListQuery[]);
      } catch (error) {
        console.error("Error fetching customer list:", error);
        // Decide if display an error message to the user
        // Clear list on error
        setList([]);
      } finally {
        // Set loading to false
        setLoading(false);
      }
    };

    fetchSuppliers();
  }, []);

  // Number of rows and columns for the skeleton table
  const skeletonRowCount = 4;
  const skeletonColumnCount = 4;

  return (
    <>
      <Typography variant="h4" sx={{ textAlign: "center", mt: 4, mb: 4 }}>
        Suppliers
      </Typography>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <StyledTableHeadCell>Name</StyledTableHeadCell>
              <StyledTableHeadCell>Address</StyledTableHeadCell>
              <StyledTableHeadCell>Email</StyledTableHeadCell>
              <StyledTableHeadCell>Phone</StyledTableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              Array.from(new Array(skeletonRowCount)).map((_, rowIndex) => (
                <TableRow key={rowIndex}>
                  {Array.from(new Array(skeletonColumnCount)).map((_, colIndex) => (
                    <TableCell key={colIndex}>
                      <Skeleton variant="text" width="80%" height={20} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
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
                </TableRow>
              ))
            )}
            {!loading && list.length === 0 && (
                <TableRow>
                    <TableCell colSpan={skeletonColumnCount} sx={{ textAlign: 'center', py: 3 }}>
                        No suppliers found.
                    </TableCell>
                </TableRow>
            )}
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
