import { render, screen } from '@solidjs/testing-library';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import Counter from './Counter';

describe('Counter', () => {
  it('counts clicks', async () => {
    render(() => <Counter />);
    const button = screen.getByRole('button', { name: 'Count is 0' });
    await userEvent.click(button);
    expect(button).toHaveTextContent('Count is 1');
  });
});
