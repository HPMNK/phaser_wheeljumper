import Phaser from 'phaser';

export class CircleObject extends Phaser.GameObjects.Sprite {
    radius: number;
    rotationSpeed: number;

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, rotationSpeed: number = 0.01, radiusCoefficient: number = 0.1) {
        super(scene, x, y, texture);
        scene.add.existing(this);
        this.setDisplaySize(scene.scale.width / 8, scene.scale.width / 8); // Ajustez la taille selon vos besoins
        this.radius = this.displayWidth / 2 * radiusCoefficient;
        this.setDisplaySize(this.radius * 2, this.radius * 2); // Ajuster la taille du sprite pour correspondre au rayon

        this.rotationSpeed = rotationSpeed; // Vitesse de rotation par défaut
    }

    update() {
        this.rotation += this.rotationSpeed; // Faire tourner le cercle
    }
}
