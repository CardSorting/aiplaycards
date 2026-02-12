import { Star as StarIcon } from '@mui/icons-material';
import { Typography } from '@mui/material';
import { Box } from '@mui/system';
import { FC, ReactNode } from 'react';

interface NewFeatureHelpTextProps {
  children?: ReactNode;
}

const NewFeatureHelpText: FC<NewFeatureHelpTextProps> = ({ children }) => (
  <Box component="span" display="flex" alignItems="center" mt={0.5}>
    <StarIcon color="primary" fontSize="inherit" />
    <Typography component="span" color="black" variant="caption" lineHeight={0}>
      {children}
    </Typography>
  </Box>
);

export default NewFeatureHelpText;
