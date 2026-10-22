import { describe, expect, it } from 'vitest';
import { absoluteTime } from '../time';

describe('browser-local timestamps', () => {
  it('formats equivalent UTC and offset timestamps in the browser timezone', () => {
    const expected = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date('2026-10-21T10:00:00Z'));
    expect(absoluteTime('2026-10-21T10:00:00Z')).toBe(expected);
    expect(absoluteTime('2026-10-21T12:00:00+02:00')).toBe(expected);
  });
  it.each(['', 'not-a-date'])('does not display invalid timestamps: %s', value => {
    expect(absoluteTime(value)).toBe('');
  });
});
