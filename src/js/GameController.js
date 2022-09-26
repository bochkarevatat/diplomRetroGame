/* eslint-disable max-len */
import GamePlay from './GamePlay';
import GameState from './GameState';
import {
  generateTeam,
} from './generators';
import PositionedCharacter from './PositionedCharacter';
import Team from './Team';
import cursors from './cursors';
import themes from './themes';
import checkedPositions from './checkedPositions';

let selectedCharacterIndex = 0;
let checkedDistance;
let checkedDistanceAttack;
let checkedPosition;
let boardSize;

const icons = {
  level: '\u{1F396}',
  attack: '\u{2694}',
  defence: '\u{1F6E1}',
  health: '\u{2764}',
};
checkedPositions();

function getInfoCharacter(character) {
  return `${icons.level}${character.level} ${icons.attack}${character.attack} ${icons.defence}${character.defence} ${icons.health}${character.health}`;
}

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.initTheme = themes.prairie;
    this.cursors = cursors.pointer;
    this.currentMove = 'player';
    this.boardLocked = false;
    this.selectedCell = false;
    this.selectedCharacter = {};
    this.humanTeam = [];
    this.computerTeam = [];
    this.level = 1;
    this.point = 0;
    this.humanPositions = [];
    this.computerPositions = [];
  }

  init() {
    this.gamePlay.addNewGameListener(this.newGame.bind(this));
    this.gamePlay.addSaveGameListener(this.saveGame.bind(this));
    this.gamePlay.addLoadGameListener(this.loadGame.bind(this));
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
    this.gameStart();
  }

  gameStart() {
    this.currentMove = 'player';
    if (this.level === 1) {
      this.humanTeam = generateTeam(Team.getHumanTeam(), 1, 2);
      this.computerTeam = generateTeam(Team.getComputerTeam(), 1, 2);
      this.setPositionCharacter(this.humanTeam, this.computerTeam);
    } else if (this.level === 2) {
      this.initTheme = themes.desert;
      this.humanTeam = generateTeam(Team.getHumanTeam(), 1, 1);
      this.computerTeam = generateTeam(Team.getComputerTeam(), 2, (this.humanTeam.length + this.humanPositions.length));
      this.setPositionCharacter(this.humanTeam, this.computerTeam);
    } else if (this.level === 3) {
      this.initTheme = themes.arctic;
      this.humanTeam = generateTeam(Team.getHumanTeam(), 2, 2);
      this.computerTeam = generateTeam(Team.getComputerTeam(), 3, (this.humanTeam.length + this.humanPositions.length));
      this.setPositionCharacter(this.humanTeam, this.computerTeam);
    } else if (this.level === 4) {
      this.initTheme = themes.mountain;
      this.humanTeam = generateTeam(Team.getHumanTeam(), 3, 2);
      this.computerTeam = generateTeam(Team.getComputerTeam(), 4, (this.humanTeam.length + this.humanPositions.length));
      this.setPositionCharacter(this.humanTeam, this.computerTeam);
      return;
    }

    const characterPositions = this.getPositions(this.humanPositions.length);
    for (let i = 0; i < this.humanPositions.length; i += 1) {
      this.humanPositions[i].position = characterPositions.human[i];
      this.computerPositions[i].position = characterPositions.computer[i];
    }

    this.gamePlay.drawUi(this.initTheme);
    this.gamePlay.redrawPositions([...this.humanPositions, ...this.computerPositions]);
  }

  setPositionCharacter(humanTeam, computerTeam) {
    for (let i = 0; i < humanTeam.length; i += 1) {
      this.humanPositions.push(new PositionedCharacter(humanTeam[i], 0));
    }
    for (let i = 0; i < computerTeam.length; i += 1) {
      this.computerPositions.push(new PositionedCharacter(computerTeam[i], 0));
    }
  }

  // Персонажи генерируются рандомно в столбцах 1 и 2 для игрока и в столбцах 7 и 8 для компьютера:
  static randomPosition(column = 0) {
    return (Math.floor(Math.random() * 8) * 8) + ((Math.floor(Math.random() * 2) + column));
  }

  getPositions(length) {
    const position = {
      human: [],
      computer: [],
    };
    let random;
    for (let i = 0; i < length; i += 1) {
      do {
        random = this.randomPosition();
      } while (position.human.includes(random));
      position.human.push(random);

      do {
        random = this.randomPosition(6);
      } while (position.computer.includes(random));
      position.computer.push(random);
    }
    return position;
  }

  // выбор персонажа для следующего хода
  onCellClick(index) {
    this.index = index;
    if (!this.boardLocked) {
      if (this.getIndex([...this.humanPositions]) !== -1) {
        this.gamePlay.deselectCell(selectedCharacterIndex);
        this.gamePlay.selectCell(index);
        selectedCharacterIndex = index;
        this.selectedCharacter = [...this.humanPositions].find((item) => item.position === index);
        this.selectedCell = true;
      } else if (this.selectedCell && this.gamePlay.boardEl.style.cursor === 'pointer') {
        this.selectedCharacter.position = index;
        this.gamePlay.deselectCell(selectedCharacterIndex);
        this.gamePlay.deselectCell(index);
        this.selectedCell = false;
        this.gamePlay.redrawPositions([...this.humanPositions, ...this.computerPositions]); // Отрисовка команд
        this.currentMove = 'computer';
        this.computerStrategy();
      } else if (this.selectedCell && this.gamePlay.boardEl.style.cursor === 'crosshair') {
        const thisAttackComputer = [...this.computerPositions].find(
          (item) => item.position === index,
        );
        // GamePlay.showMessage("click")
        this.gamePlay.deselectCell(selectedCharacterIndex);
        this.gamePlay.deselectCell(index);
        this.gamePlay.setCursor(cursors.auto);
        this.selectedCell = false;
        this.characterAttacker(this.selectedCharacter.character, thisAttackComputer);
        if (this.computerPositions.length > 0) {
          this.computerStrategy();
        }
      } else if (this.getIndex([...this.computerPositions]) !== -1) {
        GamePlay.showMessage('Не ваш герой! Чур тебя!');
      }
    }
  }

  // отображения краткой информации о персонаже
  onCellEnter(index) {
    this.index = index;
    if (!this.boardLocked) {
      for (const item of [...this.humanPositions, ...this.computerPositions]) {
        if (item.position === index && this.getIndex(this.humanPositions) !== -1) { // есть ли в поле персонаж
          this.gamePlay.showCellTooltip(getInfoCharacter(item.character), index);
          this.gamePlay.setCursor(cursors.pointer);
        } else if (item.position === index && this.getIndex(this.computerPositions) !== -1) {
          this.gamePlay.showCellTooltip(getInfoCharacter(item.character), index);
          this.gamePlay.setCursor(cursors.notallowed);
        }
      }
      if (this.selectedCell) {
        checkedPosition = this.selectedCharacter.position;
        checkedDistance = this.selectedCharacter.character.distance;
        boardSize = this.gamePlay.boardSize;

        const checkPositions = checkedPositions(checkedPosition, checkedDistance, boardSize);

        checkedDistanceAttack = this.selectedCharacter.character.distanceAttack;
        const checkedAttack = checkedPositions(checkedPosition, checkedDistanceAttack, boardSize);

        if (this.getIndex(this.humanPositions) !== -1) {
          this.gamePlay.setCursor(cursors.pointer);
        } else if (checkPositions.includes(index) && this.getIndex([...this.humanPositions, ...this.computerPositions]) === -1) {
          this.gamePlay.selectCell(index, 'green');
          this.gamePlay.setCursor(cursors.pointer);
        } else if (checkedAttack.includes(index) && this.getIndex(this.computerPositions) !== -1) {
          this.gamePlay.selectCell(index, 'red');
          this.gamePlay.setCursor(cursors.crosshair);
        } else {
          this.gamePlay.setCursor(cursors.notallowed);
        }
      }
    }
  }

  onCellLeave(index) {
    // скрывает подсказку
    if (this.selectedCharacter.position !== index) {
      this.gamePlay.deselectCell(index);
    }
    this.gamePlay.hideCellTooltip(index);
    this.gamePlay.setCursor(cursors.auto);
  }

  newGame() {
    this.humanPositions = [];
    this.computerPositions = [];
    this.level = 1;
    this.point = 0;
    this.initTheme = themes.prairie;
    this.cursors = cursors.pointer;
    this.gameStart();
  }

  saveGame() {
    const humanLevel = {
      point: this.point,
      level: this.level,
      humanPositions: this.humanPositions,
      computerPositions: this.computerPositions,
    };
    this.stateService.save(GameState.from(humanLevel));
    GamePlay.showMessage('Игра сохранена, комрад!');
  }

  loadGame() {
    const loadState = this.stateService.load();
    if (loadState) {
      this.point = loadState.point;
      this.level = loadState.level;
      this.humanPositions = loadState.humanPositions;
      this.computerPositions = loadState.computerPositions;
      this.gamePlay.drawUi(this.initTheme);
      this.gamePlay.redrawPositions([...this.humanPositions, ...this.computerPositions]); // отрисовка команд
    }
  }

  getIndex(arr) {
    return arr.findIndex((item) => item.position === this.index);
  }

  async characterAttacker(attacker, target) {
    const targetedCharacter = target.character;
    let damage = Math.max(attacker.attack - targetedCharacter.defence, attacker.attack * 0.1);
    damage = Math.floor(damage);
    await this.gamePlay.showDamage(target.position, damage);
    targetedCharacter.health -= damage;
    this.currentMove = this.currentMove === 'computer' ? 'player' : 'computer';

    if (targetedCharacter.health <= 0) {
      this.humanPositions = this.humanPositions.filter(
        (item) => item.position !== target.position,
      );
      this.computerPositions = this.computerPositions.filter(
        (item) => item.position !== target.position,
      );
      if (this.humanPositions.length === 0) {
        GamePlay.showMessage('Игра закончилась');
        this.boardLocked = true;
      }
      if (this.computerPositions.length === 0) {
        for (const item of this.humanPositions) {
          this.point += item.character.health;
        }
        this.levelUp();
        this.level += 1;
        this.gameStart();
        GamePlay.showMessage('Новый уровень');
      }
    }
    this.gamePlay.redrawPositions([...this.humanPositions, ...this.computerPositions]);
  }

  levelUp() {
    for (const item of this.humanPositions) {
      const current = item.character;
      current.level += 1;
      current.attack = this.attackDefence(current.attack, current.health);
      current.defence = this.attackDefence(current.defence, current.health);
      current.health = (current.health + 80) < 100 ? current.health + 80 : 100;
    }
  }

  static attackDefence(attackBefore, life) {
    return Math.floor(Math.max(attackBefore, attackBefore * (1.8 - life / 100)));
  }

  async computersAttack(character, target) {
    await this.characterAttacker(character, target);
    this.currentMove = 'player';
  }

  // Компьютер
  computerStrategy() {
    if (this.currentMove === 'computer') {
      for (const computer of [...this.computerPositions]) {
        checkedDistanceAttack = this.selectedCharacter.character.distanceAttack;
        checkedPosition = computer.position;
        boardSize = this.gamePlay.boardSize;

        const checkedAttack = checkedPositions(
          checkedPosition,
          checkedDistanceAttack,
          boardSize,
        );

        const target = this.computerAttack(checkedAttack);
        if (target !== null) {
          this.computersAttack(computer.character, target);
          return;
        }
      }
      const randomIndex = Math.floor(Math.random() * [...this.computerPositions].length);
      const randomComputer = [...this.computerPositions][randomIndex];
      this.computerMove(randomComputer);
      this.gamePlay.redrawPositions([...this.humanPositions, ...this.computerPositions]);
      this.currentMove = 'player';
    }
  }

  // комьютер
  computerMove(itemComputer) {
    const currentComputerCharacter = itemComputer;
    const itemComputerDistance = itemComputer.character.distance;
    const itemComputerRow = this.positionRow(currentComputerCharacter.position);
    const itemComputerColumn = this.positionColumn(currentComputerCharacter.position);
    let distanceRow;
    let distanceColumn;
    let stepRow;
    let stepColumn;
    let Steps;
    let nearTarget = {};
    for (const itemUser of [...this.humanPositions]) {
      const itemUserRow = this.positionRow(itemUser.position);
      const itemUserColumn = this.positionColumn(itemUser.position);
      stepRow = itemComputerRow - itemUserRow;
      stepColumn = itemComputerColumn - itemUserColumn;
      Steps = Math.abs(stepRow) + Math.abs(stepColumn);

      if (nearTarget.steps === undefined || Steps < nearTarget.steps) {
        nearTarget = {
          steprow: stepRow,
          stepcolumn: stepColumn,
          steps: Steps,
          positionRow: itemUserRow,
          positionColumn: itemUserColumn,
        };
      }
    }

    if (Math.abs(nearTarget.steprow) === Math.abs(nearTarget.stepcolumn)) {
      if (Math.abs(nearTarget.steprow) > itemComputerDistance) {
        distanceRow = (itemComputerRow - (itemComputerDistance * Math.sign(nearTarget.steprow)));
        distanceColumn = (itemComputerColumn - (
          itemComputerDistance * Math.sign(nearTarget.stepcolumn)
        ));

        currentComputerCharacter.position = this.distanceIndex(distanceRow, distanceColumn);
      } else {
        distanceRow = (itemComputerRow - (
          nearTarget.steprow - (1 * Math.sign(nearTarget.steprow))
        ));
        distanceColumn = (itemComputerColumn - (
          nearTarget.stepcolumn - (1 * Math.sign(nearTarget.steprow))
        ));

        currentComputerCharacter.position = this.distanceIndex(distanceRow, distanceColumn);
      }
    } else if (nearTarget.stepcolumn === 0) {
      if (Math.abs(nearTarget.steprow) > itemComputerDistance) {
        distanceRow = (itemComputerRow - (itemComputerDistance * Math.sign(nearTarget.steprow)));
        currentComputerCharacter.position = this.distanceIndex(distanceRow, (itemComputerColumn));
      } else {
        distanceRow = (itemComputerRow - (
          nearTarget.steprow - (1 * Math.sign(nearTarget.steprow))
        ));
        currentComputerCharacter.position = this.distanceIndex(distanceRow, (itemComputerColumn));
      }
    } else if (nearTarget.steprow === 0) {
      if (Math.abs(nearTarget.stepcolumn) > itemComputerDistance) {
        distanceColumn = (itemComputerColumn - (
          itemComputerDistance * Math.sign(nearTarget.stepcolumn)
        ));
        currentComputerCharacter.position = this.distanceIndex((itemComputerRow), distanceColumn);
      } else {
        const tempFormul = (nearTarget.stepcolumn - (1 * Math.sign(nearTarget.stepcolumn)));
        distanceColumn = (itemComputerColumn - tempFormul);
        currentComputerCharacter.position = this.distanceIndex((itemComputerRow), distanceColumn);
      }
    } else if (Math.abs(nearTarget.steprow) > Math.abs(nearTarget.stepcolumn)) {
      if (Math.abs(nearTarget.steprow) > itemComputerDistance) {
        distanceRow = (itemComputerRow - (itemComputerDistance * Math.sign(nearTarget.steprow)));
        currentComputerCharacter.position = this.distanceIndex(distanceRow, (itemComputerColumn));
      } else {
        distanceRow = (itemComputerRow - (nearTarget.steprow));
        currentComputerCharacter.position = this.distanceIndex(distanceRow, (itemComputerColumn));
      }
    } else if (Math.abs(nearTarget.stepcolumn) > itemComputerDistance) {
      distanceColumn = (itemComputerColumn - (
        itemComputerDistance * Math.sign(nearTarget.stepcolumn)
      ));
      currentComputerCharacter.position = this.distanceIndex((itemComputerRow), distanceColumn);
    } else {
      currentComputerCharacter.position = this.distanceIndex((itemComputerRow), (itemComputerColumn));
    }
  }

  computerAttack(checkedAttack) {
    for (const itemUser of [...this.humanPositions]) {
      if (checkedAttack.includes(itemUser.position)) {
        return itemUser;
      }
    }

    return null;
  }

  positionRow(index) {
    return Math.floor(index / this.gamePlay.boardSize);
  }

  positionColumn(index) {
    return index % this.gamePlay.boardSize;
  }

  static distanceIndex(row, column) {
    return (row * 8) + column;
  }
}
