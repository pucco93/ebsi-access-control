import { useSelector } from "react-redux";
import styles from "./AlertComponent.module.css";
import AccessControlListType from "../../../store/accessControlListType";
import { Alert, AlertTitle } from "@mui/material";
import { getAlert } from "../../../store/accessControlListSelectors";

const AlertComponent = () => {
  const alert = useSelector((state: { accessControlList: AccessControlListType }) => getAlert(state));

  return (
    alert?.show && (
      <Alert
        severity={alert?.color === "red" ? "error" : "success"}
        className={styles.alert}
      >
        <AlertTitle>{alert?.color === "red" ? "Error" : "Success"}</AlertTitle>
        {alert?.msg}
      </Alert>
    )
  );
};

export default AlertComponent;
