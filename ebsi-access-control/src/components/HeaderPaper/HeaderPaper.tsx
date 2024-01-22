import { Button, Paper, Typography } from "@mui/material";
import AccountSection from "./AccountSection/AccountSection";
import styles from './HeaderPaper.module.css';

interface IHeaderPaperProps {
  setCurrentView: (newView: string) => void;
  currentViewTitle: string;
}

const HeaderPaper = (props: IHeaderPaperProps) => {
  const { currentViewTitle, setCurrentView } = props;

  return (
    <Paper style={{ marginBottom: "30px" }}>
      <div className={styles.header}>
        <Button
          className={styles.titleMainView}
          onClick={() => setCurrentView("")}
        >
          <Typography variant="h5">Access Control List</Typography>
        </Button>
        <div className={styles.currentViewTitle}>
          <Typography variant="h5">{currentViewTitle}</Typography>
        </div>
        <AccountSection />
      </div>
    </Paper>
  );
};

export default HeaderPaper;