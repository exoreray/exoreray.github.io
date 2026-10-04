import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import JourneyScroll from './JourneyScroll';

jest.mock('./JourneyFilmScene', () => ({
  __esModule: true,
  default: function UnavailableScene() {
    throw new Error('Error creating WebGL context.');
  },
}));

test('a failed WebGL scene leaves all chapters readable without a stuck loading notice', async () => {
  // React reports a caught boundary error to the console in development.
  const report = jest.spyOn(console, 'error').mockImplementation(() => {});
  try {
    render(<JourneyScroll active={false} />);
    await screen.findByText('The 3D scene is unavailable. All chapters remain readable.');
    expect(screen.getAllByRole('article')).toHaveLength(8);
    expect(screen.getByRole('heading', { name: 'Origins in Wangjing' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'The Heart' })).toBeInTheDocument();
    expect(screen.getAllByRole('status')).toHaveLength(1);
    expect(screen.queryByText(/^Loading /)).not.toBeInTheDocument();
  } finally {
    report.mockRestore();
  }
});
