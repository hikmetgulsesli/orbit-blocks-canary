// AUTO-GENERATED from Stitch — DO NOT modify layout or CSS
// Screen: Pause Overlay
// 
// AGENT INSTRUCTIONS:
// 1. DO NOT change className values or layout structure
// 2. Add useState for dynamic values (replace hardcoded text)
// 3. Wire interactive controls through the typed actions prop
// 4. Keep runtime data connected through props/state


export type PauseOverlayActionId = "play-again-1" | "share-score-2" | "main-menu-3";

export interface PauseOverlayProps {
  actions?: Partial<Record<PauseOverlayActionId, () => void>>;
}

export function PauseOverlay({ actions }: PauseOverlayProps) {
  return (
    <>
      <header>
          <div><div className="meta">Small English Falling Blocks PRD</div><h1>Pause Overlay</h1><p>Paused state with resume, restart, and return-to-menu actions.</p></div>
          <nav aria-label="Fallback design navigation"><a href="#fallback-game-board">Game Board</a><a href="#fallback-main-menu">Main Menu</a><a href="#fallback-pause-overlay">Pause Overlay</a><a href="#fallback-game-over">Game Over</a><a href="#fallback-controls-help">Controls Help</a></nav>
        </header>
        <main id="fallback-pause-overlay">
            <section className="result-panel">
              <p className="scoreline">Final score 24,800 with strong progress through the challenge.</p>
              <button type="button" data-action-id="play-again-1" onClick={actions?.["play-again-1"]}>Play Again</button><button type="button" data-action-id="share-score-2" onClick={actions?.["share-score-2"]}>Share Score</button><button type="button" data-action-id="main-menu-3" onClick={actions?.["main-menu-3"]}>Main Menu</button>
            </section></main>
    </>
  );
}
