'use client';

import { useCallback, useState } from 'react';
import { YugiohCardData } from '../types';

export const useYugiohCardData = () => {
  const [cardData, setCardData] = useState<YugiohCardData>({
    uiLang: 'en',
    cardLang: 'en',
    holo: false,
    cardRare: 'Common',
    titleColor: '#000000',
    cardLoadYgoProEnabled: false,
    cardKey: '',
    cardTitle: '',
    cardImg: null,
    cardType: 'Monster',
    cardSubtype: 'Normal',
    cardEff1: '',
    cardEff2: '',
    cardAttr: 'EARTH',
    cardCustomRaceEnabled: false,
    cardCustomRace: '',
    cardRace: 'Warrior',
    Pendulum: false,
    Special: false,
    cardLevel: '4',
    cardBLUE: 1,
    cardRED: 8,
    pendulumSize: 1,
    cardPendulumInfo: '',
    cardATK: '1500',
    cardDEF: '1200',
    links: {},
    infoSize: 'normal',
    cardInfo: '',
  });

  const updateCardData = useCallback((updates: Partial<YugiohCardData>) => {
    setCardData(prev => ({ ...prev, ...updates }));
  }, []);

  return {
    cardData,
    updateCardData,
  };
};
