module.exports = function(grunt) {
  grunt.initConfig({
    uglify: {
      options: {
        mangle: {
          except: ['initClimbMode', 'createjs']
        },
        compress: {
          sequences: true,
          dead_code: true,
          conditionals: true,
          booleans: true,
          unused: true,
          if_return: true,
          join_vars: true,
          drop_console: true
        }
      },
      my_target: {
        files: {
          'public/climb-min-almost.js': ['public/js/trailtitans.js', 'public/js/contextMap.js', 'public/js/mike-utilities.js', ]
        }
      }
    },
    concat: {
      xml: {
        options: {
          banner: '<krpano>',
          footer: '</krpano>',
          process: function(src, filepath) {
            src = src.replace(/<krpano>/g, '');
            src = src.replace(/<\/krpano>/g, '');
            src = src.replace(/\r\n/g, '');
            return src;
          }
        },
        src: ['public/shared-xml/basefunctions.xml', 'public/shared-xml/controls.xml', 'public/shared-xml/mike-utilities.xml', 'public/shared-xml/showtext.xml'],
        dest: 'public/combined.xml'
      },
      js: {
        src: ['public/js/easeljs-0.8.0.min.js', 'public/climb-min-almost.js'],
        dest: 'public/min.js'
      }
    },
    xmlmin: {                                       // Task 
      dist: {                                     // Target 
        options: {                              // Target options 
          preserveComments: false
        },
        files: {                                // Dictionary of files 
          'public/shared-xml/min.xml': 'public/combined.xml'   // 'destination': 'source' 
        }
      }
    }
  });
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-xmlmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('default', ['concat', 'xmlmin', 'uglify']);
};