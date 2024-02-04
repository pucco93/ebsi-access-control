import { useSelector } from "react-redux";
import styles from "./PermissionDeniedErrorAlertComponent.module.css";
import AccessControlListType from "../../../store/accessControlListType";
import { Alert, AlertTitle } from "@mui/material";
import { getPermissionDeniedErrorsAlert } from "../../../store/accessControlListSelectors";

const PermissionDeniedErrorAlertComponent = () => {
  const permissionDeniedErrorsAlert = useSelector((state: { accessControlList: AccessControlListType }) => getPermissionDeniedErrorsAlert(state));

  return (
    permissionDeniedErrorsAlert?.show && (
      <Alert
        severity="error"
        className={styles.alert}
      >
        <AlertTitle>Error</AlertTitle>
        {permissionDeniedErrorsAlert?.msg}
      </Alert>
    )
  );
};

export default PermissionDeniedErrorAlertComponent;
