import { createContext, useContext } from 'react';
import type { GameAction, GameSnapshot } from '../types/domain';
import type { Board } from '../types/domain';

export type AppContextValue = {
  state: GameSnapshot & { highScore: number };
  board: Board;
  nextPreview: Board;
  dispatch: (action: GameAction) => void;
};

export const AppContext = createContext<AppContextValue | null>(null);

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppContext.Provider');
  }
  return context;
}
