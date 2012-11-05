/*global module:false*/
module.exports = function(grunt) {

  var jsFiles = [
    'fightcode/static/js/engine.js',
    'fightcode/static/js/robot.js',
    'fightcode/static/js/inline.js'
  ];

  grunt.loadNpmTasks('grunt-compass');
  grunt.loadNpmTasks('grunt-css');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-coffee');

  grunt.initConfig({
    meta: {
      version: '0.1.0',
      banner: '/*! FightCode - v<%= meta.version %> - ' +
              '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
              '* http://fightcodega.me/\n*/'
    },

    lint: {
      files: ['grunt.js', 'fightcode/static/js/*.js']
    },

    coffee: {
      src: ['fightcode/static/coffee/*.coffee'],
      dest: 'fightcode/static/js',
      options: {
        bare: true
      }
    },

    concat: {
      js: {
        src: ['<banner:meta.banner>'].concat(jsFiles),
        dest: 'fightcode/static/output/fightcode.min.js'
      }
    },

    min: {
      js: {
        src: ['<banner:meta.banner>'].concat(jsFiles),
        dest: 'fightcode/static/output/fightcode.min.js'
      }
    },

    compass: {
      dist: {
        src: 'fightcode/static/scss',
        dest: 'fightcode/static/css',
        images: 'fightcode/static/img',
        linecomments: true,
        forcecompile: false,
        relativeassets: true
      }
    },

    cssmin: {
        src: [
            'fightcode/static/css/fight.css'
        ],
        dest: 'fightcode/static/output/fightcode.min.css'
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
    },

    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        boss: true,
        eqnull: true,
        browser: true
      },
      globals: {
        jQuery: true
      }
    },

    uglify: {}
  });

  grunt.registerTask('default', 'shell:clean coffee lint concat min compass cssmin');
  grunt.registerTask('dev', 'shell:clean coffee lint concat compass cssmin');
};
