declare module Ezelia.ParticleSystem {
    class Emitter {
        static params: string[];
        private time;
        public id: string;
        public _defaultTexture: any;
        public _predefinedSystemName: any;
        public _baseSystem: any;
        public _totalParticles: number;
        private _file;
        public emissionRate: number;
        public allOrNone: boolean;
        public aFactor: {
            x: number;
            y: number;
        };
        public xFactor: {
            x: number;
            y: number;
        };
        private _xEquation;
        private _yEquation;
        private _xEqName;
        private _yEqName;
        public active: boolean;
        public duration: number;
        public cycles: number;
        public settings: EmitterEntity;
        private _particlePool;
        private _particleCount;
        private _particleIndex;
        private _elapsed;
        private _emitCounter;
        public edge: {
            top: number;
            left: number;
            bottom: number;
            right: number;
        };
        constructor(system: any, defaultTexture?: any);
        public xEquation : string;
        public yEquation : string;
        public particles : Particle[];
        public totalParticles : number;
        public predefinedSystem : string;
        public textureFile : any;
        public overlay(config: any): void;
        public resetTexture(): void;
        private loadConfig(config);
        public restart(): void;
        public reset(): void;
        public _isFull(): boolean;
        private createParticle();
        private initParticle(particle);
        private updateParticle(p, delta, i);
        public update(delta: any): void;
    }
}
declare module Ezelia.ParticleSystem {
    class EmitterEntity {
        public pos: {
            x: number;
            y: number;
        };
        public posVar: {
            x: number;
            y: number;
        };
        public speed: number;
        public speedVar: number;
        public angle: number;
        public angleVar: number;
        public life: number;
        public lifeVar: number;
        public radius: number;
        public radiusVar: number;
        public texture: string;
        public textureAdditive: boolean;
        public startScale: number;
        public startScaleVar: number;
        public endScale: number;
        public endScaleVar: number;
        public startColor: number[];
        public startColorVar: number[];
        public endColor: number[];
        public endColorVar: number[];
        public colorList: any[];
        public gravity: {
            x: number;
            y: number;
        };
        public radialAccel: number;
        public radialAccelVar: number;
        public tangentialAccel: number;
        public tangentialAccelVar: number;
    }
}
declare module Ezelia.ParticleSystem {
    class Particle extends EmitterEntity {
        public scale: number;
        public deltaScale: number;
        public deltaColor: any[];
        public lastpos: {
            x: number;
            y: number;
        };
        public vel: {
            x: number;
            y: number;
        };
        public color: any[];
        public forces: {
            x: number;
            y: number;
        };
        public radial: {
            x: number;
            y: number;
        };
        public tangential: {
            x: number;
            y: number;
        };
        public colorIdx: number;
        constructor();
        public setVelocity(angle: any, speed: any): void;
    }
}
declare module Ezelia.ParticleSystem {
    class PixiRenderer {
        public context: any;
        private defaultTexture;
        private buffer;
        constructor(context: any);
        public _renderParticleTexture(particle: any): void;
        public render(particles: any): void;
        public reset(): void;
    }
}
declare module Ezelia.ParticleSystem {
    class Point {
        public x: number;
        public y: number;
    }
}
declare module Ezelia.ParticleSystem {
    module PredefinedSystems {
        function getSystem(name: any): any;
        function positionSystems(size: any): void;
        function setTexture(texture: any): void;
        var systems: {}[];
    }
}
declare module Ezelia.ParticleSystem.util {
    var isIE: boolean;
    function toRad(deg: any): number;
    function isNumber(i: any): boolean;
    function isInteger(num: any): boolean;
    function random(minOrMax: any, maxOrUndefined: any, dontFloor: any): any;
    function random11(): any;
    function extend(obj: any, config: any): void;
    function recursiveExtend(obj: any, config: any, exceptions: any): void;
    function recursiveExtendInclusive(obj: any, config: any, whitelist: any[]): void;
    function clone(obj: any, props: any): {};
    function deepClone(obj: any, exceptions: any): any;
    function colorArrayToString(array: any, overrideAlpha?: any): string;
}
declare module Ezelia.ParticleSystem {
    class Renderer {
        public context: any;
        private defaultTexture;
        constructor(context: any);
        public _renderParticleTexture(particle: any): void;
        public render(particles: any): void;
        public reset(): void;
    }
}
declare module Ezelia.ParticleSystem {
    class TextureLoader {
        static cache: {};
        static load(target: any, property: any, file: any): void;
        static _overlay(target: any, property: any, result: any): void;
        static _loadViaFile(target: any, property: any, file: any): void;
        static _isImageFile(file: any): boolean;
    }
}
