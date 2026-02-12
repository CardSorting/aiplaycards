import CroppedImg from '@components/CroppedImg';
import CroppedVideo from '@components/CroppedVideo';
import { styled } from '@css';

export const Wrapper = styled('div')`
  position: absolute;
  pointer-events: none;
  z-index: -2;
  /* Space a bit away from the borders so it's not visible outside of the card */
  width: calc(100% - 8px);
  height: calc(100% - 8px);
  top: 4px;
  left: 4px;
  transform-style: preserve-3d;
  transform: translateZ(-10px);

  /* Subtle depth with shadowbox effect */
  filter: blur(0.5px) brightness(0.95);
`;

export const StyledCroppedImg = styled(CroppedImg)`
  border-radius: 30px;
`;

export const StyledCroppedVideo = styled(CroppedVideo)`
  border-radius: 30px;
`;
