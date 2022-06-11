/**
 * Generates random characters
 *
 * @param allowedTypes iterable of classes
 * @param maxLevel max character level
 * @returns Character type children (ex. Magician, Bowman, etc)
 */
export function* characterGenerator(allowedTypes, maxLevel) {
  // TODO: write logic here
  while (true) {
    const charType = Math.floor(Math.random() * allowedTypes.length);
    const charLevel = Math.floor(1 + (Math.random() * maxLevel));
    yield new allowedTypes[charType](charLevel);
  }
}

export function generateTeam(allowedTypes, maxLevel, characterCount) {
  // TODO: write logic here
  const team = [];
  const char = characterGenerator(allowedTypes, maxLevel);

  for (let i = 0; i < characterCount; i += 1) {
    team.push(char.next().value);
  }

  return team;
}
