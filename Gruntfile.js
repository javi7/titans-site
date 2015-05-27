module.exports = function(grunt) {
  grunt.initConfig({
    uglify: {
      options: {
        mangle: {
          except: ['initClimbMode']
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
          'public/min.js': ['public/js/contextMap.js', 'public/js/krpano.js', 'public/js/mike-utilities.js', 'public/js/trailtitans.js']
        }
      }
    },
    concat: {
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