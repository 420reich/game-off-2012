/*global module:false*/
module.exports = function(grunt) {

    var cssFiles = {
        website: [
            'fightcode/static/css/bootstrap.min.css',
            'fightcode/static/css/prism.css',
            'fightcode/static/css/codemirror.css',
            'fightcode/static/css/home.css',
            'fightcode/static/css/create.css',
            'fightcode/static/css/fight.css'
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

        thirdParty: [
            'fightcode/static/js/jquery-1.8.2.min.js',
            'fightcode/static/js/prism.js',
            'fightcode/static/js/codemirror.js',
            'fightcode/static/js/coffeescript.js',
            'fightcode/static/js/javascript.js'
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
            banner: '/*! FightCode - v<%= meta.version %> - ' +
                    '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
                    '* http://fightcodega.me/\n*/'
        },

        coffee: {
            app: {
                src: ['./fightcode/static/coffee/*.coffee'],
                dest: './fightcode/static/js/',
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

        watch: {
            files: [
                './fightcode/static/coffee/*.coffee',
                './fightcode/*.html',
                './fightcode/static/scss/*.scss'
            ],
            tasks: 'dev'
        }
    });

    grunt.registerTask('default', 'shell:clean coffee concat min compass cssmin');
    grunt.registerTask('dev', 'shell:clean coffee concat compass cssmin');
};
