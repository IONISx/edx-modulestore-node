var mongoose = require('mongoose');

// Register `Long' type
require('mongoose-long')(mongoose);

var ModuleSchema = require('./module');
var CourseSchema = require('./course');
var AboutSchema = require('./about');

// ## //

var Module, Course, About;

var setup = function (connection) {
    Module = connection.model('Module', ModuleSchema);
    Course = Module.discriminator('course', CourseSchema);
    About = Module.discriminator('about', AboutSchema);
}

// ## //

exports.setup = setup;

exports.__defineGetter__('Module', function () { return Module; });
exports.__defineGetter__('Course', function () { return Course; });
exports.__defineGetter__('About',  function () { return About; });
