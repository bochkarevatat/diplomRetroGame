/**
 * Generates random characters
 *
 * @param allowedTypes iterable of classes
 * @param maxLevel max character level
 * @returns Character type children (ex. Magician, Bowman, etc)
 */
import Team from './Team';
import side from './side';

export function* characterGenerator(allowedTypes, maxLevel) {
  const indexTypes = Math.floor(Math.random() * allowedTypes.length);
  const indexLevel = Math.floor(Math.random() * maxLevel) + 1;
  yield new allowedTypes[indexTypes](indexLevel);
}

export function generateTeam(allowedTypes, maxLevel, characterCount) {
  const team = new Team();
  for (let i = 0; i < characterCount; i += 1) {
    team.add(characterGenerator(allowedTypes, maxLevel));
  }
  return team;
}
