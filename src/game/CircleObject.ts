import Phaser from 'phaser';
import { Killzone } from './Killzone';

export class CircleObject extends Phaser.Physics.Arcade.Sprite {
    radius: number;
    rotationSpeed: number;
    killzones: Killzone[];

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, rotationSpeed: number = 0.01, radiusCoefficient: number = 0.1) {
        super(scene, x, y, texture);
        scene.add.existing(this);

        this.setDisplaySize(scene.scale.width / 8, scene.scale.width / 8);
        this.radius = this.displayWidth / 2 * radiusCoefficient;
        this.setDisplaySize(this.radius * 2, this.radius * 2);

        this.rotationSpeed = rotationSpeed;
        this.killzones = [];

        scene.physics.world.enable(this);
        const body = this.body as Phaser.Physics.Arcade.Body;
        body.setCircle(this.width / 2);
        body.setImmovable(true);
        body.setAllowGravity(false);
    }

    update(time: number, delta: number) {
        this.rotation += this.rotationSpeed;

        this.killzones.forEach(killzone => {
            const angle = Phaser.Math.Angle.Between(this.x, this.y, killzone.x, killzone.y) + this.rotationSpeed;
            const distance = Phaser.Math.Distance.Between(this.x, this.y, killzone.x, killzone.y);
            const newX = this.x + distance * Math.cos(angle);
            const newY = this.y + distance * Math.sin(angle);
            killzone.updatePosition(newX, newY, this.x, this.y);
        });
    }

    addKillzone(killzone: Killzone) {
        this.killzones.push(killzone);
    }
}
