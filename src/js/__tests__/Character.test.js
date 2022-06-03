import Character from '../Character';

test('should throw an error', () => {
  expect(() => new Character(1)).toThrow('Ошибка создания класса Character');
});
