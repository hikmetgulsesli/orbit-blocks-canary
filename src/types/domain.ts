export type CellValue = '' | 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

export type Board = CellValue[][];

export type PieceType = Exclude<CellValue, ''>;

export type Point = {
  x: number;
  y: number;
};

export type ActivePiece = {
  type: PieceType;
  cells: Point[];
  position: Point;
};

export type GameStatus = 'menu' | 'playing' | 'paused' | 'game-over' | 'help';

export type GameSnapshot = {
  board: Board;
  activePiece: ActivePiece | null;
  nextPiece: PieceType;
  status: GameStatus;
  score: number;
  level: number;
  lines: number;
  isRunning: boolean;
  isGameOver: boolean;
};

export type GameAction =
  | 'start'
  | 'resume'
  | 'pause'
  | 'restart'
  | 'left'
  | 'right'
  | 'down'
  | 'rotate'
  | 'drop'
  | 'help'
  | 'menu';

export type AppRuntimeBridge = {
  getState: () => GameSnapshot;
  dispatch: (action: GameAction) => void;
  start: () => void;
  restart: () => void;
  pause: () => void;
  resume: () => void;
  moveLeft: () => void;
  moveRight: () => void;
  softDrop: () => void;
  hardDrop: () => void;
  rotate: () => void;
};
