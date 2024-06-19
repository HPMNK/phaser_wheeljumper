// Game.ts
import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { CircleObject } from '../CircleObject';
import { Blob } from '../Blob';

export class Game extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    circleObjects: CircleObject[] = [];
    blob: Blob;
    currentCircle: CircleObject | null = null;
    lastCircle: CircleObject | null = null;

    constructor() {
        super('Game');
    }

    preload() {
        this.load.image('planet', '/assets/pixelplanet.png');
        Blob.preload(this);
    }

    create() {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x151d28);

        const { width, height } = this.scale;

        const circle1 = new CircleObject(this, width / 2, height / 2, 'planet', 0.01, 1.3);
        const circle2 = new CircleObject(this, width / 3, height / 3, 'planet', 0.02, 0.5);

        this.circleObjects.push(circle1, circle2);

        this.blob = new Blob(this, width / 2, 0);

        this.add.existing(this.blob);

        this.input.on('pointerdown', this.jump, this);

        EventBus.emit('current-scene-ready', this);
    }

    update(time: number, delta: number) {
        this.circleObjects.forEach(circle => {
            circle.update();
        });

        this.blob.update(this.circleObjects);

        console.log('isGrounded:', this.blob.isGrounded); // Debug log

    }

    jump() {
        if (this.blob.isGrounded) {
            this.blob.jump();
        }
    }
}
