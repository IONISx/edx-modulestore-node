'use strict';

var mongoose         = require('mongoose');

// Register `Long' type
require('mongoose-long')(mongoose);

var ModuleSchema     = require('./module');
var CourseSchema     = require('./course');
var AboutSchema      = require('./about');
var ChapterSchema    = require('./chapter');
var SequentialSchema = require('./sequential');
var ProblemSchema    = require('./problem');

// ## //

var Module, Course, About, Chapter, Sequential, Problem;

var setup = function (connection) {
    Module = connection.model('Module', ModuleSchema);

    Course = Module.discriminator('course', CourseSchema);
    About = Module.discriminator('about', AboutSchema);
    Chapter = Module.discriminator('chapter', ChapterSchema);
    Sequential = Module.discriminator('sequential', SequentialSchema);
    Problem = Module.discriminator('problem', ProblemSchema);
};

var cleanup = function () {
    // This removes the discriminatorKey from the schemas.
    // We’re doing this to make sure that the schema/models
    // are re-usable.
    // Model.discriminator will call Schema.add() with the
    // configured discriminatorKey. Calling Model.discriminator()
    // when the discriminatorKey is already defined will fail.

    CourseSchema.remove(CourseSchema.options.discriminatorKey);
    AboutSchema.remove(AboutSchema.options.discriminatorKey);
    ChapterSchema.remove(ChapterSchema.options.discriminatorKey);
    SequentialSchema.remove(SequentialSchema.options.discriminatorKey);
    ProblemSchema.remove(ProblemSchema.options.discriminatorKey);
};

// ## //

exports.setup = setup;
exports.cleanup = cleanup;

exports.__defineGetter__('Module',      function () { return Module; });
exports.__defineGetter__('Course',      function () { return Course; });
exports.__defineGetter__('About',       function () { return About; });
exports.__defineGetter__('Chapter',     function () { return Chapter; });
exports.__defineGetter__('Sequential',  function () { return Sequential; });
exports.__defineGetter__('Problem',     function () { return Problem; });
