import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { CircleObject } from '../CircleObject'; // Assurez-vous d'importer la classe CircleObject

export class Game extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    circleObjects: CircleObject[] = [];
    blobSprite: Phaser.GameObjects.Sprite;
    rotationSpeed: number;
    angle: number;
    currentCircle: CircleObject;

    constructor() {
        super('Game');
        this.rotationSpeed = 0.01; // Définit la vitesse de rotation (en radians par frame)
        this.angle = 0; // Angle initial du blob par rapport au cercle
    }

    preload() {
        this.load.image('planet', '/assets/pixelplanet.png');
        this.load.image('blob', '/assets/Blob.png'); // Ajoutez une image pour le blob
    }

    create() {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x151d28);

        const { width, height } = this.scale;

        // Créer les objets cercle
        const circle1 = new CircleObject(this, width / 2, height / 2, 'planet', 0.01, 1.3);
        const circle2 = new CircleObject(this, width / 3, height / 3, 'planet', 0.02, 0.5);

        this.circleObjects.push(circle1, circle2);
        this.currentCircle = circle1; // Initialiser le cercle courant

        // Créer le sprite du blob
        this.blobSprite = this.add.sprite(0, 0, 'blob');
        this.blobSprite.setDisplaySize(width / 16, width / 16);

        // Positionner initialement le blob sur le bord du cercle actuel
        this.updateBlobPosition();

        // Ajouter un gestionnaire d'événements pour faire sauter le blob
        this.input.on('pointerdown', this.jump, this);

        EventBus.emit('current-scene-ready', this);
    }

    update(time: number, delta: number) {
        // Faire tourner le cercle
        this.angle += this.rotationSpeed;
        this.circleObjects.forEach(circle => {
            circle.update();
        });

        // Mettre à jour la position du blob
        this.updateBlobPosition();
    }

    updateBlobPosition() {
        const { x, y, radius } = this.currentCircle;

        // Calculer la nouvelle position du blob avec offset
        const offsetCoefficient = 0.1; // Ajustez ce coefficient pour rapprocher ou éloigner le blob du eentre du cercle
        const adjustedRadius = radius + (radius * offsetCoefficient); // On utilise une valeur relative au radius pour gérer l'offset et le rendre responsive 

        this.blobSprite.x = x + adjustedRadius * Math.cos(this.angle);
        this.blobSprite.y = y + adjustedRadius * Math.sin(this.angle);

        // Ajuster la rotation du blob pour qu'il soit orienté vers le centre du cercle
        this.blobSprite.rotation = this.angle + Math.PI / 2;
    }

    jump() {
        // Faire sauter le blob
        this.tweens.add({
            targets: this.blobSprite,
            y: this.blobSprite.y - 50, // Ajuster la hauteur du saut
            duration: 200,
            yoyo: true,
            ease: 'Power2'
        });

        // Vérifier les collisions après le saut
        this.checkCollisions();
    }

    checkCollisions() {
        this.circleObjects.forEach(circle => {
            if (this.isColliding(this.blobSprite, circle)) {
                this.currentCircle = circle;
            }
        });
    }

    isColliding(sprite: Phaser.GameObjects.Sprite, circle: CircleObject): boolean {
        const distance = Phaser.Math.Distance.Between(sprite.x, sprite.y, circle.x, circle.y);
        return distance < circle.radius + sprite.displayWidth / 2;
    }

    changeScene() {
        this.scene.start('GameOver');
    }
}
