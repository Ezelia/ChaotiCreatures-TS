/// <reference path="eventhandler.ts" />
/// <reference path="../lib/phaser.d.ts" />
/// <reference path="../lib/ezps.d.ts" />
/// <reference path="../lib/tween.js.d.ts" />

declare var p2;

module Ezelia {
    export class Engine extends EventHandler {
        public game: Phaser.Game;
        public playerCollisionGroup: Phaser.Physics.P2.CollisionGroup;
        public objCollisionGroup: Phaser.Physics.P2.CollisionGroup;
        public floorCollisionGroup: Phaser.Physics.P2.CollisionGroup;
        public objMaterial;
        public playerMaterial;
        public worldMaterial;
        public worldContactMeterial : Phaser.Physics.P2.ContactMaterial;

        public players = [];
        public objects = [];
        public idObjects = {};


        public playersGroup: Phaser.Group;
        public objectsGroup: Phaser.Group;

        private cursors;
        private jumpButton;
        private dupButton;
        private dupTimer = 0;

        public maskObj: Phaser.Graphics;
        public cameraTarget: Phaser.Graphics;
        public levelGroup: Phaser.Group;
        public maskGroup: Phaser.Group;
        public bgGroup: Phaser.Group;
        public gameGroup: Phaser.Group;
        public fgGroup: Phaser.Group;        
        public uiGroup: Phaser.Group;    
        private currentLevel = 'level1';


        public gate: Phaser.Sprite;
        public player: Phaser.Sprite;


        private particleRenderer;
        private particleTS;
        private particleLastTS;
        public emitters = [];


        public text: Phaser.Text;

        public ready;
        public callReady = false;
        constructor() {
            super();

            this.registerEvent('gameover');
            this.registerEvent('levelload');
            this.registerEvent('levelwin');

            var _this = this;

            var height = Math.min(window.innerHeight, 640);
            var width = Math.min(window.innerWidth, 800);

            



            this.game = new Phaser.Game(width, height, null, 'phaser-example', {
                preload: preloader.preload.bind(_this),
                create: _this.p2create.bind(_this),
                update: _this.p2update.bind(_this),
                render: _this.render.bind(_this)
            });

            
        }



        public doLevelWin() {
            if (!this.ready) return;
            this.ready = false;
            this.text.setText(_t('Level cleared'));
            this.text.position.x = 200;
            this.text.position.y = 200;

            var list = this.game.physics.p2.getBodies();
            var _this = this;
            this.addEmitter('galaxy', this.gate.x, this.gate.y);

            for (var i = 0; i < list.length; i++) {
                var body: any = list[i];
                if (!body) continue;
                body.static = true;
                if (body.sprite && body.sprite._entity) {

                    var tween = new TWEEN.Tween(body.sprite._entity)
                        .to({ x: this.gate.position.x, y: this.gate.position.y }, 3000)
                        .easing(TWEEN.Easing.Elastic.InOut)
                        .start();

                    body.sprite.pivot.x = 0.5;
                    body.sprite.pivot.y = 0.5;
                    var tr = new TWEEN.Tween(body.sprite)
                        .to({ rotation: 10 }, 3000)
                        .easing(TWEEN.Easing.Exponential.Out).start();

                    var t0 = new TWEEN.Tween(body.sprite.scale)
                        .to({ x: 1.2, y: 1.2 }, 400)
                        .easing(TWEEN.Easing.Linear.None);

                    var t1 = new TWEEN.Tween(body.sprite.scale)
                        .to({ x: 0, y: 0 }, 2600)
                        .easing(TWEEN.Easing.Elastic.InOut);
                    t0.chain(t1);

                    t0.start();

                }
            }

            var aspirable = [];
            for (var i = 0; i < this.fgGroup.children.length; i++) {
                aspirable.push(this.fgGroup.children[i]);
            }
            for (var i = 0; i < this.bgGroup.children.length; i++) {
                aspirable.push(this.bgGroup.children[i]);
            }

            for (var i = 0; i < aspirable.length; i++) {
                var item = aspirable[i];
                if (item.fixedToCamera) continue;
                var tween = new TWEEN.Tween(item.position)
                    .to({ x: this.gate.position.x, y: this.gate.position.y }, 3000)
                    .easing(TWEEN.Easing.Elastic.InOut)
                    .delay(2000)
                    .start();

                item.pivot.x = 0.5;
                item.pivot.y = 0.5;
                var tr = new TWEEN.Tween(item)
                    .to({ rotation: 30 }, 3000)
                    .delay(2000)
                    .easing(TWEEN.Easing.Bounce.InOut).start();

                var t0 = new TWEEN.Tween(item.scale)
                    .to({ x: 0.5, y: 0.5 }, 400)
                    .delay(2000)
                    .easing(TWEEN.Easing.Linear.None);

                var t1 = new TWEEN.Tween(item.scale)
                    .to({ x: 0, y: 0 }, 2600)
                    .easing(TWEEN.Easing.Elastic.InOut);
                t0.chain(t1);

                t0.start().onComplete(function () {
                    _this.maskGroup.mask = null;
                    _this.maskObj.clear();
                    _this.trigger('levelwin');


                    

                });
            }
            
            
            setTimeout(function () {
                if (_this.currentLevel == 'level1') {
                    _this.currentLevel = 'level2';

                    _this.loadLevel(_this.currentLevel);
                    return;
                }
                if (_this.currentLevel == 'level2') {
                    _this.currentLevel = 'level3';

                    _this.loadLevel(_this.currentLevel);
                    return;
                }

                if (_this.currentLevel == 'level3') {

                    _this.text.setText(_t('Congratulations you finished the game :)'));
                    return;
                }
            }, 5000);                        
        }
        public doGameOver() {
            this.text.setText(_t('Level failed'));
            this.text.position.x = 200;
            this.text.position.y = 200;

            this.trigger('gameover');
        }


        private createUI() {
            var _this = this;          
            var button = this.game.add.button(this.game.width - 100, 0, 'buttons', function () {
                _this.loadLevel(_this.currentLevel);
            }, this, 0, 0, 0);

            this.uiGroup.add(button);
        }

        public loadLevel(levelId) {
            this.destroy();
            this.currentLevel = levelId;
            var game = this.game;
            this.levelGroup = game.add.group();
            this.bgGroup = game.add.group();            
            this.maskGroup = game.add.group();
            this.gameGroup = game.add.group();
            this.fgGroup = game.add.group();


            this.levelGroup.add(this.bgGroup);
            this.levelGroup.add(this.maskGroup);
            this.levelGroup.add(this.gameGroup);
            this.levelGroup.add(this.fgGroup);

            this.uiGroup = game.add.group();
            this.uiGroup.fixedToCamera = true;

            this.createUI();


            //this.maskGroup.add(this.gameGroup);

            
            //var bg1 = game.add.tileSprite(0, 0, 800, 600, 'background');            
            //this.bgGroup.add(bg1);

            
            //var bg = game.add.tileSprite(0, 0, 800, 600, 'background1');
            //this.maskGroup.add(bg);
            
            

            var data:any = this.game.cache.getJSON(levelId);
            if (!data) return;
            

            this.initParticles();

            //Load phycis first
            for (var l = 0; l < data.layers.length; l++) {
                if (data.layers[l].type != 'objectgroup') continue;
                var objects: any[] = data.layers[l].objects;

                for (var i = 0; i < objects.length; i++) {
                    var obj = objects[i];

                    if (obj.type == 'floor') {

                        var floor = new P2GameEntity(this, 'atari', obj.x + obj.width / 2, obj.y + obj.height / 2);
                        floor.sprite.width = obj.width;
                        floor.sprite.height = obj.height;
                        floor.sprite.visible = false;
                        //floor.body.dynamic = false;
                        floor.body.static = true;
                        //floor.data.motionState = 2;
                        floor.body.setRectangle(obj.width, obj.height);
                        floor.body.setMaterial(this.worldMaterial);

                        floor.body.setCollisionGroup(this.objCollisionGroup);
                        floor.body.collides([this.objCollisionGroup, this.playerCollisionGroup]);

                        floor.tag = obj.properties.id;


                        if (obj.properties.id) {
                            this.idObjects[floor.tag] = floor;
                        }
                    }

                    if (obj.type == 'spawn') {

                        var player = new P2PlayerEntity(this, obj.x + obj.width / 2, obj.y + obj.height / 2);

                        

                    }
                    if (obj.type == 'gameobj') {

                        var mass = obj.properties.mass ? parseInt(obj.properties.mass) : undefined;
                        var shape = obj.properties.shape || undefined;
                        var nodup = (obj.properties.nodup != undefined);

                        var w = obj.width;
                        var h = obj.height;

                        if (shape) {
                            if (shape == 'circle') {
                                w = obj.width;
                                h = null;

                            }
                            else {
                                w = null;
                                h = shape;

                            }
                        }



                        var box = new P2GameObject(this, obj.properties.sprite,
                            obj.x + obj.width / 2, obj.y + obj.height / 2,
                            w, h,
                            mass);
                        box.nodup = nodup;
                        box.tag = obj.properties.tag || box.tag;

                        console.log('adding gameobj', obj.properties.mass, mass, obj);
                    }
                    if (obj.type == 'special') {

                        var _this = this;
                        var target = obj.properties['target'];
                        var spriteId = obj.properties['sprite'] || 'gate';

                        var _collide = JSON.parse(obj.properties['collide']);
                        var collisions = [];
                        for (var c = 0; c < _collide.length; c++) {
                            if (this[_collide[c]] instanceof Phaser.Physics.P2.CollisionGroup) collisions.push(this[_collide[c]]);
                        }
                        var count = parseInt(obj.properties['count']);

                        var interval = obj.properties.interval ? parseInt(obj.properties.interval) : 1000;

                        var special = new P2SpecialEntity(this, spriteId, interval, obj.x + obj.width / 2, obj.y + obj.height / 2, target, collisions, count);
                        special.countCB = LevelScripts[obj.properties['countCB']];
                        special.targetCB = LevelScripts[obj.properties['targetCB']];
                        special.props = obj.properties;
                        special.sprite.visible = false;

                        if (obj.name == 'gate') {
                            this.gate = special.sprite;
                        }
                        

                    }

                    if (obj.type == 'emitter') {
                        var predef = obj.properties.predef;

                        console.log('adding emitter ', predef, obj.x + obj.width / 2, obj.y + obj.height / 2);
                        if (predef) {
                            this.addEmitter(predef, obj.x + obj.width / 2, obj.y + obj.height / 2);
                        }
                    }
                }
            }


            for (var l = 0; l < data.layers.length; l++) {
                if (data.layers[l].type != 'imagelayer') continue;

                var image: any = data.layers[l];
                if (image.properties && image.properties.fg) {
                    var fg = this.game.add.image(image.x, image.y, image.name);
                    this.fgGroup.add(fg);


                    if (image.properties && image.properties.id) {
                        this.idObjects[image.properties.id] = fg;
                    }
                }
                else {

                    var bg1img = this.game.add.image(image.x, image.y, image.name);
                    this.bgGroup.add(bg1img);
                    if (image.properties && image.properties.fixed) {
                        bg1img.fixedToCamera = true;
                    }

                    if (image.properties && image.properties.id) {
                        this.idObjects[image.properties.id] = bg1img;
                    }

                    if (image.properties && image.properties.mask) {
                        var bgimg = this.game.add.image(image.x, image.y, image.properties.mask);
                        this.maskGroup.add(bgimg);
                        bgimg.fixedToCamera = bg1img.fixedToCamera;
                    }
                }

            }            

            this.cameraTarget = this.game.add.graphics(0, 0);
            this.cameraTarget.position = this.players[0].position;


            this.maskObj = this.game.add.graphics(0, 0);
            //bg.mask = this.maskObj;

            this.maskGroup.mask = this.maskObj;
            this.maskObj.beginFill(0xFFFFFF, 0.8);
            this.maskObj.drawCircle(0, 0, 1);


            this.text = game.add.text(20, 20, _t('...'), { fill: '#ffffff' });
            this.uiGroup.add(this.text);



            this.ready = true;
            this.trigger('levelload', levelId);

            //if (!game.device.desktop) {


            (<any>game.camera).follow(this.maskObj);
            game.camera.deadzone = new Phaser.Rectangle(200, 200, game.width - 400, game.height - 400);
            game.camera.focusOnXY(0, 0);
            game.world.setBounds(-100, -100, 2000, 2000);
            //game.camera.x = 0;
            //game.camera.y = 0;
            //}

            this.text.setText(this.currentLevel);
            
        }

        public switchCamera() {
            var idx = util.math.random(0, this.players.length - 1);
            var targetPlayer = this.players[idx];
            if (!targetPlayer) return;

            var point = new Phaser.Point(this.cameraTarget.position.x, this.cameraTarget.position.y);
            this.cameraTarget.position = point;

            (<any>this.game.camera).follow(this.cameraTarget);

            var _this = this;
            new TWEEN.Tween(point).to({ x: targetPlayer.position.x, y: targetPlayer.position.y }, 500).start().onComplete(function () {
                _this.cameraTarget.position = targetPlayer.position;
                (<any>_this.game.camera).follow(this.cameraTarget);
            });

            
        }


        public checkDuplicate(type) {
            if (type == 'player') {
                if (this.players.length > 80) {
                    this.text.setText(_t('Duplication limit reached'));
                    return false;
                }
                else return true;
            }
            
            if (this.game.physics.p2.total > 150) {
                this.text.setText(_t('Chaos limit reached'));
                return false;
            }

            return true;
        }
        public duplicateEntities() {
            //if (this.players.length + this.objects.length > 100) {
            //    console.log('CHAOS');
            //    return;
            //}
            //if (!this.checkDuplicate()) return;


            var toDuplicate = [];
            for (var i = 0; i < this.players.length; i++) {
                toDuplicate.push(this.players[i]);

            }


            var p;
            while (p = toDuplicate.pop()) {
                p.duplicate();


            }


            this.findDuplicable(function (obj: GameEntity) {
                toDuplicate.push(obj);
            });
            while (p = toDuplicate.pop()) {

                var clone = p.duplicate();
                //this.objects.push(clone);
                //this.objectsGroup.add(clone.sprite);


                //clone.body.velocity.y = -500;
                //clone.body.velocity.x = -200;

            }

        }

        public findDuplicable(callback) {
            var x = this.maskObj.position.x;
            var y = this.maskObj.position.y;
            var distance = (<any>this.maskObj).graphicsData[0].points[2];


            for (var i = 0; i < this.objects.length; i++) {
                var obj = this.objects[i];
                if (util.math.distance(obj.position.x, obj.position.y, x, y) < distance) {
                    if (typeof callback == 'function') callback(obj);
                }

            }


        }

        public destroy() {
            this.ready = false;
            if (this.levelGroup) this.levelGroup.destroy();
            if (this.uiGroup) this.uiGroup.destroy();
            this.players.length = 0;
            this.objects.length = 0;
            this.idObjects = {};
            this.emitters.length = 0;
            if (this.particleRenderer) this.particleRenderer.reset();
        }


        public addEmitter(name, x, y)
        {
            var emitter1 = new Ezelia.ParticleSystem.Emitter(name);
            emitter1.settings.pos.x = x;
            emitter1.settings.pos.y = y;
            emitter1.restart();
            this.emitters.push(emitter1);
        }
        public initParticles() {
            var canvas = this.game.canvas;
            Ezelia.ParticleSystem.PredefinedSystems.positionSystems({ width: canvas.width - 10, height: canvas.height - 10 });
            Ezelia.ParticleSystem.PredefinedSystems.setTexture('./assets/img/particle.png');
            var container:any = new PIXI.DisplayObjectContainer();
            this.particleRenderer = new Ezelia.ParticleSystem.PixiRenderer(container);
            var lastTimestamp = Date.now();
            //var timestamp = Date.now();
            container.preUpdate = function () { }
            container.update = function () { }
            container.postUpdate = function () { }
            container.destroy = function () { }

            //just a trick to prevent emitters aspiration
            container.fixedToCamera = true;
            //this.game.world.addChild(container);

            this.fgGroup.add(container);

        }
        public renderParticles(particleTS) {
            var delta = particleTS - (this.particleLastTS || particleTS);

            this.particleLastTS = particleTS;

            delta /= 1000;
            for (var i = 0; i < this.emitters.length; i++) {
                var emitter = this.emitters[i];
                emitter.update(delta);
                this.particleRenderer.render(emitter.particles);
            }
        }
        private render() {
            //this.game.debug.body(this.gate);
            //this.game.debug.body(this.players[0].sprite);
            this.renderParticles(Date.now());
        }
        private preload() {

        }


        private p2create() {
            var game = this.game;
            //game.world.setBounds(0, 0, 1000, 1000);
            this.game.stage.disableVisibilityChange = true;

            game.physics.startSystem(Phaser.Physics.P2JS);
            game.physics.p2.gravity.y = 300;
            game.physics.p2.friction = 0.5;

            this.playerCollisionGroup = game.physics.p2.createCollisionGroup();
            this.objCollisionGroup = game.physics.p2.createCollisionGroup();
            this.floorCollisionGroup = game.physics.p2.createCollisionGroup();

            game.physics.p2.updateBoundsCollisionGroup();

            this.playerMaterial = game.physics.p2.createMaterial('playerMaterial');
            this.objMaterial = game.physics.p2.createMaterial('objMaterial');

            this.worldMaterial = game.physics.p2.createMaterial('worldMaterial');
            //game.physics.p2.setWorldMaterial(this.worldMaterial, true, true, true, true);

            this.worldContactMeterial = game.physics.p2.createContactMaterial(this.objMaterial, this.worldMaterial);
            this.worldContactMeterial.friction = 10;

            var objContact = game.physics.p2.createContactMaterial(this.objMaterial, this.objMaterial);
            objContact.friction = 5;

            var playerContact = game.physics.p2.createContactMaterial(this.playerMaterial, this.objMaterial);
            playerContact.friction = 0;





            

            this.cursors = game.input.keyboard.createCursorKeys();
            this.jumpButton = game.input.keyboard.addKey(Phaser.Keyboard.UP);
            this.dupButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

            

            var _this = this;
            //var updateCheck = setTimeout(function () {
            //    if (!_this.callReady) alert('Something goes wrong, please reload the game');
            //}, 20000);



            //ui stuff
            this.uiGroup = game.add.group();
            var _this = this;
            _this.currentLevel = 'level1';
            var button = this.game.add.button(this.game.world.centerX, this.game.world.centerY, 'play', function () {
                _this.loadLevel(_this.currentLevel);
            }, this, 0, 0, 0);
            button.fixedToCamera = true;


            
            this.uiGroup.add(button);


        }


        private p2update() {

            TWEEN.update();
            this.callReady = true;
            if (!this.ready) return;
            this.updateMask();

            var players = this.players;
            var cursors = this.cursors;
            var jumpButton = this.jumpButton;




            var toDuplicate = [];
            for (var i = 0; i < players.length; i++) {
                var playerSprite = players[i].sprite;
                var player = players[i];

                if (player.spawning) continue;
                //if (!this.checkIfCanJump(player)) continue;

                var canjump = this.checkIfCanJump(player);

                var reduce = !canjump ? -120 : 0;
                //reduce = 0;

                //if (playerSprite.body.velocity.x < 0.0001 && playerSprite.body.velocity.y < 0.0001) {
                //    playerSprite.animations.play('idle');
                //}

                if (cursors.left.isDown) {

                    player.body.velocity.x = -(200 + player.leftRand + reduce);
                    
                    if (playerSprite.facing != 'left') {

                        playerSprite.animations.play('left');
                        
                        playerSprite.facing = 'left';
                    }
                }
                else if (cursors.right.isDown) {
                    player.body.velocity.x = (200 + player.leftRand + reduce);

                    if (playerSprite.facing != 'right') {


                        playerSprite.animations.play('right');
                        
                        playerSprite.facing = 'right';
                    }
                }
                else {
                    playerSprite.body.velocity.x = 0;
                    
                    if (playerSprite.facing != 'idle') {
                        playerSprite.animations.stop();

                        if (playerSprite.facing == 'left') {
                            playerSprite.frame = 0;
                        }
                        else {
                            playerSprite.frame = 5;
                        }

                        playerSprite.facing = 'idle';
                    }


                }

                

                
                if (cursors.up.isDown && this.game.time.now > player.jumpTimer && canjump) {                
                    var p = player;
                    p.jumpTimer = this.game.time.now + 700 + ~~(Math.random() * 300);
                    (function (player, i) {
                        var jumpdelay = ~~(Math.random() * i * 6);
                        setTimeout(function () {
                            player.body.velocity.y = -300 + ~~(Math.random() * 10);

                        }, jumpdelay);
                    })(playerSprite, i);
                }

                if (this.dupButton.isDown && this.game.time.now > this.dupTimer) {
                    this.duplicateEntities();
                    this.dupTimer = this.game.time.now + 700;
                }

            }

        }



        private updateMask() {
            if (!this.maskObj || this.players.length <= 0) return;

            this.maskObj.position.y = this.players[0].sprite.position.y;
            this.maskObj.position.x = this.players[0].sprite.position.x;
            //mygame.maskObj.graphicsData[0].points

            
            (<any>this.maskObj).graphicsData[0].points[2] = 100;


            var maxdistance = 0; var p1; var p2;
            for (var i = 0; i < this.players.length; i++) {
                var p = this.players[i];
                var d = util.math.distance(this.maskObj.position.x, this.maskObj.position.y, p.position.x, p.position.y);

                if (d > (<any>this.maskObj).graphicsData[0].points[2]) {
                    (<any>this.maskObj).graphicsData[0].points[2] = d + 20;
                }
                /*
                for (var j = 0; j < this.players.length; j++) {
                    var d = util.math.distance(this.players[i].position.x, this.players[i].position.y, this.players[j].position.x, this.players[j].position.y);

                    if (d > maxdistance) {
                        maxdistance = d;
                        p1 = this.players[i];
                        p2 = this.players[j];
                    }

                }
                */
            }
            var radius = (<any>this.maskObj).graphicsData[0].points[2];


            this.maskObj.clear();
            this.maskObj.beginFill(0xFFFFFF, 0.8);
            this.maskObj.drawCircle(0, 0, radius);
            /*

            if (p1 && p2) {
                this.maskObj.position.x = ~~((p1.position.x + p2.position.x) / 2);
                this.maskObj.position.y = ~~((p1.position.y + p2.position.y) / 2);
                (<any>this.maskObj).graphicsData[0].points[2] = Math.max( ~~(maxdistance / 2) + 20, 100);
            }
            */


        }

        private checkIfCanJump(player) {
            var game: any = this.game;
            var yAxis = p2.vec2.fromValues(0, 1);
            var result = false;
            

            for (var i = 0; i < game.physics.p2.world.narrowphase.contactEquations.length; i++) {
                var c = game.physics.p2.world.narrowphase.contactEquations[i];

                if (c.bodyA === player.body.data || c.bodyB === player.body.data) {
                    var d = p2.vec2.dot(c.normalA, yAxis); // Normal dot Y-axis
                    if (c.bodyA === player.body.data) d *= -1;
                    if (d > 0.5) result = true;
                }
            }

            return result;

        }
    }
}
