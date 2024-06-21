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

    constructor(scene: Phaser.Scene, x: number, y: number, sizeCoefficient: number = 0.1) {
        super(scene, x, y);
        scene.add.existing(this);

        this.blobSprite = scene.add.sprite(0, 0, 'blobSheet', 11); // Initialiser avec la frame 12 (index 11)
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

        scene.physics.world.enable(this.blobSprite);
        const body = this.blobSprite.body as Phaser.Physics.Arcade.Body;
        body.setCircle(this.blobSprite.width / 4); // 24 est la moitié de 48, ce qui correspond au rayon pour une tile de 48x48
        body.setOffset(this.blobSprite.width / 4, this.blobSprite.height / 4); // Centrer le corps physique sur le sprite
        body.setAllowGravity(false);



    }

    static preload(scene: Phaser.Scene) {
        scene.load.spritesheet('blobSheet', '/assets/Blobsheet.png', { frameWidth: 48, frameHeight: 48 });
    }

    create() {
        // Créer les animations
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
    }


    update(circleObjects: CircleObject[]) {
        if (!this.isGrounded) {
            this.applyGravity();
        } else if (this.currentCircle) {
            this.updateBlobAngle();
            this.updateBlobPosition();
        }

        this.checkCollisions(circleObjects);
    }

    applyGravity() {
        if (this.gravityEnabled) {
            this.velocityY += this.gravity;
        }
        this.y += this.velocityY;
        this.x += this.velocityX;
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
                        this.attachToCircle(circle);
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

    attachToCircle(circle: CircleObject) {
        this.currentCircle = circle;
        this.isGrounded = true;
        this.resetVelocity();
        this.angleOfCollision = Phaser.Math.Angle.Between(circle.x, circle.y, this.x, this.y);
        this.updateBlobPosition();

        const body = this.blobSprite.body as Phaser.Physics.Arcade.Body;
        body.moves = false; // Désactiver les mouvements automatiques du corps pour simuler un joint

        this.blobSprite.play('land').once('animationcomplete', () => {
            this.blobSprite.play('idle');
        });

        this.scene.cameras.main.stopFollow();



    }

    jump() {
        console.log('Blob jump triggered');
        this.isJumping = true;

        if (this.isGrounded) {
            this.isGrounded = false;

            if (this.currentCircle) {
                const jumpForce = 7;
                const angle = Phaser.Math.Angle.Between(this.currentCircle.x, this.currentCircle.y, this.x, this.y);

                this.velocityX = Math.cos(angle) * jumpForce;
                this.velocityY = Math.sin(angle) * jumpForce;

                this.lastCircle = this.currentCircle;
                this.currentCircle = null;
            }

            this.disableGravityTemporarily();

            const body = this.blobSprite.body as Phaser.Physics.Arcade.Body;
            body.moves = true; // Réactiver les mouvements automatiques du corps pour simuler un saut

            this.blobSprite.play('jumpLaunch').once('animationcomplete', () => {
                this.blobSprite.setFrame(11); // Fixer sur la dernière frame de l'animation
            });

            this.scene.cameras.main.startFollow(this, true, 2, 2);

        }
    }

    disableGravityTemporarily() {
        this.gravityEnabled = false;
        this.scene.time.delayedCall(500, () => {
            this.gravityEnabled = true;
            this.isJumping = false;
            this.blobSprite.setFrame(11);

        });
    }

    resetVelocity() {
        this.velocityY = 0;
        this.velocityX = 0;
    }
}
