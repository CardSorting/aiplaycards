import { FC } from 'react';
import { useCardOptions } from '@cardEditor/cardOptions';
import { useAnimation } from '@cardEditor/cardStyles/contexts/AnimationContext';
import { StyledCroppedImg, StyledCroppedVideo, Wrapper } from './styles';

const BackgroundImg: FC = () => {
  const { backgroundImg } = useCardOptions();
  const animationData = useAnimation();

  if (!backgroundImg) return null;

  // Use animation video if available, otherwise use the original image
  const hasAnimation = animationData?.animationUrl;
  const mediaSrc = hasAnimation
    ? animationData.animationUrl
    : backgroundImg.src;

  return (
    <Wrapper data-bg-src={mediaSrc}>
      {hasAnimation ? (
        <StyledCroppedVideo
          src={mediaSrc!}
          croppedArea={backgroundImg.croppedArea}
        />
      ) : (
        <StyledCroppedImg {...backgroundImg} />
      )}
    </Wrapper>
  );
};

export default BackgroundImg;
