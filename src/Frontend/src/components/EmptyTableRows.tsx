import {
  TableCell,
  TableRow,
} from "@mui/material";

interface EmptyTableRowsProps {
  colspan: number;
  noDataFoundMessage: string;
}

export const EmptyTableRows = ({
  colspan,
  noDataFoundMessage,
}: EmptyTableRowsProps) => {
  return (
    <TableRow>
        <TableCell colSpan={colspan} sx={{ textAlign: 'center', py: 3 }}>
            {noDataFoundMessage}
        </TableCell>
    </TableRow>
  );
};