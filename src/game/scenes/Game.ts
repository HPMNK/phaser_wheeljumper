// Game.ts
import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { CircleObject } from '../CircleObject';
import { Blob } from '../Blob'; // Importer la classe Blob

export class Game extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    circleObjects: CircleObject[] = [];
    blob: Blob;
    rotationSpeed: number;
    angle: number;
    currentCircle: CircleObject;
    isGrounded: boolean;
    gravity: number;


    constructor() {
        super('Game');
        this.rotationSpeed = 0.01; // Définit la vitesse de rotation (en radians par frame)
        this.angle = 0; // Angle initial du blob par rapport au cercle
        this.isGrounded = false; // Initialiser le drapeau au sol
        this.gravity = 0.1; // Définir la gravité

    }

    preload() {
        this.load.image('planet', '/assets/pixelplanet.png');
        Blob.preload(this); // Appeler la méthode de préchargement du blob
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

        // Créer le blob en utilisant la texture 'blob'
        this.blob = new Blob(this, width / 2, 0);

        // Ajouter le blob à la scène
        this.add.existing(this.blob);

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

        // Appliquer la gravité si le blob n'est pas au sol
        if (!this.isGrounded) {
            this.blob.applyGravity(this.gravity);
            this.checkCollisions(); // Vérifier les collisions pour voir si le blob touche un cercle
        } else {
            // Mettre à jour la position du blob s'il est au sol
            this.updateBlobPosition();
        }

        this.blob.update(); // Appeler la méthode update du blob pour mettre à jour la ligne de raycast
    }

    updateBlobPosition() {
        const { x, y, radius } = this.currentCircle;

        // Calculer la nouvelle position du blob avec offset
        const offsetCoefficient = 0.1; // Ajustez ce coefficient pour rapprocher ou éloigner le blob du centre du cercle
        const adjustedRadius = radius + (radius * offsetCoefficient); // On utilise une valeur relative au radius pour gérer l'offset et le rendre responsive 

        this.blob.x = x + adjustedRadius * Math.cos(this.angle);
        this.blob.y = y + adjustedRadius * Math.sin(this.angle);

        // Ajuster la rotation du blob pour qu'il soit orienté vers le centre du cercle
        this.blob.rotation = this.angle + Math.PI / 2;
    }

    jump() {
        if (this.isGrounded) {
            this.blob.jump();
        }
    }
    checkCollisions() {
        let grounded = false;
        this.circleObjects.forEach(circle => {
            if (this.isColliding(this.blob, circle)) {
                this.currentCircle = circle;
                grounded = true;
                this.blob.resetVelocity(); // Réinitialiser la vitesse du blob lorsque celui-ci touche un cercle
            }
        });
        this.isGrounded = grounded;
    }

    isColliding(blob: Blob, circle: CircleObject): boolean {
        const distance = Phaser.Math.Distance.Between(blob.x, blob.y, circle.x, circle.y);
        return distance < circle.radius + blob.blobSprite.displayWidth / 2;
    }

    changeScene() {
        this.scene.start('GameOver');
    }
}
