/// <reference path="eventhandler.ts" />
/// <reference path="../lib/phaser.d.ts" />

module Ezelia {
    export class P2PlayerEntity extends P2GameEntity {
        private dieSprite: Phaser.Sprite;
        public popcornSprite: Phaser.Sprite;
        public position: Phaser.Point;
        constructor(public engine: Engine, x: number= 0, y: number= 0) {
            super(engine, 'dude', x, y);


            this.popcornSprite = engine.game.add.sprite(x, y, 'popcorndude');
            this.popcornSprite.visible = false;

            this.dieSprite = engine.game.add.sprite(x, y, 'die');
            this.dieSprite.position = this.sprite.position;
            this.dieSprite.visible = false;
            this.dieSprite.animations.add('die', [0,1,2,3,4,5,6,7,8,9], 30, false);
            
            this.sprite.animations.add('idle', [4], 1, true);
            this.sprite.animations.add('left', [0, 1, 2, 3], 10, true);
            this.sprite.animations.add('jleft', [2], 10, true);
            this.sprite.animations.add('turn', [4], 20, true);            
            this.sprite.animations.add('right', [5, 6, 7, 8], 10, true);
            this.sprite.animations.add('jright', [7], 10, true);
            this.body.fixedRotation = true;
            //this.body.setCircle(15);
            this.body.mass = 10;

            this.sprite.anchor.y = 0.5+(util.math.random(0, 3) / 10);
            this.tag = 'player';
            this.body.setMaterial(engine.playerMaterial);
            
            (<any>this.body).tag = 'player';

            engine.players.push(this);
            this.body.setCollisionGroup(engine.playerCollisionGroup);
            this.body.collides([engine.objCollisionGroup]);

        }
        public duplicate() {
            if (this.nodup || !this.engine.checkDuplicate('player')) return;

            var clone = new P2PlayerEntity(this.engine, this.sprite.position.x, this.sprite.position.y);

            clone.spawning = true;

            clone.tag = this.tag;

            if (clone.tag == 'grain') {
                clone.sprite.texture = clone.popcornSprite.texture;
            }

            clone.body.velocity.y = - (150 + ~~(Math.random() * 150));
            clone.body.velocity.x = -150 + ~~(Math.random() * 300);
            setTimeout(function () {
                clone.spawning = false;
            }, 1000)

            return clone;
        }

        public kill() {
            //console.log('killing player ');
            var found = -1;
            for (var i = 0; i < this.engine.players.length; i++) {
                var player = this.engine.players[i];
                if (player.body.data.id == this.body.data.id) {
                    found = i;
                    break;
                }
            }

            if (found!=-1) {
                //console.log('killed ', found);
                this.sprite.kill();
                this.engine.players.splice(found, 1);
                this.dieSprite.position.y -= 24;
                this.dieSprite.visible = true;
                this.dieSprite.animations.play('die');
                this.popcornSprite.kill();
                var _this = this;
                new TWEEN.Tween(this.dieSprite.position).to({ y: this.dieSprite.position.y - 100 }, 2000).onComplete(function () {
                    _this.dieSprite.kill();
                }).start();
            }

            if (this.engine.players.length <= 0) {
                this.engine.doGameOver();
            }

            if (this.engine.players[0]) {
                this.engine.cameraTarget.position = this.engine.players[0].position;
            }
        }

    }

}