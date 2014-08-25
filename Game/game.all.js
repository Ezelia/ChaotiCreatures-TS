var Ezelia;
(function (Ezelia) {
    var EventHandler = (function () {
        function EventHandler() {
        }
        EventHandler.prototype.bind = function (event, fct) {
            this._events = this._events || {};
            this._events[event] = this._events[event] || [];
            this._events[event].push(fct);
        };

        //same as bind
        EventHandler.prototype.on = function (event, fct) {
            this._events = this._events || {};
            this._events[event] = this._events[event] || [];
            this._events[event].push(fct);
        };

        EventHandler.prototype.unbind = function (event, fct) {
            this._events = this._events || {};
            if (event in this._events === false)
                return;
            this._events[event].splice(this._events[event].indexOf(fct), 1);
        };
        EventHandler.prototype.unbindEvent = function (event) {
            this._events = this._events || {};
            this._events[event] = [];
        };
        EventHandler.prototype.unbindAll = function () {
            this._events = this._events || {};
            for (var event in this._events)
                this._events[event] = false;
        };
        EventHandler.prototype.trigger = function (event) {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 1); _i++) {
                args[_i] = arguments[_i + 1];
            }
            this._events = this._events || {};
            if (event in this._events !== false) {
                for (var i = 0; i < this._events[event].length; i++) {
                    this._events[event][i].apply(this, args);
                }
            }
        };

        EventHandler.prototype.registerEvent = function (evtname) {
            if (typeof this[evtname] == 'function')
                return this[evtname];
            this[evtname] = function (callback, replace) {
                if (typeof callback == 'function') {
                    if (replace)
                        this.unbindEvent(evtname);

                    this.bind(evtname, callback);
                }

                return this;
            };
        };
        return EventHandler;
    })();
    Ezelia.EventHandler = EventHandler;
})(Ezelia || (Ezelia = {}));
/// <reference path="eventhandler.ts" />
/// <reference path="../lib/phaser.d.ts" />
/// <reference path="../lib/ezps.d.ts" />
/// <reference path="../lib/tween.js.d.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};

var Ezelia;
(function (Ezelia) {
    var Engine = (function (_super) {
        __extends(Engine, _super);
        function Engine() {
            _super.call(this);
            this.players = [];
            this.objects = [];
            this.idObjects = {};
            this.dupTimer = 0;
            this.currentLevel = 'level1';
            this.emitters = [];
            this.callReady = false;

            this.registerEvent('gameover');
            this.registerEvent('levelload');
            this.registerEvent('levelwin');

            var _this = this;

            var height = Math.min(window.innerHeight, 640);
            var width = Math.min(window.innerWidth, 800);

            this.game = new Phaser.Game(width, height, null, 'phaser-example', {
                preload: Ezelia.preloader.preload.bind(_this),
                create: _this.p2create.bind(_this),
                update: _this.p2update.bind(_this),
                render: _this.render.bind(_this)
            });
        }
        Engine.prototype.doLevelWin = function () {
            if (!this.ready)
                return;
            this.ready = false;
            this.text.setText(_t('Level cleared'));
            this.text.position.x = 200;
            this.text.position.y = 200;

            var list = this.game.physics.p2.getBodies();
            var _this = this;
            this.addEmitter('galaxy', this.gate.x, this.gate.y);

            for (var i = 0; i < list.length; i++) {
                var body = list[i];
                if (!body)
                    continue;
                body.static = true;
                if (body.sprite && body.sprite._entity) {
                    var tween = new TWEEN.Tween(body.sprite._entity).to({ x: this.gate.position.x, y: this.gate.position.y }, 3000).easing(TWEEN.Easing.Elastic.InOut).start();

                    body.sprite.pivot.x = 0.5;
                    body.sprite.pivot.y = 0.5;
                    var tr = new TWEEN.Tween(body.sprite).to({ rotation: 10 }, 3000).easing(TWEEN.Easing.Exponential.Out).start();

                    var t0 = new TWEEN.Tween(body.sprite.scale).to({ x: 1.2, y: 1.2 }, 400).easing(TWEEN.Easing.Linear.None);

                    var t1 = new TWEEN.Tween(body.sprite.scale).to({ x: 0, y: 0 }, 2600).easing(TWEEN.Easing.Elastic.InOut);
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
                if (item.fixedToCamera)
                    continue;
                var tween = new TWEEN.Tween(item.position).to({ x: this.gate.position.x, y: this.gate.position.y }, 3000).easing(TWEEN.Easing.Elastic.InOut).delay(2000).start();

                item.pivot.x = 0.5;
                item.pivot.y = 0.5;
                var tr = new TWEEN.Tween(item).to({ rotation: 30 }, 3000).delay(2000).easing(TWEEN.Easing.Bounce.InOut).start();

                var t0 = new TWEEN.Tween(item.scale).to({ x: 0.5, y: 0.5 }, 400).delay(2000).easing(TWEEN.Easing.Linear.None);

                var t1 = new TWEEN.Tween(item.scale).to({ x: 0, y: 0 }, 2600).easing(TWEEN.Easing.Elastic.InOut);
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
        };
        Engine.prototype.doGameOver = function () {
            this.text.setText(_t('Level failed'));
            this.text.position.x = 200;
            this.text.position.y = 200;

            this.trigger('gameover');
        };

        Engine.prototype.createUI = function () {
            var _this = this;
            var button = this.game.add.button(this.game.width - 100, 0, 'buttons', function () {
                _this.loadLevel(_this.currentLevel);
            }, this, 0, 0, 0);

            this.uiGroup.add(button);
        };

        Engine.prototype.loadLevel = function (levelId) {
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
            var data = this.game.cache.getJSON(levelId);
            if (!data)
                return;

            this.initParticles();

            for (var l = 0; l < data.layers.length; l++) {
                if (data.layers[l].type != 'objectgroup')
                    continue;
                var objects = data.layers[l].objects;

                for (var i = 0; i < objects.length; i++) {
                    var obj = objects[i];

                    if (obj.type == 'floor') {
                        var floor = new Ezelia.P2GameEntity(this, 'atari', obj.x + obj.width / 2, obj.y + obj.height / 2);
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
                        var player = new Ezelia.P2PlayerEntity(this, obj.x + obj.width / 2, obj.y + obj.height / 2);
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
                            } else {
                                w = null;
                                h = shape;
                            }
                        }

                        var box = new Ezelia.P2GameObject(this, obj.properties.sprite, obj.x + obj.width / 2, obj.y + obj.height / 2, w, h, mass);
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
                            if (this[_collide[c]] instanceof Phaser.Physics.P2.CollisionGroup)
                                collisions.push(this[_collide[c]]);
                        }
                        var count = parseInt(obj.properties['count']);

                        var interval = obj.properties.interval ? parseInt(obj.properties.interval) : 1000;

                        var special = new Ezelia.P2SpecialEntity(this, spriteId, interval, obj.x + obj.width / 2, obj.y + obj.height / 2, target, collisions, count);
                        special.countCB = Ezelia.LevelScripts[obj.properties['countCB']];
                        special.targetCB = Ezelia.LevelScripts[obj.properties['targetCB']];
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
                if (data.layers[l].type != 'imagelayer')
                    continue;

                var image = data.layers[l];
                if (image.properties && image.properties.fg) {
                    var fg = this.game.add.image(image.x, image.y, image.name);
                    this.fgGroup.add(fg);

                    if (image.properties && image.properties.id) {
                        this.idObjects[image.properties.id] = fg;
                    }
                } else {
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
            game.camera.follow(this.maskObj);
            game.camera.deadzone = new Phaser.Rectangle(200, 200, game.width - 400, game.height - 400);
            game.camera.focusOnXY(0, 0);
            game.world.setBounds(-100, -100, 2000, 2000);

            //game.camera.x = 0;
            //game.camera.y = 0;
            //}
            this.text.setText(this.currentLevel);
        };

        Engine.prototype.switchCamera = function () {
            var idx = util.math.random(0, this.players.length - 1);
            var targetPlayer = this.players[idx];
            if (!targetPlayer)
                return;

            var point = new Phaser.Point(this.cameraTarget.position.x, this.cameraTarget.position.y);
            this.cameraTarget.position = point;

            this.game.camera.follow(this.cameraTarget);

            var _this = this;
            new TWEEN.Tween(point).to({ x: targetPlayer.position.x, y: targetPlayer.position.y }, 500).start().onComplete(function () {
                _this.cameraTarget.position = targetPlayer.position;
                _this.game.camera.follow(this.cameraTarget);
            });
        };

        Engine.prototype.checkDuplicate = function (type) {
            if (type == 'player') {
                if (this.players.length > 80) {
                    this.text.setText(_t('Duplication limit reached'));
                    return false;
                } else
                    return true;
            }

            if (this.game.physics.p2.total > 150) {
                this.text.setText(_t('Chaos limit reached'));
                return false;
            }

            return true;
        };
        Engine.prototype.duplicateEntities = function () {
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

            this.findDuplicable(function (obj) {
                toDuplicate.push(obj);
            });
            while (p = toDuplicate.pop()) {
                var clone = p.duplicate();
                //this.objects.push(clone);
                //this.objectsGroup.add(clone.sprite);
                //clone.body.velocity.y = -500;
                //clone.body.velocity.x = -200;
            }
        };

        Engine.prototype.findDuplicable = function (callback) {
            var x = this.maskObj.position.x;
            var y = this.maskObj.position.y;
            var distance = this.maskObj.graphicsData[0].points[2];

            for (var i = 0; i < this.objects.length; i++) {
                var obj = this.objects[i];
                if (util.math.distance(obj.position.x, obj.position.y, x, y) < distance) {
                    if (typeof callback == 'function')
                        callback(obj);
                }
            }
        };

        Engine.prototype.destroy = function () {
            this.ready = false;
            if (this.levelGroup)
                this.levelGroup.destroy();
            if (this.uiGroup)
                this.uiGroup.destroy();
            this.players.length = 0;
            this.objects.length = 0;
            this.idObjects = {};
            this.emitters.length = 0;
            if (this.particleRenderer)
                this.particleRenderer.reset();
        };

        Engine.prototype.addEmitter = function (name, x, y) {
            var emitter1 = new Ezelia.ParticleSystem.Emitter(name);
            emitter1.settings.pos.x = x;
            emitter1.settings.pos.y = y;
            emitter1.restart();
            this.emitters.push(emitter1);
        };
        Engine.prototype.initParticles = function () {
            var canvas = this.game.canvas;
            Ezelia.ParticleSystem.PredefinedSystems.positionSystems({ width: canvas.width - 10, height: canvas.height - 10 });
            Ezelia.ParticleSystem.PredefinedSystems.setTexture('./assets/img/particle.png');
            var container = new PIXI.DisplayObjectContainer();
            this.particleRenderer = new Ezelia.ParticleSystem.PixiRenderer(container);
            var lastTimestamp = Date.now();

            //var timestamp = Date.now();
            container.preUpdate = function () {
            };
            container.update = function () {
            };
            container.postUpdate = function () {
            };
            container.destroy = function () {
            };

            //just a trick to prevent emitters aspiration
            container.fixedToCamera = true;

            //this.game.world.addChild(container);
            this.fgGroup.add(container);
        };
        Engine.prototype.renderParticles = function (particleTS) {
            var delta = particleTS - (this.particleLastTS || particleTS);

            this.particleLastTS = particleTS;

            delta /= 1000;
            for (var i = 0; i < this.emitters.length; i++) {
                var emitter = this.emitters[i];
                emitter.update(delta);
                this.particleRenderer.render(emitter.particles);
            }
        };
        Engine.prototype.render = function () {
            //this.game.debug.body(this.gate);
            //this.game.debug.body(this.players[0].sprite);
            this.renderParticles(Date.now());
        };
        Engine.prototype.preload = function () {
        };

        Engine.prototype.p2create = function () {
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
        };

        Engine.prototype.p2update = function () {
            TWEEN.update();
            this.callReady = true;
            if (!this.ready)
                return;
            this.updateMask();

            var players = this.players;
            var cursors = this.cursors;
            var jumpButton = this.jumpButton;

            var toDuplicate = [];
            for (var i = 0; i < players.length; i++) {
                var playerSprite = players[i].sprite;
                var player = players[i];

                if (player.spawning)
                    continue;

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
                } else if (cursors.right.isDown) {
                    player.body.velocity.x = (200 + player.leftRand + reduce);

                    if (playerSprite.facing != 'right') {
                        playerSprite.animations.play('right');

                        playerSprite.facing = 'right';
                    }
                } else {
                    playerSprite.body.velocity.x = 0;

                    if (playerSprite.facing != 'idle') {
                        playerSprite.animations.stop();

                        if (playerSprite.facing == 'left') {
                            playerSprite.frame = 0;
                        } else {
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
        };

        Engine.prototype.updateMask = function () {
            if (!this.maskObj || this.players.length <= 0)
                return;

            this.maskObj.position.y = this.players[0].sprite.position.y;
            this.maskObj.position.x = this.players[0].sprite.position.x;

            //mygame.maskObj.graphicsData[0].points
            this.maskObj.graphicsData[0].points[2] = 100;

            var maxdistance = 0;
            var p1;
            var p2;
            for (var i = 0; i < this.players.length; i++) {
                var p = this.players[i];
                var d = util.math.distance(this.maskObj.position.x, this.maskObj.position.y, p.position.x, p.position.y);

                if (d > this.maskObj.graphicsData[0].points[2]) {
                    this.maskObj.graphicsData[0].points[2] = d + 20;
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
            var radius = this.maskObj.graphicsData[0].points[2];

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
        };

        Engine.prototype.checkIfCanJump = function (player) {
            var game = this.game;
            var yAxis = p2.vec2.fromValues(0, 1);
            var result = false;

            for (var i = 0; i < game.physics.p2.world.narrowphase.contactEquations.length; i++) {
                var c = game.physics.p2.world.narrowphase.contactEquations[i];

                if (c.bodyA === player.body.data || c.bodyB === player.body.data) {
                    var d = p2.vec2.dot(c.normalA, yAxis);
                    if (c.bodyA === player.body.data)
                        d *= -1;
                    if (d > 0.5)
                        result = true;
                }
            }

            return result;
        };
        return Engine;
    })(Ezelia.EventHandler);
    Ezelia.Engine = Engine;
})(Ezelia || (Ezelia = {}));
/// <reference path="eventhandler.ts" />
/// <reference path="../lib/phaser.d.ts" />
var Ezelia;
(function (Ezelia) {
    var GameEntity = (function (_super) {
        __extends(GameEntity, _super);
        function GameEntity(engine, spriteId, x, y) {
            if (typeof x === "undefined") { x = 0; }
            if (typeof y === "undefined") { y = 0; }
            _super.call(this);
            this.engine = engine;
            this.spriteId = spriteId;
            this.leftRand = 0;
            this.rightRand = 0;
            this.jumpTimer = 0;
            this.spawning = false;
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
        GameEntity.prototype.duplicate = function () {
            var clone = new GameEntity(this.engine, this.spriteId, this.sprite.position.x, this.sprite.position.y);

            clone.spawning = true;
            setTimeout(function () {
                clone.spawning = false;
                clone.body.velocity.x = 0;
            }, 1000);

            return clone;
        };
        return GameEntity;
    })(Ezelia.EventHandler);
    Ezelia.GameEntity = GameEntity;
})(Ezelia || (Ezelia = {}));
var Ezelia;
(function (Ezelia) {
    var LevelScripts = (function () {
        function LevelScripts() {
        }
        LevelScripts.show_count = function (tag, count, foundTagets, context, me) {
            console.log(' ** gate count =  ', tag, count);
        };

        LevelScripts.kill_gate = function (tag, count, foundTagets, context, me) {
            context.gate.kill();
        };

        LevelScripts.kill_players = function (tag, count, foundTagets, context, me) {
            for (var i = 0; i < foundTagets.length; i++) {
                var p = foundTagets[i];

                p.kill();
            }
        };

        LevelScripts.level_win = function (tag, count, foundTagets, context, me) {
            context.doLevelWin();
        };

        LevelScripts.kill_floor = function (tag, count, foundTagets, context, me, props) {
            var killtags = props['killTag'].split(',');

            for (var i = 0; i < killtags.length; i++) {
                var obj = context.idObjects[killtags[i]];
                if (!obj)
                    continue;
                console.log('killing id obj', killtags[i], obj);
                obj.kill();
            }
        };

        LevelScripts.grainconvert_count = function (tag, count, foundTagets, engine, me, props) {
            for (var i = 0; i < foundTagets.length; i++) {
                var p = foundTagets[i];

                p.tag = 'grain';
                p.sprite.texture = p.popcornSprite.texture;
                p.nodup = true;
                p.spawning = true;

                p.x = 360;
                p.y = 240;
                p.body.velocity.y = -util.math.random(50, 100);
                p.body.velocity.x = util.math.random(100, 150);

                (function (p) {
                    setTimeout(function () {
                        p.spawning = false;
                    }, 1000);
                })(p);
                //p.kill();
            }
        };

        LevelScripts.grain_count = function (tag, count, foundTagets, engine, me, props) {
            for (var i = 0; i < foundTagets.length; i++) {
                var p = foundTagets[i];

                p.kill();
                if (p.tag == 'grain') {
                    (function (x, y) {
                        setTimeout(function () {
                            var box = new Ezelia.P2GameObject(engine, 'popcorn', x, y, null, 'popcorn', 50);
                            box.nodup = true;
                            box.tag = 'popcorn';

                            box.x = x;
                            box.y = y;

                            box.body.velocity.y = util.math.random(50, 100);
                            box.body.velocity.x = -util.math.random(50, 100);
                        }, util.math.random(1000, 2000));
                    })(1408, 608);
                }

                if (p instanceof Ezelia.P2PlayerEntity) {
                    p.tag = undefined;
                } else {
                    p.position.x = -1;
                    p.position.y = -1;
                }
                p.tag = undefined;
            }
        };

        LevelScripts.popcorn_count = function (tag, count, foundTagets, context, me, props) {
            var _self = me;
            if (!_self.popcorns)
                _self.popcorns = 0;

            for (var i = 0; i < foundTagets.length; i++) {
                var p = foundTagets[i];

                p.kill();
                if (p.tag == 'popcorn') {
                    _self.popcorns++;
                }

                //untag it
                if (p instanceof Ezelia.P2PlayerEntity) {
                    p.tag = undefined;
                } else {
                    p.position.x = -1;
                    p.position.y = -1;
                }
                p.tag = undefined;
            }
            if (_self.popcorns >= 3) {
                var killtags = props['killTag'].split(',');

                for (var i = 0; i < killtags.length; i++) {
                    var obj = context.idObjects[killtags[i]];
                    if (!obj)
                        continue;
                    console.log('killing id obj', killtags[i], obj);
                    obj.kill();
                }

                me.kill();
            }
        };
        return LevelScripts;
    })();
    Ezelia.LevelScripts = LevelScripts;
})(Ezelia || (Ezelia = {}));
/// <reference path="eventhandler.ts" />
/// <reference path="../lib/phaser.d.ts" />
var Ezelia;
(function (Ezelia) {
    var P2GameEntity = (function (_super) {
        __extends(P2GameEntity, _super);
        function P2GameEntity(engine, spriteId, x, y) {
            if (typeof x === "undefined") { x = 0; }
            if (typeof y === "undefined") { y = 0; }
            _super.call(this);
            this.engine = engine;
            this.spriteId = spriteId;
            this.leftRand = 0;
            this.rightRand = 0;
            this.jumpTimer = 0;
            this.spawning = false;
            this.nodup = false;
            var game = engine.game;
            this.sprite = game.add.sprite(x, y, spriteId);
            this.sprite._entity = this;

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
        Object.defineProperty(P2GameEntity.prototype, "x", {
            get: function () {
                return this.position.x;
            },
            set: function (v) {
                this.data.position[0] = v / -20;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(P2GameEntity.prototype, "y", {
            get: function () {
                return this.position.y;
            },
            set: function (v) {
                this.data.position[1] = v / -20;
            },
            enumerable: true,
            configurable: true
        });

        P2GameEntity.prototype.duplicate = function () {
            if (!this.engine.checkDuplicate('entity'))
                return;

            var clone = new P2GameEntity(this.engine, this.spriteId, this.sprite.position.x, this.sprite.position.y);

            clone.spawning = true;
            clone.body.moveUp(50 + ~~(Math.random() * 50));
            clone.body.velocity.x = -100 + ~~(Math.random() * 200);
            setTimeout(function () {
                clone.spawning = false;
            }, 1000);

            return clone;
        };

        P2GameEntity.prototype.kill = function () {
            this.sprite.kill();
        };
        return P2GameEntity;
    })(Ezelia.EventHandler);
    Ezelia.P2GameEntity = P2GameEntity;
})(Ezelia || (Ezelia = {}));
/// <reference path="eventhandler.ts" />
/// <reference path="../lib/phaser.d.ts" />
var Ezelia;
(function (Ezelia) {
    var P2GameObject = (function (_super) {
        __extends(P2GameObject, _super);
        function P2GameObject(engine, spriteId, x, y, w, h, mass) {
            if (typeof x === "undefined") { x = 0; }
            if (typeof y === "undefined") { y = 0; }
            _super.call(this, engine, spriteId, x, y);
            this.engine = engine;
            this.spriteId = spriteId;
            this.w = w;
            this.h = h;
            this.mass = mass;

            if (typeof h == 'string') {
                this.body.clearShapes();
                this.body.loadPolygon('physicsData', h);
                this.body.fixedRotation = false;
            } else {
                if (w)
                    this.sprite.width = w;
                if (h)
                    this.sprite.height = h;

                if (w != null && h == null) {
                    this.body.setCircle(w / 2);
                } else {
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
                if (_this.body.mass < 100)
                    return;
                if (!body || body.tag != 'player')
                    return;
                if (body.velocity.y > 0.1)
                    return;
                var playerBody = equation[0].bodyA.parent.sprite._entity instanceof Ezelia.P2PlayerEntity ? equation[0].bodyA : equation[0].bodyB;
                var objBody = playerBody == equation[0].bodyA ? equation[0].bodyB : equation[0].bodyA;

                if (playerBody.parent.sprite.position.y > objBody.parent.sprite.position.y + objBody.parent.sprite.height / 1.5) {
                    console.log('HEIGHT = ', equation[0].bodyA.parent.sprite._entity.tag, equation[0].bodyA.parent.sprite.position.y, equation[0].bodyB.parent.sprite.position.y, equation[0].bodyB.parent.sprite.height);
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
        P2GameObject.prototype.duplicate = function () {
            if (this.nodup)
                return;
            if (!this.engine.checkDuplicate('object'))
                return;

            var clone = new P2GameObject(this.engine, this.spriteId, this.position.x, this.position.y - this.sprite.height, this.w, this.h, this.mass);

            clone.spawning = true;

            clone.body.velocity.y = -(50 + ~~(Math.random() * 50));
            clone.body.velocity.x = -100 + ~~(Math.random() * 200);
            setTimeout(function () {
                clone.spawning = false;
            }, 1000);

            return clone;
        };
        return P2GameObject;
    })(Ezelia.P2GameEntity);
    Ezelia.P2GameObject = P2GameObject;
})(Ezelia || (Ezelia = {}));
/// <reference path="eventhandler.ts" />
/// <reference path="../lib/phaser.d.ts" />
var Ezelia;
(function (Ezelia) {
    var P2PlayerEntity = (function (_super) {
        __extends(P2PlayerEntity, _super);
        function P2PlayerEntity(engine, x, y) {
            if (typeof x === "undefined") { x = 0; }
            if (typeof y === "undefined") { y = 0; }
            _super.call(this, engine, 'dude', x, y);
            this.engine = engine;

            this.popcornSprite = engine.game.add.sprite(x, y, 'popcorndude');
            this.popcornSprite.visible = false;

            this.dieSprite = engine.game.add.sprite(x, y, 'die');
            this.dieSprite.position = this.sprite.position;
            this.dieSprite.visible = false;
            this.dieSprite.animations.add('die', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 30, false);

            this.sprite.animations.add('idle', [4], 1, true);
            this.sprite.animations.add('left', [0, 1, 2, 3], 10, true);
            this.sprite.animations.add('jleft', [2], 10, true);
            this.sprite.animations.add('turn', [4], 20, true);
            this.sprite.animations.add('right', [5, 6, 7, 8], 10, true);
            this.sprite.animations.add('jright', [7], 10, true);
            this.body.fixedRotation = true;

            //this.body.setCircle(15);
            this.body.mass = 10;

            this.sprite.anchor.y = 0.5 + (util.math.random(0, 3) / 10);
            this.tag = 'player';
            this.body.setMaterial(engine.playerMaterial);

            this.body.tag = 'player';

            engine.players.push(this);
            this.body.setCollisionGroup(engine.playerCollisionGroup);
            this.body.collides([engine.objCollisionGroup]);
        }
        P2PlayerEntity.prototype.duplicate = function () {
            if (this.nodup || !this.engine.checkDuplicate('player'))
                return;

            var clone = new P2PlayerEntity(this.engine, this.sprite.position.x, this.sprite.position.y);

            clone.spawning = true;

            clone.tag = this.tag;

            if (clone.tag == 'grain') {
                clone.sprite.texture = clone.popcornSprite.texture;
            }

            clone.body.velocity.y = -(150 + ~~(Math.random() * 150));
            clone.body.velocity.x = -150 + ~~(Math.random() * 300);
            setTimeout(function () {
                clone.spawning = false;
            }, 1000);

            return clone;
        };

        P2PlayerEntity.prototype.kill = function () {
            //console.log('killing player ');
            var found = -1;
            for (var i = 0; i < this.engine.players.length; i++) {
                var player = this.engine.players[i];
                if (player.body.data.id == this.body.data.id) {
                    found = i;
                    break;
                }
            }

            if (found != -1) {
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
        };
        return P2PlayerEntity;
    })(Ezelia.P2GameEntity);
    Ezelia.P2PlayerEntity = P2PlayerEntity;
})(Ezelia || (Ezelia = {}));
/// <reference path="eventhandler.ts" />
/// <reference path="../lib/phaser.d.ts" />
var Ezelia;
(function (Ezelia) {
    var P2SpecialEntity = (function (_super) {
        __extends(P2SpecialEntity, _super);
        function P2SpecialEntity(engine, spriteId, interval, x, y, tag, collides, targetCount, countCB, targetCB, props) {
            if (typeof x === "undefined") { x = 0; }
            if (typeof y === "undefined") { y = 0; }
            if (typeof tag === "undefined") { tag = ''; }
            if (typeof targetCount === "undefined") { targetCount = 1; }
            _super.call(this, engine, spriteId, x, y);
            this.engine = engine;
            this.spriteId = spriteId;
            this.countCB = countCB;
            this.targetCB = targetCB;
            this.props = props;
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
                    if (tag.indexOf(p.tag) == -1)
                        continue;

                    if (p.sprite.position.y > _this.position.y)
                        continue;

                    var d = util.math.distance(p.sprite.position.x, p.sprite.position.y, _this.position.x, _this.position.y);

                    if (d < _this.sprite.width) {
                        count++;
                        foundTagets.push(p);
                    }
                }

                for (var i = 0; i < engine.objects.length; i++) {
                    var p = engine.objects[i];
                    if (tag.indexOf(p.tag) == -1)
                        continue;

                    if (p.sprite.position.y > _this.position.y)
                        continue;

                    var d = util.math.distance(p.sprite.position.x, p.sprite.position.y, _this.position.x, _this.position.y);

                    if (d < _this.sprite.width) {
                        count++;
                        foundTagets.push(p);
                    }
                }

                if (count >= targetCount && typeof _this.targetCB == 'function') {
                    _this.targetCB(tag, count, foundTagets, _this.engine, _this, _this.props);
                } else {
                    if (typeof _this.countCB == 'function')
                        _this.countCB(tag, count, foundTagets, _this.engine, _this, _this.props);
                }
            }, interval);
        }
        P2SpecialEntity.prototype.kill = function () {
            clearInterval(this.itv);

            try  {
                _super.prototype.kill.call(this);
            } catch (ex) {
            }
        };
        P2SpecialEntity.prototype.duplicate = function () {
            return this;
        };
        return P2SpecialEntity;
    })(Ezelia.P2GameEntity);
    Ezelia.P2SpecialEntity = P2SpecialEntity;
})(Ezelia || (Ezelia = {}));
/// <reference path="eventhandler.ts" />
/// <reference path="../lib/phaser.d.ts" />
var Ezelia;
(function (Ezelia) {
    var PlayerEntity = (function (_super) {
        __extends(PlayerEntity, _super);
        function PlayerEntity(engine, x, y) {
            if (typeof x === "undefined") { x = 0; }
            if (typeof y === "undefined") { y = 0; }
            _super.call(this, engine, 'dude', x, y);
            this.engine = engine;

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
        PlayerEntity.prototype.duplicate = function () {
            if (this.engine.players.length >= 100)
                return;
            var clone = new PlayerEntity(this.engine, this.sprite.position.x, this.sprite.position.y);
            clone.body.velocity.y = -(200 + ~~(Math.random() * 100));
            clone.body.velocity.x = -100 + ~~(Math.random() * 200);

            clone.spawning = true;
            setTimeout(function () {
                clone.spawning = false;
                clone.body.velocity.x = 0;
            }, 1000);

            return clone;
        };
        return PlayerEntity;
    })(Ezelia.GameEntity);
    Ezelia.PlayerEntity = PlayerEntity;
})(Ezelia || (Ezelia = {}));
var Ezelia;
(function (Ezelia) {
    var preloader = (function () {
        function preloader() {
        }
        preloader.pad = function (n, width, z) {
            z = z || '0';
            n = n + '';
            return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
        };

        preloader.preload = function () {
            this.game.load.image('gate', 'assets/img/gate.png');
            this.game.load.image('atari', 'assets/img/block.png');
            this.game.load.image('background', 'assets/img/background2.png');
            this.game.load.image('background1', 'assets/img/background1.png');

            var arr = ['pf', 'fg', 'bg'];
            for (var i = 1; i <= 20; i++) {
                for (var p = 0; p < arr.length; p++) {
                    var name = arr[p];
                    this.game.load.image(name + preloader.pad(i, 2), 'assets/img/' + name + preloader.pad(i, 2) + '.png');
                    this.game.load.image(name + preloader.pad(i, 2) + '-gs', 'assets/img/' + name + preloader.pad(i, 2) + '-gs.png');
                }
            }

            this.game.load.image('fg1', 'assets/img/fg1.png');

            this.game.load.image('bg01', 'assets/img/bg01.png');

            this.game.load.image('gatex2', 'assets/img/gatex2.png');
            this.game.load.image('gatex2-gs', 'assets/img/gatex2.png');

            this.game.load.json('level1', './assets/levels/level1.json');
            this.game.load.json('level2', './assets/levels/level2.json');
            this.game.load.json('level3', './assets/levels/level3.json');

            this.game.load.spritesheet('dude', 'assets/img/dude.png', 32, 48);
            this.game.load.spritesheet('popcorndude', 'assets/img/popcorndude.png', 32, 48);
            this.game.load.spritesheet('die', 'assets/img/die.png', 30, 60);

            this.game.load.image('rock1', './assets/img/rock1.png');
            this.game.load.image('rock3', './assets/img/rock3.png');
            this.game.load.image('rock4', './assets/img/rock4.png');
            this.game.load.image('rock5', './assets/img/rock5.png');
            this.game.load.image('popcorn', './assets/img/popcorn.png');

            this.game.load.spritesheet('buttons', './assets/img/buttons.png', 75, 75);
            this.game.load.spritesheet('play', './assets/img/play.png', 200, 75);

            //	Load our physics data exported from PhysicsEditor
            this.game.load.physics('physicsData', 'assets/img/physics.json');
        };
        return preloader;
    })();
    Ezelia.preloader = preloader;
})(Ezelia || (Ezelia = {}));
var local = {};
function _t(text) {
    if (!local[text]) {
        console.warn('No translation found for : ', text);
    }
    return local[text] || text;
}
var util;
(function (util) {
    (function (math) {
        function round(n) {
            return (0.5 + n) << 0;
        }
        math.round = round;

        function random(from, to) {
            return Math.floor(Math.random() * (to - from + 1) + from);
        }
        math.random = random;
        function distance(x1, y1, x2, y2) {
            return Math.sqrt((Math.pow((x2 - x1), 2)) + (Math.pow((y2 - y1), 2)));
        }
        math.distance = distance;

        function getAngle(sourcePos, targetPos) {
            var ab = { x: 1, y: 0 };
            var cb = { x: sourcePos.x - targetPos.x, y: sourcePos.y - targetPos.y };

            var dot = (ab.x * cb.x + ab.y * cb.y);
            var cross = (ab.x * cb.y - ab.y * cb.x);

            var alpha = Math.atan2(cross, dot);

            return Math.floor(alpha * 180 / Math.PI + 0.5);
        }
        math.getAngle = getAngle;

        function getAngleABC(a, b, c) {
            var ab = { x: b.x - a.x, y: b.y - a.y };
            var cb = { x: b.x - c.x, y: b.y - c.y };

            var dot = (ab.x * cb.x + ab.y * cb.y);
            var cross = (ab.x * cb.y - ab.y * cb.x);

            var alpha = Math.atan2(cross, dot);

            return Math.floor(alpha * 180 / Math.PI + 0.5);
        }
        math.getAngleABC = getAngleABC;
        function d2h(d) {
            return d.toString(16);
        }
        math.d2h = d2h;
        function h2d(h) {
            return parseInt(h, 16);
        }
        math.h2d = h2d;
        function d2o(d) {
            return d.toString(8);
        }
        math.d2o = d2o;
        function o2d(h) {
            return parseInt(h, 8);
        }
        math.o2d = o2d;

        function sign(n) {
            return n == 0 ? 0 : n / Math.abs(n);
        }
        math.sign = sign;
    })(util.math || (util.math = {}));
    var math = util.math;
})(util || (util = {}));
//# sourceMappingURL=game.all.js.map
