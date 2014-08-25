module Ezelia {
    export class preloader {

        public static game: any;

        private static pad(n, width, z?) {
            z = z || '0';
            n = n + '';
            return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
        }


        public static preload() {
            this.game.load.image('gate', 'assets/img/gate.png');
            this.game.load.image('atari', 'assets/img/block.png');
            this.game.load.image('background', 'assets/img/background2.png');
            this.game.load.image('background1', 'assets/img/background1.png');


            var arr = ['pf', 'fg', 'bg'];
            for (var i = 1; i <= 20; i++) {
                for (var p = 0; p < arr.length; p++) {
                    var name = arr[p];
                    this.game.load.image(name + preloader.pad(i, 2), 'assets/img/' + name + preloader.pad(i, 2) + '.png');
                    this.game.load.image(name + preloader.pad(i, 2) +'-gs', 'assets/img/' + name + preloader.pad(i, 2) + '-gs.png');
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
        }
    }
} 