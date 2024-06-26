import { Boot } from './scenes/Boot';
import { GameOver } from './scenes/GameOver';
import { Game as MainGame } from './scenes/Game';
import { MainMenu } from './scenes/MainMenu';
import { AUTO, Game } from 'phaser';
import { Preloader } from './scenes/Preloader';

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    width: 600,
    height: 768,
    parent: 'game-container',
    backgroundColor: '#028af8',
    fps: {
        target: 60,
        min: 30,
        forceSetTimeOut: true

    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 0 }, // Nous ne voulons pas de gravité par défaut
            debug: true // Activez le mode débogage pour visualiser les corps physiques
        }
    },
    scene: [
        Boot,
        Preloader,
        MainMenu,
        MainGame,
        GameOver
    ]

};

const StartGame = (parent: string) => {

    return new Game({ ...config, parent });

}

export default StartGame;
