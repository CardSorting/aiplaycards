import CroppedImg from '@components/CroppedImg';
import { styled } from '@css';

export const Wrapper = styled('div')`
  position: absolute;
  pointer-events: none;
  z-index: 2;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  transform-style: preserve-3d;
  transform: translateZ(15px);

  /* Top layer with enhanced depth */
  filter: drop-shadow(0 3px 8px rgba(0, 0, 0, 0.12)) brightness(1.05);
`;

export const StyledCroppedImg = styled(CroppedImg)`
  border-radius: 21px;
`;
