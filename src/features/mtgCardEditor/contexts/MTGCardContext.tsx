'use client';

import React, { ReactNode, createContext, useContext, useReducer } from 'react';
import { MTGCard, MTGCardEditor, MTGCardValidation } from '../types';
import { DEFAULT_MTG_CARD } from '../types/constants';
import { useContentValidation } from '../hooks/useContentValidation';

interface MTGCardState extends MTGCardEditor {
  validation: MTGCardValidation;
}

type MTGCardAction =
  | { type: 'SET_CARD'; payload: MTGCard }
  | { type: 'UPDATE_CARD'; payload: Partial<MTGCard> }
  | { type: 'SET_EDITING'; payload: boolean }
  | { type: 'SET_SELECTED_FACE'; payload: number | undefined }
  | { type: 'SET_ERRORS'; payload: Record<string, string> }
  | { type: 'CLEAR_ERRORS' }
  | { type: 'VALIDATE_CARD' }
  | { type: 'RESET_CARD' };

const initialState: MTGCardState = {
  card: DEFAULT_MTG_CARD,
  isEditing: true,
  selectedFace: undefined,
  errors: {},
  validation: {
    isValid: false,
    errors: {},
    warnings: {},
  },
};

function validateCard(
  card: MTGCard,
  contentValidator?: ReturnType<typeof useContentValidation>,
): MTGCardValidation {
  const errors: Record<string, string> = {};
  const warnings: Record<string, string> = {};

  if (!card.name.trim()) {
    errors.name = 'Card name is required';
  }

  if (!card.type.trim()) {
    errors.type = 'Card type is required';
  }

  if (card.type.toLowerCase().includes('creature')) {
    if (!card.power) {
      errors.power = 'Creatures must have power';
    }
    if (!card.toughness) {
      errors.toughness = 'Creatures must have toughness';
    }
  }

  if (card.type.toLowerCase().includes('planeswalker') && !card.loyalty) {
    errors.loyalty = 'Planeswalkers must have starting loyalty';
  }

  if (card.manaCost && !/^(\{[WUBRGXC]?\d*\})*$/.test(card.manaCost)) {
    warnings.manaCost = 'Mana cost format may be invalid';
  }

  // Add spam/content validation if available
  if (contentValidator) {
    const fullCardValidation = contentValidator.validateFullCard(card);

    // Merge spam validation errors with existing errors
    Object.entries(fullCardValidation.errors).forEach(
      ([field, fieldErrors]) => {
        if (fieldErrors && fieldErrors.length > 0) {
          // If there are existing errors, append; otherwise, create new
          if (errors[field]) {
            errors[field] += '; ' + fieldErrors.join('; ');
          } else {
            errors[field] = fieldErrors.join('; ');
          }
        }
      },
    );
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings,
  };
}

function mtgCardReducer(
  state: MTGCardState,
  action: MTGCardAction,
  contentValidator?: ReturnType<typeof useContentValidation>,
): MTGCardState {
  switch (action.type) {
    case 'SET_CARD': {
      const validation = validateCard(action.payload, contentValidator);
      return {
        ...state,
        card: action.payload,
        validation,
      };
    }
    case 'UPDATE_CARD': {
      const updatedCard = { ...state.card, ...action.payload };
      const validation = validateCard(updatedCard, contentValidator);
      return {
        ...state,
        card: updatedCard,
        validation,
      };
    }
    case 'SET_EDITING':
      return { ...state, isEditing: action.payload };
    case 'SET_SELECTED_FACE':
      return { ...state, selectedFace: action.payload };
    case 'SET_ERRORS':
      return { ...state, errors: action.payload };
    case 'CLEAR_ERRORS':
      return { ...state, errors: {} };
    case 'VALIDATE_CARD': {
      const validation = validateCard(state.card, contentValidator);
      return { ...state, validation };
    }
    case 'RESET_CARD': {
      const validation = validateCard(DEFAULT_MTG_CARD, contentValidator);
      return {
        ...initialState,
        card: { ...DEFAULT_MTG_CARD },
        validation,
      };
    }
    default:
      return state;
  }
}

interface MTGCardContextType {
  state: MTGCardState;
  setCard: (card: MTGCard) => void;
  updateCard: (updates: Partial<MTGCard>) => void;
  setEditing: (editing: boolean) => void;
  setSelectedFace: (face?: number) => void;
  setErrors: (errors: Record<string, string>) => void;
  clearErrors: () => void;
  validateCard: () => void;
  resetCard: () => void;
}

const MTGCardContext = createContext<MTGCardContextType | undefined>(undefined);

export function MTGCardProvider({ children }: { children: ReactNode }) {
  const contentValidation = useContentValidation();

  const [state, dispatch] = useReducer(
    (state: MTGCardState, action: MTGCardAction) =>
      mtgCardReducer(state, action, contentValidation),
    initialState,
  );

  const contextValue: MTGCardContextType = {
    state,
    setCard: (card: MTGCard) => dispatch({ type: 'SET_CARD', payload: card }),
    updateCard: (updates: Partial<MTGCard>) =>
      dispatch({ type: 'UPDATE_CARD', payload: updates }),
    setEditing: (editing: boolean) =>
      dispatch({ type: 'SET_EDITING', payload: editing }),
    setSelectedFace: (face?: number) =>
      dispatch({ type: 'SET_SELECTED_FACE', payload: face }),
    setErrors: (errors: Record<string, string>) =>
      dispatch({ type: 'SET_ERRORS', payload: errors }),
    clearErrors: () => dispatch({ type: 'CLEAR_ERRORS' }),
    validateCard: () => dispatch({ type: 'VALIDATE_CARD' }),
    resetCard: () => dispatch({ type: 'RESET_CARD' }),
  };

  return (
    <MTGCardContext.Provider value={contextValue}>
      {children}
    </MTGCardContext.Provider>
  );
}

export function useMTGCard() {
  const context = useContext(MTGCardContext);
  if (context === undefined) {
    throw new Error('useMTGCard must be used within a MTGCardProvider');
  }
  return context;
}
