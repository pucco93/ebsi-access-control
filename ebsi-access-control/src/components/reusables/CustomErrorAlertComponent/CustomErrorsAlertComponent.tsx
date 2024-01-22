import { useSelector } from "react-redux";
import styles from "./CustomErrorsAlertComponent.module.css";
import AccessControlListType from "../../../store/accessControlListType";
import { Alert, AlertTitle } from "@mui/material";
import { getCustomErrorsAlert } from "../../../store/accessControlListSelectors";

const CustomErrorAlertComponent = () => {
  const customErrorsAlert = useSelector((state: { accessControlList: AccessControlListType }) => getCustomErrorsAlert(state));

  return (
    customErrorsAlert?.show && (
      <Alert
        severity="error"
        className={styles.alert}
      >
        <AlertTitle>Error</AlertTitle>
        {customErrorsAlert?.msg}
      </Alert>
    )
  );
};

export default CustomErrorAlertComponent;
