import {
  Chip,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  TooltipProps,
  styled,
  tooltipClasses,
} from "@mui/material";
import { useSelector } from "react-redux";
import AccessControlListType from "../../store/accessControlListType";
import { getUsers } from "../../store/accessControlListSelectors";
import { useMemo, useState } from "react";
import User from "../../models/User";
import { Delete, Edit } from "@mui/icons-material";
import styles from "./UsersView.module.css";
import { formatDate } from "../../utilities/utilities";
import { requestDeleteUser } from "../../contracts_connections/Users";

export const LightHtmlTooltip = styled(
  ({ className, ...props }: TooltipProps) => (
    <Tooltip {...props} classes={{ popper: className }} />
  )
)(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.common.white,
    color: "rgba(0, 0, 0, 0.87)",
    boxShadow: theme.shadows[1],
    fontSize: 11,
  },
}));

interface IUsersTableProps {
  setIsCreating: (newValue: boolean) => void;
  openManageModal: () => void;
  openUser: (user: User) => void;
}

const UsersTable = (props: IUsersTableProps) => {
  const { setIsCreating, openManageModal, openUser } = props;
  const users = useSelector(
    (state: { accessControlList: AccessControlListType }) => getUsers(state)
  );
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);

  const visibleUsers = useMemo(
    () => users.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [page, rowsPerPage]
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

  const triggerDeleteUser = (event: any, user: User) => {
    event.preventDefault();
    event.stopPropagation();
    if (user.ebsiDID) {
      setIsCreating(true);
      requestDeleteUser(user);
    }
  };

  const handleRowClick = (row: User) => {
    openManageModal();
    openUser(row);
  };

  return (
    <>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>EBSI DID</TableCell>
              <TableCell align="right">Resources</TableCell>
              <TableCell align="right">Created time</TableCell>
              <TableCell align="right">Last Update</TableCell>
              <TableCell align="right">Last Access</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {visibleUsers.map((user: User) => (
              <TableRow
                key={user.ebsiDID}
                className={styles.userRow}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                onClick={() => handleRowClick(user)}
              >
                <Tooltip title={user?.ebsiDID}>
                  <TableCell className={styles.ebsiDIDCell} align="right">
                    {user.ebsiDID}
                  </TableCell>
                </Tooltip>
                <TableCell className={styles.chipsContainerCell} align="right">
                  <Stack
                    className={styles.chipsContainerStack}
                    direction="row"
                    spacing={1}
                  >
                    {(user?.resources.length > 2
                      ? user?.resources.slice(0, 2)
                      : user.resources
                    )?.map((resource: string) => (
                      <LightHtmlTooltip
                        key={resource}
                        title={
                          <Stack direction="row" spacing={1}>
                            {resource}
                          </Stack>
                        }
                      >
                        <Chip label={resource}></Chip>
                      </LightHtmlTooltip>
                    ))}
                  </Stack>
                </TableCell>
                <TableCell align="right">
                  {formatDate(user?.createdTime)}
                </TableCell>
                <TableCell align="right">
                  {formatDate(user?.lastUpdate)}
                </TableCell>
                <TableCell align="right">
                  {formatDate(user?.lastAccess)}
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    onClick={(event: any) => triggerDeleteUser(event, user)}
                  >
                    <Delete />
                  </IconButton>
                  <IconButton>
                    <Edit />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={users.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </>
  );
};

export default UsersTable;
