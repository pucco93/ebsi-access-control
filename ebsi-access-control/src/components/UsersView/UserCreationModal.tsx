import {
  Alert,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  FormGroup,
  FormLabel,
  Switch,
  TextField,
  Tooltip,
} from "@mui/material";
import styles from "./UsersView.module.css";
import { useEffect, useState } from "react";
import { createKeysPair, createUser } from "../../contracts_connections/Users";
import ShowPrivateKeyToSave from "./sub-components/ShowPrivateKeyToSave";
import ResourceRoleSelector from "./sub-components/ResourceRoleSelector";
import ResourceRole from "../../models/ResourceRole";
import { requestResources } from "../../contracts_connections/Resources";
import { requestRoles } from "../../contracts_connections/Roles";

interface IUserCreationModalProps {
  isOpen: boolean;
  isCreating: boolean;
  closeModal: () => void;
  setIsCreating: (newValue: boolean) => void;
}

type formStateType = {
  name: string;
  email: string;
  publicKey: {};
  resourceRoles: ResourceRole[];
};

const initialFormState: formStateType = {
  name: "",
  email: "",
  publicKey: {},
  resourceRoles: [],
};

const removeDuplicatesEmptyDataFromResourceRoles = (data: formStateType) => ({
  ...data,
  resourceRoles: [
    ...new Map(
      data?.resourceRoles
        ?.filter(({ resourceName, role }) => resourceName && role?.name)
        ?.map((item) => [item?.resourceName, item])
    ).values(),
  ],
});

const UserCreationModal = (props: IUserCreationModalProps) => {
  const { isOpen, isCreating, closeModal, setIsCreating } = props;
  const [isPublicKeyFromUser, setIsPublicKeyFromUser] =
    useState<boolean>(false);
  const [privateKey, setPrivateKey] = useState<any>("");
  const [isPrivateKeySaved, setIsPrivateKeySaved] = useState<boolean>(false);
  const [formState, updateForm] = useState(initialFormState);
  const [selectResourceRoles, setSelectResourceRoles] =
    useState<boolean>(false);

  const validateUserPublicKey = (userPublicKey: string) => {
    if (userPublicKey.indexOf("-----BEGIN PUBLIC KEY-----") < 0) {
      return false;
    }
    if (userPublicKey.indexOf("-----END PUBLIC KEY-----") < 0) {
      return false;
    }
    return true;
  };

  const triggerUpdateForm = (
    newValue: string | {} | ResourceRole[],
    property: string
  ) => {
    updateForm({
      ...formState,
      [property]: newValue,
    });
    if (property === "publicKey") {
      setIsPrivateKeySaved(true);
    }
  };

  const triggerCreateKeyPair = async () => {
    const keysPair = await createKeysPair();
    const { publicKey, privateKey } = keysPair || {};

    triggerUpdateForm(publicKey, "publicKey");
    setPrivateKey(privateKey);
  };

  const triggerCreateUser = async () => {
    if (!isCreating) {
      if (isPublicKeyFromUser) {
        const data = removeDuplicatesEmptyDataFromResourceRoles(formState);
        if (validateUserPublicKey(formState?.publicKey as string)) {
          triggerCloseModal();
          setIsCreating(true);
          await createUser(data);
          setIsCreating(false);
        }
      } else {
        const data = removeDuplicatesEmptyDataFromResourceRoles(formState);
        triggerCloseModal();
        setIsCreating(true);
        await createUser(data);
        setIsCreating(false);
      }
    }
  };

  const triggerUsePersonalPublicKey = () => {
    setIsPrivateKeySaved(false);
    setIsPublicKeyFromUser(!isPublicKeyFromUser);
  };

  const triggerCloseModal = () => {
    closeModal();
    updateForm(initialFormState);
    setSelectResourceRoles(false);
    setPrivateKey("");
    setIsPrivateKeySaved(false);
  };

  const triggerSelectResourceRoles = async () => {
    if (!selectResourceRoles == true) {
      requestResources();
      requestRoles();
    }
    setSelectResourceRoles(!selectResourceRoles);
  };

  const triggerAddResourceRole = (resourceRoles: ResourceRole[]) => {
    triggerUpdateForm(resourceRoles, "resourceRoles");
  };

  useEffect(() => {
    return () => {
      setIsPrivateKeySaved(false);
    };
  }, [isOpen]);

  return (
    <Dialog
      open={isOpen}
      keepMounted
      closeAfterTransition
      onClose={triggerCloseModal}
    >
      <DialogTitle>New user</DialogTitle>
      <DialogContent>
        <form>
          <FormGroup>
            <FormControl fullWidth>
              <FormLabel>Name</FormLabel>
              <TextField
                onChange={(event) =>
                  triggerUpdateForm(event?.target?.value, "name")
                }
                className={styles.textInput}
                variant="outlined"
              />
            </FormControl>

            <FormControl fullWidth>
              <FormLabel>Email</FormLabel>
              <TextField
                onChange={(event) =>
                  triggerUpdateForm(event?.target?.value, "email")
                }
                className={styles.textInput}
                variant="outlined"
              />
            </FormControl>

            <FormControl
              className={styles.usePublicKeyControl}
              onClick={triggerUsePersonalPublicKey}
              fullWidth
            >
              <FormLabel>Do you want to use your Public Key?</FormLabel>
              <Switch checked={isPublicKeyFromUser} />
            </FormControl>

            {isPublicKeyFromUser && (
              <FormControl fullWidth>
                <FormLabel>Public key</FormLabel>
                <TextField
                  multiline
                  rows={4}
                  onChange={(event) =>
                    triggerUpdateForm(event?.target?.value, "publicKey")
                  }
                  className={styles.textInput}
                  variant="outlined"
                />
              </FormControl>
            )}
            {typeof formState?.publicKey === "string" &&
              !validateUserPublicKey(formState?.publicKey) && (
                <Alert
                  className={styles.pemKeyFormatErrorAlert}
                  severity="error"
                >
                  Public key is not correctly formatted or missing (Provide it
                  in PEM format).
                </Alert>
              )}

            {!isPublicKeyFromUser && (
              <>
                <Button
                  disabled={isPrivateKeySaved}
                  variant="outlined"
                  onClick={triggerCreateKeyPair}
                >
                  {isPrivateKeySaved
                    ? "Private key copied!"
                    : "Create keys pair"}
                </Button>

                <ShowPrivateKeyToSave
                  handleClose={() => setIsPrivateKeySaved(true)}
                  privateKey={privateKey}
                />
              </>
            )}

            <FormControl
              className={styles.selectResourceRoles}
              onClick={triggerSelectResourceRoles}
              fullWidth
            >
              <FormLabel>
                Do you want to add resources and relative roles?
              </FormLabel>
              <Switch checked={selectResourceRoles} />
            </FormControl>

            <ResourceRoleSelector
              blocks={formState?.resourceRoles}
              selectResourceRoles={selectResourceRoles}
              addResourceRole={triggerAddResourceRole}
            />

            <Tooltip placement="top" title="Copy the private key first!">
              <Button
                disabled={isCreating || !isPrivateKeySaved}
                variant="contained"
                onClick={triggerCreateUser}
              >
                Create
              </Button>
            </Tooltip>
          </FormGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UserCreationModal;
