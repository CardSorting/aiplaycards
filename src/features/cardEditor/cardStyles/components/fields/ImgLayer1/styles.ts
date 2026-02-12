import CroppedImg from '@components/CroppedImg';
import { styled } from '@css';

export const Wrapper = styled('div')`
  position: absolute;
  pointer-events: none;
  z-index: -1;
  /* Space a bit away from the borders so it's not visible outside of the card */
  width: calc(100% - 8px);
  height: calc(100% - 8px);
  top: 4px;
  left: 4px;
  transform-style: preserve-3d;
  transform: translateZ(5px);

  /* Subtle shadowbox depth */
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1)) brightness(0.98);
`;

export const StyledCroppedImg = styled(CroppedImg)`
  border-radius: 30px;
`;
