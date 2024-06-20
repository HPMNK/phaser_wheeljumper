import { EventBus } from '../EventBus';
import Phaser, { Scene } from 'phaser';
import { CircleObject } from '../CircleObject';
import { Blob } from '../Blob';

export class Game extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    circleObjects: CircleObject[] = [];
    blob: Blob;
    currentCircle: CircleObject | null = null;
    lastCircle: CircleObject | null = null;
    fpsText: Phaser.GameObjects.Text; // Ajout de la propriété fpsText
    scoreText: Phaser.GameObjects.Text;
    score: number;
    circleGroup: Phaser.Physics.Arcade.StaticGroup;


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
        this.load.spritesheet('blobSheet', '/assets/Blobsheet.png', { frameWidth: 48, frameHeight: 48 });

        Blob.preload(this);
    }

    create() {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x151d28);

        const { width, height } = this.scale;

        this.circleGroup = this.physics.add.staticGroup();

        this.generateCircles(width, height, 10);



        this.blob = new Blob(this, width / 2, 0);

        this.add.existing(this.blob);
        this.blob.create(); // Appeler la méthode create de Blob pour initialiser les animations


        this.input.on('pointerdown', this.jump, this);

        EventBus.emit('current-scene-ready', this);

        // Vérifier les coordonnées et le style du texte
        this.fpsText = this.add.text(width / 2, height / 2, '', { font: '16px Arial', color: '#00ff00' });
        this.fpsText.setScrollFactor(0); // Empêche le texte de se déplacer avec la caméra
        this.fpsText.setOrigin(0.5, 0.5); // Centrer le texte par rapport à ses coordonnées

        this.scoreText = this.add.text(10, 10, 'Score: 0', { font: '16px Arial', color: '#ffffff' }).setOrigin(0, 0);
        this.scoreText.setScrollFactor(0);

        // Vérifier la visibilité du texte
        this.fpsText.setVisible(true);
        this.scoreText.setVisible(true);

        this.physics.add.collider(this.blob.blobSprite, this.circleGroup, this.handleBlobCollision as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback, undefined, this);
    }

    update(time: number, delta: number) {
        this.circleObjects.forEach(circle => {
            circle.update();
        });

        this.blob.update(this.circleObjects);

        this.fpsText.setText('FPS: ' + this.game.loop.actualFps.toFixed(2));

        this.score += delta / 1000;
        this.scoreText.setText('Score: ' + Math.floor(this.score));

        console.log('isGrounded:', this.blob.isGrounded);
    }

    handleBlobCollision(blobSprite: Phaser.Physics.Arcade.Sprite, circleSprite: Phaser.Physics.Arcade.Sprite) {
        const circle = this.circleObjects.find(c => c.x === circleSprite.x && c.y === circleSprite.y);
        if (circle) {
            this.blob.attachToCircle(circle);
        }
    }

    jump() {
        if (this.blob.isGrounded) {
            this.blob.jump();
        }
    }

    generateCircles(width: number, height: number, numCircles: number) {
        for (let i = 0; i < numCircles; i++) {
            let valid = false;
            let x: number = 0;
            let y: number = 0;
            let radius: number = 0;
            let attempts = 0;
            const maxAttempts = 100; // Limiter le nombre de tentatives

            while (!valid && attempts < maxAttempts) {
                radius = Phaser.Math.FloatBetween(this.minRadius, this.maxRadius) * (this.scale.width / 16); // Ajuster ici

                x = Phaser.Math.Between(radius, width - radius);
                y = Phaser.Math.Between(radius, height - radius);

                valid = true;
                for (const circle of this.circleObjects) {
                    const dist = Phaser.Math.Distance.Between(x, y, circle.x, circle.y);
                    // Vérifier la distance en incluant les rayons des cercles
                    const requiredDistance = circle.displayWidth / 2 + radius + this.minDistance;
                    if (dist < requiredDistance) {
                        valid = false;
                        break;
                    }
                }

                attempts++;
            }

            if (valid) {
                // Utiliser le radius généré pour définir la taille du cercle
                const newCircle = new CircleObject(this, x, y, 'planet', Phaser.Math.FloatBetween(0.01, 0.05), radius / (this.scale.width / 16));
                this.circleObjects.push(newCircle);
                this.circleGroup.add(newCircle);
            }
        }
    }

}
