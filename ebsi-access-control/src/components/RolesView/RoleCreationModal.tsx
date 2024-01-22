import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  FormLabel,
  TextField,
  Select,
  MenuItem,
  SelectChangeEvent,
  Checkbox,
  ListItemText,
} from "@mui/material";
import styles from "./Roles.module.css";
import { requestCreateRole } from "../../contracts_connections/Roles";
import { useSelector } from "react-redux";
import { getPermissionsOptions } from "../../store/accessControlListSelectors";
import AccessControlListType from "../../store/accessControlListType";

interface IUserCreationModalProps {
  isOpen: boolean;
  isCreating: boolean;
  handleClose: () => void;
  setIsCreating: (newValue: boolean) => void;
}

const RoleCreationModal = (props: IUserCreationModalProps) => {
  const { isOpen, handleClose, isCreating, setIsCreating } = props;
  const [name, udpateName] = useState<string>("");
  const [permissions, updatePermissions] = useState<string[]>([]);
  const [errorInForm, updateErrorInForm] = useState<boolean>(false);
  const [nameLength, updateNameLength] = useState<number>(0);
  const permissionsOptions = useSelector(
    (state: { accessControlList: AccessControlListType }) =>
    getPermissionsOptions(state)
  );

  const triggerUpdateName = (newValue: string) => {
    updateErrorInForm(false);
    udpateName(newValue);
    updateNameLength(newValue?.length || 0);
  };

  const triggerUpdatePermissions = (event: SelectChangeEvent) => {
    const newValue = event?.target?.value || "";
    if (newValue) {
      updatePermissions(newValue);
    }
  };

  const submitNewRole = () => {
    if (!isCreating) {
      if (name && name.length <= 32) {
        setIsCreating(true);
        requestCreateRole(name, permissions);
      } else {
        updateErrorInForm(true);
      }
    }
  };

  return (
    <>
      <Dialog
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={isOpen}
        keepMounted
        closeAfterTransition
        onClose={handleClose}
      >
        <DialogTitle>New role</DialogTitle>
        <DialogContent>
          <form>
            <FormControl fullWidth>
              <FormLabel className={styles.roleNameLabel}>Name*</FormLabel>
              <TextField
                autoFocus={true}
                error={errorInForm || nameLength > 32}
                helperText={errorInForm || nameLength > 32 ? `Name should have a value and up to 32 chars - ${nameLength}/32` : `${nameLength}/32`}
                required
                onChange={(event) => triggerUpdateName(event?.target?.value)}
                className={styles.textInput}
                variant="outlined"
              />
              <FormLabel className={styles.roleNameLabel}>
                Permissions
              </FormLabel>
              <Select
                onChange={(event: SelectChangeEvent) =>
                  triggerUpdatePermissions(event)
                }
                className={styles.textInput}
                variant="outlined"
                multiple
                value={permissions}
                renderValue={(selected) => (
                  permissionsOptions
                    ?.filter(option => selected.indexOf(option.value) > -1)
                    ?.map(option => option.name)
                    ?.join(', ')
                    || ""
                )}
              >
                {permissionsOptions?.map((permissionHash: { name: string, value: string }) => (
                  <MenuItem key={permissionHash.value} value={permissionHash.value}>
                    <Checkbox
                      checked={permissions.indexOf(permissionHash.value) > -1}
                    />
                    <ListItemText primary={permissionHash.name} />
                  </MenuItem>
                ))}
              </Select>
              <Button
                variant="contained"
                disabled={isCreating}
                onClick={submitNewRole}
              >
                Create
              </Button>
              {isCreating && (
                <Box className={styles.circularProgressBox}>
                  <CircularProgress />
                </Box>
              )}
              {errorInForm && (
                <Alert className={styles.requiredErrorAlert} severity="error">
                  Name is required
                </Alert>
              )}
            </FormControl>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RoleCreationModal;
