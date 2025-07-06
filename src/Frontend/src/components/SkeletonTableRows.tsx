import {
  TableCell,
  TableRow,
  Skeleton,
} from "@mui/material";

interface SkeletonTableRowsProps {
  skeletonRowCount: number;
  skeletonColumnCount: number;
}

export const SkeletonTableRows = ({
  skeletonRowCount,
  skeletonColumnCount,
}: SkeletonTableRowsProps) => {
  return (
    <>
      {Array.from(new Array(skeletonRowCount)).map((_, rowIndex) => (
        <TableRow key={rowIndex}>
          {Array.from(new Array(skeletonColumnCount)).map((_, colIndex) => (
            <TableCell key={colIndex}>
              <Skeleton variant="text" width="80%" height={20} />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
};