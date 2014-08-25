/// <reference path="eventhandler.ts" />
/// <reference path="../lib/phaser.d.ts" />

module Ezelia {
    export class P2SpecialEntity extends P2GameEntity {
        private itv;
        public position: Phaser.Point;
        constructor(public engine: Engine, public spriteId, interval:number, x: number= 0, y: number= 0, tag= '', collides?: any[], targetCount=1, public countCB?, public targetCB?, public props?) {
            super(engine, spriteId, x, y);
            var game = engine.game;

            this.body.setCollisionGroup(engine.objCollisionGroup);
            this.body.collides(collides);
            this.body.dynamic = false;

            var _this = this;
            this.itv = setInterval(function () {
                var count = 0;

                var foundTagets = [];

                for (var i = 0; i < engine.players.length; i++) {
                    var p = engine.players[i];
                    if (tag.indexOf(p.tag) == -1) continue;

                    if (p.sprite.position.y > _this.position.y) continue;

                    var d = util.math.distance(p.sprite.position.x, p.sprite.position.y, _this.position.x, _this.position.y)

                    if (d < _this.sprite.width) {
                        count++;
                        foundTagets.push(p);
                        }

                }

                for (var i = 0; i < engine.objects.length; i++) {
                    var p = engine.objects[i];
                    if (tag.indexOf(p.tag) == -1) continue;

                    if (p.sprite.position.y > _this.position.y) continue;

                    var d = util.math.distance(p.sprite.position.x, p.sprite.position.y, _this.position.x, _this.position.y)

                    if (d < _this.sprite.width) {
                        count++;
                        foundTagets.push(p);
                    }

                }


                if (count >= targetCount && typeof _this.targetCB == 'function') {
                    _this.targetCB(tag, count, foundTagets, _this.engine, _this, _this.props);
                }
                else {
                if (typeof _this.countCB == 'function') _this.countCB(tag, count, foundTagets, _this.engine, _this, _this.props)
                }
            }, interval)
        }

        public kill() {
            
            clearInterval(this.itv);

            try {
                super.kill();
            }
            catch (ex)
            {
            }
        }
        public duplicate() {
            return this;
        }
    }

}