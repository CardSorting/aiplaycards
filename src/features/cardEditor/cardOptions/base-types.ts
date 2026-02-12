import { CardLogic } from '../cardLogic';
import { CardStyles } from '../cardStyles';

export interface CardTypeHelpers {
  styles?: Partial<CardStyles>;
  logic?: Partial<CardLogic>;
}

export interface IdentifierInfo {
  /**
   * Used for finding and identifying objects
   */
  id: number;
  /**
   * Used for React keys and dynamic image retrieval
   */
  slug: string;
  /**
   * Used to display to the user
   */
  displayName: string;
}
