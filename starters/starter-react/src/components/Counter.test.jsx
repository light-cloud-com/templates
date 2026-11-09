import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Counter from './Counter.jsx'

describe('Counter', () => {
  it('counts clicks', () => {
    render(<Counter />)
    const button = screen.getByRole('button', { name: 'Count is 0' })
    fireEvent.click(button)
    expect(button).toHaveTextContent('Count is 1')
  })
})
