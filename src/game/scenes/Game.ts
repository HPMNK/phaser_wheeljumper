// Game.ts
import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { CircleObject } from '../CircleObject';
import { Blob } from '../Blob';

export class Game extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    circleObjects: CircleObject[] = [];
    blob: Blob;
    currentCircle: CircleObject | null = null;
    isGrounded: boolean;
    gravity: number;

    constructor() {
        super('Game');
        this.isGrounded = false;
        this.gravity = 0.5; // Augmenter la gravité pour des tests plus visibles
    }

    preload() {
        this.load.image('planet', '/assets/pixelplanet.png');
        Blob.preload(this);
    }

    create() {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x151d28);

        const { width, height } = this.scale;

        const circle1 = new CircleObject(this, width / 2, height / 2, 'planet', 0.01, 1.3);
        const circle2 = new CircleObject(this, width / 3, height / 3, 'planet', 0.02, 0.5);

        this.circleObjects.push(circle1, circle2);

        this.blob = new Blob(this, width / 2, 0);

        this.add.existing(this.blob);

        this.input.on('pointerdown', this.jump, this);

        EventBus.emit('current-scene-ready', this);
    }

    update(time: number, delta: number) {
        this.circleObjects.forEach(circle => {
            circle.update();
        });

        if (!this.isGrounded) {
            this.blob.applyGravity(this.gravity);
        } else if (this.currentCircle) {
            this.updateBlobAngle();
            this.updateBlobPosition();
        }

        this.blob.update();
        this.checkCollisions();
        console.log('isGrounded:', this.isGrounded); // Debug log
    }

    updateBlobPosition() {
        if (this.currentCircle && this.isGrounded) {
            const { x, y, radius } = this.currentCircle;

            const adjustedRadius = radius * 1.1;
            this.blob.x = x + adjustedRadius * Math.cos(this.blob.angleOfCollision);
            this.blob.y = y + adjustedRadius * Math.sin(this.blob.angleOfCollision);

            this.blob.rotation = this.blob.angleOfCollision + Math.PI / 2;
        }
    }

    updateBlobAngle() {
        if (this.currentCircle) {
            this.blob.angleOfCollision += this.currentCircle.rotationSpeed;
        }
    }

    jump() {
        if (this.isGrounded) {
            this.isGrounded = false;
            this.blob.jump();
        }
    }

    checkCollisions() {
        this.circleObjects.forEach(circle => {
            if (this.isColliding(this.blob, circle)) {
                if (!this.isGrounded && this.blob.velocityY > 0) {
                    this.currentCircle = circle;
                    this.isGrounded = true;
                    this.blob.resetVelocity();
                    this.blob.angleOfCollision = Phaser.Math.Angle.Between(circle.x, circle.y, this.blob.x, this.blob.y);
                    this.updateBlobPosition();
                }
            }
        });
    }

    isColliding(blob: Blob, circle: CircleObject): boolean {
        const distance = Phaser.Math.Distance.Between(blob.x, blob.y, circle.x, circle.y);
        return distance < circle.radius + blob.blobSprite.displayWidth / 2;
    }

    changeScene() {
        this.scene.start('GameOver');
    }
}
