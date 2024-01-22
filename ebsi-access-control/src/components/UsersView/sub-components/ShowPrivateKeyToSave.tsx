import {
  FormControl,
  IconButton,
  InputAdornment,
  OutlinedInput,
  Typography
} from "@mui/material";
import styles from "../UsersView.module.css";
import { ContentCopy } from "@mui/icons-material";

const ShowPrivateKeyToSave = ({
  privateKey,
  handleClose
}: IShowPrivateKeyToSaveProps) => {

  const copyPrivateKey = () => {
    navigator.clipboard.writeText(privateKey);
    handleClose();
  };

  return (
    <FormControl fullWidth>
      <div className={styles.privateKeyContainer}>
        <OutlinedInput
          className={styles.privateKeyInput}
          id="outlined-adornment-private-key"
          type="text"
          multiline
          rows={4}
          inputProps={{
            readOnly: true,
          }}
          value={privateKey}
          endAdornment={
            <InputAdornment position="end">
              <IconButton
                aria-label="copy key"
                disabled={!privateKey}
                onClick={copyPrivateKey}
                edge="end"
              >
                <ContentCopy />
              </IconButton>
            </InputAdornment>
          }
        />
      </div>
      <Typography>Please be sure to copy the private key into a safe place, this can be used to create the public key (it can be used to impersonate you on the web).</Typography>
      <Typography className={styles.importantMessage}>The generated public key will be used to create your ebsiDID when clicking on CREATE button.</Typography>
    </FormControl>
  );
};

interface IShowPrivateKeyToSaveProps {
  privateKey: any;
  handleClose: () => void;
}

export default ShowPrivateKeyToSave;
