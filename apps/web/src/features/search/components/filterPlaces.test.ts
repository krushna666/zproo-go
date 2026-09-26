import { describe, expect, it } from 'vitest';
import { filterPlaces } from './filterPlaces';
import { AIRPORT_OPTIONS, STATION_OPTIONS } from './options';

describe('filterPlaces', () => {
  it('puts an exact code match first', () => {
    expect(filterPlaces(AIRPORT_OPTIONS, 'goi')[0]?.value).toBe('GOI');
  });

  it('matches city names by prefix before substrings', () => {
    const values = filterPlaces(AIRPORT_OPTIONS, 'mum').map((o) => o.value);
    expect(values[0]).toBe('BOM');
  });

  it('matches airport names, countries and station cities', () => {
    expect(filterPlaces(AIRPORT_OPTIONS, 'kempegowda').map((o) => o.value)).toEqual(['BLR']);
    expect(filterPlaces(AIRPORT_OPTIONS, 'emirates').map((o) => o.value)).toEqual(['DXB']);
    expect(filterPlaces(STATION_OPTIONS, 'goa').map((o) => o.value)).toEqual(['MAO']);
  });

  it('returns everything for an empty query and nothing for nonsense', () => {
    expect(filterPlaces(AIRPORT_OPTIONS, '  ')).toHaveLength(AIRPORT_OPTIONS.length);
    expect(filterPlaces(AIRPORT_OPTIONS, 'zzzz')).toEqual([]);
  });
});
