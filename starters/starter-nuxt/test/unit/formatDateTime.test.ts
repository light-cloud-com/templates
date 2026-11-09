import { describe, expect, it } from 'vitest'
import { formatDateTime } from '../../app/utils/formatDateTime'

describe('formatDateTime', () => {
  it('formats in UTC to the minute', () => {
    expect(formatDateTime(new Date('2026-01-31T14:05:59.123Z'))).toBe('2026-01-31 14:05 UTC')
  })
})
