'use strict';

module.exports = function (grunt) {
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        jshint: {
            options: {
                jshintrc: true
            },
            node: {
                files: {
                    src: [
                        'Gruntfile.js',
                        'index.js',
                        'lib/**/*.js',
                        'bin/**/*.js'
                    ]
                }
            }
        }
    });

    grunt.registerTask('test', [
        'jshint'
    ]);
};
