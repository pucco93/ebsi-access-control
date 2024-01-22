import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  FormGroup,
  FormLabel,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  TextField,
} from "@mui/material";
import styles from "./Resources.module.css";
import { Add, Remove } from "@mui/icons-material";
import { useState } from "react";
import { triggerAddUserToBlacklist } from "../../contracts_connections/Resources";

export interface IResourceDetailModalProps {
  resource: Resource | null;
  closeModal: () => void;
}

const ResourceDetailModal = (props: IResourceDetailModalProps) => {
  const { resource, closeModal } = props;
  const isOpen = !!resource;
  const blacklistedUsers = resource?.blacklist || [];
  const [isBlacklistTextFieldOpen, openBlacklistTextField] =
    useState<boolean>(false);
  const [errorEbsiDID, updateErrorEbsiDID] = useState<boolean>(false);
  const [ebsiDIDToAdd, updateEbsiDIDToAdd] = useState<string>("");
  const [isRemoving, updateIsRemoving] = useState<boolean>(false);

  const triggerOpenAddUserToBlacklist = () => {
    updateIsRemoving(false);
    openBlacklistTextField(true);
  };

  const triggerOpenRemoveUserFromBlacklist = () => {
    updateIsRemoving(true);
    openBlacklistTextField(true);
  };

  const triggerUpdateEbsiDID = (newValue: string) => {
    if (newValue) {
      updateErrorEbsiDID(false);
      updateEbsiDIDToAdd(newValue);
    } else {
      updateErrorEbsiDID(true);
    }
  };

  const triggerSubmitNewBlacklist = () => {
    triggerAddUserToBlacklist(ebsiDIDToAdd);
  };

  return (
    <Dialog
      aria-labelledby="transition-modal-title"
      aria-describedby="transition-modal-description"
      open={isOpen}
      keepMounted
      closeAfterTransition
      onClose={closeModal}
    >
      <DialogTitle>{resource?.name} details</DialogTitle>
      <DialogContent>
        <FormGroup>
          <FormControl fullWidth>
            <FormLabel>Name</FormLabel>
            <TextField
              className={styles.textInput}
              value={resource?.name}
              InputProps={{
                readOnly: true
              }}
              variant="outlined"
            />
          </FormControl>

          <FormControl fullWidth>
            <FormLabel>Blacklist</FormLabel>
            <List>
              {blacklistedUsers.map((user: string) => (
                <ListItem>
                  <ListItemAvatar></ListItemAvatar>
                  <ListItemText>{user}</ListItemText>
                </ListItem>
              ))}
              <ListItemButton onClick={triggerOpenAddUserToBlacklist}>
                <ListItemIcon>
                  <Add />
                </ListItemIcon>
                <ListItemText>Add user to blacklist</ListItemText>
              </ListItemButton>
              <ListItemButton onClick={triggerOpenRemoveUserFromBlacklist}>
                <ListItemIcon>
                  <Remove />
                </ListItemIcon>
                <ListItemText>Remove user from blacklist</ListItemText>
              </ListItemButton>
            </List>
          </FormControl>

          {isBlacklistTextFieldOpen && (
            <FormControl fullWidth>
              <FormLabel>{isRemoving ? "User to be removed" : "New user in blacklist"}</FormLabel>
              <TextField
                autoFocus={true}
                error={errorEbsiDID}
                helperText="Insert user ebsiDID here"
                required
                onChange={(event) => triggerUpdateEbsiDID(event?.target?.value)}
                className={styles.textInput}
                variant="outlined"
              />
            </FormControl>
          )}

          <Button
            variant="contained"
            onSubmit={triggerSubmitNewBlacklist}
          >
            Edit
          </Button>
        </FormGroup>
      </DialogContent>
    </Dialog>
  );
};

export default ResourceDetailModal;
