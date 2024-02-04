import { Button, Tooltip } from "@mui/material";
import styles from "./AccountSection.module.css";
import { useDispatch, useSelector } from "react-redux";
import AccessControlListType from "../../../store/accessControlListType";
import { Login, Person } from "@mui/icons-material";
import {
  getConnectedAccount,
  getCurrentUserEbsiDID,
} from "../../../store/accessControlListSelectors";
import { useEffect, useRef, useState } from "react";
import {
  connect,
  disconnect,
  setCurrentUserEbsiDID,
} from "../../../store/accessControlListStore";
import {
  EBSI_DID_RESOLVED,
  METAMASK_ACCOUNT,
} from "../../../constants/Constants";
import { connectWallet } from "../../../contracts_connections/Account";

const AccountSection = () => {
  const ref = useRef<any>(null);
  let accountFromLocalStorage = "";
  const connectedAccount = useSelector(
    (state: { accessControlList: AccessControlListType }) =>
      getConnectedAccount(state)
  );
  const currentUserEbsiDID = useSelector(
    (state: { accessControlList: AccessControlListType }) =>
      getCurrentUserEbsiDID(state)
  );
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);

  const disconnectAccount = () => {
    localStorage.setItem(METAMASK_ACCOUNT, "");
    localStorage.setItem(EBSI_DID_RESOLVED, "");
    dispatch(disconnect());
    dispatch(setCurrentUserEbsiDID(""));
    setOpen(false);
  };

  const clickOutside = (event: any) => {
    if (ref.current && !ref.current.contains(event.target)) {
      setOpen(false);
    }
  };

  useEffect(() => {
    accountFromLocalStorage = localStorage.getItem(METAMASK_ACCOUNT) || "";
    if (!!accountFromLocalStorage) {
      dispatch(connect(accountFromLocalStorage));
    }
    window.addEventListener("click", clickOutside);

    return () => {
      window.removeEventListener("click", clickOutside);
    };
  }, []);

  return (
    <>
      <div className={styles.accountSection}>
        {!currentUserEbsiDID && !connectedAccount && (
          <Button
            className={styles.loginButton}
            onClick={connectWallet}
            startIcon={<Login />}
          >
            Login
          </Button>
        )}
        {(currentUserEbsiDID || connectedAccount) && (
          <div ref={ref}>
            <Tooltip title={currentUserEbsiDID}>
              <Button
                className={
                  open ? styles.logoutButtonOpened : styles.logoutButton
                }
                onClick={() => setOpen(!open)}
                startIcon={<Person />}
              >
                {currentUserEbsiDID || connectedAccount}
              </Button>
            </Tooltip>
            <div
              className={
                open ? styles.slidingWindowOpened : styles.slidingWindow
              }
              onClick={disconnectAccount}
            >
              Disconnect
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AccountSection;
