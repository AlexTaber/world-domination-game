import Phaser from 'phaser';

export const config = {
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#100c08',
  physics: {
    default: 'arcade',
    arcade: {
        gravity: { y: 0 },
        debug: false
    }
  },
  scale: {
    width: 920,
    height: 800,
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};
