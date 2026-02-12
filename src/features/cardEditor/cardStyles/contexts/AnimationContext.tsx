import React, { createContext, useContext } from 'react';

interface AnimationContextType {
  animationUrl?: string;
  animationKey?: string;
  animationPrompt?: string;
  animatedAt?: string;
}

const AnimationContext = createContext<AnimationContextType | null>(null);

export const AnimationProvider: React.FC<{
  children: React.ReactNode;
  animationData?: AnimationContextType;
}> = ({ children, animationData }) => {
  return (
    <AnimationContext.Provider value={animationData || null}>
      {children}
    </AnimationContext.Provider>
  );
};

export const useAnimation = () => {
  const context = useContext(AnimationContext);
  return context;
};
