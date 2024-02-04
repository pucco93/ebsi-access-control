import {
  Alert,
  AlertColor,
  Box,
  CircularProgress,
  Paper,
  Snackbar,
  Typography,
} from "@mui/material";
import Actions from "../reusables/Actions/Actions";
import { useDispatch, useSelector } from "react-redux";
import AccessControlListType from "../../store/accessControlListType";
import { useEffect, useState } from "react";
import { ROLES } from "../../constants/Constants";
import {
  setCreatedRole,
  setDeletedRole,
} from "../../store/accessControlListStore";
import {
  listenForRoles,
  requestRoles,
  requestRolesHashes,
} from "../../contracts_connections/Roles";
import {
  getCreatedRole,
  getDeletedRole,
  getLoader,
  getRoles,
} from "../../store/accessControlListSelectors";
import styles from "./Roles.module.css";
import RoleCreationModal from "./RoleCreationModal";
import RolesTable from "./RolesTable";
import { requestPermissionsHashes } from "../../contracts_connections/Permissions";

const NoRoles = () => {
  return (
    <Paper>
      <Typography className={styles.noRolesLabel} variant="h5">
        No roles found, maybe you should create the first one.
      </Typography>
    </Paper>
  );
};

const RolesView = () => {
  const roles =
    useSelector((state: { accessControlList: AccessControlListType }) =>
      getRoles(state)
    ) || [];
  const { dataType, show } =
    useSelector((state: { accessControlList: AccessControlListType }) =>
      getLoader(state)
    ) || {};
  const [openSnackbar, setSnackbarOpen] = useState<boolean>(false);
  const createdRole = useSelector(
    (state: { accessControlList: AccessControlListType }) =>
      getCreatedRole(state)
  );
  const deletedRole = useSelector(
    (state: { accessControlList: AccessControlListType }) =>
      getDeletedRole(state)
  );
  const isLoading = show && typeof dataType === ROLES;
  const [isOpen, setOpen] = useState<boolean>(false);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [alertData, setAlertData] = useState<{
    status: AlertColor | undefined;
    name: string;
    action: string;
  }>({
    action: "",
    name: "",
    status: undefined,
  });
  const dispatch = useDispatch();
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  useEffect(() => {
    listenForRoles();
    requestRolesHashes();
    requestRoles();
    requestPermissionsHashes();
  }, []);

  useEffect(() => {
    setIsCreating(false);
    if (createdRole) {
      setSnackbarOpen(true);
      handleClose();
      setAlertData({
        action: "created",
        name: createdRole.role?.name || "",
        status: createdRole.status,
      });
      setTimeout(() => {
        setSnackbarOpen(false);
        dispatch(setCreatedRole({ status: undefined, role: null }));
        setAlertData({
          action: "",
          name: "",
          status: undefined,
        });
      }, 3000);
    }
  }, [createdRole]);

  useEffect(() => {
    setIsCreating(false);
    if (deletedRole) {
      setSnackbarOpen(true);
      handleClose();
      setAlertData({
        action: "deleted",
        name: deletedRole.role?.name || "",
        status: deletedRole.status,
      });
      setTimeout(() => {
        setSnackbarOpen(false);
        dispatch(setDeletedRole({ status: undefined, role: null }));
        setAlertData({
          action: "",
          name: "",
          status: undefined,
        });
      }, 3000);
    }
  }, [deletedRole]);

  return (
    <Box>
      <Actions currentViewTitle="roles" openCreation={handleOpen} />
      {isLoading && <CircularProgress />}
      {!isLoading && roles?.length > 0 && (
        <Paper>
          <RolesTable setIsCreating={setIsCreating} />
        </Paper>
      )}
      {!isLoading && roles?.length === 0 && <NoRoles />}
      <RoleCreationModal
        isOpen={isOpen}
        isCreating={isCreating}
        setIsCreating={setIsCreating}
        handleClose={handleClose}
      />
      <Snackbar
        onClose={handleClose}
        open={openSnackbar}
        autoHideDuration={5000}
      >
        <Alert severity={alertData.status} sx={{ width: "100%" }}>
          <Typography>
            {`${alertData.name} has ${
              alertData.status !== "success" ? "not" : ""
            } been ${alertData.action}.`}
          </Typography>
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default RolesView;
