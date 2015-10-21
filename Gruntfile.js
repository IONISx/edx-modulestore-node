'use strict';

module.exports = function (grunt) {
    require('time-grunt')(grunt);
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        jscs: {
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
        },

        // ## //

        jshint: {
            options: {
                jshintrc: true
            },
            node: {
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
        'jscs',
        'jshint'
    ]);

    grunt.registerTask('test:ci', [
        'test'
    ]);
};
