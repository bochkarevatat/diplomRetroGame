import {
  calcTileType, calcHealthLevel,
} from '../utils';

describe('should calcTileType function returns the correct tile', () => {
  test('should the tile matching ', () => {
    expect(calcTileType(0, 5)).toBe('top-left');
  });
  test('should the tile matching top', () => {
    expect(calcTileType(3, 5)).toBe('top');
  });
  test('should the tile matching bottom', () => {
    expect(calcTileType(22, 5)).toBe('bottom');
  });
  test('should the tile matching left', () => {
    expect(calcTileType(5, 5)).toBe('left');
  });
  test('should the tile matching right', () => {
    expect(calcTileType(14, 5)).toBe('right');
  });
  test('should the tile matching top-right', () => {
    expect(calcTileType(4, 5)).toBe('top-right');
  });
  test('should the tile matching bottom-left', () => {
    expect(calcTileType(20, 5)).toBe('bottom-left');
  });
  test('should the tile matching bottom-right', () => {
    expect(calcTileType(35, 6)).toBe('bottom-right');
  });
  test('should the tile matching center', () => {
    expect(calcTileType(8, 7)).toBe('center');
  });
});

test.each([
  [5, 'critical'],
  [14, 'critical'],
  [15, 'normal'],
  [30, 'normal'],
  [49, 'normal'],
  [50, 'high'],
  [80, 'high'],
  [100, 'high'],
])('Health status %s', (value, status) => {
  expect(calcHealthLevel(value)).toBe(status);
});
