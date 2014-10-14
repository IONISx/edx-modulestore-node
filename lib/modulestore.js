var Q = require('q');
var EventEmitter = require('events').EventEmitter;
var mongoose = require('mongoose');
var _ = require('lodash');
var Module = require('./models/module');
var Course = require('./course');
var Organization = require('./organization');

// ## //

var Modulestore = function (options) {
    this.connection = null;

    this.lmsBase = options.lmsBase;
    this.studioBase = options.studioBase;
};


_.merge(Modulestore.prototype, EventEmitter.prototype);


Modulestore.prototype.connect = function (options) {
    var connection = mongoose.createConnection(options);
    return this.attachConnection(connection);
};

Modulestore.prototype.attachConnection = function (connection) {
    var deferred = Q.defer();

    if (this.connection) {
        throw new Error('modulestore: detach current connection first');
    }

    this.connection = connection;

    this.connection.once('open', _.bind(function () {
        deferred.resolve(this);
    }, this));

    this.connection.on('open', _.bind(function () {
        this.emit('connected', this);
    }, this));

    this.connection.on('close', _.bind(function () {
        this.emit('disconnected', this);
        this.detachConnection();
    }, this));

    this.connection.on('error', _.bind(function (err) {
        this.detachConnection();
        deferred.reject(new Error(err));
    }, this));

    return deferred.promise
}

Modulestore.prototype.detachConnection = function () {
    if (!this.connection) {
        throw new Error('modulestore: no connection attached');
    }

    this.removeAllListeners(this.connection);
    delete this.connection;

    return this;
};

Modulestore.prototype.disconnect = function () {
    this.connection.close();
    return this;
};

Modulestore.prototype.findCourses = function (filter) {
    return Course.find(this, filter);
};


Modulestore.prototype.findCourse = function (id) {
    return Course.findById(this, id);
};


Modulestore.prototype.findOrganizations = function (filter) {
    return Organization.find(this, filter);
};


/*
** Exports
*/

module.exports = Modulestore;
