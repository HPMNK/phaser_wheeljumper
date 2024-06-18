// Blob.ts
import Phaser from 'phaser';

export class Blob extends Phaser.GameObjects.Container {
    blobSprite: Phaser.GameObjects.Sprite;
    raycastLine: Phaser.GameObjects.Line;
    velocityY: number;
    angleOfCollision: number;

    constructor(scene: Phaser.Scene, x: number, y: number, sizeCoefficient: number = 0.0625) {
        super(scene, x, y);
        scene.add.existing(this);

        this.blobSprite = scene.add.sprite(0, 0, 'blob');
        this.blobSprite.setDisplaySize(scene.scale.width * sizeCoefficient, scene.scale.width * sizeCoefficient);

        this.add(this.blobSprite);

        this.velocityY = 0;
        this.angleOfCollision = 0;

        this.raycastLine = scene.add.line(0, 0, 0, -this.blobSprite.displayHeight / 2, 0, this.blobSprite.displayHeight / 2, 0x00ff00)
            .setOrigin(0.5, 0.5);

        this.add(this.raycastLine);
    }

    static preload(scene: Phaser.Scene) {
        scene.load.image('blob', '/assets/Blob.png');
    }

    updateRaycast() {
        this.raycastLine.setTo(0, -this.blobSprite.displayHeight / 2, 0, this.blobSprite.displayHeight / 2);
        this.raycastLine.setPosition(this.blobSprite.x, this.blobSprite.y);
        this.raycastLine.setDisplaySize(1, this.blobSprite.displayHeight * 8);
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
        this.scene.tweens.add({
            targets: this,
            y: this.y - 50,
            duration: 200,
            yoyo: true,
            ease: 'Power2',
            onUpdate: () => {
                this.updateRaycast();
            }
        });
    }

    update() {
        this.updateRaycast();
    }
}
