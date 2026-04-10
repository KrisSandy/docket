import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---------------------------------------------------------------------------
// Mock Dexie before importing the module under test
// ---------------------------------------------------------------------------

const { mockGet, mockPut } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockPut: vi.fn(),
}));

vi.mock('@/db/database', () => ({
  db: {
    settings: { get: mockGet, put: mockPut },
  },
}));

import {
  DEFAULT_NOTIFY_TIME,
  DEFAULT_OFFSETS,
  SETTINGS_KEY,
  getDefaultPreferences,
  isValidTime,
  isValidOffsets,
  parsePreferences,
  loadPreferences,
  savePreferences,
  resolveOffsets,
  parseTime,
  type ReminderPreferences,
} from '@/lib/reminder-preferences';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

describe('constants', () => {
  it('DEFAULT_NOTIFY_TIME is 09:00', () => {
    expect(DEFAULT_NOTIFY_TIME).toBe('09:00');
  });

  it('DEFAULT_OFFSETS is [30, 7, 1]', () => {
    expect(DEFAULT_OFFSETS).toEqual([30, 7, 1]);
  });

  it('SETTINGS_KEY is reminder_preferences', () => {
    expect(SETTINGS_KEY).toBe('reminder_preferences');
  });
});

// ---------------------------------------------------------------------------
// getDefaultPreferences
// ---------------------------------------------------------------------------

describe('getDefaultPreferences', () => {
  it('returns a well-formed default', () => {
    const d = getDefaultPreferences();
    expect(d.schemaVersion).toBe(1);
    expect(d.notifyTimeLocal).toBe('09:00');
    expect(d.defaultOffsets).toEqual([30, 7, 1]);
  });

  it('returns a fresh object each call (no shared references)', () => {
    const a = getDefaultPreferences();
    const b = getDefaultPreferences();
    expect(a).not.toBe(b);
    expect(a.defaultOffsets).not.toBe(b.defaultOffsets);
  });
});

// ---------------------------------------------------------------------------
// isValidTime
// ---------------------------------------------------------------------------

describe('isValidTime', () => {
  it.each([
    ['00:00', true],
    ['09:00', true],
    ['23:59', true],
    ['12:30', true],
    ['00:01', true],
  ])('accepts "%s"', (input, expected) => {
    expect(isValidTime(input)).toBe(expected);
  });

  it.each([
    ['24:00', false],  // hours overflow
    ['9:00', false],   // single-digit hour
    ['23:60', false],  // minutes overflow
    ['25:30', false],  // hours too high
    ['abc', false],
    ['', false],
    ['12:0', false],   // single-digit minute
    ['1200', false],   // no colon
  ])('rejects "%s"', (input, expected) => {
    expect(isValidTime(input)).toBe(expected);
  });
});

// ---------------------------------------------------------------------------
// isValidOffsets
// ---------------------------------------------------------------------------

describe('isValidOffsets', () => {
  it('accepts an empty array', () => {
    expect(isValidOffsets([])).toBe(true);
  });

  it('accepts [30, 7, 1]', () => {
    expect(isValidOffsets([30, 7, 1])).toBe(true);
  });

  it('accepts [0] (day-of)', () => {
    expect(isValidOffsets([0])).toBe(true);
  });

  it('accepts [365] (max boundary)', () => {
    expect(isValidOffsets([365])).toBe(true);
  });

  it('rejects negative numbers', () => {
    expect(isValidOffsets([-1])).toBe(false);
  });

  it('rejects numbers > 365', () => {
    expect(isValidOffsets([366])).toBe(false);
  });

  it('rejects floats', () => {
    expect(isValidOffsets([7.5])).toBe(false);
  });

  it('rejects non-arrays', () => {
    expect(isValidOffsets('30')).toBe(false);
    expect(isValidOffsets(null)).toBe(false);
    expect(isValidOffsets(undefined)).toBe(false);
    expect(isValidOffsets(30)).toBe(false);
  });

  it('rejects arrays with non-number elements', () => {
    expect(isValidOffsets([30, '7', 1])).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// parsePreferences
// ---------------------------------------------------------------------------

describe('parsePreferences', () => {
  it('returns defaults for null input', () => {
    expect(parsePreferences(null)).toEqual(getDefaultPreferences());
  });

  it('returns defaults for undefined input', () => {
    expect(parsePreferences(undefined)).toEqual(getDefaultPreferences());
  });

  it('returns defaults for non-object input', () => {
    expect(parsePreferences('hello')).toEqual(getDefaultPreferences());
  });

  it('preserves valid fields', () => {
    const input = {
      notifyTimeLocal: '08:30',
      defaultOffsets: [14, 3],
    };
    const result = parsePreferences(input);
    expect(result.notifyTimeLocal).toBe('08:30');
    expect(result.defaultOffsets).toEqual([14, 3]);
  });

  it('replaces invalid notifyTimeLocal with default', () => {
    const result = parsePreferences({ notifyTimeLocal: 'noon' });
    expect(result.notifyTimeLocal).toBe('09:00');
  });

  it('replaces invalid defaultOffsets with default', () => {
    const result = parsePreferences({ defaultOffsets: 'bad' });
    expect(result.defaultOffsets).toEqual([30, 7, 1]);
  });

  it('ignores unknown fields from stored JSON', () => {
    const result = parsePreferences({
      notifyTimeLocal: '08:00',
      defaultOffsets: [7],
      categoryOverrides: { Vehicle: [30] }, // legacy field — silently ignored
    });
    expect(result.notifyTimeLocal).toBe('08:00');
    expect(result.defaultOffsets).toEqual([7]);
  });

  it('always sets schemaVersion to 1', () => {
    const result = parsePreferences({ schemaVersion: 42 });
    expect(result.schemaVersion).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// loadPreferences
// ---------------------------------------------------------------------------

describe('loadPreferences', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns defaults when no setting exists', async () => {
    mockGet.mockResolvedValue(undefined);
    const prefs = await loadPreferences();
    expect(prefs).toEqual(getDefaultPreferences());
    expect(mockGet).toHaveBeenCalledWith(SETTINGS_KEY);
  });

  it('returns defaults when setting value is empty', async () => {
    mockGet.mockResolvedValue({ key: SETTINGS_KEY, value: '' });
    const prefs = await loadPreferences();
    expect(prefs).toEqual(getDefaultPreferences());
  });

  it('parses stored JSON correctly', async () => {
    const stored: ReminderPreferences = {
      schemaVersion: 1,
      notifyTimeLocal: '07:00',
      defaultOffsets: [14, 1],
    };
    mockGet.mockResolvedValue({ key: SETTINGS_KEY, value: JSON.stringify(stored) });
    const prefs = await loadPreferences();
    expect(prefs.notifyTimeLocal).toBe('07:00');
    expect(prefs.defaultOffsets).toEqual([14, 1]);
  });

  it('returns defaults when DB throws', async () => {
    mockGet.mockRejectedValue(new Error('IndexedDB gone'));
    const prefs = await loadPreferences();
    expect(prefs).toEqual(getDefaultPreferences());
  });

  it('returns defaults when stored JSON is corrupt', async () => {
    mockGet.mockResolvedValue({ key: SETTINGS_KEY, value: '{bad json' });
    const prefs = await loadPreferences();
    expect(prefs).toEqual(getDefaultPreferences());
  });
});

// ---------------------------------------------------------------------------
// savePreferences
// ---------------------------------------------------------------------------

describe('savePreferences', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('persists validated preferences as JSON', async () => {
    const prefs: ReminderPreferences = {
      schemaVersion: 1,
      notifyTimeLocal: '08:00',
      defaultOffsets: [7, 1],
    };
    await savePreferences(prefs);
    expect(mockPut).toHaveBeenCalledWith({
      key: SETTINGS_KEY,
      value: JSON.stringify(prefs),
    });
  });

  it('validates before writing (replaces bad time with default)', async () => {
    const bad = {
      schemaVersion: 1 as const,
      notifyTimeLocal: 'midnight',
      defaultOffsets: [30],
    };
    await savePreferences(bad as unknown as ReminderPreferences);
    const written = JSON.parse(mockPut.mock.calls[0][0].value);
    expect(written.notifyTimeLocal).toBe('09:00');
  });
});

// ---------------------------------------------------------------------------
// resolveOffsets
// ---------------------------------------------------------------------------

describe('resolveOffsets', () => {
  const basePrefs: ReminderPreferences = {
    schemaVersion: 1,
    notifyTimeLocal: '09:00',
    defaultOffsets: [30, 7, 1],
  };

  it('uses global defaultOffsets (descending sort)', () => {
    expect(resolveOffsets(basePrefs, 'Vehicle')).toEqual([30, 7, 1]);
  });

  it('falls back to legacy DEFAULT_REMINDER_INTERVALS when global is empty', () => {
    const prefs = { ...basePrefs, defaultOffsets: [] };
    // Vehicle legacy: [60, 30, 14, 7]
    expect(resolveOffsets(prefs, 'Vehicle')).toEqual([60, 30, 14, 7]);
  });

  it('falls back to compile-time DEFAULT_OFFSETS when nothing else matches', () => {
    const prefs = { ...basePrefs, defaultOffsets: [] };
    expect(resolveOffsets(prefs, 'UnknownCategory')).toEqual([30, 7, 1]);
  });

  it('sorts results descending', () => {
    const prefs = { ...basePrefs, defaultOffsets: [1, 30, 7] };
    expect(resolveOffsets(prefs, 'Anything')).toEqual([30, 7, 1]);
  });
});

// ---------------------------------------------------------------------------
// parseTime
// ---------------------------------------------------------------------------

describe('parseTime', () => {
  it('parses "09:00" correctly', () => {
    expect(parseTime('09:00')).toEqual({ hours: 9, minutes: 0 });
  });

  it('parses "23:59" correctly', () => {
    expect(parseTime('23:59')).toEqual({ hours: 23, minutes: 59 });
  });

  it('parses "00:00" correctly', () => {
    expect(parseTime('00:00')).toEqual({ hours: 0, minutes: 0 });
  });

  it('throws on invalid input', () => {
    expect(() => parseTime('noon')).toThrow('Invalid time format');
    expect(() => parseTime('9:00')).toThrow('Invalid time format');
    expect(() => parseTime('')).toThrow('Invalid time format');
  });
});
