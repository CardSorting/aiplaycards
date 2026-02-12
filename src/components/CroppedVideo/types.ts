import { Area } from 'react-easy-crop';

export interface CroppedVideoProps {
  src: string;
  croppedArea?: Area;
  className?: string;
}
