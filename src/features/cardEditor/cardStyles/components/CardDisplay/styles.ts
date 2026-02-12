import { styled } from '@css';

export const CardContainer = styled('div')<{
  $fontSize: number;
  $height: number;
  $tiltX: number;
  $tiltY: number;
  $isHovering: boolean;
  $showFrame?: boolean;
  $disableParallax?: boolean;
}>`
  position: relative;
  z-index: 1;
  font-size: ${({ $fontSize }) => `${$fontSize}px`};
  height: ${({ $height }) => `${$height}px`};
  overflow: visible;
  cursor: ${({ $disableParallax }) =>
    $disableParallax ? 'default' : 'pointer'};
  transform-style: ${({ $disableParallax }) =>
    $disableParallax ? 'flat' : 'preserve-3d'};
  perspective: ${({ $disableParallax }) =>
    $disableParallax ? 'none' : '2000px'};

  /* Card with original positioning preserved */
  transform: ${({ $tiltX, $tiltY, $isHovering, $disableParallax }) =>
    $disableParallax
      ? 'none'
      : $isHovering
      ? `rotateX(${$tiltX}deg) rotateY(${$tiltY}deg) scale3d(1.05, 1.05, 1.05) translateZ(40px)`
      : 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1) translateZ(0px)'};
  filter: ${({ $isHovering, $disableParallax }) =>
    $disableParallax
      ? 'none'
      : $isHovering
      ? 'brightness(1.12) contrast(1.08) saturate(1.12)'
      : 'brightness(1) contrast(1) saturate(1)'};

  /* Contained shadowbox depth shadows */
  box-shadow: ${({ $tiltX, $tiltY, $isHovering, $showFrame = true }) =>
    $showFrame && $isHovering
      ? `
        /* Contained shadowbox shadow on background */
        ${$tiltY * 3}px ${$tiltX * 3 + 20}px 50px rgba(0, 0, 0, 0.35),
        ${$tiltY * 2}px ${$tiltX * 2 + 12}px 25px rgba(0, 0, 0, 0.25),
        ${$tiltY * 1}px ${$tiltX * 1 + 6}px 12px rgba(0, 0, 0, 0.2),
        
        /* Card floating above shadowbox floor */
        0 -8px 16px rgba(0, 0, 0, 0.12),
        0 -4px 8px rgba(0, 0, 0, 0.08),
        
        /* Card thickness layers */
        ${$tiltY * 0.8 + 2}px ${$tiltX * 0.8 + 5}px 0px rgba(0, 0, 0, 0.4),
        ${$tiltY * 0.5 + 1}px ${$tiltX * 0.5 + 3}px 0px rgba(0, 0, 0, 0.35),
        ${$tiltY * 0.3}px ${$tiltX * 0.3 + 2}px 0px rgba(0, 0, 0, 0.3),
        
        /* Shadowbox lighting from top */
        inset 0 2px 6px rgba(255, 255, 255, 0.12),
        inset 0 -1px 3px rgba(0, 0, 0, 0.04),
        
        /* Card edge highlight */
        0 0 0 1px rgba(255, 255, 255, 0.18)
      `
      : $showFrame
      ? `
        /* Resting shadowbox shadows */
        0 8px 20px rgba(0, 0, 0, 0.18),
        0 4px 10px rgba(0, 0, 0, 0.12),
        0 2px 5px rgba(0, 0, 0, 0.08),
        
        /* Card thickness at rest */
        1px 3px 0px rgba(0, 0, 0, 0.25),
        1px 2px 0px rgba(0, 0, 0, 0.18),
        
        /* Subtle shadowbox lighting */
        inset 0 1px 3px rgba(255, 255, 255, 0.08)
      `
      : 'none'};

  &,
  & * {
    transition: transform 0.25s cubic-bezier(0.23, 1, 0.32, 1),
      filter 0.25s ease, box-shadow 0.25s ease;
  }

  &::before {
    /* Simple white background so the card isn't transparent */
    z-index: -10;
    content: '';
    position: absolute;
    background: white;
    border-radius: ${({ $showFrame = true }) => ($showFrame ? '30px' : '0px')};
    /* Space a bit away from the borders so it's not visible outside of the card */
    width: calc(100% - 8px);
    height: calc(100% - 8px);
    top: 4px;
    left: 4px;
    pointer-events: none;
  }

  &::after {
    /* Card rim/edge highlight for 3D effect */
    content: '';
    position: absolute;
    top: 3px;
    left: 3px;
    right: 3px;
    bottom: 3px;
    border-radius: ${({ $showFrame = true }) => ($showFrame ? '31px' : '0px')};
    border: ${({ $showFrame = true }) =>
      $showFrame ? '1px solid rgba(255, 255, 255, 0.2)' : 'none'};
    pointer-events: none;
    z-index: -9;
    transform-style: preserve-3d;
    transform: ${({ $showFrame = true, $disableParallax }) =>
      $disableParallax ? 'none' : $showFrame ? 'translateZ(-4px)' : 'none'};
  }
`;

export const ShadowboxFrame = styled('div')<{
  $tiltX: number;
  $tiltY: number;
  $isHovering: boolean;
  $disableParallax?: boolean;
}>`
  position: absolute;
  top: -12px;
  left: -12px;
  right: -12px;
  bottom: -12px;
  border-radius: 6px;
  background: transparent;
  transform-style: preserve-3d;
  transform: ${({ $disableParallax }) =>
    $disableParallax ? 'none' : 'translateZ(100px)'};
  pointer-events: none;
  z-index: 200;

  /* Shadowbox frame edges */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border: 4px solid #2a2a2a;
    border-radius: 6px;
    box-shadow: 
      /* Frame depth shadow */ inset 0 0 0 1px #1a1a1a,
      inset 0 0 0 2px #333,
      /* Frame outer shadow */ 0 5px 15px rgba(0, 0, 0, 0.3),
      0 2px 8px rgba(0, 0, 0, 0.2);
  }

  /* Frame inner bevel */
  &::after {
    content: '';
    position: absolute;
    top: 4px;
    left: 4px;
    right: 4px;
    bottom: 4px;
    border: 1px solid #444;
    border-radius: 1px;
    box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.08),
      inset 0 -1px 2px rgba(0, 0, 0, 0.2);
  }

  transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
`;

export const TransparentGlass = styled('div')<{
  $tiltX: number;
  $tiltY: number;
  $isHovering: boolean;
  $disableParallax?: boolean;
}>`
  position: absolute;
  top: -8px;
  left: -8px;
  right: -8px;
  bottom: -8px;
  border-radius: 32px;
  background: transparent;
  transform-style: preserve-3d;
  transform: ${({ $disableParallax }) =>
    $disableParallax ? 'none' : 'translateZ(90px)'};
  pointer-events: none;
  z-index: 150;

  /* Subtle glass reflection only */
  &::before {
    content: '';
    position: absolute;
    top: 6px;
    left: 6px;
    right: 85%;
    bottom: 85%;
    background: ${({ $tiltY, $isHovering }) =>
      $isHovering
        ? `linear-gradient(
            ${135 + $tiltY * 2}deg,
            rgba(255, 255, 255, 0.25) 0%,
            transparent 70%
          )`
        : `linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.12) 0%,
            transparent 60%
          )`};
    border-radius: 15px;
    opacity: ${({ $isHovering }) => ($isHovering ? 0.6 : 0.3)};
    transition: all 0.3s ease;
  }
`;

export const ShadowboxBackground = styled('div')<{
  $isHovering: boolean;
}>`
  position: absolute;
  top: -8px;
  left: -8px;
  right: -8px;
  bottom: -8px;
  background: linear-gradient(
    145deg,
    rgba(255, 255, 255, 0.8) 0%,
    rgba(248, 249, 250, 0.6) 50%,
    rgba(233, 236, 239, 0.4) 100%
  );
  border-radius: 3px;
  transform: translateZ(-80px);
  pointer-events: none;
  z-index: -30;

  /* Subtle shadowbox backing */
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.03),
    inset 0 2px 4px rgba(0, 0, 0, 0.02);
`;

export const HolographicShine = styled('div')<{
  $isVisible: boolean;
  $tiltX: number;
  $tiltY: number;
  $isHovering: boolean;
  $disableParallax?: boolean;
}>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 30px;
  pointer-events: none;
  z-index: 50;
  opacity: ${({ $isVisible }) => ($isVisible ? 1 : 0)};
  transform-style: preserve-3d;
  transform: ${({ $disableParallax }) =>
    $disableParallax ? 'none' : 'translateZ(35px)'};
  overflow: hidden;

  /* Tilt-reactive holographic overlay */
  background: linear-gradient(
    ${({ $tiltX, $tiltY }) => 45 + $tiltY * 2 + $tiltX * 1.5}deg,
    rgba(255, 0, 150, 0.15) 0%,
    rgba(0, 255, 255, 0.2) 25%,
    rgba(255, 255, 255, 0.3) 50%,
    rgba(150, 0, 255, 0.2) 75%,
    rgba(255, 0, 150, 0.15) 100%
  );

  opacity: ${({ $isVisible, $isHovering }) =>
    $isVisible ? ($isHovering ? 0.8 : 0.4) : 0};

  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
`;

export const CardContent = styled('div')<{
  $tiltX?: number;
  $tiltY?: number;
  $isHovering?: boolean;
}>`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  z-index: 10;
  transform-style: preserve-3d;
  transform: translateZ(30px);

  /* Subtle lighting effect on content layer */
  filter: ${({ $isHovering, $tiltX = 0, $tiltY = 0 }) =>
    $isHovering
      ? `drop-shadow(${$tiltY * 0.3}px ${
          $tiltX * 0.3 + 2
        }px 8px rgba(0, 0, 0, 0.15))`
      : 'drop-shadow(0 1px 3px rgba(0, 0, 0, 0.08))'};

  /* Add subtle texture and material feel */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${({ $isHovering, $tiltY = 0 }) =>
      $isHovering
        ? `linear-gradient(
            ${135 + $tiltY * 1.5}deg, 
            rgba(255, 255, 255, 0.08) 0%, 
            transparent 40%, 
            rgba(0, 0, 0, 0.02) 100%
          )`
        : 'transparent'};
    border-radius: 30px;
    pointer-events: none;
    z-index: 1;
    opacity: ${({ $isHovering }) => ($isHovering ? 1 : 0)};
    transition: opacity 0.3s ease;
  }
`;
