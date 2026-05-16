import { useCallback, useEffect, useMemo, useState } from 'react';
import { ControlsHelp, GameBoard, GameOver, MainMenu, PauseOverlay } from './screens';
import './App.css';
import { AppContext } from './contexts/AppContext';
import { BOARD_HEIGHT, BOARD_WIDTH, useAppState } from './hooks/useAppState';
import type { Board, CellValue, GameAction } from './types/domain';

const cellLabels: Record<CellValue, string> = {
  '': 'Empty',
  I: 'Cyan block',
  O: 'Yellow block',
  T: 'Purple block',
  S: 'Green block',
  Z: 'Red block',
  J: 'Blue block',
  L: 'Orange block',
};

type FallbackRoute =
  | 'fallback-game-board'
  | 'fallback-main-menu'
  | 'fallback-pause-overlay'
  | 'fallback-game-over'
  | 'fallback-controls-help';

const routeAliases: Record<string, FallbackRoute> = {
  'game-board': 'fallback-game-board',
  'main-menu': 'fallback-main-menu',
  'pause-overlay': 'fallback-pause-overlay',
  'game-over': 'fallback-game-over',
  'controls-help': 'fallback-controls-help',
};

const fallbackRoutes = new Set<FallbackRoute>([
  'fallback-game-board',
  'fallback-main-menu',
  'fallback-pause-overlay',
  'fallback-game-over',
  'fallback-controls-help',
]);

function fallbackRouteFromHash(): FallbackRoute | null {
  const route = window.location.hash.replace(/^#/, '');
  if (routeAliases[route]) return routeAliases[route];
  return fallbackRoutes.has(route as FallbackRoute) ? (route as FallbackRoute) : null;
}

function fallbackRouteFromStatus(status: string): FallbackRoute {
  if (status === 'menu') return 'fallback-main-menu';
  if (status === 'paused') return 'fallback-pause-overlay';
  if (status === 'game-over') return 'fallback-game-over';
  if (status === 'help') return 'fallback-controls-help';
  return 'fallback-game-board';
}

function BoardGrid({ board, compact = false }: { board: Board; compact?: boolean }) {
  return (
    <div
      className={compact ? 'board-grid board-grid--preview' : 'board-grid'}
      role="grid"
      aria-label={compact ? 'Next piece preview' : 'Falling blocks board'}
      style={{
        gridTemplateColumns: `repeat(${compact ? 4 : BOARD_WIDTH}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${compact ? 4 : BOARD_HEIGHT}, minmax(0, 1fr))`,
      }}
    >
      {board.flatMap((row, y) =>
        row.map((cell, x) => (
          <span
            aria-label={cellLabels[cell]}
            className={`board-cell ${cell ? `board-cell--${cell}` : ''}`}
            key={`${x}-${y}`}
            role="gridcell"
          />
        )),
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function StorageNotice({ status, lastError }: { status: string; lastError: string | null }) {
  if (status === 'available') {
    return null;
  }

  const title = status === 'recovered' ? 'Saved score recovered' : 'Saved score unavailable';
  const message =
    lastError ??
    (status === 'unavailable'
      ? 'High score persistence is unavailable in this browser.'
      : 'High score persistence needs attention.');

  return (
    <div className={`storage-notice storage-notice--${status}`} role="status" aria-live="polite">
      <strong>{title}</strong>
      <span>{message}</span>
    </div>
  );
}

export default function App() {
  const { state, dispatch, board, nextPreview } = useAppState();
  const [fallbackRoute, setFallbackRouteState] = useState<FallbackRoute | null>(() => fallbackRouteFromHash());

  useEffect(() => {
    const onHashChange = () => setFallbackRouteState(fallbackRouteFromHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const setFallbackRoute = useCallback((route: FallbackRoute) => {
    if (window.location.hash === `#${route}`) {
      setFallbackRouteState(route);
      return;
    }
    window.location.hash = route;
  }, []);

  const start = useCallback(() => {
    dispatch('start');
  }, [dispatch]);
  const resume = useCallback(() => {
    dispatch('resume');
  }, [dispatch]);
  const restart = useCallback(() => {
    dispatch('restart');
  }, [dispatch]);
  const pause = useCallback(() => {
    dispatch('pause');
  }, [dispatch]);
  const menu = useCallback(() => {
    dispatch('menu');
  }, [dispatch]);
  const help = useCallback(() => {
    dispatch('help');
  }, [dispatch]);

  const showBoard = useCallback(() => {
    setFallbackRoute('fallback-game-board');
  }, [setFallbackRoute]);
  const startGeneratedGame = useCallback(() => {
    start();
    showBoard();
  }, [showBoard, start]);
  const resumeGeneratedGame = useCallback(() => {
    resume();
    showBoard();
  }, [resume, showBoard]);
  const restartGeneratedGame = useCallback(() => {
    restart();
    showBoard();
  }, [restart, showBoard]);
  const pauseGeneratedGame = useCallback(() => {
    pause();
    setFallbackRoute('fallback-pause-overlay');
  }, [pause, setFallbackRoute]);
  const shareGeneratedScore = useCallback(() => {
    const text = `Orbit Blocks score: ${state.score}`;
    const navigatorApi = window.navigator as Navigator & {
      share?: (data: ShareData) => Promise<void>;
      clipboard?: Clipboard;
    };

    void (async () => {
      if (typeof navigatorApi.share === 'function') {
        await navigatorApi.share({ text });
        return;
      }

      if (navigatorApi.clipboard?.writeText) {
        await navigatorApi.clipboard.writeText(text);
      }
    })().catch(() => undefined);
  }, [state.score]);
  const menuGeneratedGame = useCallback(() => {
    menu();
    setFallbackRoute('fallback-main-menu');
  }, [menu, setFallbackRoute]);
  const helpGeneratedGame = useCallback(() => {
    help();
    setFallbackRoute('fallback-controls-help');
  }, [help, setFallbackRoute]);

  const generatedScreen = useMemo(() => {
    const route = fallbackRoute ?? fallbackRouteFromStatus(state.status);
    if (route === 'fallback-main-menu') {
      return <MainMenu actions={{ 'start-game-1': startGeneratedGame, 'resume-2': resumeGeneratedGame, 'open-settings-3': helpGeneratedGame }} />;
    }
    if (route === 'fallback-pause-overlay') {
      return <PauseOverlay actions={{ 'play-again-1': restartGeneratedGame, 'share-score-2': shareGeneratedScore, 'main-menu-3': menuGeneratedGame }} />;
    }
    if (route === 'fallback-game-over') {
      return <GameOver actions={{ 'pause-1': pauseGeneratedGame, 'restart-2': restartGeneratedGame }} />;
    }
    if (route === 'fallback-controls-help') {
      return <ControlsHelp actions={{ 'start-game-1': startGeneratedGame, 'resume-2': resumeGeneratedGame, 'open-settings-3': menuGeneratedGame }} />;
    }
    return <GameBoard actions={{ 'pause-1': pauseGeneratedGame, 'restart-2': restartGeneratedGame }} />;
  }, [
    fallbackRoute,
    helpGeneratedGame,
    menuGeneratedGame,
    pauseGeneratedGame,
    restartGeneratedGame,
    resumeGeneratedGame,
    shareGeneratedScore,
    startGeneratedGame,
    state.status,
  ]);

  const dispatchControl = (action: GameAction) => () => dispatch(action);
  const isPlaying = state.status === 'playing';
  const isGeneratedRoute = fallbackRoute !== null;

  return (
    <AppContext.Provider value={{ state, board, nextPreview, dispatch }}>
      <main data-setfarm-root="orbit-blocks" className="app-shell">
        {!isGeneratedRoute ? (
          <section className="game-layout" aria-label="Orbit Blocks">
            <div className="playfield">
              <div className="playfield__header">
                <div>
                  <p className="eyebrow">Orbit Blocks</p>
                  <h1>Small English Falling Blocks</h1>
                </div>
                <div className={`status-pill status-pill--${state.status}`}>{state.status.replace('-', ' ')}</div>
              </div>

              <div className="board-frame">
                <BoardGrid board={board} />
                {state.status !== 'playing' ? (
                  <div className="board-overlay" role="status" aria-live="polite">
                    <strong>{state.status === 'game-over' ? 'Game over' : state.status === 'paused' ? 'Paused' : 'Ready'}</strong>
                    <span>{state.status === 'help' ? 'Use the controls below or keyboard shortcuts.' : 'Start or resume when ready.'}</span>
                  </div>
                ) : null}
              </div>

              <div className="mobile-controls" aria-label="Mobile controls">
                <button type="button" onClick={dispatchControl('left')} disabled={!isPlaying}>
                  Left
                </button>
                <button type="button" onClick={dispatchControl('rotate')} disabled={!isPlaying}>
                  Rotate
                </button>
                <button type="button" onClick={dispatchControl('right')} disabled={!isPlaying}>
                  Right
                </button>
                <button type="button" onClick={dispatchControl('down')} disabled={!isPlaying}>
                  Down
                </button>
                <button type="button" onClick={dispatchControl('drop')} disabled={!isPlaying}>
                  Drop
                </button>
              </div>
            </div>

            <aside className="side-panel" aria-label="Game information and actions">
              <div className="stats-grid">
                <Stat label="Score" value={state.score} />
                <Stat label="Level" value={state.level} />
                <Stat label="Lines" value={state.lines} />
                <Stat label="Best" value={state.highScore} />
              </div>

              <StorageNotice status={state.storageStatus} lastError={state.storageLastError} />

              <div className="next-piece">
                <span>Next</span>
                <BoardGrid board={nextPreview} compact />
              </div>

              <div className="action-stack">
                {state.status === 'playing' ? (
                  <button type="button" onClick={pause}>
                    Pause
                  </button>
                ) : (
                  <button type="button" onClick={state.activePiece ? resume : start}>
                    {state.activePiece ? 'Resume' : 'Start Game'}
                  </button>
                )}
                <button type="button" onClick={restart}>
                  Restart
                </button>
                <button type="button" onClick={help}>
                  Controls
                </button>
                <button type="button" onClick={menu}>
                  Main Menu
                </button>
              </div>

              <dl className="help-list">
                <div>
                  <dt>Move</dt>
                  <dd>Arrow keys</dd>
                </div>
                <div>
                  <dt>Rotate</dt>
                  <dd>Up arrow</dd>
                </div>
                <div>
                  <dt>Drop</dt>
                  <dd>Space</dd>
                </div>
                <div>
                  <dt>Pause</dt>
                  <dd>P</dd>
                </div>
              </dl>
            </aside>
          </section>
        ) : null}

        <section className={isGeneratedRoute ? 'generated-screen-host generated-screen-host--route' : 'generated-screen-host'} aria-label="Generated screen">
          {generatedScreen}
        </section>
      </main>
    </AppContext.Provider>
  );
}
