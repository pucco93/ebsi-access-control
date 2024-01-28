import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  MenuItem,
  OutlinedInput,
  Select,
  SelectChangeEvent,
  Tooltip,
  Typography,
} from "@mui/material";
import ResourceRoleSelector from "./ResourceRoleSelector";
import { useEffect, useState } from "react";
import ResourceRole from "../../../models/ResourceRole";
import { updateUser } from "../../../contracts_connections/Users";
import { requestResources } from "../../../contracts_connections/Resources";
import { requestRoles } from "../../../contracts_connections/Roles";
import styles from "../UsersView.module.css";
import User from "../../../models/User";

const removeDuplicatesAndEmptyData = (resourceRoles: ResourceRole[]) => [
  ...new Map(
    resourceRoles
      ?.filter(({ resourceName, role }) => resourceName && role?.name)
      ?.map((item) => [item?.resourceName, item])
  ).values(),
];

interface IManageResourceModalProps {
  isOpen: boolean;
  closeModal: () => void;
  user: User | null;
}

const ManageResourcesModal = (props: IManageResourceModalProps) => {
  const { isOpen, closeModal, user } = props;
  const [resourceRoles, setResourceRoles] = useState<ResourceRole[]>([]);
  const [selectedResources, setSelelectedResources] = useState<string[]>([]);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [action, setActionType] = useState<"creation" | "deletion" | null>(
    null
  );

  const triggerAddResourceRole = (newItems: any) => {
    setResourceRoles(newItems);
  };

  const triggerRemoveResources = (event: SelectChangeEvent<string>) => {
    const {
      target: { value },
    } = event;
    setSelelectedResources(
      // On autofill we get a stringified value.
      typeof value === "string" ? value.split(",") : value
    );
  };

  const triggerUpdateUser = async () => {
    setIsUpdating(true);
    const preparedResourceRolesPayload =
      removeDuplicatesAndEmptyData(resourceRoles);
    await updateUser(
      user,
      preparedResourceRolesPayload,
      selectedResources,
      action
    );
    triggerCloseModal();
    setIsUpdating(false);
  };

  const triggerCloseModal = () => {
    setResourceRoles([]);
    setSelelectedResources([]);
    setActionType(null);
    closeModal();
  };

  useEffect(() => {
    requestResources();
    requestRoles();
  }, []);

  return (
    <Dialog open={isOpen} keepMounted closeAfterTransition onClose={triggerCloseModal}>
      <DialogTitle className={styles.dialogTitle}>
        Update resources to user: {user?.ebsiDID}
      </DialogTitle>
      <DialogContent style={{ width: 500 }}>
        {/* creare un bottone o altro per mostrare la sezione rimuovi risorse o aggiungi, e mostrare la stringa qui sopra o l'altra */}
        <form>
          <FormControl className={styles.addButtonContainer}>
            <Button
              className={styles.removeItemsButton}
              onClick={() => setActionType("creation")}
              variant="outlined"
            >
              Add resources
            </Button>
          </FormControl>

          <FormControl className={styles.removeButtonContainer}>
            <Tooltip title="User has no resources!">
              <div>
                <Button
                  disabled={user?.resources?.length === 0}
                  className={styles.removeItemsButton}
                  onClick={() => setActionType("deletion")}
                  variant="outlined"
                >
                  Remove resources
                </Button>
              </div>
            </Tooltip>
          </FormControl>

          <Typography className={styles.textHelper}>
            User the form below to add or remove resources from the current user
          </Typography>

          {action === "creation" && (
            <FormControl fullWidth>
              <ResourceRoleSelector
                blocks={resourceRoles}
                selectResourceRoles
                addResourceRole={triggerAddResourceRole}
              />
            </FormControl>
          )}

          {action === "deletion" && (
            <FormControl fullWidth className={styles.resourceSelect}>
              <Select
                multiple
                value={selectedResources}
                onChange={triggerRemoveResources}
                input={<OutlinedInput label="Name" />}
                // label="Resources"
              >
                {user?.resources &&
                  user.resources.map((resource: string) => (
                    <MenuItem value={resource} key={resource}>
                      {resource}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          )}

          <FormControl fullWidth>
            <Button
              disabled={isUpdating}
              variant="contained"
              onClick={triggerUpdateUser}
            >
              Update
            </Button>
          </FormControl>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ManageResourcesModal;
