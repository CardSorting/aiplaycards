import { AttackMove, DamageModifier } from '@cardEditor/types';
import { SxProps, Theme } from '@mui/system';
import { ReactNode } from 'react';

export interface DamageModifierButtonProps {
  modifier: DamageModifier;
  move: AttackMove;
  setMove: (value: AttackMove | undefined) => void;
  sx?: SxProps<Theme>;
  children?: ReactNode;
}
