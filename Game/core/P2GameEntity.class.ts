/// <reference path="eventhandler.ts" />
/// <reference path="../lib/phaser.d.ts" />

module Ezelia {
    export class P2GameEntity extends EventHandler {
        //public bgsprite: Phaser.Sprite;
        public sprite: Phaser.Sprite;
        public data: any;
        public body: Phaser.Physics.P2.Body;

        private leftRand = 0;
        private rightRand = 0;
        private jumpTimer = 0;
        public spawning = false;

        public position: Phaser.Point;
        public nodup = false;

        get x() {
            return this.position.x;
        }
        get y() {
            return this.position.y;
        }
        set x(v) {
            this.data.position[0] = v / -20;
        }
        set y(v) {
            this.data.position[1] = v / -20;
        }         

        public tag: string;
        constructor(public engine:Engine, public spriteId, x: number=0, y: number=0) {
            super();
            var game = engine.game;
            this.sprite = game.add.sprite(x, y, spriteId);
            (<any>this.sprite)._entity = this;

            //this.bgsprite = engine.game.add.sprite(x, y, spriteId);
            //this.bgsprite.position = this.sprite.position;
            //this.bgsprite.anchor = this.sprite.anchor;
            //engine.bgGroup.add(this.bgsprite);

            engine.gameGroup.add(this.sprite);

            this.position = this.sprite.position;
            game.physics.p2.enable(this.sprite);

            this.body = this.sprite.body;

            this.data = this.body.data;

            this.body.fixedRotation = true;
            //this.body.setCircle(50);

            
            //this.sprite.anchor.y = 1;

            this.leftRand = ~~(Math.random() * 30);
            this.rightRand = ~~(Math.random() * 30);

            this.jumpTimer = 0;            
        }
        public duplicate() {
            if (!this.engine.checkDuplicate('entity')) return;
                        
            var clone = new P2GameEntity(this.engine, this.spriteId, this.sprite.position.x, this.sprite.position.y);

            clone.spawning = true;
            clone.body.moveUp(50 + ~~(Math.random() * 50));
            clone.body.velocity.x = -100 + ~~(Math.random() * 200);
            setTimeout(function () {
                clone.spawning = false;
            }, 1000);

            return clone;
        }

        public kill() {
            this.sprite.kill();
        }

        
    }

}