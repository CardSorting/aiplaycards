export interface AICardData {
  name: string;
  subname?: string;
  hitpoints: number;
  supertypeId: number;
  typeId: number;
  subtypeId?: number;
  variationId?: number;
  rarityId?: number;
  weaknessTypeId?: number;
  resistanceTypeId?: number;
  retreatCost: number;
  illustrator: string;
  cardNumber: string;
  totalInSet: string;
  dexStats: string;

  description?: string;
  hasAbility: boolean;
  ability?: {
    name: string;
    description: string;
  };
  move1: {
    name: string;
    description: string;
    damageAmount: number | '';
    damageModifier?: '×' | '+';
    energyCost: Array<{
      amount: number;
      typeId: number;
    }>;
  };
  hasMove2: boolean;
  move2?: {
    name: string;
    description: string;
    damageAmount: number | '';
    damageModifier?: '×' | '+';
    energyCost: Array<{
      amount: number;
      typeId: number;
    }>;
  };
}

export interface SimpleAIGeneratorProps {
  onGenerated?: () => void;
}
