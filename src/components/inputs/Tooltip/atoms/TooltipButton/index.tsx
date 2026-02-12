import { Info as InfoIcon } from '@mui/icons-material';
import { IconButton, IconButtonProps } from '@mui/material';
import { forwardRef } from 'react';

const TooltipButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (props, ref) => (
    <IconButton ref={ref} size="small" sx={{ p: 0 }} {...props}>
      <InfoIcon fontSize="inherit" />
    </IconButton>
  ),
);

TooltipButton.displayName = 'TooltipButton';

export default TooltipButton;
