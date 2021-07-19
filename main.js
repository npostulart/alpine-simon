import Alpine from 'alpinejs';
import sound1Url from './audio/simonSound1.mp3';
import sound2Url from './audio/simonSound2.mp3';
import sound3Url from './audio/simonSound3.mp3';
import sound4Url from './audio/simonSound4.mp3';
import './style.css';

function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function playAudio(audioUrl) {
  return new Promise((res) => {
    const audio = new Audio(audioUrl);
    audio.play();
    audio.onended = res;
  })
}

Alpine.data('game', () => ({
  items: {
    'top': {
      activeCount: 0,
      audioUrl: sound1Url,
    },
    'right': {
      activeCount: 0,
      audioUrl: sound2Url,
    },
    'left': {
      activeCount: 0,
      audioUrl: sound3Url,
    },
    'bottom': {
      activeCount: 0,
      audioUrl: sound4Url,
    },
  },
  blocked: true,
  lost: false,

  simonEntries: [],
  userEntries: [],

  async blink(dir) {
    this.items[dir].activeCount += 1;
    await playAudio(this.items[dir].audioUrl);
    this.items[dir].activeCount -= 1;
  },

  async nextRound() {
    this.blocked = true;
    this.userEntries = [];
    this.simonEntries.push(
      Object.keys(this.items).sort(() => 0.5 - Math.random())[0]
    );

    for (const dir of this.simonEntries) {
      await this.blink(dir);
      await sleep(300);
    }

    this.blocked = false;
  },

  async enter(dir) {
    if (this.blocked || this.everyEntered) return;
    this.userEntries.push(dir);
    this.blink(dir);

    if (
      this.userEntries.some(
        (value, index) => value !== this.simonEntries[index]
      )
    ) {
      this.setLost();
      return;
    }

    // every entered
    if (this.everyEntered) {
      await sleep(1500);
      await this.nextRound();
    }
  },

  setLost() {
    this.lost = true;
    this.blocked = true;
  },

  isActive(dir) {
    return this.items[dir].activeCount > 0;
  },

  get round() {
    return Math.max(this.simonEntries.length, 0);
  },

  get wonRounds() {
    return Math.max(this.round - 1, 0);
  },

  get everyEntered() {
    return this.userEntries.length === this.simonEntries.length;
  },

  get running() {
    return this.simonEntries.length !== 0 && !this.lost;
  },

  startGame() {
    this.simonEntries = [];
    this.userEntries = [];
    this.lost = false;
    this.blocked = false;

    this.nextRound();
  },
}));

window.Alpine = Alpine;
Alpine.start();
