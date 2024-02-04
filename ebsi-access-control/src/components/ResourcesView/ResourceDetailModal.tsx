import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  FormGroup,
  FormLabel,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  OutlinedInput,
  TextField,
  Tooltip,
} from "@mui/material";
import styles from "./Resources.module.css";
import { AccountCircle, Add, Delete } from "@mui/icons-material";
import { useEffect, useMemo, useState } from "react";
import {
  requestUpdateBlacklist,
} from "../../contracts_connections/Resources";

export interface IResourceDetailModalProps {
  resource: Resource | null;
  closeModal: () => void;
}

const ResourceDetailModal = (props: IResourceDetailModalProps) => {
  const { resource, closeModal } = props;
  const isOpen = !!resource;
  const blacklistedUsers = useMemo(() => resource?.blacklist || [], [resource?.blacklist]);
  const [blacklist, updateBlacklist] = useState<string[]>([...blacklistedUsers]);
  const [newBlacklistedUser, updateNewBlacklistedUser] = useState<string>("");
  const [isRemoving, updateIsRemoving] = useState<boolean>(false);

  const triggerAddUserToBlacklist = () => {
    if (!blacklist.some((user: string) => user === newBlacklistedUser)) {
      const newBlacklist = [...blacklist, newBlacklistedUser];
      updateBlacklist(newBlacklist);
      updateNewBlacklistedUser("");
    }
  };

  const triggerUpdateEbsiDID = (newValue: string) => {
    updateNewBlacklistedUser(newValue);
  };

  const triggerRemoveUserFromBlacklist = (user: string) => {
    const newBlacklist = [
      ...blacklist?.filter(
        (blacklistedUser: string) => blacklistedUser !== user
      ),
    ];
    updateBlacklist(newBlacklist);
  };

  const triggerCloseModal = () => {
    updateBlacklist([]);
    closeModal();
  };

  const triggerSubmitNewBlacklist = async () => {
    if (resource?.name) {
      updateIsRemoving(true);
      triggerCloseModal();
      await requestUpdateBlacklist(resource.name, blacklist);
      updateIsRemoving(false);
    }
  };

  // useEffect(() => {
  //   if (resource?.name) {
  //     requestBlacklist(resource?.name);
  //   }
  // }, [resource]);

  useEffect(() => {
    updateBlacklist([...blacklistedUsers]);
  }, [blacklistedUsers])

  return (
    <Dialog
      aria-labelledby="transition-modal-title"
      aria-describedby="transition-modal-description"
      open={isOpen}
      keepMounted
      closeAfterTransition
      onClose={triggerCloseModal}
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
                readOnly: true,
              }}
              variant="outlined"
            />
          </FormControl>

          <FormControl fullWidth>
            <FormLabel>Blacklist</FormLabel>
            <List>
              {blacklist.map((user: string) => (
                <ListItem key={user}>
                  <AccountCircle className={styles.avatarIcon} />
                  <Tooltip title={user}>
                    <ListItemText className={styles.ebsiDIDContainer}>{user}</ListItemText>
                  </Tooltip>
                  <IconButton
                    onClick={() => triggerRemoveUserFromBlacklist(user)}
                    color="error"
                    aria-label="Delete"
                    style={{ marginLeft: 10 }}
                  >
                    <Delete />
                  </IconButton>
                </ListItem>
              ))}

              <FormLabel>New user in blacklist</FormLabel>
              <OutlinedInput
                autoFocus={true}
                required
                onChange={(event) => triggerUpdateEbsiDID(event?.target?.value)}
                className={styles.textInput}
                value={newBlacklistedUser}
                multiline
                maxRows={4}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      disabled={!newBlacklistedUser}
                      aria-label="add user to blacklist"
                      onClick={triggerAddUserToBlacklist}
                      edge="end"
                    >
                      <Add />
                    </IconButton>
                  </InputAdornment>
                }
              />
            </List>
          </FormControl>

          <Button
            disabled={isRemoving}
            variant="contained"
            onClick={triggerSubmitNewBlacklist}
          >
            Edit
          </Button>
        </FormGroup>
      </DialogContent>
    </Dialog>
  );
};

export default ResourceDetailModal;
