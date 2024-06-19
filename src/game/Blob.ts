import Phaser from 'phaser';
import { CircleObject } from './CircleObject';

export class Blob extends Phaser.GameObjects.Container {
    blobSprite: Phaser.GameObjects.Sprite;
    raycastLine: Phaser.GameObjects.Line;
    velocityY: number;
    velocityX: number;
    angleOfCollision: number;
    isJumping: boolean;
    gravityEnabled: boolean;
    isGrounded: boolean;
    gravity: number;
    currentCircle: CircleObject | null;
    lastCircle: CircleObject | null;

    constructor(scene: Phaser.Scene, x: number, y: number, sizeCoefficient: number = 0.0625) {
        super(scene, x, y);
        scene.add.existing(this);

        this.blobSprite = scene.add.sprite(0, 0, 'blob');
        this.blobSprite.setDisplaySize(scene.scale.width * sizeCoefficient, scene.scale.width * sizeCoefficient);
        this.add(this.blobSprite);

        this.velocityY = 0;
        this.velocityX = 0;
        this.angleOfCollision = 0;
        this.isJumping = false;
        this.gravityEnabled = true;
        this.isGrounded = false;
        this.gravity = 0.5;
        this.currentCircle = null;
        this.lastCircle = null;

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
        this.raycastLine.rotation = 0; // Garder la rotation du raycast verticale
    }

    applyGravity() {
        if (this.gravityEnabled) {
            this.velocityY += this.gravity;
        }
        this.y += this.velocityY;
        this.x += this.velocityX;
    }

    resetVelocity() {
        this.velocityY = 0;
        this.velocityX = 0;
    }

    jump() {
        console.log('Blob jump triggered');
        this.isJumping = true;

        if (this.isGrounded) {
            this.isGrounded = false; // Rendre grounded false immédiatement

            if (this.currentCircle) {
                const jumpForce = 15;
                const angle = Phaser.Math.Angle.Between(this.currentCircle.x, this.currentCircle.y, this.x, this.y);

                this.velocityX = Math.cos(angle) * jumpForce;
                this.velocityY = Math.sin(angle) * jumpForce;

                this.lastCircle = this.currentCircle;
                this.currentCircle = null;
            }

            this.disableGravityTemporarily();
        }
    }

    disableGravityTemporarily() {
        this.gravityEnabled = false;
        this.scene.time.delayedCall(500, () => {
            this.gravityEnabled = true;
            this.isJumping = false;
        });
    }

    update(circleObjects: CircleObject[], delta: number) {
        this.updateRaycast();

        if (!this.isGrounded) {
            this.applyGravity();
        } else if (this.currentCircle) {
            this.updateBlobAngle();
            this.updateBlobPosition();
        }

        this.checkCollisions(circleObjects);
    }

    updateBlobPosition() {
        if (this.currentCircle && this.isGrounded) {
            const { x, y, radius } = this.currentCircle;

            const adjustedRadius = radius * 1.1;
            this.x = x + adjustedRadius * Math.cos(this.angleOfCollision);
            this.y = y + adjustedRadius * Math.sin(this.angleOfCollision);

            this.rotation = this.angleOfCollision + Math.PI / 2;
        }
    }

    updateBlobAngle() {
        if (this.currentCircle) {
            this.angleOfCollision += this.currentCircle.rotationSpeed;
        }
    }

    checkCollisions(circleObjects: CircleObject[]) {
        circleObjects.forEach(circle => {
            if (this.isColliding(circle)) {
                if (!this.isGrounded && (circle !== this.lastCircle || !this.isJumping)) {
                    if (circle !== this.lastCircle || this.isFarEnoughFromLastCircle()) {
                        this.currentCircle = circle;
                        this.isGrounded = true;
                        this.resetVelocity();
                        this.angleOfCollision = Phaser.Math.Angle.Between(circle.x, circle.y, this.x, this.y);
                        this.updateBlobPosition();
                    }
                }
            }
        });
    }
    isColliding(circle: CircleObject): boolean {
        const distance = Phaser.Math.Distance.Between(this.x, this.y, circle.x, circle.y);
        return distance < circle.radius + this.blobSprite.displayWidth / 2;
    }

    isFarEnoughFromLastCircle(): boolean {
        if (!this.lastCircle) return true;
        const distance = Phaser.Math.Distance.Between(this.x, this.y, this.lastCircle.x, this.lastCircle.y);
        return distance > this.blobSprite.displayWidth;
    }
}
