import {
  Alert,
  AlertColor,
  Box,
  CircularProgress,
  Paper,
  Snackbar,
  Typography,
} from "@mui/material";
import UsersTable from "./UsersTable";
import { useEffect, useState } from "react";
import {
  getAllUserRoles,
  listenForUsersEvents,
  requestUsers,
  requestUsersEbsiDIDsArray,
} from "../../contracts_connections/Users";
// import { requestUsers } from "../../ contracts_connections/ContractsConnections";
import styles from "./UsersView.module.css";
import { useDispatch, useSelector } from "react-redux";
import AccessControlListType from "../../store/accessControlListType";
import {
  getCreatedUser,
  getDeletedUser,
  getLoader,
  getUpdatedUser,
  getUsers,
} from "../../store/accessControlListSelectors";
import { USERS } from "../../constants/Constants";
import Actions from "../reusables/Actions/Actions";
import UserCreationModal from "./UserCreationModal";
import {
  setCreatedUser,
  setDeletedUser,
  setUpdatedUser,
} from "../../store/accessControlListStore";
import ManageResourcesModal from "./sub-components/ManageResourcesModal";
import User from "../../models/User";

const NoUsers = () => {
  return (
    <Paper>
      <Typography className={styles.noUsersLabel} variant="h5">
        No users found, maybe you should create the first one.
      </Typography>
    </Paper>
  );
};

const UsersView = () => {
  const users =
    useSelector((state: { accessControlList: AccessControlListType }) =>
      getUsers(state)
    ) || [];
  const { dataType, show } =
    useSelector((state: { accessControlList: AccessControlListType }) =>
      getLoader(state)
    ) || {};
  const createdUser = useSelector(
    (state: { accessControlList: AccessControlListType }) =>
      getCreatedUser(state)
  );
  const deletedUser = useSelector(
    (state: { accessControlList: AccessControlListType }) =>
      getDeletedUser(state)
  );
  const updatedUser = useSelector(
    (state: { accessControlList: AccessControlListType }) =>
      getUpdatedUser(state)
  );
  const [isOpen, setOpen] = useState(false);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [openSnackbar, setSnackbarOpen] = useState<boolean>(false);
  const [isManageModalOpen, setIsManageModalOpened] = useState<boolean>(false);
  const [openedUser, updateOpenedUser] = useState<User | null>(null);
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
  const isLoading = show && typeof dataType === USERS;
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const triggerOpenUser = (user: User) => {
    getAllUserRoles(user?.ebsiDID);
    updateOpenedUser(user);
  };

  useEffect(() => {
    requestUsers();
    listenForUsersEvents();
    requestUsersEbsiDIDsArray();
  }, []);

  useEffect(() => {
    setIsCreating(false);
    if (createdUser?.ebsiDID) {
      setSnackbarOpen(true);
      handleClose();
      setAlertData({
        action: "created",
        name: createdUser?.ebsiDID || "",
        status: createdUser.status,
      });
      setTimeout(() => {
        setSnackbarOpen(false);
        dispatch(setCreatedUser({ action: "", status: undefined, ebsiDID: "" }));
        setAlertData({ action: "", status: undefined, name: "" });
      }, 3000);
    }
  }, [createdUser]);

  useEffect(() => {
    setIsCreating(false);
    if (deletedUser?.ebsiDID) {
      setSnackbarOpen(true);
      handleClose();
      setAlertData({
        action: "deleted",
        name: deletedUser?.ebsiDID || "",
        status: deletedUser.status,
      });
      setTimeout(() => {
        setSnackbarOpen(false);
        dispatch(setDeletedUser({ status: undefined, ebsiDID: "" }));
        setAlertData({ action: "", status: undefined, name: "" });
      }, 3000);
    }
  }, [deletedUser]);

  useEffect(() => {
    setIsCreating(false);
    if (updatedUser?.ebsiDID) {
      setSnackbarOpen(true);
      handleClose();
      setAlertData({
        action: "updated",
        name: updatedUser?.ebsiDID || "",
        status: updatedUser.status,
      });
      setTimeout(() => {
        setSnackbarOpen(false);
        dispatch(setUpdatedUser({ status: undefined, ebsiDID: "" }));
        setAlertData({ action: "", status: undefined, name: "" });
      }, 3000);
    }
  }, [updatedUser]);

  return (
    <Box>
      <Actions currentViewTitle="users" openCreation={handleOpen} />
      {isLoading && <CircularProgress />}
      {!isLoading && users?.length > 0 && (
        <Paper>
          <UsersTable
            setIsCreating={setIsCreating}
            openManageModal={() => setIsManageModalOpened(true)}
            openUser={triggerOpenUser}
          />
        </Paper>
      )}
      {!isLoading && users?.length === 0 && <NoUsers />}
      <UserCreationModal
        isOpen={isOpen}
        closeModal={handleClose}
        isCreating={isCreating}
        setIsCreating={setIsCreating}
      />
      <ManageResourcesModal
        isOpen={isManageModalOpen}
        closeModal={() => setIsManageModalOpened(false)}
        user={openedUser}
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

export default UsersView;
