'use strict';

module.exports = function (grunt) {
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        jshint: {
            options: {
                'node': true,
                'curly': true,
                'eqeqeq': true,
                'immed': true,
                'latedef': true,
                'newcap': true,
                'noarg': true,
                'noempty': true,
                'unused': true,
                'undef': true,
                'trailing': true,
                'indent': 2,
                'quotmark': 'single',
                'boss': true,
                'eqnull': true,
                'strict': true
            },
            node: {
                files: {
                    src: [
                        'Gruntfile.js',
                        'index.js',
                        'lib/**/*.js'
                    ]
                }
            }
        }
    });

    grunt.registerTask('test', [
        'jshint'
    ]);
};
