import Phaser from 'phaser';

export class Killzone extends Phaser.Physics.Arcade.Sprite {
    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'spike');
        scene.add.existing(this);
        scene.physics.world.enable(this);

        this.setOrigin(0.5, 0.5);

        const body = this.body as Phaser.Physics.Arcade.Body;
        body.setCircle(this.displayWidth / 2);
        body.setOffset(0, 0);  // Assurer que le corps est centré sur le sprite
        body.setImmovable(true);
        body.moves = false; // Désactiver les mouvements automatiques
    }

    updatePosition(x: number, y: number, circleX: number, circleY: number) {
        this.setPosition(x, y);
        const angle = Phaser.Math.Angle.Between(circleX, circleY, x, y);
        this.setRotation(angle + Math.PI / 2);  // Ajuster l'angle pour que le sprite pointe vers l'extérieur

        const body = this.body as Phaser.Physics.Arcade.Body;
        body.x = x - body.halfWidth;
        body.y = y - body.halfHeight;
    }

    static preload(scene: Phaser.Scene) {
        scene.load.image('spike', '/assets/spike.png');
    }
}
