import {
  Alert,
  Backdrop,
  Box,
  Button,
  Fade,
  FormControl,
  FormGroup,
  FormLabel,
  Modal,
  Switch,
  TextField,
  Tooltip,
  Typography,
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

const initialFormState = {
  name: "",
  email: "",
  publicKey: {},
  resourceRoles: [] as ResourceRole[],
};

const removeEmptyDataFromResourceRoles = (resourceRoles: ResourceRole[]) => {
  return resourceRoles.filter(
    ({ resourceName, role }) => resourceName && role?.name
  );
};

const UserCreationModal = (props: IUserCreationModalProps) => {
  const { isOpen, isCreating, closeModal, setIsCreating } = props;
  const [isPublicKeyFromUser, setIsPublicKeyFromUser] =
    useState<boolean>(false);
  const [privateKey, setPrivateKey] = useState<any>("");
  const [isPrivateKeySaved, setIsPrivateKeySaved] = useState<boolean>(false);
  const [formState, updateForm] = useState(initialFormState);
  const [selectResourceRoles, setSelectResourceRoles] =
    useState<boolean>(false);

  const style = {
    position: "absolute" as "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 800,
    bgcolor: "background.paper",
    border: "2px solid #000",
    borderRadius: 2,
    boxShadow: 24,
    p: 4,
  };

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
        removeEmptyDataFromResourceRoles(formState?.resourceRoles);
        if (validateUserPublicKey(formState?.publicKey as string)) {
          closeModal();
          setIsCreating(true);
          await createUser(formState);
          setIsCreating(false);
        }
      } else {
        removeEmptyDataFromResourceRoles(formState?.resourceRoles);
        closeModal();
        setIsCreating(true);
        await createUser(formState);
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
    setIsCreating(false);
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
    <Modal
      aria-labelledby="transition-modal-title"
      aria-describedby="transition-modal-description"
      open={isOpen}
      onClose={triggerCloseModal}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{
        backdrop: {
          timeout: 500,
        },
      }}
    >
      <Fade in={isOpen}>
        <Box sx={style}>
          <Typography
            className={styles.modalTitle}
            variant="h5"
            textAlign={"center"}
          >
            New user
          </Typography>
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
        </Box>
      </Fade>
    </Modal>
  );
};

export default UserCreationModal;
