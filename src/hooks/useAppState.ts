import { useCallback, useEffect, useMemo, useReducer } from 'react';
import type { ActivePiece, AppRuntimeBridge, Board, CellValue, GameAction, GameSnapshot, PieceType, Point } from '../types/domain';
import { readHighScore, writeHighScore } from '../utils/storage';

export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;

const PIECES: Record<PieceType, Point[]> = {
  I: [
    { x: -1, y: 0 },
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 2, y: 0 },
  ],
  O: [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: 1, y: 1 },
  ],
  T: [
    { x: -1, y: 0 },
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
  ],
  S: [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: -1, y: 1 },
    { x: 0, y: 1 },
  ],
  Z: [
    { x: -1, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 1 },
    { x: 1, y: 1 },
  ],
  J: [
    { x: -1, y: 0 },
    { x: -1, y: 1 },
    { x: 0, y: 1 },
    { x: 1, y: 1 },
  ],
  L: [
    { x: 1, y: 0 },
    { x: -1, y: 1 },
    { x: 0, y: 1 },
    { x: 1, y: 1 },
  ],
};

const PIECE_SEQUENCE: PieceType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

type State = GameSnapshot & {
  highScore: number;
  bagIndex: number;
};

type InternalAction = { type: GameAction };

function createBoard(): Board {
  return Array.from({ length: BOARD_HEIGHT }, () => Array.from({ length: BOARD_WIDTH }, () => '' as CellValue));
}

function cloneBoard(board: Board): Board {
  return board.map((row) => [...row]);
}

function nextFromIndex(index: number): PieceType {
  return PIECE_SEQUENCE[index % PIECE_SEQUENCE.length];
}

function createPiece(type: PieceType): ActivePiece {
  return {
    type,
    cells: PIECES[type].map((cell) => ({ ...cell })),
    position: { x: Math.floor(BOARD_WIDTH / 2), y: 0 },
  };
}

function piecePoints(piece: ActivePiece): Point[] {
  return piece.cells.map((cell) => ({
    x: piece.position.x + cell.x,
    y: piece.position.y + cell.y,
  }));
}

function isValidPosition(board: Board, piece: ActivePiece): boolean {
  return piecePoints(piece).every(({ x, y }) => x >= 0 && x < BOARD_WIDTH && y >= 0 && y < BOARD_HEIGHT && board[y][x] === '');
}

function movePiece(piece: ActivePiece, delta: Point): ActivePiece {
  return {
    ...piece,
    position: {
      x: piece.position.x + delta.x,
      y: piece.position.y + delta.y,
    },
  };
}

function rotatePiece(piece: ActivePiece): ActivePiece {
  if (piece.type === 'O') {
    return piece;
  }

  return {
    ...piece,
    cells: piece.cells.map(({ x, y }) => ({ x: -y, y: x })),
  };
}

function mergePiece(board: Board, piece: ActivePiece): Board {
  const merged = cloneBoard(board);
  piecePoints(piece).forEach(({ x, y }) => {
    if (y >= 0 && y < BOARD_HEIGHT && x >= 0 && x < BOARD_WIDTH) {
      merged[y][x] = piece.type;
    }
  });
  return merged;
}

function clearLines(board: Board): { board: Board; cleared: number } {
  const remaining = board.filter((row) => row.some((cell) => cell === ''));
  const cleared = BOARD_HEIGHT - remaining.length;
  const emptyRows = Array.from({ length: cleared }, () => Array.from({ length: BOARD_WIDTH }, () => '' as CellValue));
  return {
    board: [...emptyRows, ...remaining],
    cleared,
  };
}

function spawnNext(state: State, board: Board, lineBonus = 0, dropBonus = 0): State {
  const activePiece = createPiece(state.nextPiece);
  const bagIndex = state.bagIndex + 1;
  const score = state.score + lineBonus + dropBonus;
  const highScore = Math.max(state.highScore, score);
  const nextState: State = {
    ...state,
    board,
    activePiece,
    nextPiece: nextFromIndex(bagIndex),
    bagIndex,
    score,
    highScore,
    level: Math.floor(state.lines / 10) + 1,
    isRunning: true,
    isGameOver: false,
    status: 'playing',
  };

  if (!isValidPosition(board, activePiece)) {
    return {
      ...nextState,
      activePiece: null,
      status: 'game-over',
      isRunning: false,
      isGameOver: true,
    };
  }

  return nextState;
}

function lockActivePiece(state: State, dropBonus = 0): State {
  if (!state.activePiece) {
    return state;
  }

  const merged = mergePiece(state.board, state.activePiece);
  const cleared = clearLines(merged);
  const lineBonus = [0, 100, 300, 500, 800][cleared.cleared] * state.level;
  const lines = state.lines + cleared.cleared;
  return spawnNext({ ...state, lines }, cleared.board, lineBonus, dropBonus);
}

function tick(state: State): State {
  if (state.status !== 'playing' || !state.activePiece) {
    return state;
  }

  const moved = movePiece(state.activePiece, { x: 0, y: 1 });
  if (isValidPosition(state.board, moved)) {
    return { ...state, activePiece: moved, score: state.score + 1 };
  }

  return lockActivePiece(state);
}

function initialState(): State {
  const bagIndex = 1;
  return {
    board: createBoard(),
    activePiece: null,
    nextPiece: nextFromIndex(bagIndex),
    bagIndex,
    status: 'menu',
    score: 0,
    highScore: readHighScore(),
    level: 1,
    lines: 0,
    isRunning: false,
    isGameOver: false,
  };
}

function startGame(highScore: number): State {
  return spawnNext(
    {
      ...initialState(),
      highScore,
      nextPiece: nextFromIndex(0),
      bagIndex: 0,
      status: 'playing',
    },
    createBoard(),
  );
}

function reducer(state: State, action: InternalAction): State {
  switch (action.type) {
    case 'start':
    case 'restart':
      return startGame(state.highScore);
    case 'resume':
      return state.activePiece && !state.isGameOver ? { ...state, status: 'playing', isRunning: true } : startGame(state.highScore);
    case 'pause':
      return state.status === 'playing' ? { ...state, status: 'paused', isRunning: false } : state;
    case 'help':
      return { ...state, status: 'help', isRunning: false };
    case 'menu':
      return { ...state, status: 'menu', isRunning: false };
    case 'left': {
      if (state.status !== 'playing' || !state.activePiece) return state;
      const moved = movePiece(state.activePiece, { x: -1, y: 0 });
      return isValidPosition(state.board, moved) ? { ...state, activePiece: moved } : state;
    }
    case 'right': {
      if (state.status !== 'playing' || !state.activePiece) return state;
      const moved = movePiece(state.activePiece, { x: 1, y: 0 });
      return isValidPosition(state.board, moved) ? { ...state, activePiece: moved } : state;
    }
    case 'down':
      return tick(state);
    case 'rotate': {
      if (state.status !== 'playing' || !state.activePiece) return state;
      const rotated = rotatePiece(state.activePiece);
      const kicks = [0, -1, 1, -2, 2].map((x) => movePiece(rotated, { x, y: 0 }));
      const valid = kicks.find((piece) => isValidPosition(state.board, piece));
      return valid ? { ...state, activePiece: valid } : state;
    }
    case 'drop': {
      if (state.status !== 'playing' || !state.activePiece) return state;
      let piece = state.activePiece;
      let distance = 0;
      while (isValidPosition(state.board, movePiece(piece, { x: 0, y: 1 }))) {
        piece = movePiece(piece, { x: 0, y: 1 });
        distance += 1;
      }
      return lockActivePiece({ ...state, activePiece: piece }, distance * 2);
    }
    default:
      return state;
  }
}

export function boardWithActivePiece(snapshot: GameSnapshot): Board {
  const board = cloneBoard(snapshot.board);
  if (!snapshot.activePiece) {
    return board;
  }

  piecePoints(snapshot.activePiece).forEach(({ x, y }) => {
    if (y >= 0 && y < BOARD_HEIGHT && x >= 0 && x < BOARD_WIDTH) {
      board[y][x] = snapshot.activePiece?.type ?? '';
    }
  });
  return board;
}

export function previewForPiece(type: PieceType): Board {
  const preview = Array.from({ length: 4 }, () => Array.from({ length: 4 }, () => '' as CellValue));
  PIECES[type].forEach(({ x, y }) => {
    preview[y + 1][x + 1] = type;
  });
  return preview;
}

export function useAppState() {
  const [state, dispatchBase] = useReducer(reducer, undefined, initialState);

  const dispatch = useCallback((action: GameAction) => {
    dispatchBase({ type: action });
  }, []);

  useEffect(() => {
    if (state.score >= state.highScore) {
      writeHighScore(state.highScore);
    }
  }, [state.highScore, state.score]);

  useEffect(() => {
    if (state.status !== 'playing') {
      return undefined;
    }

    const speed = Math.max(140, 760 - (state.level - 1) * 70);
    const interval = window.setInterval(() => dispatch('down'), speed);
    return () => window.clearInterval(interval);
  }, [dispatch, state.level, state.status]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const keyMap: Partial<Record<string, GameAction>> = {
        ArrowLeft: 'left',
        ArrowRight: 'right',
        ArrowDown: 'down',
        ArrowUp: 'rotate',
        ' ': 'drop',
        p: state.status === 'playing' ? 'pause' : 'resume',
        P: state.status === 'playing' ? 'pause' : 'resume',
      };
      const action = keyMap[event.key];
      if (action) {
        event.preventDefault();
        dispatch(action);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [dispatch, state.status]);

  const bridge = useMemo<AppRuntimeBridge>(
    () => ({
      getState: () => state,
      dispatch,
      start: () => dispatch('start'),
      restart: () => dispatch('restart'),
      pause: () => dispatch('pause'),
      resume: () => dispatch('resume'),
      moveLeft: () => dispatch('left'),
      moveRight: () => dispatch('right'),
      softDrop: () => dispatch('down'),
      hardDrop: () => dispatch('drop'),
      rotate: () => dispatch('rotate'),
    }),
    [dispatch, state],
  );

  useEffect(() => {
    window.app = bridge;
    return () => {
      if (window.app === bridge) {
        delete window.app;
      }
    };
  }, [bridge]);

  return {
    state,
    dispatch,
    board: boardWithActivePiece(state),
    nextPreview: previewForPiece(state.nextPiece),
  };
}

declare global {
  interface Window {
    app?: AppRuntimeBridge;
  }
}
