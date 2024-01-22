import { Button, InputAdornment, TextField } from "@mui/material";
import { requestUser, requestUsers } from "../../../contracts_connections/Users";
import { Add } from "@mui/icons-material";
import styles from "./Actions.module.css";
import { requestPermission, requestPermissions } from "../../../contracts_connections/Permissions";
import { useEffect, useState } from "react";
import { requestRole, requestRoles } from "../../../contracts_connections/Roles";
import { requestResource, requestResources } from "../../../contracts_connections/Resources";

interface IActionsProps {
  currentViewTitle: string;
  openCreation: () => void;
}

const Actions = (props: IActionsProps) => {
  const { currentViewTitle, openCreation } = props;
  const [searchTerm, updateSearchTerm] = useState<string | undefined>(undefined);

  useEffect(() => {
    const debounce = setTimeout(() => {
      if(searchTerm) {
        triggerUpdateSearch(searchTerm, currentViewTitle);
      } else if(searchTerm === "") {
        triggerUpdateSearch("", currentViewTitle);
      }
    }, 1000);

    return () => clearTimeout(debounce);
  }, [searchTerm]);

  const triggerUpdateSearch = (newTerm: string = "", type: string) => {
    switch(type) {
      case 'users': {
        let ebsiDID = newTerm;
        if(ebsiDID.indexOf('did:key:') > -1) {
          ebsiDID = ebsiDID.replace('did:key:', '');
        }

        if(ebsiDID) {
          requestUser(ebsiDID);
        } else {
          requestUsers();
        }
        break;
      }
      case 'resources': {
        if(newTerm) {
          requestResource(newTerm);
        } else {
          requestResources();
        }
        break;
      }
      case 'roles': {
        if(newTerm) {
          requestRole(newTerm);
        } else {
          requestRoles();
        }
        break;
      }
      case 'permissions': {
        if(newTerm) {
          requestPermission(newTerm);
        } else {
          requestPermissions();
        }
        break;
      }
      default:
    }
  };

  return (
    currentViewTitle && (
      <div className={styles.actionsRow}>
        <TextField
          className={styles.searchField}
          id="outlined-basic"
          label={(currentViewTitle === "users") ? "Search by EBSI DID" : "Search by Name"}
          variant="outlined"
          onChange={(event) => updateSearchTerm(event?.target?.value)}
          InputProps={{startAdornment: (currentViewTitle === "users") && <InputAdornment position="start">did:key:</InputAdornment>}}
        />
        <Button
          variant="contained"
          color="success"
          startIcon={<Add />}
          size="large"
          onClick={openCreation}
        >
          {`Create ${currentViewTitle?.slice(0, -1)}`}
        </Button>
      </div>
    )
  );
};

export default Actions;
