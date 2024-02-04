import {
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material";
import { useSelector } from "react-redux";
import AccessControlListType from "../../store/accessControlListType";
import { getPermissions } from "../../store/accessControlListSelectors";
import { useMemo, useState } from "react";
import { Check, Close } from "@mui/icons-material";
import { requestDeletePermission } from "../../contracts_connections/Permissions";

interface IPermissionsTableProps {
  setIsCreating: (newValue: boolean) => void;
};

const PermissionsTable = (props: IPermissionsTableProps) => {
  const { setIsCreating } = props;
  const permissions = useSelector(
    (state: { accessControlList: AccessControlListType }) =>
      getPermissions(state)
  );
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);

  const visiblePermissions = useMemo(
    () =>
      permissions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [page, rowsPerPage, permissions]
  );

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const triggerDeleteRow = (row: Permission) => {
    if (row?.name) {
      setIsCreating(true);
      requestDeletePermission(row?.name);
    }
  };

  return (
    <>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell align="left">Name</TableCell>
              <TableCell align="right">Is custom?</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {visiblePermissions.map((permission: any, index: number) => (
              <TableRow
                key={index}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell align="left">{permission.name}</TableCell>
                <TableCell align="right">
                  {permission.isCustom ? <Check /> : <Close />}
                </TableCell>
                <TableCell align="right">
                  {permission.isCustom && (
                    <Button
                      onClick={() => triggerDeleteRow(permission)}
                      startIcon={<Close />}
                    >
                      Delete
                    </Button>
                  )}
                  {!permission.isCustom && (
                    <Typography>This permission is not custom and cannot be deleted.</Typography>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={permissions.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </>
  );
};

export default PermissionsTable;
