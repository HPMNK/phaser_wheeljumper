// Killzone.ts
import Phaser from 'phaser';

export class Killzone extends Phaser.Physics.Arcade.Sprite {
    constructor(scene: Phaser.Scene, x: number, y: number, texture: string = 'spike') {
        super(scene, x, y, texture);

        // Configurer le sprite
        this.setOrigin(0.5, 0.5);
        this.setDisplaySize(30, 30); // Ajuster la taille des pics si nécessaire

        // Ajouter le sprite à la scène
        scene.add.existing(this);

        // Activer la physique pour le sprite
        scene.physics.world.enable(this);
        const body = this.body as Phaser.Physics.Arcade.Body;
        body.setSize(this.displayWidth * 0.5, this.displayHeight * 0.5);
        body.setOffset(0, this.displayHeight * 0.25);
        body.setAllowGravity(false);
    }

    update() {
        // Ajouter des mises à jour personnalisées si nécessaire
    }

    static preload(scene: Phaser.Scene) {
        scene.load.image('spike', '/assets/Spike.png');
    }
}
