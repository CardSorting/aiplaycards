import { AppBar, Button, ListItemButton, styled } from '@mui/material';
import type { ButtonProps } from '@mui/material/Button';

export const InvisibleHeading = styled('h1')`
  visibility: hidden;
  position: absolute;
  top: 0;
  left: 0;
`;

export const DefaultAppBar = styled(AppBar)``;

export const NavItems = styled('nav')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  marginLeft: 'auto',
}));

export const NavItem = styled(Button)<ButtonProps>(({ theme }) => ({
  padding: theme.spacing(0.75, 2),
  minWidth: 0,
  whiteSpace: 'nowrap',
}));

export const Spacer = styled('div')`
  padding: ${({ theme }) => theme.spacing(1)};
`;

// Mobile header //

export const PrimaryListItem = styled(ListItemButton)`
  background: ${({ theme }) => theme.palette.primary.main};
`;
