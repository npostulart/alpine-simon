import Alpine from 'alpinejs';
import './style.css';

import sound1Url from './audio/simonSound1.mp3';
import sound2Url from './audio/simonSound2.mp3';
import sound3Url from './audio/simonSound3.mp3';
import sound4Url from './audio/simonSound4.mp3';

function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function playAudio(audio) {
  return new Promise((res) => {
    audio.play();
    audio.onended = res;
  });
}

Alpine.data('game', () => ({
  items: {
    'top-left': {
      active: false,
      audio: new Audio(sound1Url),
    },
    'top-right': {
      active: false,
      audio: new Audio(sound2Url),
    },
    'bottom-left': {
      active: false,
      audio: new Audio(sound3Url),
    },
    'bottom-right': {
      active: false,
      audio: new Audio(sound4Url),
    },
  },
  running: false,
  blocked: true,
  lost: false,

  simonEntries: [],
  userEntries: [],

  async nextRound() {
    this.blocked = true;
    this.userEntries = [];
    this.simonEntries.push(
      Object.keys(this.items).sort(() => 0.5 - Math.random())[0]
    );

    for (const dir of this.simonEntries) {
      this.items[dir].active = true;
      await playAudio(this.items[dir].audio);
      this.items[dir].active = false;
      await sleep(500);
    }

    this.blocked = false;
  },

  async enter(dir) {
    if (this.blocked) return;
    this.blocked = true;
    this.userEntries.push(dir);
    this.items[dir].active = true;
    await playAudio(this.items[dir].audio);
    this.items[dir].active = false;

    // every entered
    if (this.userEntries.length === this.simonEntries.length) {
      // correct
      if (
        this.userEntries.every(
          (value, index) => value === this.simonEntries[index]
        )
      ) {
        await sleep(1000);
        await this.nextRound();
      } else {
        this.setLost();
      }
      // still playing
    } else {
      // still correct
      if (
        this.userEntries.every(
          (value, index) => value === this.simonEntries[index]
        )
      ) {
        this.blocked = false;
        return;
      } else {
        this.setLost();
      }
    }
  },

  setLost() {
    this.lost = true;
    this.running = false;
    this.blocked = true;
  },

  isActive(dir) {
    return this.items[dir].active;
  },

  round() {
    return Math.max(this.simonEntries.length, 0);
  },

  wonRounds() {
    return Math.max(this.round() - 1, 0);
  },

  startGame() {
    this.simonEntries = [];
    this.userEntries = [];
    this.lost = false;
    this.running = true;
    this.blocked = false;

    this.nextRound();
  },
}));

window.Alpine;
Alpine.start();
