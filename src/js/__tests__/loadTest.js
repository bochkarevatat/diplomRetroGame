import GameStateService from '../GameStateService';

test('GameStateService, metod load error', () => {
  const stateService = new GameStateService(null);
  expect(() => stateService.load()).toThrow('Invalid state');
});

test('GameStateService, metod save error', () => {
  const mock = {};
  mock.setItem = () => { };
  const stateService = new GameStateService(mock);

  expect(stateService.save()).toEqual(undefined);
});
