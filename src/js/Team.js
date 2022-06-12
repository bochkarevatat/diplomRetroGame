// export default class Team {
//   constructor() {
//     this.members = new Set();
//   }

//   add(character) {
//     if (this.members.has(character)) {
//       throw new Error('Такой персонаж уже есть');
//     }
//     this.members.add(character);
//   }

//   addAll(characters) {
//     this.members = new Set([...this.members, ...characters]);
//   }

//   delete(elem) {
//     this.members.delete(elem);
//   }

//   toArray() {
//     return [...this.members];
//   }

//   * [Symbol.iterator]() {
//     for (const person of this.members) {
//       yield person;
//     }
//   }
// }
import Swordsman from './types/Swordsman';
import Bowman from './types/Bowman';
import Magician from './types/Magician';
import Daemon from './types/Daemon';
import Vampire from './types/Vampire';
import Undead from './types/Undead';

export default class Team {
  static getHumanTeam() {
    return [Magician, Bowman, Swordsman];
  }

  static getComputerTeam() {
    return [Daemon, Undead, Vampire];
  }
}
