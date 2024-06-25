import { EventBus } from '../EventBus';
import Phaser, { Scene } from 'phaser';
import { CircleObject } from '../CircleObject';
import { Blob } from '../Blob';
import { Killzone } from '../Killzone'; // Importer la classe Killzone

export class Game extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    circleObjects: CircleObject[] = [];
    blob: Blob;
    currentCircle: CircleObject | null = null;
    lastCircle: CircleObject | null = null;
    fpsText: Phaser.GameObjects.Text;
    scoreText: Phaser.GameObjects.Text;
    score: number;
    circleGroup: Phaser.Physics.Arcade.StaticGroup;
    killzonesGroup: Phaser.Physics.Arcade.Group; // Utiliser un groupe normal pour les killzones

    // Paramètres pour le spawn des cercles
    minRadius: number = 0.80;
    maxRadius: number = 3;
    minDistance: number = 20;

    constructor() {
        super('Game');
        this.score = 0;
    }

    preload() {
        this.load.image('planet', '/assets/pixelplanet.png');
        this.load.image('planetMed', '/assets/pixelplanet70px.png');
        this.load.image('planetBig', '/assets/pixelplanet100px.png');
        this.load.spritesheet('blobSheet', '/assets/Blobsheet.png', { frameWidth: 48, frameHeight: 48 });
        Killzone.preload(this); // Charger le sprite Spike via Killzone
        Blob.preload(this);
    }

    create() {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x151d28);

        const { width, height } = this.scale;

        this.circleGroup = this.physics.add.staticGroup();
        this.killzonesGroup = this.physics.add.group(); // Utiliser un groupe normal pour les killzones

        this.generateCircles(width, height, 10);

        this.blob = new Blob(this, width / 2, 0);

        this.add.existing(this.blob);
        this.blob.create();

        this.input.on('pointerdown', this.jump, this);

        EventBus.emit('current-scene-ready', this);

        this.fpsText = this.add.text(width / 2, height / 2, '', { font: '16px Arial', color: '#00ff00' });
        this.fpsText.setScrollFactor(0);
        this.fpsText.setOrigin(0.5, 0.5);

        this.scoreText = this.add.text(10, 10, 'Score: 0', { font: '16px Arial', color: '#ffffff' }).setOrigin(0, 0);
        this.scoreText.setScrollFactor(0);

        this.fpsText.setVisible(true);
        this.scoreText.setVisible(true);

        this.physics.add.collider(this.blob.blobSprite, this.circleGroup, this.handleBlobCollision as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback, undefined, this);

        // Ajouter une collision entre le blob et les killzones
        this.physics.add.overlap(this.blob.blobSprite, this.killzonesGroup, this.handleKillzoneCollision as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback, undefined, this);
    }

    update(time: number, delta: number) {
        this.circleObjects.forEach(circle => {
            circle.update();
        });

        this.blob.update(this.circleObjects, this.killzonesGroup);

        this.fpsText.setText('FPS: ' + this.game.loop.actualFps.toFixed(2));

        this.score += delta / 1000;
        this.scoreText.setText('Score: ' + Math.floor(this.score));

        if (!this.blob.isGrounded) {
            this.cameras.main.startFollow(this.blob, true, 0.1, 0.3);
        }
    }

    handleBlobCollision(blobSprite: Phaser.Physics.Arcade.Sprite, circleSprite: Phaser.Physics.Arcade.Sprite) {
        const circle = this.circleObjects.find(c => c.x === circleSprite.x && c.y === circleSprite.y);
        if (circle) {
            this.blob.attachToCircle(circle);
        }
    }

    handleKillzoneCollision(blobSprite: Phaser.Physics.Arcade.Sprite, killzone: Phaser.Physics.Arcade.Sprite) {
        this.blob.die();
    }

    jump() {
        if (this.blob.isGrounded) {
            this.blob.jump();
        }
    }

    generateKillzones(circle: CircleObject, numKillzones: number) {
        const killzones: Killzone[] = [];
        const radius = circle.radius;
        const offset = 10; // Offset vers l'extérieur du cercle

        const container = this.add.container(circle.x, circle.y);
        container.setSize(circle.displayWidth, circle.displayHeight);
        this.physics.world.enable(container);

        for (let i = 0; i < numKillzones; i++) {
            let angle: number, x: number, y: number, overlap: boolean;

            do {
                angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
                x = (radius + offset) * Math.cos(angle);
                y = (radius + offset) * Math.sin(angle);

                overlap = killzones.some(kz => Phaser.Math.Distance.Between(x, y, kz.x, kz.y) < 20);
            } while (overlap);

            const killzone = new Killzone(this, x, y);
            const body = killzone.body as Phaser.Physics.Arcade.Body;

            // Calculer l'angle entre le centre du cercle et la position du pic pour la rotation
            const spikeAngle = Phaser.Math.Angle.Between(0, 0, x, y);
            killzone.setRotation(spikeAngle + Math.PI / 2); // Ajuster l'orientation du pic pour qu'il pointe vers l'extérieur

            container.add(killzone);
            killzones.push(killzone);

            this.killzonesGroup.add(killzone); // Ajouter le killzone au groupe de killzones
        }

        circle.setData('container', container);
    }

    generateCircles(width: number, height: number, numCircles: number) {
        for (let i = 0; i < numCircles; i++) {
            let valid = false;
            let x: number = 0;
            let y: number = 0;
            let radius: number = 0;
            let attempts = 0;
            const maxAttempts = 100;

            while (!valid && attempts < maxAttempts) {
                radius = Phaser.Math.FloatBetween(this.minRadius, this.maxRadius) * (this.scale.width / 16);

                x = Phaser.Math.Between(radius, width - radius);
                y = Phaser.Math.Between(radius, height - radius);

                valid = true;
                for (const circle of this.circleObjects) {
                    const dist = Phaser.Math.Distance.Between(x, y, circle.x, circle.y);
                    const requiredDistance = circle.displayWidth / 2 + radius + this.minDistance;
                    if (dist < requiredDistance) {
                        valid = false;
                        break;
                    }
                }

                attempts++;
            }

            if (valid) {
                const rotationSpeed = Phaser.Math.FloatBetween(0.01, 0.05) * (Phaser.Math.Between(0, 1) ? 1 : -1);

                let texture = 'planet';
                if (radius < 70) {
                    texture = 'planet';
                } else if (radius < 120) {
                    texture = 'planetMed';
                } else {
                    texture = 'planetBig';
                }

                const newCircle = new CircleObject(this, x, y, texture, rotationSpeed, radius / (this.scale.width / 16));
                newCircle.setDisplaySize(radius * 2, radius * 2);
                newCircle.setCircle(newCircle.width / 2);

                this.circleObjects.push(newCircle);
                this.circleGroup.add(newCircle);

                this.generateKillzones(newCircle, Phaser.Math.Between(1, 3)); // Placer entre 1 et 3 killzones par cercle
            }
        }
    }
}
