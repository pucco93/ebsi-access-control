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
import { getRoles } from "../../store/accessControlListSelectors";
import { useMemo, useState } from "react";
import { Check, Close } from "@mui/icons-material";
import { requestDeleteRole } from "../../contracts_connections/Roles";

interface IRolesTableProps {
  setIsCreating: (newValue: boolean) => void;
}

const RolesTable = (props: IRolesTableProps) => {
  const { setIsCreating } = props;
  const roles = useSelector(
    (state: { accessControlList: AccessControlListType }) => getRoles(state)
  );
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);

  const visibleRoles = useMemo(
    () => roles.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [page, rowsPerPage, roles]
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

  const triggerDeleteRow = (row: Role) => {
    if (row?.name) {
      setIsCreating(true);
      requestDeleteRole(row?.name);
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
            {visibleRoles.map((role: any, index: number) => (
              <TableRow
                key={index}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell align="left">{role.name}</TableCell>
                <TableCell align="right">
                  {role.isCustom ? <Check /> : <Close />}
                </TableCell>
                <TableCell align="right">
                  {role.isCustom && (
                    <Button
                      onClick={() => triggerDeleteRow(role)}
                      startIcon={<Close />}
                    >
                      Delete
                    </Button>
                  )}
                  {!role.isCustom && (
                    <Typography>
                      This Role is not custom and cannot be deleted.
                    </Typography>
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
        count={roles.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </>
  );
};

export default RolesTable;
