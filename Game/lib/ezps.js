var Ezelia;
(function (Ezelia) {
    (function (ParticleSystem) {
        /*
        * Given a vector of any length, returns a vector
        * pointing in the same direction but with a magnitude of 1
        */
        function normalize(vector) {
            var length = Math.sqrt(vector.x * vector.x + vector.y * vector.y);

            vector.x /= length;
            vector.y /= length;
        }

        var Emitter = (function () {
            function Emitter(system, defaultTexture) {
                this.time = Date.now();
                this.id = (Math.random() * 1e20).toString(36);
                this._totalParticles = 0;
                this.emissionRate = 0;
                this.allOrNone = false;
                this.aFactor = { x: 0, y: 0 };
                this.xFactor = { x: 0, y: 0 };
                this._xEqName = '';
                this._yEqName = '';
                this.active = false;
                this.duration = 0;
                this.cycles = Infinity;
                this.settings = new ParticleSystem.EmitterEntity();
                this._particleCount = 0;
                this._particleIndex = 0;
                this._elapsed = 0;
                this._emitCounter = 0;
                this.edge = { top: 100, left: 100, bottom: 100, right: 100 };
                this._defaultTexture = defaultTexture;

                if (!system || typeof system === 'string') {
                    var predefinedSystem = ParticleSystem.PredefinedSystems.getSystem(system);
                    this._predefinedSystemName = predefinedSystem.name;
                    system = predefinedSystem.system;
                } else {
                    this._predefinedSystemName = '';
                }

                this._baseSystem = ParticleSystem.util.clone(system, ['texture']);
                this.loadConfig(system);
            }
            Object.defineProperty(Emitter.prototype, "xEquation", {
                //#region [Getters/Setters] ===========================================
                get: function () {
                    return this._xEqName;
                },
                set: function (value) {
                    if (typeof Math[value] == 'function') {
                        this._xEqName = value;
                        this._xEquation = Math[value];
                    } else {
                        this._xEqName = '';
                        this._xEquation = undefined;
                    }
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Emitter.prototype, "yEquation", {
                get: function () {
                    return this._yEqName;
                },
                set: function (value) {
                    if (typeof Math[value] == 'function') {
                        this._yEqName = value;
                        this._yEquation = Math[value];
                    } else {
                        this._yEqName = '';
                        this._yEquation = undefined;
                    }
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Emitter.prototype, "particles", {
                get: function () {
                    return this._particlePool;
                },
                set: function (value) {
                    this._particlePool = value;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Emitter.prototype, "totalParticles", {
                get: function () {
                    return this._totalParticles;
                },
                set: function (tp) {
                    tp = tp | 0;
                    if (tp !== this._totalParticles) {
                        this._totalParticles = tp;
                        this.restart();
                    }
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Emitter.prototype, "predefinedSystem", {
                get: function () {
                    return this._predefinedSystemName;
                },
                set: function (ps) {
                    if (this._predefinedSystemName !== ps) {
                        this._predefinedSystemName = ps;
                        this._baseSystem = ParticleSystem.PredefinedSystems.getSystem(ps).system;
                        this.reset();
                    }
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Emitter.prototype, "textureFile", {
                get: function () {
                    return (this._file && this._file.name) || '';
                },
                set: function (file) {
                    try  {
                        ParticleSystem.TextureLoader.load(this, 'texture', file);
                        this._file = file;
                    } catch (e) {
                    }
                },
                enumerable: true,
                configurable: true
            });

            //#endregion ===========================================================
            /*
            * Applies all the properties in config to the particle system,
            * a good way to change just one or two things about the system
            * on the fly
            */
            Emitter.prototype.overlay = function (config) {
                ParticleSystem.util.extend(this, config);
                this.restart();
            };

            Emitter.prototype.resetTexture = function () {
                this.overlay({
                    texture: this._defaultTexture
                });
            };

            /*
            * completely reconfigures the particle system. First applies all
            * the defaults, then overlays everything found in config
            */
            Emitter.prototype.loadConfig = function (config) {
                this._totalParticles = 0;
                this.emissionRate = 0;

                this.active = false;
                this.duration = 0;

                this.settings.pos.x = 0;
                this.settings.pos.y = 0;

                this.settings.posVar.x = 0;
                this.settings.posVar.y = 0;

                this.settings.speed = 0;
                this.settings.speedVar = 0;

                this.settings.angle = 0;
                this.settings.angleVar = 0;

                this.settings.life = 0;
                this.settings.lifeVar = 0;

                this.settings.radius = 0;
                this.settings.radiusVar = 0;

                this.settings.texture = null;

                this.settings.textureAdditive = false;

                this.settings.startScale = 0;
                this.settings.startScaleVar = 0;
                this.settings.endScale = 0;
                this.settings.endScaleVar = 0;

                this.settings.startColor[0] = 0;
                this.settings.startColor[1] = 0;
                this.settings.startColor[2] = 0;
                this.settings.startColor[3] = 0;

                this.settings.startColorVar[0] = 0;
                this.settings.startColorVar[1] = 0;
                this.settings.startColorVar[2] = 0;
                this.settings.startColorVar[3] = 0;

                this.settings.endColor[0] = 0;
                this.settings.endColor[1] = 0;
                this.settings.endColor[2] = 0;
                this.settings.endColor[3] = 0;

                this.settings.endColorVar[0] = 0;
                this.settings.endColorVar[1] = 0;
                this.settings.endColorVar[2] = 0;
                this.settings.endColorVar[3] = 0;

                this.settings.gravity.x = 0;
                this.settings.gravity.y = 0;

                this.settings.radialAccel = 0;
                this.settings.radialAccelVar = 0;
                this.settings.tangentialAccel = 0;
                this.settings.tangentialAccelVar = 0;

                ParticleSystem.util.recursiveExtend(this.settings, config, Emitter.params);
                ParticleSystem.util.recursiveExtendInclusive(this, config, Emitter.params);

                this.id = config.name || this.id;

                /*
                this.duration = config.duration;
                this.emissionRate = config.emissionRate
                this.totalParticles = config.totalParticles;
                if (config.edge) {
                this.edge.top = config.edge.top;
                this.edge.left = config.edge.left;
                this.edge.bottom= config.edge.bottom;
                this.edge.right = config.edge.right;
                }
                if (config.xFactor) {
                this.xFactor.x = config.xFactor.x;
                this.xFactor.y = config.xFactor.y;
                }
                if (config.aFactor) {
                this.aFactor.x = config.aFactor.x;
                this.aFactor.y = config.aFactor.y;
                }
                */
                //this.active = config.ac
                this.restart();
            };

            /*
            * flushes out the particle pool and starts the system over
            * from the beginning. Replacing all the particles with new ones
            * is a bit nuclear, but gets the job done
            */
            Emitter.prototype.restart = function () {
                this._particlePool = [];

                for (var i = 0; i < this.totalParticles; ++i) {
                    this._particlePool.push(new ParticleSystem.Particle());
                }

                this._particleCount = 0;
                this._particleIndex = 0;
                this._elapsed = 0;
                this._emitCounter = 0;
            };

            Emitter.prototype.reset = function () {
                this.loadConfig(this._baseSystem);
            };

            /*
            * Returns whether all the particles in the pool are currently active
            */
            Emitter.prototype._isFull = function () {
                return this._particleCount === this.totalParticles;
            };

            /*
            * Recycle particle if available, otherwise do nothing
            */
            Emitter.prototype.createParticle = function () {
                if (this._isFull()) {
                    return false;
                }

                var p = this._particlePool[this._particleCount];

                this.initParticle(p);

                this._particleCount++;

                return true;
            };

            /*
            * Initializes the particle based on the current settings
            * of the particle system
            */
            Emitter.prototype.initParticle = function (particle) {
                particle.texture = this.settings.texture;

                particle.textureAdditive = this.settings.textureAdditive;

                particle.pos.x = this.settings.pos.x + this.settings.posVar.x * ParticleSystem.util.random11();
                particle.pos.y = this.settings.pos.y + this.settings.posVar.y * ParticleSystem.util.random11();

                var angle = this.settings.angle + this.settings.angleVar * ParticleSystem.util.random11();
                var speed = this.settings.speed + this.settings.speedVar * ParticleSystem.util.random11();

                // it's easier to set speed and angle at this level
                // but once the particle is active and being updated, it's easier
                // to use a vector to indicate speed and angle. So particle.setVelocity
                // converts the angle and speed values to a velocity vector
                particle.setVelocity(angle, speed);

                particle.radialAccel = this.settings.radialAccel + this.settings.radialAccelVar * ParticleSystem.util.random11() || 0;
                particle.tangentialAccel = this.settings.tangentialAccel + this.settings.tangentialAccelVar * ParticleSystem.util.random11() || 0;

                var life = this.settings.life + this.settings.lifeVar * ParticleSystem.util.random11() || 0;
                particle.life = Math.max(0, life);

                particle.scale = ParticleSystem.util.isNumber(this.settings.startScale) ? this.settings.startScale : 1;
                particle.deltaScale = ParticleSystem.util.isNumber(this.settings.endScale) ? (this.settings.endScale - this.settings.startScale) : 0;
                particle.deltaScale /= particle.life;

                particle.radius = ParticleSystem.util.isNumber(this.settings.radius) ? this.settings.radius + (this.settings.radiusVar || 0) * ParticleSystem.util.random11() : 0;

                // color
                // note that colors are stored as arrays => [r,g,b,a],
                // this makes it easier to tweak the color every frame in _updateParticle
                // The renderer will take this array and turn it into a css rgba string
                if (this.settings.startColor) {
                    var startColor = [this.settings.startColor[0] + this.settings.startColorVar[0] * ParticleSystem.util.random11(), this.settings.startColor[1] + this.settings.startColorVar[1] * ParticleSystem.util.random11(), this.settings.startColor[2] + this.settings.startColorVar[2] * ParticleSystem.util.random11(), this.settings.startColor[3] + this.settings.startColorVar[3] * ParticleSystem.util.random11()];

                    // if there is no endColor, then the particle will end up staying at startColor the whole time
                    var endColor = startColor;
                    if (this.settings.endColor) {
                        endColor = [this.settings.endColor[0] + this.settings.endColorVar[0] * ParticleSystem.util.random11(), this.settings.endColor[1] + this.settings.endColorVar[1] * ParticleSystem.util.random11(), this.settings.endColor[2] + this.settings.endColorVar[2] * ParticleSystem.util.random11(), this.settings.endColor[3] + this.settings.endColorVar[3] * ParticleSystem.util.random11()];
                    }

                    particle.color = startColor;
                    particle.deltaColor = [(endColor[0] - startColor[0]) / particle.life, (endColor[1] - startColor[1]) / particle.life, (endColor[2] - startColor[2]) / particle.life, (endColor[3] - startColor[3]) / particle.life];

                    for (var c = 0; c < 3; c++) {
                        particle.startColor[c] = ~~particle.startColor[c];
                        particle.endColor[c] = ~~particle.endColor[c];
                        particle.deltaColor[c] = ~~particle.deltaColor[c];
                    }
                }
            };

            /*
            * Updates a particle based on how much time has passed in delta
            * Moves the particle using its velocity and all forces acting on it (gravity,
            * radial and tangential acceleration), and updates all the properties of the
            * particle like its size, color, etc
            */
            Emitter.prototype.updateParticle = function (p, delta, i) {
                var inEdge = (!this.edge) || (p.pos.x >= this.settings.pos.x - this.edge.left && p.pos.y >= this.settings.pos.y - this.edge.top && p.pos.x <= this.settings.pos.x + this.edge.right && p.pos.y <= this.settings.pos.y + this.edge.bottom);

                if (!inEdge) {
                    p.life = 0;
                }

                if (p.life > 0) {
                    p.radial.x = 0;
                    p.radial.y = 0;
                    p.forces.x = 0;
                    p.forces.y = 0;

                    // dont apply radial forces until moved away from the emitter
                    if ((p.pos.x !== this.settings.pos.x || p.pos.y !== this.settings.pos.y) && (p.radialAccel || p.tangentialAccel)) {
                        p.radial.x = p.pos.x - this.settings.pos.x;
                        p.radial.y = p.pos.y - this.settings.pos.y;

                        normalize(p.radial);
                    }

                    p.tangential.x = p.radial.x;
                    p.tangential.y = p.radial.y;

                    p.radial.x *= p.radialAccel;
                    p.radial.y *= p.radialAccel;

                    var newy = p.tangential.x;
                    p.tangential.x = -p.tangential.y;
                    p.tangential.y = newy;

                    p.tangential.x *= p.tangentialAccel;
                    p.tangential.y *= p.tangentialAccel;

                    p.forces.x = p.radial.x + p.tangential.x + this.settings.gravity.x;
                    p.forces.y = p.radial.y + p.tangential.y + this.settings.gravity.y;

                    p.forces.x *= delta;
                    p.forces.y *= delta;

                    p.vel.x += p.forces.x;
                    p.vel.y += p.forces.y;

                    p.lastpos.x = p.pos.x;
                    p.lastpos.y = p.pos.y;

                    var ax = 0;
                    var ay = 0;
                    if (this._xEquation)
                        ax = this.aFactor.x * this._xEquation(p.life * this.xFactor.x * Math.PI);
                    if (this._yEquation)
                        ay = this.aFactor.y * this._yEquation(p.life * this.xFactor.y * Math.PI);

                    p.pos.x += p.vel.x * delta + ax;
                    p.pos.y += p.vel.y * delta + ay;

                    p.life -= delta;

                    p.scale += p.deltaScale * delta;

                    if (p.color) {
                        if (this.settings.colorList.length > 0) {
                            p.color[0] = this.settings.colorList[p.colorIdx][0];
                            p.color[1] = this.settings.colorList[p.colorIdx][1];
                            p.color[2] = this.settings.colorList[p.colorIdx][2];
                            p.color[3] = this.settings.colorList[p.colorIdx][3];

                            p.colorIdx++;
                            if (p.colorIdx >= this.settings.colorList.length)
                                p.colorIdx = 0;
                        } else {
                            p.color[0] += p.deltaColor[0] * delta;
                            p.color[1] += p.deltaColor[1] * delta;
                            p.color[2] += p.deltaColor[2] * delta;
                            p.color[3] += p.deltaColor[3] * delta;
                        }
                    }

                    ++this._particleIndex;
                } else {
                    p.color[3] = 0;

                    // the particle has died, time to return it to the particle pool
                    // take the particle at the current index
                    var temp = this._particlePool[i];

                    // and move it to the end of the active particles, keeping all alive particles pushed
                    // up to the front of the pool
                    this._particlePool[i] = this._particlePool[this._particleCount - 1];
                    this._particlePool[this._particleCount - 1] = temp;

                    // decrease the count to indicate that one less particle in the pool is active.
                    --this._particleCount;
                }
            };

            Emitter.prototype.update = function (delta) {
                this._elapsed += delta;
                this.active = this._elapsed < this.duration;

                if (!this.active) {
                    return;
                }

                if (this.emissionRate) {
                    // emit new particles based on how much time has passed and the emission rate
                    var rate = 1.0 / this.emissionRate;
                    this._emitCounter += delta;
                    if (!this.allOrNone) {
                        while (!this._isFull() && this._emitCounter > rate) {
                            this.createParticle();
                            this._emitCounter -= rate;
                        }
                        ;
                    } else if (this._particleCount == 0 && this.cycles > 0) {
                        while (!this._isFull()) {
                            this.createParticle();
                        }
                        ;
                        this.cycles--;
                    }
                }

                this._particleIndex = 0;

                while (this._particleIndex < this._particleCount) {
                    var p = this._particlePool[this._particleIndex];
                    this.updateParticle(p, delta, this._particleIndex);
                }
            };
            Emitter.params = ['id', 'edge', 'duration', 'emissionRate', 'totalParticles', 'xFactor', 'aFactor', 'xEquation', 'yEquation'];
            return Emitter;
        })();
        ParticleSystem.Emitter = Emitter;
        ;
    })(Ezelia.ParticleSystem || (Ezelia.ParticleSystem = {}));
    var ParticleSystem = Ezelia.ParticleSystem;
})(Ezelia || (Ezelia = {}));
var Ezelia;
(function (Ezelia) {
    (function (ParticleSystem) {
        /*
        */
        var EmitterEntity = (function () {
            function EmitterEntity() {
                this.pos = { x: 0, y: 0 };
                this.posVar = { x: 0, y: 0 };
                this.speed = 0;
                this.speedVar = 0;
                this.angle = 0;
                this.angleVar = 0;
                this.life = 0;
                this.lifeVar = 0;
                this.radius = 0;
                this.radiusVar = 0;
                this.textureAdditive = false;
                this.startScale = 0;
                this.startScaleVar = 0;
                this.endScale = 0;
                this.endScaleVar = 0;
                this.startColor = [0, 0, 0, 0];
                this.startColorVar = [0, 0, 0, 0];
                this.endColor = [0, 0, 0, 0];
                this.endColorVar = [0, 0, 0, 0];
                this.colorList = [];
                this.gravity = { x: 0, y: 0 };
                this.radialAccel = 0;
                this.radialAccelVar = 0;
                this.tangentialAccel = 0;
                this.tangentialAccelVar = 0;
            }
            return EmitterEntity;
        })();
        ParticleSystem.EmitterEntity = EmitterEntity;
    })(Ezelia.ParticleSystem || (Ezelia.ParticleSystem = {}));
    var ParticleSystem = Ezelia.ParticleSystem;
})(Ezelia || (Ezelia = {}));
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Ezelia;
(function (Ezelia) {
    (function (ParticleSystem) {
        var Particle = (function (_super) {
            __extends(Particle, _super);
            function Particle() {
                _super.call(this);
                this.lastpos = { x: -1, y: -1 };
                this.vel = { x: 0, y: 0 };
                this.forces = { x: 0, y: 0 };
                this.radial = { x: 0, y: 0 };
                this.tangential = { x: 0, y: 0 };
                this.colorIdx = 0;
                this.setVelocity(0, 0);
            }
            Particle.prototype.setVelocity = function (angle, speed) {
                this.vel.x = Math.cos(ParticleSystem.util.toRad(angle)) * speed;
                this.vel.y = -Math.sin(ParticleSystem.util.toRad(angle)) * speed;
            };
            return Particle;
        })(ParticleSystem.EmitterEntity);
        ParticleSystem.Particle = Particle;
    })(Ezelia.ParticleSystem || (Ezelia.ParticleSystem = {}));
    var ParticleSystem = Ezelia.ParticleSystem;
})(Ezelia || (Ezelia = {}));
var Ezelia;
(function (Ezelia) {
    (function (ParticleSystem) {
        var PixiRenderer = (function () {
            function PixiRenderer(context) {
                this.context = context;
                this.defaultTexture = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAACz0lEQVR42t2XP0hbURTGnfp/KK3QFiylCG11aRYpBQWFDiJCg266BNQtdnBQyOASQjp1KS4KGVw6iXMWEUdHUShkCBhSQpaQkJg/Jmm/H3xLEdtaWvLawMfJvfec79x77jnnvdfX96/9MpnM9VwudzOfz98qFAq3kYyZ/6tOi8XinVKpdLdSqfRXq9UHwsNarfYIyZh51tH7Y5s5Pj6+BqHI7+OsXq8/aTQag8LzZrM5JAwjGTPPOnroY4f9bzvPZrM3OBEnFPFTOXohvGy1WiPC6/Pz81FhDMmYedbRQx877OG5snPutFwu3zs7OxvQyZ6JPGSnE8KkMN1ut98KYSRjz094MyHssIcHviud3M4fE15OJuJxOZoSZoU5ISIsCIuWEc+zPoW+IzIED3y/FAnujLCxczt/JbI3Pum8sCQsCyudTmdVWEMy9vyS9cLYYe9NDMD705wgcbg7h33Ezmd8wqidrgtxISm8t4x7ns1ErT/jTYzABy/8Pyw1spcE4g4d9rDJ3ok8JiSED8KGsClsWW54nvUY+rYL+zpC8MJ/aYmyO0qILCaRfOfzPnnMJ/0opIRPwk63291FepzyetKbiNp+Cj544b80CtwRdUwpkc1OqCWHPWHybTtNS+5LHlimPb9tvYSvg5yYhQ9e+PFzWfj7aSa++0ln9bLvlvCm7GRP8lDySDhBerzn9ZT1152Yc/A5Fwbxc+EaqFPaKR3N9T7tO1xxgm04zJz0UPis/6fCFyRjbyJtPfTjro4IfPDCj58LfYEHCllKydDZ3GQWHP6kE23H4T6y05Jk1fLUkdh3TmzabtV9gmY1Cj9+8PfdBniqOQGHaa/O/kXXOaW25fAeOOycvPpVP6THJ86JXVcHdmtuVlTDGPz4wV+wItDzHOh5FfS8DwSiE/b8WdDzp2Eg3gd6/kYUiHfCQLwVB+K7IBBfRoH5Nvyvf98A3rZr7fen7G8AAAAASUVORK5CYII=';
                this.buffer = [];
            }
            /*
            * renders a particle using the particle's texture. The texture is typically a white
            * image and so need to use a secondary buffer to "tint" this image based on the
            * particle's color.
            */
            PixiRenderer.prototype._renderParticleTexture = function (particle) {
                if (!particle.sprite) {
                    var texture = PIXI.Texture.fromImage(particle.texture || this.defaultTexture);
                    particle.sprite = new PIXI.Sprite(texture);

                    particle.sprite.__parentParticle = particle;

                    particle.sprite.anchor.x = 0.5;
                    particle.sprite.anchor.y = 0.5;

                    particle.sprite.tail = 0;
                }

                if (!particle.inserted) {
                    particle.inserted = true;
                    this.buffer.push(particle.sprite);
                    this.context.addChild(particle.sprite);
                    //this.context.addChild(particle.graphics);
                }

                particle.sprite.width = particle.radius * particle.scale;
                particle.sprite.height = particle.radius * particle.scale;

                //particle.sprite.scale.x = particle.scale || 1;
                //particle.sprite.scale.y = particle.scale || 1;
                particle.sprite.position.x = particle.pos.x;
                particle.sprite.position.y = particle.pos.y;
                if (particle.textureAdditive) {
                    particle.sprite.blendMode = PIXI.blendModes.ADD;
                } else {
                    particle.sprite.blendMode = PIXI.blendModes.NORMAL;
                }

                //particle.sprite.texture.tintCache = undefined;
                particle.sprite.tint = ~~particle.color[2] + 256 * ~~particle.color[1] + 65536 * ~~particle.color[0];
                particle.sprite.alpha = particle.color[3];
                //particle.sprite.rotation = 45 * Math.PI / 180;
                //particle.sprite.height *= 0.5;
                //particle.sprite.width *= 0;
                //if (particle.sprite.tail < 10) {
                //    //particle.sprite.alpha = 0;
                //    var snapshot = particle.sprite.generateTexture();
                //    particle.sprite.setTexture(snapshot);
                //    var spr = new PIXI.Sprite(snapshot);
                //    this.context.addChild(spr);
                //    particle.sprite.tail++;
                //}
            };

            PixiRenderer.prototype.render = function (particles) {
                for (var i = 0; i < particles.length; ++i) {
                    var p = particles[i];
                    if (p.life > 0 && p.color) {
                        this._renderParticleTexture(p);
                    }
                }
            };

            PixiRenderer.prototype.reset = function () {
                do {
                    var sprite = this.buffer.pop();
                    if (!sprite)
                        continue;
                    this.context.removeChild(sprite);

                    if (sprite.__parentParticle)
                        sprite.__parentParticle.inserted = false;
                } while(this.buffer.length > 0);
            };
            return PixiRenderer;
        })();
        ParticleSystem.PixiRenderer = PixiRenderer;
    })(Ezelia.ParticleSystem || (Ezelia.ParticleSystem = {}));
    var ParticleSystem = Ezelia.ParticleSystem;
})(Ezelia || (Ezelia = {}));
var Ezelia;
(function (Ezelia) {
    (function (ParticleSystem) {
        var Point = (function () {
            function Point() {
            }
            return Point;
        })();
        ParticleSystem.Point = Point;
    })(Ezelia.ParticleSystem || (Ezelia.ParticleSystem = {}));
    var ParticleSystem = Ezelia.ParticleSystem;
})(Ezelia || (Ezelia = {}));
var Ezelia;
(function (Ezelia) {
    (function (ParticleSystem) {
        var posFuncs = {
            center: function (size) {
                return {
                    x: (size.width / 2) | 0,
                    y: (size.height / 2) | 0
                };
            },
            centerBottom: function (size) {
                return {
                    x: (size.width / 2) | 0,
                    y: (size.height * 2 / 3) | 0
                };
            },
            centerOffBottom: function (size) {
                return {
                    x: (size.width / 2) | 0,
                    y: size.height + 20
                };
            },
            centerAboveTop: function (size) {
                return {
                    x: (size.width / 2) | 0,
                    y: 0
                };
            },
            bottomLeft: function (size) {
                return {
                    x: 0,
                    y: size.height + 5
                };
            }
        };

        (function (PredefinedSystems) {
            function getSystem(name) {
                var system = this.systems[0];
                for (var i = 0; i < this.systems.length; ++i) {
                    var ps = this.systems[i];
                    if (ps.name === name) {
                        system = ps;
                        break;
                    }
                }
                return ParticleSystem.util.deepClone(system, ['texture']);
            }
            PredefinedSystems.getSystem = getSystem;

            function positionSystems(size) {
                for (var i = 0; i < this.systems.length; ++i) {
                    var pos = this.systems[i].system.pos;
                    if (!posFuncs[pos])
                        continue;
                    this.systems[i].system.pos = posFuncs[pos](size);
                }
            }
            PredefinedSystems.positionSystems = positionSystems;

            function setTexture(texture) {
                for (var i = 0; i < this.systems.length; ++i) {
                    if (this.systems[i].system.texture)
                        continue;
                    this.systems[i].system.texture = texture;
                }
            }
            PredefinedSystems.setTexture = setTexture;

            PredefinedSystems.systems = [
                {
                    name: 'Horror',
                    system: {
                        //SIN
                        aFactor: {
                            x: 1,
                            y: 5
                        },
                        xFactor: {
                            x: 0.5,
                            y: 1
                        },
                        xEquation: 'sin',
                        yEquation: 'sin',
                        edge: {
                            top: 400,
                            left: 400,
                            bottom: 400,
                            right: 400
                        },
                        "pos": {
                            "x": 150,
                            "y": 300
                        },
                        "posVar": {
                            "x": 20,
                            "y": 20
                        },
                        "speed": 15,
                        "speedVar": 0,
                        "angle": 90,
                        "angleVar": 30,
                        "life": 4,
                        "lifeVar": 4,
                        "radius": 30,
                        "radiusVar": 10,
                        "textureAdditive": false,
                        "startScale": 2,
                        "startScaleVar": 0,
                        "endScale": 5,
                        "endScaleVar": 0,
                        "startColor": [
                            255,
                            255,
                            255,
                            1
                        ],
                        "startColorVar": [
                            0,
                            0,
                            0,
                            0
                        ],
                        "endColor": [
                            255,
                            0,
                            0,
                            0
                        ],
                        "endColorVar": [
                            0,
                            0,
                            0,
                            0
                        ],
                        "gravity": {
                            "x": 0,
                            "y": -30
                        },
                        "radialAccel": 0,
                        "radialAccelVar": 0,
                        "tangentialAccel": 0,
                        "tangentialAccelVar": 0,
                        "texture": "data:image/png;base64,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",
                        "totalParticles": 10,
                        "emissionRate": 3,
                        "textureEnabled": true,
                        "active": true,
                        "duration": Infinity
                    }
                },
                {
                    name: 'Circle1',
                    system: {
                        "pos": { "x": 150, "y": 250 },
                        "posVar": { "x": 0, "y": 40 },
                        "speed": 0,
                        "speedVar": 0,
                        "angle": 90,
                        "angleVar": 0,
                        "life": 2,
                        "lifeVar": 0,
                        "radius": 50,
                        "radiusVar": 0,
                        "textureAdditive": true,
                        "startScale": 1,
                        "startScaleVar": 0,
                        "endScale": 4,
                        "endScaleVar": 0,
                        "startColor": [255, 0, 44, 1],
                        "startColorVar": [0, 0, 0, 0],
                        "endColor": [210, 0, 255, 0],
                        "endColorVar": [0, 0, 0, 0],
                        "gravity": { "x": 0, "y": 0 },
                        "radialAccel": 0,
                        "radialAccelVar": 0,
                        "tangentialAccel": 0,
                        "tangentialAccelVar": 0,
                        "texture": "data:image/png;base64,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",
                        "totalParticles": 20,
                        "emissionRate": 50,
                        "textureEnabled": true,
                        "active": true,
                        "duration": Infinity
                    }
                },
                {
                    name: 'Skull1',
                    system: {
                        edge: {
                            top: 400,
                            left: 200,
                            bottom: 200,
                            right: 200
                        },
                        "pos": { "x": 150, "y": 250 },
                        "posVar": { "x": 0, "y": 0 },
                        "speed": 15,
                        "speedVar": 0,
                        "angle": 90,
                        "angleVar": 0,
                        "life": 2,
                        "lifeVar": 0,
                        "radius": 30,
                        "radiusVar": 0,
                        "textureAdditive": false,
                        "startScale": 2,
                        "startScaleVar": 0,
                        "endScale": 5,
                        "endScaleVar": 0,
                        "startColor": [210, 255, 0, 1],
                        "startColorVar": [0, 0, 0, 0],
                        "endColor": [255, 0, 0, 0.59],
                        "endColorVar": [0, 0, 0, 0],
                        "gravity": { "x": 0, "y": -30 },
                        "radialAccel": 0,
                        "radialAccelVar": 0,
                        "tangentialAccel": 0,
                        "tangentialAccelVar": 0,
                        "texture": "data:image/png;base64,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",
                        "totalParticles": 1,
                        "emissionRate": 50,
                        "textureEnabled": true,
                        "active": true,
                        "duration": Infinity
                    }
                },
                {
                    name: 'meteor',
                    system: {
                        totalParticles: 150,
                        emissionRate: 150 / 2,
                        active: true,
                        duration: Infinity,
                        pos: 'center',
                        gravity: {
                            x: -200,
                            y: -200
                        },
                        angle: 90,
                        angleVar: 360,
                        speed: 15,
                        speedVar: 5,
                        life: 7,
                        lifeVar: 1,
                        radialAccel: 0,
                        radialAccelVar: 0,
                        tangentialAccel: 0,
                        tangentialAccelVar: 0,
                        textureEnabled: true,
                        textureAdditive: true,
                        radius: 20,
                        radiusVar: 2,
                        startScale: 3,
                        endScale: 1,
                        startColor: [51, 102, 178, 1],
                        startColorVar: [0, 0, 51, 0.1],
                        endColor: [0, 0, 0, 1]
                    }
                },
                {
                    name: 'flame',
                    system: {
                        xEquation: '',
                        yEquation: '',
                        totalParticles: 20,
                        emissionRate: 10,
                        pos: {
                            x: 150,
                            y: 250
                        },
                        posVar: {
                            y: 0,
                            x: 20
                        },
                        gravity: {
                            x: -0,
                            y: -200
                        },
                        angle: 90,
                        angleVar: 360,
                        speed: 15,
                        speedVar: 5,
                        life: 2,
                        lifeVar: 1,
                        radialAccel: 0,
                        radialAccelVar: 0,
                        tangentialAccel: 0,
                        tangentialAccelVar: 0,
                        textureEnabled: true,
                        textureAdditive: true,
                        radius: 30,
                        radiusVar: 5,
                        startScale: 2,
                        endScale: 1,
                        startColor: [178, 102, 51, 1],
                        startColorVar: [0, 0, 51, 0.1],
                        endColor: [0, 0, 0, 1],
                        active: true,
                        duration: Infinity
                    }
                },
                {
                    name: 'smoke',
                    system: {
                        totalParticles: 20,
                        emissionRate: 20,
                        pos: {
                            x: 150,
                            y: 230
                        },
                        posVar: {
                            y: 0,
                            x: 5
                        },
                        gravity: {
                            x: -0,
                            y: -50
                        },
                        angle: 90,
                        angleVar: 20,
                        speed: 15,
                        speedVar: 5,
                        life: 2,
                        lifeVar: 0.5,
                        radialAccel: 0,
                        radialAccelVar: 0,
                        tangentialAccel: 0,
                        tangentialAccelVar: 0,
                        textureEnabled: true,
                        textureAdditive: false,
                        radius: 20,
                        radiusVar: 5,
                        startScale: 2,
                        endScale: 1.8,
                        startColor: [0x90, 0x90, 0x90, 1],
                        startColorVar: [0, 0, 0, 0],
                        endColor: [0xbb, 0xbb, 0xbb, 0.2],
                        active: true,
                        duration: Infinity
                    }
                },
                {
                    name: 'fireworks',
                    system: {
                        totalParticles: 1000,
                        emissionRate: 1000 / 3.5,
                        pos: {
                            x: 150,
                            y: 380
                        },
                        angle: 90,
                        angleVar: 20,
                        gravity: {
                            x: 0,
                            y: -90
                        },
                        edge: {
                            top: 400,
                            left: 200,
                            bottom: 200,
                            right: 200
                        },
                        speed: 180,
                        speedVar: 50,
                        life: 3.5,
                        lifeVar: 1,
                        radialAccel: 0,
                        radialAccelVar: 0,
                        tangentialAccel: 0,
                        tangentialAccelVar: 0,
                        radius: 8,
                        radiusVar: 2,
                        startScale: 1,
                        endScale: 1,
                        startColor: [127, 127, 127, 1],
                        startColorVar: [127, 127, 127, 0],
                        endColor: [25, 25, 25, 0.2],
                        endColorVar: [25, 25, 25, 0.2],
                        active: true,
                        textureAdditive: true,
                        duration: Infinity
                    }
                },
                {
                    name: 'fire',
                    system: {
                        totalParticles: 150,
                        emissionRate: 150 / 7,
                        pos: 'centerBottom',
                        posVar: {
                            x: 40,
                            y: 0
                        },
                        angle: 90,
                        angleVar: 10,
                        speed: 60,
                        speedVar: 20,
                        life: 7,
                        lifeVar: 4,
                        radialAccel: 0,
                        radialAccelVar: 0,
                        tangentialAccel: 0,
                        tangentialAccelVar: 0,
                        textureEnabled: true,
                        textureAdditive: true,
                        radius: 20,
                        radiusVar: 1,
                        startScale: 3,
                        endScale: 1,
                        startColor: [193, 63, 30, 1],
                        endColor: [0, 0, 0, 0],
                        active: true,
                        duration: Infinity
                    }
                },
                {
                    name: 'galaxy',
                    system: {
                        totalParticles: 200,
                        emissionRate: 200 / 4,
                        pos: 'center',
                        angle: 90,
                        angleVar: 360,
                        speed: 60,
                        speedVar: 10,
                        life: 4,
                        lifeVar: 1,
                        radialAccel: -80,
                        radialAccelVar: 0,
                        tangentialAccel: 80,
                        tangentialAccelVar: 0,
                        textureEnabled: true,
                        textureAdditive: true,
                        radius: 40,
                        radiusVar: 10,
                        startScale: 1,
                        endScale: 1,
                        startColor: [30, 63, 193, 1],
                        endColor: [0, 0, 0, 1],
                        active: true,
                        duration: Infinity
                    }
                },
                {
                    name: 'snow',
                    system: {
                        totalParticles: 700,
                        emissionRate: 10,
                        pos: 'centerAboveTop',
                        posVar: {
                            x: 175,
                            y: 0
                        },
                        gravity: {
                            x: 0,
                            y: 8
                        },
                        edge: {
                            top: 10,
                            left: 200,
                            bottom: 400,
                            right: 200
                        },
                        angle: -90,
                        angleVar: 10,
                        speed: 9,
                        speedVar: 1,
                        life: 45,
                        lifeVar: 15,
                        radialAccel: 0,
                        radialAccelVar: 0,
                        tangentialAccel: 0,
                        tangentialAccelVar: 0,
                        textureEnabled: false,
                        textureAdditive: false,
                        radius: 20,
                        radiusVar: 18,
                        startScale: 1,
                        endScale: 0.3,
                        startColor: [255, 255, 255, 1],
                        endColor: [255, 255, 255, 0],
                        active: true,
                        duration: Infinity
                    }
                },
                {
                    name: 'bubbles',
                    system: {
                        totalParticles: 500,
                        emissionRate: 200,
                        active: true,
                        duration: Infinity,
                        pos: 'centerOffBottom',
                        posVar: {
                            x: 150,
                            y: 0
                        },
                        edge: {
                            top: 400,
                            left: 200,
                            bottom: 10,
                            right: 200
                        },
                        angle: 90,
                        angleVar: 20,
                        life: 3.5,
                        lifeVar: 1,
                        radius: 20,
                        radiusVar: 2,
                        textureEnabled: false,
                        textureAdditive: true,
                        startScale: 1,
                        startScaleVar: 0,
                        endScale: 1,
                        endScaleVar: 0,
                        startColor: [198, 198, 255, 1],
                        startColorVar: [0, 0, 38, 0.1],
                        endColor: [25, 25, 25, 0.2],
                        endColorVar: [25, 25, 25, 0.2],
                        gravity: {
                            x: 0,
                            y: -90
                        },
                        radialAccel: 0,
                        radialAccelVar: 0,
                        tangentialAccel: 0,
                        tangentialAccelVar: 0,
                        speed: 180,
                        speedVar: 50
                    }
                },
                {
                    name: 'watergeyser',
                    system: {
                        totalParticles: 400,
                        emissionRate: 100,
                        active: true,
                        duration: Infinity,
                        pos: {
                            x: 150,
                            y: 380
                        },
                        posVar: {
                            x: 0,
                            y: 0
                        },
                        edge: {
                            top: 400,
                            left: 200,
                            bottom: 200,
                            right: 200
                        },
                        angle: 90,
                        angleVar: 10,
                        life: 2.5,
                        lifeVar: 1,
                        radius: 10,
                        radiusVar: 3,
                        textureEnabled: false,
                        textureAdditive: false,
                        startScale: 1,
                        startScaleVar: 0,
                        endScale: 1,
                        endScaleVar: 0,
                        startColor: [19, 59., 255, 1],
                        startColorVar: [0, 0, 0, 0.3],
                        endColor: [198, 198, 255, 0],
                        endColorVar: [0, 0, 0, 0],
                        gravity: {
                            x: 0,
                            y: 150
                        },
                        radialAccel: 0,
                        radialAccelVar: 0,
                        tangentialAccel: 0,
                        tangentialAccelVar: 0,
                        speed: 180,
                        speedVar: 50
                    }
                },
                {
                    name: 'ribbon',
                    system: {
                        totalParticles: 200,
                        emissionRate: 40,
                        active: true,
                        duration: Infinity,
                        pos: 'bottomLeft',
                        posVar: {
                            x: 30,
                            y: 0
                        },
                        edge: {
                            top: 400,
                            left: 10,
                            bottom: 10,
                            right: 400
                        },
                        angle: 55,
                        angleVar: 0,
                        life: 2.5,
                        lifeVar: 0,
                        radius: 30,
                        radiusVar: 5,
                        textureEnabled: false,
                        textureAdditive: false,
                        startScale: 1,
                        startScaleVar: 0,
                        endScale: 1,
                        endScaleVar: 0,
                        startColor: [255, 0, 0, 1],
                        startColorVar: [0, 0, 0, 0],
                        endColor: [0, 0, 255, 1],
                        endColorVar: [0, 0, 0, 0],
                        gravity: {
                            x: 0,
                            y: -45
                        },
                        radialAccel: 0,
                        radialAccelVar: 0,
                        tangentialAccel: 60,
                        tangentialAccelVar: 0,
                        speed: 180,
                        speedVar: 50,
                        texture: 'data:image/png;base64,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'
                    }
                }];
        })(ParticleSystem.PredefinedSystems || (ParticleSystem.PredefinedSystems = {}));
        var PredefinedSystems = ParticleSystem.PredefinedSystems;
    })(Ezelia.ParticleSystem || (Ezelia.ParticleSystem = {}));
    var ParticleSystem = Ezelia.ParticleSystem;
})(Ezelia || (Ezelia = {}));
var Ezelia;
(function (Ezelia) {
    (function (ParticleSystem) {
        (function (util) {
            util.isIE = navigator.userAgent.indexOf('MSIE') > -1;

            function toRad(deg) {
                return Math.PI * deg / 180;
            }
            util.toRad = toRad;

            function isNumber(i) {
                return typeof i === 'number';
            }
            util.isNumber = isNumber;

            function isInteger(num) {
                return num === (num | 0);
            }
            util.isInteger = isInteger;

            function random(minOrMax, maxOrUndefined, dontFloor) {
                dontFloor = dontFloor || false;

                var min = this.isNumber(maxOrUndefined) ? minOrMax : 0;
                var max = this.isNumber(maxOrUndefined) ? maxOrUndefined : minOrMax;

                var range = max - min;

                var result = Math.random() * range + min;

                if (this.isInteger(min) && this.isInteger(max) && !dontFloor) {
                    return Math.floor(result);
                } else {
                    return result;
                }
            }
            util.random = random;

            function random11() {
                return this.random(-1, 1, true);
            }
            util.random11 = random11;

            function extend(obj, config) {
                for (var prop in config) {
                    if (config.hasOwnProperty(prop)) {
                        obj[prop] = config[prop];
                    }
                }
            }
            util.extend = extend;

            function recursiveExtend(obj, config, exceptions) {
                exceptions = exceptions || [];
                for (var prop in config) {
                    if (config.hasOwnProperty(prop)) {
                        if (exceptions.indexOf(prop) > -1) {
                            obj[prop] = config[prop];
                        } else {
                            if (typeof config[prop] === 'object') {
                                this.recursiveExtend(obj[prop], config[prop], exceptions);
                            } else {
                                obj[prop] = config[prop];
                            }
                        }
                    }
                }
            }
            util.recursiveExtend = recursiveExtend;
            function recursiveExtendInclusive(obj, config, whitelist) {
                if (!whitelist || !whitelist.length || whitelist.length <= 0)
                    return;

                for (var prop in config) {
                    if (config.hasOwnProperty(prop) && whitelist.indexOf(prop) >= 0) {
                        if (typeof config[prop] === 'object') {
                            if (!obj[prop])
                                obj[prop] = {};
                            this.recursiveExtend(obj[prop], config[prop]);
                        } else {
                            obj[prop] = config[prop];
                        }
                    }
                }
            }
            util.recursiveExtendInclusive = recursiveExtendInclusive;

            function clone(obj, props) {
                var clone = {};
                this.extend(clone, obj);
                return clone;
            }
            util.clone = clone;

            function deepClone(obj, exceptions) {
                exceptions = exceptions || [];
                if (typeof obj !== 'object') {
                    return obj;
                }
                if (Array.isArray(obj)) {
                    var cloneArray = [];
                    for (var i = 0; i < obj.length; ++i) {
                        cloneArray.push(this.deepClone(obj[i], exceptions));
                    }
                    return cloneArray;
                }

                var clone = {};
                for (var prop in obj) {
                    if (exceptions.indexOf(prop) > -1) {
                        clone[prop] = obj[prop];
                    } else {
                        clone[prop] = this.deepClone(obj[prop], exceptions);
                    }
                }
                return clone;
            }
            util.deepClone = deepClone;

            /*
            * Given an array with four channels (r, g, b and a),
            * returns a css rgba string compatible with Canvas.
            * Optionally provide an override alpha value that will be used
            * in place of the actual alpha (useful for texture rendering)
            */
            function colorArrayToString(array, overrideAlpha) {
                var r = array[0] | 0;
                var g = array[1] | 0;
                var b = array[2] | 0;
                var a = overrideAlpha || array[3];

                return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + a + ')';
            }
            util.colorArrayToString = colorArrayToString;
        })(ParticleSystem.util || (ParticleSystem.util = {}));
        var util = ParticleSystem.util;
    })(Ezelia.ParticleSystem || (Ezelia.ParticleSystem = {}));
    var ParticleSystem = Ezelia.ParticleSystem;
})(Ezelia || (Ezelia = {}));
/// <reference path="util.ts" />
var Ezelia;
(function (Ezelia) {
    (function (ParticleSystem) {
        var bufferCache = {};

        /*
        * Utility method to create a canvas the same size as the passed in texture (which is
        * an Image element). Used for _renderParticleTexture
        */
        function getBuffer(particle) {
            var img = particle.img;
            if (!img) {
                img = new Image();
                particle.ready = false;
                img.onload = function () {
                    particle.ready = true;
                };
                img.src = particle.texture;
                particle.img = img;
            }

            if (!particle.ready)
                return undefined;

            var size = '' + img.width + 'x' + img.height;

            var canvas = bufferCache[size];

            if (!canvas) {
                canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                bufferCache[size] = canvas;
            }

            return canvas;
        }

        var Renderer = (function () {
            function Renderer(context) {
                this.context = context;
                this.defaultTexture = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAACz0lEQVR42t2XP0hbURTGnfp/KK3QFiylCG11aRYpBQWFDiJCg266BNQtdnBQyOASQjp1KS4KGVw6iXMWEUdHUShkCBhSQpaQkJg/Jmm/H3xLEdtaWvLawMfJvfec79x77jnnvdfX96/9MpnM9VwudzOfz98qFAq3kYyZ/6tOi8XinVKpdLdSqfRXq9UHwsNarfYIyZh51tH7Y5s5Pj6+BqHI7+OsXq8/aTQag8LzZrM5JAwjGTPPOnroY4f9bzvPZrM3OBEnFPFTOXohvGy1WiPC6/Pz81FhDMmYedbRQx877OG5snPutFwu3zs7OxvQyZ6JPGSnE8KkMN1ut98KYSRjz094MyHssIcHviud3M4fE15OJuJxOZoSZoU5ISIsCIuWEc+zPoW+IzIED3y/FAnujLCxczt/JbI3Pum8sCQsCyudTmdVWEMy9vyS9cLYYe9NDMD705wgcbg7h33Ezmd8wqidrgtxISm8t4x7ns1ErT/jTYzABy/8Pyw1spcE4g4d9rDJ3ok8JiSED8KGsClsWW54nvUY+rYL+zpC8MJ/aYmyO0qILCaRfOfzPnnMJ/0opIRPwk63291FepzyetKbiNp+Cj544b80CtwRdUwpkc1OqCWHPWHybTtNS+5LHlimPb9tvYSvg5yYhQ9e+PFzWfj7aSa++0ln9bLvlvCm7GRP8lDySDhBerzn9ZT1152Yc/A5Fwbxc+EaqFPaKR3N9T7tO1xxgm04zJz0UPis/6fCFyRjbyJtPfTjro4IfPDCj58LfYEHCllKydDZ3GQWHP6kE23H4T6y05Jk1fLUkdh3TmzabtV9gmY1Cj9+8PfdBniqOQGHaa/O/kXXOaW25fAeOOycvPpVP6THJ86JXVcHdmtuVlTDGPz4wV+wItDzHOh5FfS8DwSiE/b8WdDzp2Eg3gd6/kYUiHfCQLwVB+K7IBBfRoH5Nvyvf98A3rZr7fen7G8AAAAASUVORK5CYII=';
            }
            /*
            * renders a particle using the particle's texture. The texture is typically a white
            * image and so need to use a secondary buffer to "tint" this image based on the
            * particle's color.
            */
            Renderer.prototype._renderParticleTexture = function (particle) {
                if (!particle.texture)
                    particle.texture = this.defaultTexture;

                particle.buffer = particle.buffer || getBuffer(particle);

                if (!particle.buffer)
                    return;

                var bufferContext = particle.buffer.getContext('2d');

                // figure out what size to draw the texture at, based on the particle's
                // current scale
                var w = (particle.img.width * particle.scale) | 0;
                var h = (particle.img.height * particle.scale) | 0;

                // figure out the x and y locations to render at, to center the texture in the buffer
                var x = particle.pos.x - w / 2;
                var y = particle.pos.y - h / 2;

                bufferContext.clearRect(0, 0, particle.buffer.width, particle.buffer.height);
                bufferContext.globalAlpha = particle.color[3];
                bufferContext.drawImage(particle.img, 0, 0);

                // now use source-atop to "tint" the white texture, here we want the particle's pure color,
                // not including alpha. As we already used the particle's alpha to render the texture above
                bufferContext.globalCompositeOperation = "source-atop";
                bufferContext.fillStyle = ParticleSystem.util.colorArrayToString(particle.color, 1);
                bufferContext.fillRect(0, 0, particle.buffer.width, particle.buffer.height);

                // reset the buffer's context for the next time we draw the particle
                bufferContext.globalCompositeOperation = "source-over";
                bufferContext.globalAlpha = 1;

                if (particle.textureAdditive) {
                    this.context.globalCompositeOperation = 'lighter';
                } else {
                    this.context.globalCompositeOperation = 'source-over';
                }

                // finally, take the rendered and tinted texture and draw it into the main canvas, at the
                // particle's location
                this.context.drawImage(particle.buffer, 0, 0, particle.buffer.width, particle.buffer.height, x, y, w, h);
            };

            Renderer.prototype.render = function (particles) {
                for (var i = 0; i < particles.length; ++i) {
                    var p = particles[i];
                    if (p.life > 0 && p.color) {
                        this._renderParticleTexture(p);
                    }
                }
                this.context.globalCompositeOperation = 'source-over';
            };

            Renderer.prototype.reset = function () {
                return;
            };
            return Renderer;
        })();
        ParticleSystem.Renderer = Renderer;
    })(Ezelia.ParticleSystem || (Ezelia.ParticleSystem = {}));
    var ParticleSystem = Ezelia.ParticleSystem;
})(Ezelia || (Ezelia = {}));
var Ezelia;
(function (Ezelia) {
    (function (ParticleSystem) {
        var TextureLoader = (function () {
            function TextureLoader() {
            }
            TextureLoader.load = function (target, property, file) {
                if (this.cache[file.name]) {
                    this._overlay(target, property, this.cache[file.name]);
                } else {
                    this._loadViaFile(target, property, file);
                }
            };

            TextureLoader._overlay = function (target, property, result) {
                if (result.width) {
                    target[property] = result;
                } else {
                    result.onload = function () {
                        target[property] = result;
                    };
                }
            };

            TextureLoader._loadViaFile = function (target, property, file) {
                if (!this._isImageFile(file)) {
                    throw new Error('this does not appear to be an image');
                }

                var me = this;

                var filereader = new FileReader();
                filereader.onload = function (result) {
                    var image = new Image();
                    image.src = result.target.result;

                    me.cache[file.name] = image;
                    me._overlay(target, property, image);
                };

                filereader.onerror = function () {
                    alert('failed to load the image file');
                };

                filereader.readAsDataURL(file);
            };

            TextureLoader._isImageFile = function (file) {
                var period = file.name.indexOf('.');

                var extension = file.name.substring(period + 1);

                if (!extension) {
                    return false;
                }

                return ['png', 'jpg', 'jpeg', 'gif'].indexOf(extension.toLowerCase()) > -1;
            };
            TextureLoader.cache = {};
            return TextureLoader;
        })();
        ParticleSystem.TextureLoader = TextureLoader;
    })(Ezelia.ParticleSystem || (Ezelia.ParticleSystem = {}));
    var ParticleSystem = Ezelia.ParticleSystem;
})(Ezelia || (Ezelia = {}));
PIXI.CanvasTinter.getTintedTexture = function (sprite, color) {
    var texture = sprite.texture;

    color = PIXI.CanvasTinter.roundColor(color);

    var stringColor = "#" + ("00000" + (color | 0).toString(16)).substr(-6);

    texture.tintCache = texture.tintCache || {};

    if (texture.tintCache[stringColor])
        return texture.tintCache[stringColor];

    // clone texture..
    var canvas = PIXI.CanvasTinter.canvas || document.createElement("canvas");

    PIXI.CanvasTinter.tintMethod(texture, color, canvas);

    //preserve this canvas to use it for next time we need to re-tint the texture.
    //texture.tintCache.canvas = canvas;
    if (PIXI.CanvasTinter.convertTintToImage) {
        // is this better?
        var tintImage = new Image();
        tintImage.src = canvas.toDataURL();

        texture.tintCache[stringColor] = tintImage;
    } else {
        texture.tintCache[stringColor] = canvas;

        // if we are not converting the texture to an image then we need to lose the reference to the canvas
        PIXI.CanvasTinter.canvas = null;
    }

    return canvas;
};
//# sourceMappingURL=ezps.js.map
