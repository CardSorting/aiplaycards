import {
  baseFontSize,
  cardId,
  cardImgAspect,
  cardImgWidth,
} from '@cardEditor/cardStyles/constants';
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDebounce, useElementSize } from 'usehooks-ts';
import { useRarityIcon } from '@cardEditor/cardOptions/rarityIcon';
import CardInfo from '../blocks/CardInfo';
import Debug from '../blocks/Debug';
import Moves from '../blocks/Moves';
import NameBar from '../blocks/NameBar';
import Hitpoints from '../blocks/NameBar/fields/Hitpoints';
import TypeBar from '../blocks/TypeBar';
import BackgroundImg from '../fields/BackgroundImg';
import CardImage from '../fields/CardImage';
import Description from '../fields/Description';
import DexStats from '../fields/DexStats';
import ImgLayer1 from '../fields/ImgLayer1';
import ImgLayer2 from '../fields/ImgLayer2';
import PrevolveImg from '../fields/PrevolveImg';
import PrevolveName from '../fields/PrevolveName';
import SvgHelpers from '../fields/SvgHelpers';
import TypeImg from '../fields/TypeImg';
import {
  CardContainer,
  CardContent,
  HolographicShine,
  ShadowboxBackground,
  ShadowboxFrame,
  TransparentGlass,
} from './styles';

type CardDisplayProps = {
  showFrame?: boolean;
  disableParallax?: boolean;
};

const CardDisplay: FC<CardDisplayProps> = ({
  showFrame = true,
  disableParallax = true,
}) => {
  const [cardElement, setCardElement] = useState<HTMLDivElement | null>(null);
  const [squareRef, { width }] = useElementSize();
  const debouncedWidth = useDebounce<number>(width, 250);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const { rarityIcon } = useRarityIcon();

  // Smooth parallax state
  const targetTiltRef = useRef({ x: 0, y: 0 });
  const currentTiltRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);

  const startAnimationLoop = useCallback(() => {
    if (rafRef.current !== null) return; // already running
    const animate = () => {
      const smoothing = 0.12; // lerp factor per frame
      const tx = targetTiltRef.current.x;
      const ty = targetTiltRef.current.y;
      const cx =
        currentTiltRef.current.x + (tx - currentTiltRef.current.x) * smoothing;
      const cy =
        currentTiltRef.current.y + (ty - currentTiltRef.current.y) * smoothing;
      currentTiltRef.current = { x: cx, y: cy };

      // Update React state only if significant change to reduce re-renders
      if (Math.abs(cx - tilt.x) > 0.2 || Math.abs(cy - tilt.y) > 0.2) {
        setTilt({ x: cx, y: cy });
      }

      // Stop loop when near target and not hovering
      const nearTarget = Math.abs(tx - cx) < 0.2 && Math.abs(ty - cy) < 0.2;
      if (
        !isHovering &&
        nearTarget &&
        Math.abs(cx) < 0.2 &&
        Math.abs(cy) < 0.2
      ) {
        rafRef.current = null;
        return;
      }
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
  }, [isHovering, tilt.x, tilt.y]);

  const fontSize = useMemo<number>(
    () =>
      debouncedWidth
        ? debouncedWidth / (cardImgWidth / baseFontSize)
        : baseFontSize,
    [debouncedWidth],
  );

  const height = useMemo<number>(
    () => debouncedWidth * cardImgAspect,
    [debouncedWidth],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardElement) return;

      const rect = cardElement.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;

      const normalizedX = deltaX / (rect.width / 2);
      const normalizedY = deltaY / (rect.height / 2);

      // Deadzone near center to avoid jitter
      const deadzone = 0.05;
      const nx = Math.abs(normalizedX) < deadzone ? 0 : normalizedX;
      const ny = Math.abs(normalizedY) < deadzone ? 0 : normalizedY;

      // Clamp & soften with mild easing
      const clamp = (v: number, min: number, max: number) =>
        Math.min(max, Math.max(min, v));
      const easedX = Math.sign(nx) * Math.pow(Math.abs(nx), 0.6);
      const easedY = Math.sign(ny) * Math.pow(Math.abs(ny), 0.6);
      const maxRotation = 14; // degrees
      const rotateY = clamp(easedX * maxRotation, -maxRotation, maxRotation);
      const rotateX = clamp(easedY * -maxRotation, -maxRotation, maxRotation);

      targetTiltRef.current = { x: rotateX, y: rotateY };
      startAnimationLoop();
    },
    [cardElement, startAnimationLoop],
  );

  const handleMouseEnter = useCallback(() => {
    setIsHovering(true);
    startAnimationLoop();
  }, [startAnimationLoop]);

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
    targetTiltRef.current = { x: 0, y: 0 };
    startAnimationLoop();
  }, [startAnimationLoop]);

  // Ensure RAF is cleaned up on unmount
  useEffect(
    () => () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    },
    [],
  );

  const combinedRef = useCallback(
    (node: HTMLDivElement | null) => {
      setCardElement(node);
      squareRef(node);
    },
    [squareRef],
  );

  return (
    <CardContainer
      id={cardId}
      $fontSize={fontSize}
      $height={height}
      $tiltX={tilt.x}
      $tiltY={tilt.y}
      $isHovering={isHovering}
      $showFrame={showFrame}
      $disableParallax={disableParallax}
      ref={combinedRef}
      onMouseMove={disableParallax ? undefined : handleMouseMove}
      onMouseEnter={disableParallax ? undefined : handleMouseEnter}
      onMouseLeave={disableParallax ? undefined : handleMouseLeave}
    >
      {/* Optional frame/box layers */}
      {showFrame && <ShadowboxBackground $isHovering={isHovering} />}
      {showFrame && (
        <ShadowboxFrame
          $tiltX={tilt.x}
          $tiltY={tilt.y}
          $isHovering={isHovering}
          $disableParallax={disableParallax}
        />
      )}
      {showFrame && (
        <TransparentGlass
          $tiltX={tilt.x}
          $tiltY={tilt.y}
          $isHovering={isHovering}
          $disableParallax={disableParallax}
        />
      )}

      {/* Holographic shine for rare cards */}
      {rarityIcon && (
        <HolographicShine
          $isVisible={!!rarityIcon}
          $tiltX={tilt.x}
          $tiltY={tilt.y}
          $isHovering={isHovering}
          $disableParallax={disableParallax}
        />
      )}

      <Debug />
      <SvgHelpers />
      <CardContent $tiltX={tilt.x} $tiltY={tilt.y} $isHovering={isHovering}>
        <NameBar />
        <Hitpoints />
        <PrevolveName />
        <PrevolveImg />
        <TypeImg />
        <DexStats />
        <Moves />
        <Description />
        <TypeBar />
        <CardInfo />
      </CardContent>
      <BackgroundImg />
      <ImgLayer1 />
      <CardImage />
      <ImgLayer2 />
    </CardContainer>
  );
};

export default CardDisplay;
