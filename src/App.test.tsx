import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import App from './App';

describe('Orbit Blocks app', () => {
  afterEach(() => {
    window.localStorage.clear();
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
});
