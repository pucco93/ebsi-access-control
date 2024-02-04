import { useEffect, useState } from "react";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper
} from "@mui/material";
import GroupIcon from "@mui/icons-material/Group";
import DataObjectIcon from "@mui/icons-material/DataObject";
import ListAltIcon from "@mui/icons-material/ListAlt";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import UsersView from "./UsersView/UsersView";
import ResourcesView from "./ResourcesView/ResourcesView";
import RolesView from "./RolesView/RolesView";
import PermissionsView from "./PermissionsView/PermissionsView";
import styles from "./MainView.module.css";
import AlertComponent from "./reusables/AlertComponent/AlertComponent";
import { useSelector } from "react-redux";
import AccessControlListType from "../store/accessControlListType";
import { getConnectedAccount, getCurrentUserEbsiDID, getLoader } from "../store/accessControlListSelectors";
import { GENERAL } from "../constants/Constants";
import Loader from "./reusables/Loader/Loader";
import HeaderPaper from './HeaderPaper/HeaderPaper';
import { requestEbsiDID } from "../contracts_connections/Users";
import { listenForCustomErrors, listenForPermissionError } from "../contracts_connections/Account";
import CustomErrorAlertComponent from "./reusables/CustomErrorAlertComponent/CustomErrorsAlertComponent";
import PermissionDeniedErrorAlertComponent from "./reusables/PermissionDeniedErrorAlertComponent/PermissionDeniedErrorAlertComponent";

const views: any = {
  users: { title: "Users", component: <UsersView />, icon: <GroupIcon /> },
  resources: {
    title: "Resources",
    component: <ResourcesView />,
    icon: <DataObjectIcon />,
  },
  roles: { title: "Roles", component: <RolesView />, icon: <ListAltIcon /> },
  permissions: {
    title: "Permissions",
    component: <PermissionsView />,
    icon: <RemoveCircleOutlineIcon />,
  },
};

const MainView = (props: any) => {
  const { dataType, show, msg } =
    useSelector((state: { accessControlList: AccessControlListType }) => getLoader(state)) || {};
  const connectedAccount = useSelector((state: { accessControlList: AccessControlListType }) => getConnectedAccount(state));  const currentUserEbsiDID = useSelector((state: { accessControlList: AccessControlListType }) => getCurrentUserEbsiDID(state));
  const isLoading = show && typeof dataType === GENERAL;
  const [currentView, setCurrentView] = useState<string>("");

  const triggerSetCurrentView = (newView: string) => {
    setCurrentView(newView);
  };

  useEffect(() => {
    if (!currentUserEbsiDID) {
      requestEbsiDID();
    }
  }, [connectedAccount]);
  
  useEffect(() => {
    listenForCustomErrors();
    listenForPermissionError();
  }, []);

  return (
    <Box
      sx={{
        width: "calc(100vw - 40px)",
        maxWidth: 1920,
        height: "calc(100vh - 70px)",
        background: "white",
        margin: "20px",
      }}
    >
      <HeaderPaper setCurrentView={triggerSetCurrentView} currentViewTitle={views[currentView]?.title} />
      {!isLoading && (
        <div className={styles.contentView}>
          <Paper className={styles.menuView}>
            <List>
              {Object.entries(views).map(([key, value]: any, index: number) => (
                <ListItem key={index}>
                  <ListItemButton onClick={() => setCurrentView(key)}>
                    <ListItemIcon>{value.icon}</ListItemIcon>
                    <ListItemText>{value.title}</ListItemText>
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Paper>
          <div className={styles.currentView}>
            {views[currentView]?.component}
          </div>
        </div>
      )}
      <Loader show={isLoading} msg={msg} />
      <AlertComponent />
      <CustomErrorAlertComponent />
      <PermissionDeniedErrorAlertComponent />
    </Box>
  );
};

export default MainView;
