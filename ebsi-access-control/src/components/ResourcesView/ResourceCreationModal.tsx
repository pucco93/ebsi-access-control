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
  const [errorInForm, updateErrorInForm] = useState<boolean>(false);
  const [nameLength, updateNameLength] = useState<number>(0);

  const triggerUpdateName = (newValue: string) => {
    updateErrorInForm(false);
    udpateName(newValue);
    updateNameLength(newValue?.length || 0);
  };

  const submitNewResource = () => {
    if (!isCreating) {
      if (name && name.length <= 32) {
        setIsCreating(true);
        requestCreateResource(name);
        triggerCloseModal();
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
      open={isOpen}
      keepMounted
      closeAfterTransition
      onClose={triggerCloseModal}
    >
      <DialogTitle>New resource</DialogTitle>
      <DialogContent className={styles.dialog}>
        <form>
          <FormGroup>
            <FormControl fullWidth>
              <FormLabel className={styles.resourceNameLabel}>Name*</FormLabel>
              <TextField
                autoFocus
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
