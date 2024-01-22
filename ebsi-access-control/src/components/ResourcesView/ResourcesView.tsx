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
  import { useSelector } from "react-redux";
  import AccessControlListType from "../../store/accessControlListType";
  import { useEffect, useState } from "react";
  import { ROLES } from "../../constants/Constants";
  import {
    setCreatedResource,
    setDeletedResource,
  } from "../../store/accessControlListStore";
  import {
    listenForResources,
    requestResources,
    requestResourcesHashes,
  } from "../../contracts_connections/Resources";
  import {
    getCreatedResource,
    getDeletedResource,
    getLoader,
    getResources,
  } from "../../store/accessControlListSelectors";
  import styles from "./Resources.module.css";
  import ResourceCreationModal from "./ResourceCreationModal";
  import ResourcesTable from "./ResourcesTable";
  import { requestPermissionsHashes } from "../../contracts_connections/Permissions";
import { requestUsers } from "../../contracts_connections/Users";
  
  const NoResources = () => {
    return (
      <Paper>
        <Typography className={styles.noResourcesLabel} variant="h5">
          No resources found, maybe you should create the first one.
        </Typography>
      </Paper>
    );
  };
  
  const ResourcesView = () => {
    const resources =
      useSelector((state: { accessControlList: AccessControlListType }) =>
        getResources(state)
      ) || [];
    const { dataType, show } =
      useSelector((state: { accessControlList: AccessControlListType }) =>
        getLoader(state)
      ) || {};
    const createdResource = useSelector(
      (state: { accessControlList: AccessControlListType }) =>
        getCreatedResource(state)
    );
    const deletedResource = useSelector(
      (state: { accessControlList: AccessControlListType }) =>
        getDeletedResource(state)
    );
    const [isOpen, setOpen] = useState<boolean>(false);
    const [isCreating, setIsCreating] = useState<boolean>(false);
    const [openSnackbar, setSnackbarOpen] = useState<boolean>(false);
    const [alertData, setAlertData] = useState<{
      status: AlertColor | undefined;
      name: string;
      action: string;
    }>({
      action: "",
      name: "",
      status: undefined,
    });
    const isLoading = show && typeof dataType === ROLES;
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
  
    useEffect(() => {
      listenForResources();
      requestResourcesHashes();
      requestResources();
      requestUsers();
    }, []);
  
    useEffect(() => {
      setIsCreating(false);
      if (createdResource) {
        setSnackbarOpen(true);
        handleClose();
        setAlertData({
          action: "created",
          name: createdResource.resource?.name || "",
          status: createdResource.status,
        });
        setTimeout(() => {
          setSnackbarOpen(false);
          setCreatedResource({ status: undefined, resource: null });
        }, 6000);
      }
    }, [createdResource]);
  
    useEffect(() => {
      setIsCreating(false);
      if (deletedResource) {
        setSnackbarOpen(true);
        handleClose();
        setAlertData({
          action: "deleted",
          name: deletedResource.resource?.name || "",
          status: deletedResource.status,
        });
        setTimeout(() => {
          setSnackbarOpen(false);
          setDeletedResource({ status: undefined, resource: null });
        }, 6000);
      }
    }, [deletedResource]);
  
    return (
      <Box>
        <Actions currentViewTitle="resources" openCreation={handleOpen} />
        {isLoading && <CircularProgress />}
        {!isLoading && resources?.length > 0 && (
          <Paper>
            <ResourcesTable setIsCreating={setIsCreating} />
          </Paper>
        )}
        {!isLoading && resources?.length === 0 && <NoResources />}
        <ResourceCreationModal
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
  
  export default ResourcesView;
  