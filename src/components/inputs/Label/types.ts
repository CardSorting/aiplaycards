import { PropsWithChildren } from 'react';
import { TooltipProps } from '../Tooltip/types';

export interface LabelProps {
  slug: string;
  children?: React.ReactNode;
  tooltipProps?: PropsWithChildren<TooltipProps>;
}
