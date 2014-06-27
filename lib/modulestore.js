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
    this.connection = null;
};


/*
** Public methods
*/

modulestore.connect = function (options) {
    var connection = mongoose.createConnection(options);
    return this.attachConnection(connection);
};

modulestore.attachConnection = function (connection) {
    if (this.connection) {
        throw new Error('modulestore: detach current connection first');
    }

    this.connection = connection;

    this.connection.on('open', _.bind(function () {
        this.emit('connected', this);
    }, this));

    this.connection.on('close', _.bind(function () {
        this.emit('disconnected', this);
        this.detachConnection();
    }, this));

    this.connection.on('error', _.bind(function () {
        this.detachConnection();

        throw new Error('modulestore: couldn’t connect to the database');
    }, this));

    return this;
}

modulestore.detachConnection = function () {
    if (!this.connection) {
        throw new Error('modulestore: no connection attached');
    }

    this.removeAllListeners(this.connection);
    delete this.connection;

    return this;
};

modulestore.disconnect = function () {
    this.connection.close();
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
