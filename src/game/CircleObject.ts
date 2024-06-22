import Phaser from 'phaser';

export class CircleObject extends Phaser.Physics.Arcade.Sprite {
    radius: number;
    rotationSpeed: number;

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, rotationSpeed: number = 0.01, radiusCoefficient: number = 0.1) {
        super(scene, x, y, texture);
        scene.add.existing(this);

        // Utiliser les dimensions de l'image pour définir la taille du sprite
        this.setDisplaySize(scene.scale.width / 8, scene.scale.width / 8);
        this.radius = this.displayWidth / 2 * radiusCoefficient;
        this.setDisplaySize(this.radius * 2, this.radius * 2);

        this.rotationSpeed = rotationSpeed;

        // Activer la physique et configurer le corps physique pour être centré
        scene.physics.world.enable(this);
        const body = this.body as Phaser.Physics.Arcade.Body;
        body.setCircle(this.width / 2);  // Utiliser le rayon défini pour le cercle de collision
        //body.setOffset((this.width - this.radius * 2) / 2, (this.height - this.radius * 2) / 2);  // Centrer le corps physique sur le sprite
        body.setImmovable(true);
        body.setAllowGravity(false);
    }

    update() {
        this.rotation += this.rotationSpeed;
        const container = this.getData('container');
        if (container) {
            container.rotation += this.rotationSpeed;
        }
    }
}
