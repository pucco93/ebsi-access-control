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
  Switch,
  FormGroup,
} from "@mui/material";
import styles from "./Resources.module.css";
import { requestCreateResource } from "../../contracts_connections/Resources";

interface IUserCreationModalProps {
  isOpen: boolean;
  isCreating: boolean;
  handleClose: () => void;
  setIsCreating: (newValue: boolean) => void;
}

const ResourceCreationModal = (props: IUserCreationModalProps) => {
  const { isOpen, handleClose, isCreating, setIsCreating } = props;
  const [name, udpateName] = useState<string>("");
  const [userToAdd, setUserToAdd] = useState<string>("");
  const [useCurrentUser, setUseCurrentUser] = useState<boolean>(false);
  const [errorInForm, updateErrorInForm] = useState<boolean>(false);
  const [nameLength, updateNameLength] = useState<number>(0);

  const triggerUpdateName = (newValue: string) => {
    updateErrorInForm(false);
    udpateName(newValue);
    updateNameLength(newValue?.length || 0);
  };

  const triggerUpdateUseCurrentUser = () => {
    setUseCurrentUser(!useCurrentUser);
  };

  const triggerUpdateUserToAdd = (newValue: string) => {
    setUserToAdd(newValue);
  };

  const submitNewResource = () => {
    if (!isCreating) {
      if (name && name.length <= 32) {
        setIsCreating(true);
        requestCreateResource(name, useCurrentUser, userToAdd);
      } else {
        updateErrorInForm(true);
      }
    }
  };

  const triggerCloseModal = () => {
    udpateName("");
    updateNameLength(0);
    updateErrorInForm(false);
    handleClose();
  }

  return (
    <Dialog
      aria-labelledby="transition-modal-title"
      aria-describedby="transition-modal-description"
      open={isOpen}
      keepMounted
      closeAfterTransition
      onClose={triggerCloseModal}
    >
      <DialogTitle>New resource</DialogTitle>
      <DialogContent>
        <form>
          <FormGroup>
            <FormControl fullWidth>
              <FormLabel className={styles.resourceNameLabel}>Name*</FormLabel>
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
                value={name}
                variant="outlined"
              />
            </FormControl>
            {/* <FormControl
              className={styles.currentUserControl}
              onClick={() => triggerUpdateUseCurrentUser()}
            >
              <FormLabel className={styles.resourceNameLabel}>
                Use current user?
              </FormLabel>
              <Switch checked={useCurrentUser} className={styles.switchInput} />
            </FormControl>

            <FormControl fullWidth>
              {!useCurrentUser && (
                <>
                  <FormLabel className={styles.resourceNameLabel}>
                    User to add
                  </FormLabel>
                  <TextField
                    autoFocus={true}
                    onChange={(event) =>
                      triggerUpdateUserToAdd(event?.target?.value)
                    }
                    className={styles.textInput}
                    variant="outlined"
                  />
                </>
              )}
            </FormControl> */}
            <Button
              variant="contained"
              disabled={isCreating}
              onClick={submitNewResource}
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
          </FormGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ResourceCreationModal;
