module.exports = function(grunt) {
  grunt.initConfig({
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
        dest: 'deploy/combined.xml'
      }
    },
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
        },
        preserveComments: 'some'
      },
      my_target: {
        files: {
          'deploy/climb.min.js': ['public/js/easeljs-0.8.0.min.js', 'public/js/trailtitans.js', 'public/js/contextMap.js', 'public/js/mike-utilities.js', 'public/js/mobileContextMap.js'],
          'deploy/home.min.js': ['public/js/modernizr.js', 'public/js/home.js']
        }
      }
    },
    xmlmin: {                                       // Task 
      dist: {                                     // Target 
        options: {                              // Target options 
          preserveComments: false
        },
        files: {                                // Dictionary of files 
          'deploy/min.xml': 'deploy/combined.xml'   // 'destination': 'source' 
        }
      }
    },
    cssmin: {
      target: {
        files: {
          'deploy/home.min.css' : ['public/css/common.css', 'public/css/home.css'],
          'deploy/climb.min.css' : ['public/css/common.css', 'public/css/climb.css']
        }
      }
    }
  });
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-xmlmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin')

  grunt.registerTask('default', ['uglify', 'concat', 'xmlmin', 'cssmin']);
};