// Blob.ts
import Phaser from 'phaser';

export class Blob extends Phaser.GameObjects.Sprite {
    raycastLine: Phaser.GameObjects.Line;

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, sizeCoefficient: number = 0.0625) {
        super(scene, x, y, texture);
        scene.add.existing(this);
        this.setDisplaySize(scene.scale.width * sizeCoefficient, scene.scale.width * sizeCoefficient);

        // Créer une ligne verte pour le raycast
        this.raycastLine = scene.add.line(0, 0, 0, -this.displayHeight / 2, 0, this.displayHeight / 2, 0x00ff00)
            .setOrigin(0.5, 0.5);
    }

    updateRaycast() {
        // Mettre à jour la position de la ligne pour qu'elle soit alignée avec le blob
        this.raycastLine.setTo(0, -this.displayHeight / 2, 0, this.displayHeight / 2);
        this.raycastLine.setPosition(this.x, this.y);
        this.raycastLine.setDisplaySize(1, this.displayHeight * 8);
        this.raycastLine.rotation = this.rotation;
    }

    jump() {
        this.scene.tweens.add({
            targets: this,
            y: this.y - 50, // Ajuster la hauteur du saut
            duration: 200,
            yoyo: true,
            ease: 'Power2'
        });
    }

    update() {
        this.updateRaycast(); // Mettre à jour la ligne de raycast à chaque frame
    }
}
