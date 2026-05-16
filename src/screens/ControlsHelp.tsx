// AUTO-GENERATED from Stitch — DO NOT modify layout or CSS
// Screen: Controls Help
// 
// AGENT INSTRUCTIONS:
// 1. DO NOT change className values or layout structure
// 2. Add useState for dynamic values (replace hardcoded text)
// 3. Wire interactive controls through the typed actions prop
// 4. Replace starter data with props/state


export type ControlsHelpActionId = "start-game-1" | "resume-2" | "open-settings-3";

export interface ControlsHelpProps {
  actions?: Partial<Record<ControlsHelpActionId, () => void>>;
}

export function ControlsHelp({ actions }: ControlsHelpProps) {
  return (
    <>
      <header>
          <div><div className="meta">Small English Falling Blocks</div><h1>Controls Help</h1><p>Move, rotate, pause, and restart the falling-blocks game with keyboard or touch controls.</p></div>
          <nav aria-label="Fallback design navigation"><a href="#fallback-game-board">Game Board</a><a href="#fallback-main-menu">Main Menu</a><a href="#fallback-pause-overlay">Pause Overlay</a><a href="#fallback-game-over">Game Over</a><a href="#fallback-controls-help">Controls Help</a></nav>
        </header>
        <main id="fallback-controls-help">
          <section className="command-panel">
            <p>Keep blocks falling by clearing full rows. The board speeds up as levels rise, and the game ends when new pieces can no longer enter the playfield.</p>
            <div className="action-row"><button type="button" data-action-id="start-game-1" onClick={actions?.["start-game-1"]}>Start Game</button><button type="button" data-action-id="resume-2" onClick={actions?.["resume-2"]}>Resume</button><button type="button" data-action-id="open-settings-3" onClick={actions?.["open-settings-3"]}>Open Settings</button></div>
            <div className="data-grid"><article><h2>Goal</h2><p>Clear lines to raise your score and level while keeping the stack below the top of the board.</p></article><article><h2>Controls</h2><p>Use Arrow Left/Right to move, Arrow Up to rotate, Arrow Down to soft drop, Space to hard drop, and P to pause or resume.</p></article></div>
          </section></main>
    </>
  );
}
