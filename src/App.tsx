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

const fallbackRoutes = new Set<FallbackRoute>([
  'fallback-game-board',
  'fallback-main-menu',
  'fallback-pause-overlay',
  'fallback-game-over',
  'fallback-controls-help',
]);

function fallbackRouteFromHash(): FallbackRoute | null {
  const route = window.location.hash.replace(/^#/, '');
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
    setFallbackRoute('fallback-game-board');
  }, [dispatch, setFallbackRoute]);
  const resume = useCallback(() => {
    dispatch('resume');
    setFallbackRoute('fallback-game-board');
  }, [dispatch, setFallbackRoute]);
  const restart = useCallback(() => {
    dispatch('restart');
    setFallbackRoute('fallback-game-board');
  }, [dispatch, setFallbackRoute]);
  const pause = useCallback(() => {
    dispatch('pause');
    setFallbackRoute('fallback-pause-overlay');
  }, [dispatch, setFallbackRoute]);
  const menu = useCallback(() => {
    dispatch('menu');
    setFallbackRoute('fallback-main-menu');
  }, [dispatch, setFallbackRoute]);
  const help = useCallback(() => {
    dispatch('help');
    setFallbackRoute('fallback-controls-help');
  }, [dispatch, setFallbackRoute]);

  const generatedScreen = useMemo(() => {
    const route = fallbackRoute ?? fallbackRouteFromStatus(state.status);
    if (route === 'fallback-main-menu') {
      return <MainMenu actions={{ 'start-game-1': start, 'resume-2': resume, 'open-settings-3': help }} />;
    }
    if (route === 'fallback-pause-overlay') {
      return <PauseOverlay actions={{ 'play-again-1': resume, 'share-score-2': help, 'main-menu-3': menu }} />;
    }
    if (route === 'fallback-game-over') {
      return <GameOver actions={{ 'pause-1': pause, 'restart-2': restart }} />;
    }
    if (route === 'fallback-controls-help') {
      return <ControlsHelp actions={{ 'start-game-1': start, 'resume-2': resume, 'open-settings-3': menu }} />;
    }
    return <GameBoard actions={{ 'pause-1': pause, 'restart-2': restart }} />;
  }, [fallbackRoute, help, menu, pause, restart, resume, start, state.status]);

  const dispatchControl = (action: GameAction) => () => dispatch(action);
  const isPlaying = state.status === 'playing';

  return (
    <AppContext.Provider value={{ state, board, nextPreview, dispatch }}>
      <main data-setfarm-root="orbit-blocks" className="app-shell">
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

        <section className="generated-screen-host" aria-label="Generated screen">
          {generatedScreen}
        </section>
      </main>
    </AppContext.Provider>
  );
}
