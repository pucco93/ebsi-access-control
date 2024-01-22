import { Box, CircularProgress, Typography } from "@mui/material";

interface ILodaerProps {
  show: boolean;
  msg: string;
}

const Loader = (props: ILodaerProps) => {
  const { show, msg } = props;
  return (
    show && (
      <Box
        sx={{
          width: "100%",
          // maxWidth: 1920,
          background: "white",
          margin: "20px",
          display: 'flex',
          flexWrap: 'nowrap'
        }}
      >
        <CircularProgress />
        <Typography>{msg}</Typography>
      </Box>
    )
  );
};

export default Loader;
