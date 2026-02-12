import { ButtonProps } from '@mui/material/Button';

export interface SaveToGalleryButtonProps extends Omit<ButtonProps, 'onClick'> {
  cardId: string;
}
