/// <reference path="eventhandler.ts" />
/// <reference path="../lib/phaser.d.ts" />

module Ezelia {
    export class P2GameObject extends P2GameEntity {
        
        constructor(public engine: Engine, public spriteId, x: number= 0, y: number= 0, private w?, private h?, private mass?) {
            super(engine, spriteId, x, y);

            

            if (typeof h == 'string') {
                this.body.clearShapes();
                this.body.loadPolygon('physicsData', h);
                this.body.fixedRotation = false;
            }
            else {
                if (w) this.sprite.width = w;
                if (h) this.sprite.height = h;

                if (w != null && h == null) {
                    this.body.setCircle(w/2);
                }

                else {
                    this.body.setRectangle(this.sprite.width, this.sprite.height);
                }
            }


            this.body.setMaterial(engine.objMaterial);
            this.body.mass = mass || ~~((this.sprite.width * this.sprite.height) / 50);


            console.log('Set mass = ', this.body.mass);
            //this.bgsprite.width = this.sprite.width;
            //this.bgsprite.height = this.sprite.height;



            this.body.setCollisionGroup(engine.objCollisionGroup);
            this.body.collides([engine.objCollisionGroup, engine.playerCollisionGroup]);

            var _this = this;
            this.body.onBeginContact.add(function (body, shapeA, shapeB, equation) {
                if (_this.body.mass < 100) return;
                if (!body || body.tag != 'player') return;
                if (body.velocity.y > 0.1) return;
                var playerBody = equation[0].bodyA.parent.sprite._entity instanceof P2PlayerEntity ? equation[0].bodyA : equation[0].bodyB;
                var objBody = playerBody == equation[0].bodyA ? equation[0].bodyB : equation[0].bodyA;

                if (playerBody.parent.sprite.position.y > objBody.parent.sprite.position.y + objBody.parent.sprite.height / 1.5) {
                    console.log('HEIGHT = ', equation[0].bodyA.parent.sprite._entity.tag,  equation[0].bodyA.parent.sprite.position.y, equation[0].bodyB.parent.sprite.position.y, equation[0].bodyB.parent.sprite.height);
                    body.sprite._entity.kill();
                }
                /*
                if (body.tag == 'player' && body.sprite.position.y > _this.position.y) {
                    body.sprite.kill();
                }
                */
            });

            engine.objects.push(this);
        }
        public duplicate() {
            if (this.nodup) return;
            if (!this.engine.checkDuplicate('object')) return;

            var clone = new P2GameObject(this.engine, this.spriteId, this.position.x, this.position.y - this.sprite.height, this.w, this.h, this.mass);


            clone.spawning = true;

            clone.body.velocity.y = - (50 + ~~(Math.random() * 50));
            clone.body.velocity.x = -100 + ~~(Math.random() * 200);
            setTimeout(function () {
                clone.spawning = false;
            }, 1000)

            return clone;
        }
    }

}