module.exports = function(grunt) {
  grunt.initConfig({
    uglify: {
      options: {
        mangle: {
          except: ['initClimbMode']
        }
      },
      my_target: {
        files: {
          'public/min.js': ['public/js/contextMap.js', 'public/js/krpano.js', 'public/js/mike-utilities.js', 'public/js/trailtitans.js']
        }
      }
    },
    concat: {
      options: {
        banner: '<krpano>',
        footer: '</krpano>'
      },
      dist: {
        src: ['public/shared-xml/basefunctions.xml', 'public/shared-xml/controls.xml', 'public/shared-xml/mike-utilites.xml', 'public/shared-xml/showtext.xml'],
        dest: 'public/combined.xml'
      }
    },
    xmlmin: {                                       // Task 
      dist: {                                     // Target 
        options: {                              // Target options 
          preserveComments: false
        },
        files: {                                // Dictionary of files 
          'public/min.xml': 'public/combined.xml'   // 'destination': 'source' 
        }
      }
    }
  });
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-xmlmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('default', ['concat', 'xmlmin', 'uglify']);
};