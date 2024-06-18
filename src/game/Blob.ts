// Blob.ts
import Phaser from 'phaser';

export class Blob extends Phaser.GameObjects.Container {
    blobSprite: Phaser.GameObjects.Sprite;
    raycastLine: Phaser.GameObjects.Line;
    velocityY: number; // Ajouter une propriété pour la vitesse verticale

    constructor(scene: Phaser.Scene, x: number, y: number, sizeCoefficient: number = 0.0625) {
        super(scene, x, y);
        scene.add.existing(this);

        // Créer le sprite du blob avec la texture spécifiée
        this.blobSprite = scene.add.sprite(0, 0, 'blob');
        this.blobSprite.setDisplaySize(scene.scale.width * sizeCoefficient, scene.scale.width * sizeCoefficient);

        this.add(this.blobSprite);

        this.velocityY = 0; // Initialiser la vitesse verticale à zéro

        // Créer une ligne verte pour le raycast
        this.raycastLine = scene.add.line(0, 0, 0, -this.blobSprite.displayHeight / 2, 0, this.blobSprite.displayHeight / 2, 0x00ff00)
            .setOrigin(0.5, 0.5);

        this.add(this.raycastLine);
    }

    static preload(scene: Phaser.Scene) {
        scene.load.image('blob', '/assets/Blob.png'); // Charger l'image pour le blob
    }

    updateRaycast() {
        // Mettre à jour la position de la ligne pour qu'elle soit alignée avec le blob
        this.raycastLine.setTo(0, -this.blobSprite.displayHeight / 2, 0, this.blobSprite.displayHeight / 2);
        this.raycastLine.setPosition(this.blobSprite.x, this.blobSprite.y);
        this.raycastLine.setDisplaySize(1, this.blobSprite.displayHeight * 8);
        this.raycastLine.rotation = this.rotation;
    }

    applyGravity(gravity: number) {
        this.velocityY += gravity;
        this.y += this.velocityY;
    }

    resetVelocity() {
        this.velocityY = 0;
    }

    jump() {
        this.scene.tweens.add({
            targets: this,
            y: this.y - 50, // Ajuster la hauteur du saut
            duration: 200,
            yoyo: true,
            ease: 'Power2',
            onUpdate: () => {
                this.updateRaycast();
            }
        });
    }

    update() {
        this.updateRaycast(); // Mettre à jour la ligne de raycast à chaque frame
    }
}
