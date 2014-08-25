/// <reference path="eventhandler.ts" />
/// <reference path="../lib/phaser.d.ts" />

module Ezelia {
    export class GameEntity extends EventHandler {
        public sprite: Phaser.Sprite;
        public body: any;

        private leftRand = 0;
        private rightRand = 0;
        private jumpTimer = 0;
        public spawning = false;

        public position: Phaser.Point;
        constructor(public engine: Engine, private spriteId:string, x: number= 0, y: number= 0) {
            super();
            var game = engine.game;

            this.sprite = game.add.sprite(x, y, spriteId);
            this.position = this.sprite.position;
            game.physics.enable(this.sprite, Phaser.Physics.ARCADE);

            this.body = this.sprite.body;

            this.body.collideWorldBounds = true;
            this.body.gravity.y = 1000;
            this.body.maxVelocity.y = 500;

            //this.body.immovable = true;

            this.leftRand = ~~(Math.random() * 30);
            this.rightRand = ~~(Math.random() * 30);

            this.jumpTimer = 0;
        }

        public duplicate():any {
            var clone = new GameEntity(this.engine, this.spriteId, this.sprite.position.x, this.sprite.position.y);           

            clone.spawning = true;
            setTimeout(function () {
                clone.spawning = false;
                clone.body.velocity.x = 0;
            }, 1000)

            return clone;
        }
    }
} 