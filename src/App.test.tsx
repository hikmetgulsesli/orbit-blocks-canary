import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from './App';

describe('Orbit Blocks app', () => {
  afterEach(() => {
    window.localStorage.clear();
    window.location.hash = '';
  });

  it('starts, controls, pauses, and restarts through visible controls and the runtime bridge', async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(window.app).toBeDefined();
    expect(window.app?.getState().status).toBe('menu');

    const game = within(screen.getByRole('region', { name: /orbit blocks/i }));
    await user.click(game.getByRole('button', { name: /start game/i }));
    await waitFor(() => expect(window.app?.getState().status).toBe('playing'));
    const firstPiece = window.app?.getState().activePiece?.position.x;

    act(() => {
      window.app?.moveLeft();
    });
    await waitFor(() => expect(window.app?.getState().activePiece?.position.x).toBe((firstPiece ?? 0) - 1));

    await user.keyboard('{ArrowRight}{ArrowDown}');
    await waitFor(() => expect(window.app?.getState().activePiece?.position.x).toBe(firstPiece));

    await user.click(game.getByRole('button', { name: /^pause$/i }));
    await waitFor(() => expect(window.app?.getState().status).toBe('paused'));

    await user.click(game.getByRole('button', { name: /restart/i }));
    await waitFor(() => expect(window.app?.getState().score).toBe(0));
    expect(window.app?.getState().status).toBe('playing');
  });

  it('shows visible recovery feedback for corrupted persisted high score data', () => {
    window.localStorage.setItem('orbit-blocks.high-score', 'not-a-score');

    render(<App />);

    expect(screen.getByText(/saved score recovered/i)).toBeInTheDocument();
    expect(screen.getByText(/invalid persisted high score/i)).toBeInTheDocument();
    expect(window.app?.getState().storageStatus).toBe('recovered');
  });

  it('wires generated screen actions to the playable runtime', async () => {
    const user = userEvent.setup();
    window.location.hash = '#fallback-main-menu';

    render(<App />);

    const generatedScreen = within(screen.getByRole('region', { name: /generated screen/i }));
    await user.click(generatedScreen.getByRole('button', { name: /start game/i }));

    await waitFor(() => expect(window.app?.getState().status).toBe('playing'));
    expect(window.location.hash).toBe('#fallback-game-board');

    await user.click(generatedScreen.getByRole('button', { name: /^pause$/i }));
    await waitFor(() => expect(window.app?.getState().status).toBe('paused'));
    expect(window.location.hash).toBe('#fallback-pause-overlay');

    await user.click(generatedScreen.getByRole('button', { name: /main menu/i }));
    await waitFor(() => expect(window.app?.getState().status).toBe('menu'));
    expect(window.location.hash).toBe('#fallback-main-menu');
  });

  it('restarts and shares from the generated pause overlay', async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(window.navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });
    window.location.hash = '#fallback-main-menu';

    render(<App />);

    const generatedScreen = within(screen.getByRole('region', { name: /generated screen/i }));
    await user.click(generatedScreen.getByRole('button', { name: /start game/i }));
    await waitFor(() => expect(window.app?.getState().status).toBe('playing'));

    act(() => {
      window.app?.hardDrop();
    });
    await waitFor(() => expect(window.app?.getState().score).toBeGreaterThan(0));

    await user.click(generatedScreen.getByRole('button', { name: /^pause$/i }));
    await waitFor(() => expect(window.app?.getState().status).toBe('paused'));

    await user.click(generatedScreen.getByRole('button', { name: /share score/i }));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith(expect.stringMatching(/Orbit Blocks score: \d+/)));

    await user.click(generatedScreen.getByRole('button', { name: /play again/i }));
    await waitFor(() => expect(window.app?.getState().score).toBe(0));
    expect(window.app?.getState().status).toBe('playing');
    expect(window.location.hash).toBe('#fallback-game-board');
  });
});
