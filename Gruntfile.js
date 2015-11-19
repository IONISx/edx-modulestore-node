'use strict';

module.exports = function (grunt) {
    require('time-grunt')(grunt);
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        eslint: {
            all: {
                files: {
                    src: [
                        'Gruntfile.js',
                        'lib/**/*.js',
                        'bin/**/*.js',
                        'index.js'
                    ]
                }
            }
        }
    });

    grunt.registerTask('test', [
        'eslint'
    ]);

    grunt.registerTask('test:ci', [
        'eslint'
    ]);
};
