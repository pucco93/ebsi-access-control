import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl
} from "@mui/material";
import ResourceRoleSelector from "./ResourceRoleSelector";
import { useEffect, useMemo, useState } from "react";
import ResourceRole from "../../../models/ResourceRole";
import { updateUser } from "../../../contracts_connections/Users";
import { requestResources } from "../../../contracts_connections/Resources";
import { requestRoles } from "../../../contracts_connections/Roles";
import styles from "../UsersView.module.css";
import User from "../../../models/User";
import { useSelector } from "react-redux";
import AccessControlListType from "../../../store/accessControlListType";
import { getCurrentUserInView } from "../../../store/accessControlListSelectors";

interface IManageResourceModalProps {
  isOpen: boolean;
  closeModal: () => void;
  user: User | null;
}

const ManageResourcesModal = (props: IManageResourceModalProps) => {
  const { isOpen, closeModal, user } = props;
  const currentUserInView = useSelector(
    (state: { accessControlList: AccessControlListType }) =>
      getCurrentUserInView(state)
  );
  const blocks: ResourceRole[] = useMemo(
    () =>
      currentUserInView?.resourceRoles?.map(
        (resourceRole: ResourceRole) => resourceRole
      ) || [],
    [currentUserInView]
  );
  const [resourceRoles, setResourceRoles] = useState<ResourceRole[]>(blocks);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const triggerAddResourceRole = (newItems: any) => {
    setResourceRoles(newItems);
  };

  const triggerUpdateUser = async () => {
    setIsUpdating(true);
    await updateUser(user, resourceRoles);
    triggerCloseModal();
    setIsUpdating(false);
  };

  const triggerCloseModal = () => {
    setResourceRoles([]);
    closeModal();
  };

  useEffect(() => {
    requestResources();
    requestRoles();
  }, []);

  useEffect(() => {
    setResourceRoles(blocks);
  }, [blocks]);

  return (
    <Dialog
      open={isOpen}
      keepMounted
      closeAfterTransition
      onClose={triggerCloseModal}
    >
      <DialogTitle className={styles.dialogTitle}>
        Update resources to user: {user?.ebsiDID}
      </DialogTitle>
      <DialogContent style={{ width: 500 }}>
        <form>
          <FormControl fullWidth>
            <ResourceRoleSelector
              blocks={resourceRoles}
              selectResourceRoles
              addResourceRole={triggerAddResourceRole}
            />
          </FormControl>

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
