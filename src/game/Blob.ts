// Blob.ts
import Phaser from 'phaser';

export class Blob extends Phaser.GameObjects.Container {
    blobSprite: Phaser.GameObjects.Sprite;
    raycastLine: Phaser.GameObjects.Line;
    velocityY: number;
    angleOfCollision: number;
    isJumping: boolean;

    constructor(scene: Phaser.Scene, x: number, y: number, sizeCoefficient: number = 0.0625) {
        super(scene, x, y);
        scene.add.existing(this);

        this.blobSprite = scene.add.sprite(0, 0, 'blob');
        this.blobSprite.setDisplaySize(scene.scale.width * sizeCoefficient, scene.scale.width * sizeCoefficient);
        this.add(this.blobSprite);

        this.velocityY = 0;
        this.angleOfCollision = 0;
        this.isJumping = false;

        this.raycastLine = scene.add.line(0, 0, 0, -this.blobSprite.displayHeight / 2, 0, this.blobSprite.displayHeight / 2, 0x00ff00)
            .setOrigin(0.5, 0.5);
        this.add(this.raycastLine);
    }

    static preload(scene: Phaser.Scene) {
        scene.load.image('blob', '/assets/Blob.png');
    }

    updateRaycast() {
        this.raycastLine.setTo(0, -this.blobSprite.displayHeight / 2, 0, this.blobSprite.displayHeight / 2);
        this.raycastLine.setPosition(0, 0);
        this.raycastLine.rotation = 0;
    }

    applyGravity(gravity: number) {
        this.velocityY += gravity;
        this.y += this.velocityY;
    }

    resetVelocity() {
        this.velocityY = 0;
    }

    jump() {
        console.log('Blob jump triggered');
        this.isJumping = true;
        this.velocityY = -15; // Impulsion vers le haut
    }

    update() {
        this.updateRaycast();

        if (this.isJumping) {
            this.applyGravity(0.2); // Appliquer la gravité pendant le saut

            if (this.velocityY >= 0) {
                this.isJumping = false;
            }
        }
    }
}
