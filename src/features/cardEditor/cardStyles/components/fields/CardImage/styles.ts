import { styled } from '@css';

export const Wrapper = styled('div')`
  position: relative;
  pointer-events: none;
  height: 100%;
  width: 100%;
  z-index: -1;
  transform-style: preserve-3d;
  transform: translateZ(10px);

  /* Enhanced shadowbox depth */
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.1)) brightness(1.02);

  /* Subtle material texture */
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.05) 0%,
      transparent 30%,
      rgba(0, 0, 0, 0.02) 100%
    );
    pointer-events: none;
    border-radius: inherit;
  }
`;
