module.exports = function(grunt) {

    var cssFiles = {
        website: [
            'fightcode/static/css/reset.css',
            'fightcode/static/css/color.css',
            'fightcode/static/css/grid.css',
            'fightcode/static/css/button.css',
            'fightcode/static/css/fonts.css',
            'fightcode/static/css/prism.css',
            'fightcode/static/css/header.css',
            'fightcode/static/css/codemirror.css',
            'fightcode/static/css/home.css',
            'fightcode/static/css/create.css',
            'fightcode/static/css/fight.css',
            'fightcode/static/css/arena.css',
            'fightcode/static/css/ranking.css',
            'fightcode/static/css/menu.css',
            'fightcode/static/css/user.css',
            'fightcode/static/css/footer.css'
        ]
    };

    var jsFiles = {
        engine: [
            'fightcode/static/js/engine.js',
            'fightcode/static/js/robot.js',
            'fightcode/static/js/inline.js'
        ],

        animation: [
            'fightcode/static/js/animation.js',
            'fightcode/static/js/animationInline.js'
        ],

        webApp: [
            'fightcode/static/js/ranking.js',
            'fightcode/static/js/fight.js',
            'fightcode/static/js/menu.js',
            'fightcode/static/js/navbar.js',
            'fightcode/static/js/components.js'
        ],

        thirdParty: [
            'fightcode/static/js/ga.js',
            'fightcode/static/js/jquery-1.8.2.min.js',
            'fightcode/static/js/prism.js',
            'fightcode/static/js/codemirror.js',
            'fightcode/static/js/coffeescript.js',
            'fightcode/static/js/javascript.js',
            'fightcode/static/js/jquery.knobs.js'
        ],

        worker: [
            'fightcode/static/js/engine.js',
            'fightcode/static/js/worker.js'
        ]
    };

    grunt.loadNpmTasks('grunt-compass');
    grunt.loadNpmTasks('grunt-css');
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-coffee');
    grunt.loadNpmTasks('grunt-growl');

    var growl = require('growl');
    ['warn', 'fatal'].forEach(function(level) {
        grunt.utils.hooker.hook(grunt.fail, level, function(opt) {
            growl('FightCode Error', {
                title: opt.message,
                image: 'Console'
            });
        });
    });

    grunt.initConfig({
        meta: {
            version: '0.1.0',
            banner: '/*! FightCode - v<%= meta.version %>\n' +
                    '* http://fightcodega.me/\n*/'
        },

        coffee: {
            app: {
                src: ['./fightcode/static/coffee/*.coffee'],
                dest: './fightcode/static/js/',
                options: {
                    bare: true
                }
            },
            backendRoutes: {
                src: ['./fightcode/coffee/routes/*.coffee'],
                dest: './fightcode/routes/',
                options: {
                    bare: true
                }
            }
        },

        concat: {
            engine: {
                src: ['<banner:meta.banner>'].concat(jsFiles.engine),
                dest: 'fightcode/static/output/fightcode.engine.min.js'
            },
            animation: {
                src: ['<banner:meta.banner>'].concat(jsFiles.animation),
                dest: 'fightcode/static/output/fightcode.animation.min.js'
            },
            webApp: {
                src: ['<banner:meta.banner>'].concat(jsFiles.webApp),
                dest: 'fightcode/static/output/fightcode.webApp.min.js'
            },
            worker: {
                src: ['<banner:meta.banner>'].concat(jsFiles.worker),
                dest: 'fightcode/static/output/fightcode.worker.min.js'
            },
            thirdParty: {
                src: ['<banner:meta.banner>'].concat(jsFiles.thirdParty),
                dest: 'fightcode/static/output/fightcode.thirdParty.min.js'
            }
        },

        min: {
            engine: {
                src: ['<banner:meta.banner>'].concat(jsFiles.engine),
                dest: 'fightcode/static/output/fightcode.engine.min.js'
            },
            animation: {
                src: ['<banner:meta.banner>'].concat(jsFiles.animation),
                dest: 'fightcode/static/output/fightcode.animation.min.js'
            },
            webApp: {
                src: ['<banner:meta.banner>'].concat(jsFiles.webApp),
                dest: 'fightcode/static/output/fightcode.webApp.min.js'
            },
            worker: {
                src: ['<banner:meta.banner>'].concat(jsFiles.worker),
                dest: 'fightcode/static/output/fightcode.worker.min.js'
            },
            thirdParty: {
                src: ['<banner:meta.banner>'].concat(jsFiles.thirdParty),
                dest: 'fightcode/static/output/fightcode.thirdParty.min.js'
            }
        },

        compass: {
            dist: {
                src: 'fightcode/static/scss',
                dest: 'fightcode/static/css',
                images: 'fightcode/static/img',
                linecomments: true,
                forcecompile: false,
                relativeassets: true,
                bundleExec: true
            }
        },

        cssmin: {
            dist: {
                src: cssFiles.website,
                dest: 'fightcode/static/output/fightcode.min.css'
            }
        },

        shell: {
            clean: {
                command: 'rm -rf ./fightcode/static/output/*'
            }
        },

        qunit: {
            all: ['test/*.html']
        },

        watch: {
            files: [
                './fightcode/static/coffee/*.coffee',
                './fightcode/coffee/routes/*.coffee',
                './fightcode/*.html',
                './fightcode/static/scss/*.scss'
            ],
            tasks: 'dev'
        }
    });

    grunt.registerTask('default', 'shell:clean coffee concat min compass cssmin');
    grunt.registerTask('dev', 'shell:clean coffee concat compass cssmin');
};
