import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import AccessControlListType from "../../store/accessControlListType";
import { PERMISSIONS } from "../../constants/Constants";
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
import {
  getCreatedPermission,
  getDeletedPermission,
  getLoader,
  getPermissions,
} from "../../store/accessControlListSelectors";
import PermissionsTable from "./PermissionsTable";
import styles from "./Permissions.module.css";
import PermissionCreationModal from "./PermissionCreationModal";
import {
  listenForPermissions,
  requestPermissions,
  requestPermissionsHashes,
} from "../../contracts_connections/Permissions";
import {
  setCreatedPermission,
  setDeletedPermission,
} from "../../store/accessControlListStore";

const NoPermissions = () => {
  return (
    <Paper>
      <Typography className={styles.noPermissionsLabel} variant="h5">
        No permissions found, maybe you should create the first one.
      </Typography>
    </Paper>
  );
};

const PermissionsView = () => {
  const permissions =
    useSelector((state: { accessControlList: AccessControlListType }) =>
      getPermissions(state)
    ) || [];
  const { dataType, show } =
    useSelector((state: { accessControlList: AccessControlListType }) =>
      getLoader(state)
    ) || {};
  const [openSnackbar, setSnackbarOpen] = useState<boolean>(false);
  const createdPermission = useSelector(
    (state: { accessControlList: AccessControlListType }) =>
      getCreatedPermission(state)
  );
  const deletedPermission = useSelector(
    (state: { accessControlList: AccessControlListType }) =>
      getDeletedPermission(state)
  );
  const isLoading = show && typeof dataType === PERMISSIONS;
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
    listenForPermissions();
    requestPermissionsHashes();
    requestPermissions();
  }, []);

  useEffect(() => {
    setIsCreating(false);
    if (createdPermission?.permission?.name) {
      setSnackbarOpen(true);
      handleClose();
      setAlertData({
        action: "created",
        name: createdPermission.permission?.name || "",
        status: createdPermission.status,
      });
      setTimeout(() => {
        setSnackbarOpen(false);
        dispatch(setCreatedPermission({ status: undefined, permission: null }));
        setAlertData({
          action: "",
          name: "",
          status: undefined,
        });
      }, 3000);
    }
  }, [createdPermission]);

  useEffect(() => {
    setIsCreating(false);
    if (deletedPermission?.permission?.name) {
      setSnackbarOpen(true);
      handleClose();
      setAlertData({
        action: "deleted",
        name: deletedPermission.permission?.name || "",
        status: deletedPermission.status,
      });
      setTimeout(() => {
        setSnackbarOpen(false);
        dispatch(setDeletedPermission({ status: undefined, permission: null }));
        setAlertData({
          action: "",
          name: "",
          status: undefined,
        });
      }, 3000);
    }
  }, [deletedPermission]);

  return (
    <Box>
      <Actions currentViewTitle="permissions" openCreation={handleOpen} />
      {isLoading && <CircularProgress />}
      {!isLoading && permissions?.length > 0 && (
        <Paper>
          <PermissionsTable setIsCreating={setIsCreating} />
        </Paper>
      )}
      {!isLoading && permissions?.length === 0 && <NoPermissions />}
      <PermissionCreationModal
        isOpen={isOpen}
        isCreating={isCreating}
        setIsCreating={setIsCreating}
        handleClose={handleClose}
      />
      <Snackbar onClose={handleClose} open={openSnackbar} autoHideDuration={5000}>
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

export default PermissionsView;
