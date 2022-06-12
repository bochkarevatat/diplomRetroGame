import Character from '../Character';
import Swordsman from '../types/Swordsman';

test('should throw an error', () => {
  expect(() => new Character(1)).toThrow('Ошибка создания класса Character');
});
test('class Character child', () => {
  expect(new Swordsman()).toEqual({
    attack: 40,
    defence: 10,
    health: 50,
    type: 'swordsman',
    distance: 4,
    distanceAttack: 1,
  });
});
