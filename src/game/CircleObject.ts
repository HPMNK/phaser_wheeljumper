import Phaser from 'phaser';

export class CircleObject extends Phaser.Physics.Arcade.Sprite {
    radius: number;
    rotationSpeed: number;

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, rotationSpeed: number = 0.01, radiusCoefficient: number = 0.1) {
        super(scene, x, y, texture);
        scene.add.existing(this);
        this.setDisplaySize(scene.scale.width / 8, scene.scale.width / 8);
        this.radius = this.displayWidth / 2 * radiusCoefficient;
        this.setDisplaySize(this.radius * 2, this.radius * 2);

        this.rotationSpeed = rotationSpeed;

        // La physique sera ajoutée depuis la scène
        scene.physics.world.enable(this);
        const body = this.body as Phaser.Physics.Arcade.Body;
        body.setCircle(this.radius);
        body.setImmovable(true);
        body.setAllowGravity(false);
    }

    update() {
        this.rotation += this.rotationSpeed;
        // Supprimer l'appel à setAngularVelocity car il n'est pas nécessaire ici
    }
}
