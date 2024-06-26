import Phaser from 'phaser';
import { CircleObject } from './CircleObject';

export class Blob extends Phaser.GameObjects.Container {
    blobSprite: Phaser.GameObjects.Sprite;
    velocityY: number;
    velocityX: number;
    angleOfCollision: number;
    isJumping: boolean;
    gravityEnabled: boolean;
    isGrounded: boolean;
    gravity: number;
    currentCircle: CircleObject | null;
    lastCircle: CircleObject | null;
    isDead: boolean; // Ajouter un flag pour suivre l'état de mort
    body: Phaser.Physics.Arcade.Body; // Attacher le body directement au container

    constructor(scene: Phaser.Scene, x: number, y: number, sizeCoefficient: number = 0.1) {
        super(scene, x, y);
        scene.add.existing(this);

        this.blobSprite = scene.add.sprite(0, 0, 'blobSheet', 11);
        this.blobSprite.setDisplaySize(scene.scale.width * sizeCoefficient, scene.scale.width * sizeCoefficient);
        this.add(this.blobSprite);

        this.blobSprite.setPipeline('TextureTintPipeline');
        this.blobSprite.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);

        this.velocityY = 0;
        this.velocityX = 0;
        this.angleOfCollision = 0;
        this.isJumping = false;
        this.gravityEnabled = true;
        this.isGrounded = false;
        this.gravity = 0.5;
        this.currentCircle = null;
        this.lastCircle = null;
        this.isDead = false; // Initialiser le flag à false

        scene.physics.world.enable(this);
        this.body = this.body as Phaser.Physics.Arcade.Body;
        this.body.setCircle(this.blobSprite.width / 4);
        this.body.setOffset(-this.blobSprite.width / 4, -this.blobSprite.height / 4);
        this.body.setAllowGravity(false);
        this.body.immovable = true; // Rendre le collider immatériel
    }

    static preload(scene: Phaser.Scene) {
        scene.load.spritesheet('blobSheet', '/assets/Blobsheet.png', { frameWidth: 48, frameHeight: 48 });
    }

    create() {
        this.scene.anims.create({
            key: 'idle',
            frames: this.scene.anims.generateFrameNumbers('blobSheet', { start: 0, end: 7 }),
            frameRate: 17,
            repeat: -1
        });

        this.scene.anims.create({
            key: 'jumpLaunch',
            frames: this.scene.anims.generateFrameNumbers('blobSheet', { start: 8, end: 11 }),
            frameRate: 17,
            repeat: 0
        });

        this.scene.anims.create({
            key: 'land',
            frames: this.scene.anims.generateFrameNumbers('blobSheet', { start: 12, end: 21 }),
            frameRate: 17,
            repeat: 0
        });

        this.scene.anims.create({
            key: 'death',
            frames: this.scene.anims.generateFrameNumbers('blobSheet', { start: 22, end: 31 }),
            frameRate: 17,
            repeat: 0
        });
    }

    update(time: number, delta: number, circleObjects: CircleObject[], killzones: Phaser.Physics.Arcade.Group) {
        if (this.isDead) return;
        if (this.blobSprite) {
            if (!this.isGrounded) {
                this.applyGravity();
            } else if (this.currentCircle) {
                this.updateBlobAngle();
                this.updateBlobPosition();
            }

            this.checkCollisions(circleObjects);
        }
        this.updateColliderPosition();
    }

    applyGravity() {
        if (this.gravityEnabled) {
            this.velocityY += this.gravity;
        }
        this.y += this.velocityY;
        this.x += this.velocityX;
        if (this.blobSprite && !this.isDead) {
            this.blobSprite.setFrame(11);
        }
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

    updateColliderPosition() {
        const body = this.body as Phaser.Physics.Arcade.Body;
        body.x = this.x - body.halfWidth;
        body.y = this.y - body.halfHeight;
    }

    checkCollisions(circleObjects: CircleObject[]) {
        if (this.isDead) return;
        if (this.blobSprite) {
            circleObjects.forEach(circle => {
                if (this.isColliding(circle)) {
                    if (!this.isGrounded && (circle !== this.lastCircle || !this.isJumping)) {
                        if (circle !== this.lastCircle || this.isFarEnoughFromLastCircle()) {
                            this.attachToCircle(circle);
                        }
                    }
                }
            });
        }
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

    attachToCircle(circle: CircleObject) {
        if (this.isDead) return;
        if (this.blobSprite) {
            this.currentCircle = circle;
            this.isGrounded = true;
            this.resetVelocity();
            this.angleOfCollision = Phaser.Math.Angle.Between(circle.x, circle.y, this.x, this.y);
            this.updateBlobPosition();

            const body = this.body as Phaser.Physics.Arcade.Body;
            body.moves = false;

            this.blobSprite.play('land').once('animationcomplete', () => {
                if (this.blobSprite && !this.isDead) {
                    this.blobSprite.play('idle');
                }
            });

            this.scene.cameras.main.stopFollow();
            this.updateColliderPosition();
        }
    }

    jump() {
        if (this.isDead) return;
        if (this.isGrounded && this.blobSprite) {
            this.isJumping = true;
            this.isGrounded = false;

            if (this.currentCircle) {
                const jumpForce = 4;
                const angle = Phaser.Math.Angle.Between(this.currentCircle.x, this.currentCircle.y, this.x, this.y);

                this.velocityX = Math.cos(angle) * jumpForce;
                this.velocityY = Math.sin(angle) * jumpForce;

                this.lastCircle = this.currentCircle;
                this.currentCircle = null;
            }

            this.disableGravityTemporarily();

            const body = this.body as Phaser.Physics.Arcade.Body;
            body.moves = true;

            this.blobSprite.play('jumpLaunch').once('animationcomplete', () => {
                if (this.blobSprite && !this.isDead) {
                    this.blobSprite.setFrame(11);
                }
            });

            this.scene.cameras.main.startFollow(this, true, 0.5, 0.5);
        }
    }

    disableGravityTemporarily() {
        this.gravityEnabled = false;
        this.scene.time.delayedCall(500, () => {
            this.gravityEnabled = true;
            this.isJumping = false;
            if (this.blobSprite && !this.isDead) {
                this.blobSprite.setFrame(11);
            }
        });
    }

    resetVelocity() {
        this.velocityY = 0;
        this.velocityX = 0;
    }

    die() {
        if (this.isDead) return;
        this.isDead = true;

        const body = this.body as Phaser.Physics.Arcade.Body;
        body.destroy();

        this.blobSprite.play('death').once('animationcomplete', () => {
            this.blobSprite.destroy();
            this.scene.time.delayedCall(1000, () => {
                // this.scene.scene.start('GameOver');
            });
        });
    }
}
