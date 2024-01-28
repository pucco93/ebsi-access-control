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
} from "@mui/material";
import styles from "./Permissions.module.css";
import { useState } from "react";
import { requestCreatePermission } from "../../contracts_connections/Permissions";

interface IUserCreationModalProps {
  isOpen: boolean;
  isCreating: boolean;
  handleClose: () => void;
  setIsCreating: (newValue: boolean) => void;
}

const PermissionCreationModal = (props: IUserCreationModalProps) => {
  const { isOpen, isCreating, handleClose, setIsCreating } = props;
  const [name, udpateName] = useState<string>("");
  const [nameLength, updateNameLength] = useState<number>(0);
  const [errorInForm, updateErrorInForm] = useState<boolean>(false);

  const triggerUpdateName = (newValue: string) => {
    updateErrorInForm(false);
    udpateName(newValue);
    updateNameLength(newValue?.length || 0);
  };

  const submitNewPermission = () => {
    if (!isCreating) {
      if (name && name.length <= 32) {
        setIsCreating(true);
        requestCreatePermission(name);
      } else {
        updateErrorInForm(true);
      }
    }
  };

  return (
    <Dialog
      open={isOpen}
      keepMounted
      closeAfterTransition
      onClose={handleClose}
    >
      <DialogTitle>New permission</DialogTitle>
      <DialogContent>
        <form>
          <FormControl fullWidth>
            <FormLabel className={styles.permissionNameLabel}>Name*</FormLabel>
            <TextField
              autoFocus={true}
              error={errorInForm || nameLength > 32}
              helperText={
                errorInForm || nameLength > 32
                  ? `Name should have a value and up to 32 chars - ${nameLength}/32`
                  : `${nameLength}/32`
              }
              required
              onChange={(event) => triggerUpdateName(event?.target?.value)}
              className={styles.textInput}
              variant="outlined"
            />
            <Button
              variant="contained"
              disabled={isCreating}
              onClick={submitNewPermission}
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
  );
};

export default PermissionCreationModal;
