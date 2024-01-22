import {
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow
} from "@mui/material";
import { useSelector } from "react-redux";
import AccessControlListType from "../../store/accessControlListType";
import { getResources } from "../../store/accessControlListSelectors";
import { useMemo, useState } from "react";
import { Close } from "@mui/icons-material";
import { requestDeleteResource } from "../../contracts_connections/Resources";
import ResourceDetailModal from "./ResourceDetailModal";
import styles from "./Resources.module.css";

interface IResourcesTableProps {
  setIsCreating: (newValue: boolean) => void;
}

const ResourcesTable = (props: IResourcesTableProps) => {
  const { setIsCreating } = props;
  const resources = useSelector(
    (state: { accessControlList: AccessControlListType }) => getResources(state)
  );
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);
  const [resourceDetail, openResourceDetailModal] = useState<Resource | null>(
    null
  );

  const visibleResources = useMemo(
    () => resources.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [page, rowsPerPage, resources]
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

  const triggerDeleteRow = (event: any, row: Resource) => {
    event.preventDefault();
    event.stopPropagation();
    if (row?.name) {
      setIsCreating(true);
      requestDeleteResource(row?.name);
    }
  };

  const openResourceDetails = (resource: Resource) => {
    openResourceDetailModal(resource);
  };

  const closeResourceDetails = () => {
    openResourceDetailModal(null);
  };

  return (
    <>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell align="left">Name</TableCell>
              <TableCell align="left">Blacklist</TableCell>
              <TableCell align="left">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {visibleResources.map((resource: any, index: number) => (
              <TableRow
                key={index}
                sx={{ "&:last-child td, &:last-child th": { border: 0 }}}
                onClick={() => openResourceDetails(resource)}
                className={styles.clickableRow}
              >
                <TableCell align="left">{resource.name}</TableCell>
                <TableCell align="left">{resource.blacklist?.map((user: string) => user).join(', ') || "No blacklisted user."}</TableCell>
                <TableCell align="left">
                  <Button
                    onClick={(event) => triggerDeleteRow(event, resource)}
                    startIcon={<Close />}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={resources.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
      <ResourceDetailModal
        resource={resourceDetail}
        closeModal={closeResourceDetails}
      />
    </>
  );
};

export default ResourcesTable;
