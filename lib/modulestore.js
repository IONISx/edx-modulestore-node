var mongoose = require('mongoose');
var _ = require('lodash');
var Module = require('./models/module')
var Course = require('./course');


var modulestore = {};


/*
** Private methods
*/

modulestore.initialize = function () {
    this.settings = {};

    this.setupEvents();
};

modulestore.setupEvents = function () {
    var self = this;

    mongoose.connection.on('open', function () {
        self.connected = true;
        self.emit('connected', this);
    });

    mongoose.connection.on('close', function () {
        self.connected = false;
        self.emit('disconnected', this);
    });

    mongoose.connection.on('error', function () {
        throw new Error(
            'couldn’t etablish a connection to the modulestore database'
        );
    });
};


/*
** Public methods
*/

modulestore.connect = function () {
    mongoose.connect.apply(mongoose, arguments);
    return this;
};

modulestore.disconnect = function () {
    mongoose.disconnect();
    return this;
};

modulestore.get = function (setting) {
    return this.settings[setting];
};

modulestore.set = function (setting, value) {
    if (arguments.length === 1) {
        return this.get(setting);
    }
    this.settings[setting] = value;
    return this;
};

modulestore.findCourses = function (done) {
    done = done || function () {};

    Module.find({
        '_id.category': 'course'
    }, function (err, courses) {
        if (err) {
            done(err);
            return;
        }
        done(null, _.map(courses, function (model) {
            return new Course(modulestore, model);
        }));
    });
};


/*
** Exports
*/

module.exports = modulestore;
