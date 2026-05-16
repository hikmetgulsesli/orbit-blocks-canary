// AUTO-GENERATED from Stitch — DO NOT modify layout or CSS
// Screen: Game Over
// 
// AGENT INSTRUCTIONS:
// 1. DO NOT change className values or layout structure
// 2. Add useState for dynamic values (replace hardcoded text)
// 3. Wire interactive controls through the typed actions prop
// 4. Replace placeholder data with props/state


export type GameOverActionId = "pause-1" | "restart-2";

export interface GameOverProps {
  actions?: Partial<Record<GameOverActionId, () => void>>;
}

export function GameOver({ actions }: GameOverProps) {
  return (
    <>
      <header>
          <div><div className="meta">Small English Falling Blocks PRD</div><h1>Game Over</h1><p>Final score/progress summary, replay, and return-to-menu actions.</p></div>
          <nav aria-label="Fallback design navigation"><a href="#fallback-game-board">Game Board</a><a href="#fallback-main-menu">Main Menu</a><a href="#fallback-pause-overlay">Pause Overlay</a><a href="#fallback-game-over">Game Over</a><a href="#fallback-controls-help">Controls Help</a></nav>
        </header>
        <main id="fallback-game-over">
            <section className="game-layout" aria-label="Playable board reference">
              <div className="board" role="grid" aria-label="Playable game field"><div className="cell active" aria-hidden={true}></div><div className="cell" aria-hidden={true}></div><div className="cell" aria-hidden={true}></div><div className="cell" aria-hidden={true}></div><div className="cell" aria-hidden={true}></div><div className="cell" aria-hidden={true}></div><div className="cell" aria-hidden={true}></div><div className="cell" aria-hidden={true}></div><div className="cell" aria-hidden={true}></div><div className="cell" aria-hidden={true}></div><div className="cell" aria-hidden={true}></div><div className="cell active" aria-hidden={true}></div><div className="cell" aria-hidden={true}></div><div className="cell" aria-hidden={true}></div><div className="cell" aria-hidden={true}></div><div className="cell" aria-hidden={true}></div><div className="cell" aria-hidden={true}></div><div className="cell active" aria-hidden={true}></div><div className="cell" aria-hidden={true}></div><div className="cell" aria-hidden={true}></div><div className="cell" aria-hidden={true}></div><div className="cell" aria-hidden={true}></div><div className="cell active" aria-hidden={true}></div><div className="cell" aria-hidden={true}></div><div className="cell" aria-hidden={true}></div><div className="cell" aria-hidden={true}></div><div className="cell" aria-hidden={true}></div><div className="cell" aria-hidden={true}></div><div className="cell" aria-hidden={true}></div><div className="cell" aria-hidden={true}></div><div className="cell" aria-hidden={true}></div><div className="cell" aria-hidden={true}></div><div className="cell" aria-hidden={true}></div><div className="cell active" aria-hidden={true}></div><div className="cell active" aria-hidden={true}></div><div className="cell" aria-hidden={true}></div><div className="cell" aria-hidden={true}></div><div className="cell" aria-hidden={true}></div><div className="cell" aria-hidden={true}></div><div className="cell" aria-hidden={true}></div><div className="cell" aria-hidden={true}></div><div className="cell" aria-hidden={true}></div><div className="cell" aria-hidden={true}></div><div className="cell" aria-hidden={true}></div><div className="cell active" aria-hidden={true}></div><div className="cell" aria-hidden={true}></div><div className="cell" aria-hidden={true}></div><div className="cell" aria-hidden={true}></div><div className="cell" aria-hidden={true}></div><div className="cell" aria-hidden={true}></div><div className="cell" aria-hidden={true}></div><div className="cell active" aria-hidden={true}></div><div className="cell" aria-hidden={true}></div><div className="cell" aria-hidden={true}></div><div className="cell" aria-hidden={true}></div><div className="cell active" aria-hidden={true}></div><div className="cell" aria-hidden={true}></div><div className="cell" aria-hidden={true}></div><div className="cell" aria-hidden={true}></div><div className="cell" aria-hidden={true}></div><div className="cell" aria-hidden={true}></div><div className="cell" aria-hidden={true}></div><div className="cell" aria-hidden={true}></div><div className="cell" aria-hidden={true}></div><div className="cell" aria-hidden={true}></div><div className="cell" aria-hidden={true}></div><div className="cell active" aria-hidden={true}></div><div className="cell" aria-hidden={true}></div><div className="cell active" aria-hidden={true}></div><div className="cell" aria-hidden={true}></div><div className="cell" aria-hidden={true}></div><div className="cell" aria-hidden={true}></div><div className="cell" aria-hidden={true}></div><div className="cell" aria-hidden={true}></div><div className="cell" aria-hidden={true}></div><div className="cell" aria-hidden={true}></div><div className="cell" aria-hidden={true}></div><div className="cell active" aria-hidden={true}></div><div className="cell" aria-hidden={true}></div><div className="cell" aria-hidden={true}></div><div className="cell" aria-hidden={true}></div><div className="cell" aria-hidden={true}></div><div className="cell" aria-hidden={true}></div><div className="cell" aria-hidden={true}></div><div className="cell" aria-hidden={true}></div><div className="cell active" aria-hidden={true}></div><div className="cell" aria-hidden={true}></div><div className="cell" aria-hidden={true}></div><div className="cell active" aria-hidden={true}></div><div className="cell" aria-hidden={true}></div><div className="cell" aria-hidden={true}></div><div className="cell" aria-hidden={true}></div><div className="cell" aria-hidden={true}></div><div className="cell" aria-hidden={true}></div><div className="cell" aria-hidden={true}></div><div className="cell" aria-hidden={true}></div></div>
              <aside className="side-panel">
                <h2>Status</h2>
                <div className="mini-grid" aria-label="Gameplay status preview"><span className="active"></span><span className=""></span><span className=""></span><span className=""></span><span className=""></span><span className="active"></span><span className=""></span><span className=""></span><span className=""></span><span className=""></span><span className="active"></span><span className=""></span><span className=""></span><span className=""></span><span className=""></span><span className="active"></span></div>
                <dl><dt>Score</dt><dd>12,400</dd><dt>Level</dt><dd>6</dd><dt>Progress</dt><dd>48%</dd></dl>
                <button type="button" data-action-id="pause-1" onClick={actions?.["pause-1"]}>Pause</button><button type="button" data-action-id="restart-2" onClick={actions?.["restart-2"]}>Restart</button>
              </aside>
            </section></main>
    </>
  );
}
