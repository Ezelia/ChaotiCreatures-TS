module Ezelia {
    export class LevelScripts {

        public static show_count =
        function (tag, count, foundTagets, context, me) {
            console.log(' ** gate count =  ', tag, count);
        }


        public static kill_gate =
        function (tag, count, foundTagets, context, me) {
            context.gate.kill();
        }

        public static kill_players =
        function (tag, count, foundTagets, context, me) {            
            for (var i = 0; i < foundTagets.length; i++) {
                var p = foundTagets[i];
                
                p.kill();
            }
        }

        public static level_win =
        function (tag, count, foundTagets, context, me) {
            context.doLevelWin();
        }

        public static kill_floor = 
        function (tag, count, foundTagets, context:Engine, me, props) {
            
            var killtags = props['killTag'].split(',');

            for (var i = 0; i < killtags.length; i++) {

                var obj = context.idObjects[killtags[i]];
                if (!obj) continue;
                console.log('killing id obj', killtags[i], obj);
                obj.kill();


            }
        }


        public static grainconvert_count =
        function (tag, count, foundTagets, engine: Engine, me: P2SpecialEntity, props) {
            for (var i = 0; i < foundTagets.length; i++) {
                var p:P2PlayerEntity = foundTagets[i];

                p.tag = 'grain';
                p.sprite.texture = p.popcornSprite.texture;
                p.nodup = true;
                p.spawning = true;

                p.x = 360;
                p.y = 240;
                p.body.velocity.y = - util.math.random(50, 100);
                p.body.velocity.x = util.math.random(100,150);


                (function (p) {
                    setTimeout(function () {
                        p.spawning = false;
                    }, 1000);
                })(p);
                //p.kill();

            }
        }

        public static grain_count =
        function (tag, count, foundTagets, engine: Engine, me: P2SpecialEntity, props) {


            for (var i = 0; i < foundTagets.length; i++) {
                var p = foundTagets[i];

                p.kill();
                if (p.tag == 'grain') {


                    (function (x, y) {
                        setTimeout(function () {

                            var box = new P2GameObject(engine, 'popcorn',
                                x, y,
                                null, 'popcorn',
                                50);
                            box.nodup = true;
                            box.tag = 'popcorn';


                            box.x = x;
                            box.y = y;

                            box.body.velocity.y = util.math.random(50, 100);
                            box.body.velocity.x = -util.math.random(50, 100);

                        }, util.math.random(1000, 2000));
                    })(1408, 608);

                }

                if (p instanceof P2PlayerEntity) {
                    p.tag = undefined;
                }
                else {
                    p.position.x = -1;
                    p.position.y = -1;
                }
                p.tag = undefined;
            }


        }

        public static popcorn_count =
        function (tag, count, foundTagets, context: Engine, me, props) {
            var _self: any = <any>me;
            if (!_self.popcorns) _self.popcorns = 0;
            


            //console.log('POP corns = ', foundTagets, _self.popcorns);
            for (var i = 0; i < foundTagets.length; i++) {
                var p = foundTagets[i];                

                p.kill();
                if (p.tag == 'popcorn') {
                    _self.popcorns++;
                }

                //untag it
                if (p instanceof P2PlayerEntity) {
                    p.tag = undefined;
                }
                else {
                    p.position.x = -1;
                    p.position.y = -1;
                }
                p.tag = undefined;
            }
            if (_self.popcorns >= 3) {

                var killtags = props['killTag'].split(',');

                for (var i = 0; i < killtags.length; i++) {

                    var obj = context.idObjects[killtags[i]];
                    if (!obj) continue;
                    console.log('killing id obj', killtags[i], obj);
                    obj.kill();
                    

                }

                me.kill();
            }
        }

    }
}