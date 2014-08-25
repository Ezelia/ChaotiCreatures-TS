/// <reference path="eventhandler.ts" />
/// <reference path="../lib/phaser.d.ts" />

module Ezelia {
    export class PlayerEntity extends GameEntity {
        constructor(public engine: Engine, x: number= 0, y: number= 0) {
            super(engine, 'dude', x, y);

            this.body.immovable = false;
            this.body.setSize(20, 32, 5, 16);

            //this.body.checkCollision.up = false;
            //this.body.checkCollision.down = false;

            this.sprite.animations.add('left', [0, 1, 2, 3], 10, true);
            this.sprite.animations.add('turn', [4], 20, true);
            this.sprite.animations.add('right', [5, 6, 7, 8], 10, true);



            engine.players.push(this);
            engine.playersGroup.add(this.sprite);

        }

        public duplicate():PlayerEntity {
            if (this.engine.players.length >= 100) return;
            var clone = new PlayerEntity(this.engine, this.sprite.position.x, this.sprite.position.y);
            clone.body.velocity.y = - (200 + ~~(Math.random() * 100));
            clone.body.velocity.x = -100 + ~~(Math.random() * 200);


            clone.spawning = true;
            setTimeout(function () {
                clone.spawning = false;
                clone.body.velocity.x = 0;
            }, 1000)




            return clone;
        }

    }
}