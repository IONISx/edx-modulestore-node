'use strict';

var events = require('events');
var util = require('util');

var Q = require('kew');
var mongoose = require('mongoose');
var _ = require('lodash');

var models = require('./models');
var Base = require('./base');
var Course = require('./course');
var Chapter = require('./chapter');
var Sequential = require('./sequential');

// ## //

var Modulestore = function (options) {
    this.connection = null;
    this.options = _.merge({
        lmsUrl: null
    }, options);
};

util.inherits(Modulestore, events.EventEmitter);

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
        models.setup(this.connection);
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
        deferred.reject(err);
    }, this));

    return deferred.promise;
};

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

Modulestore.prototype.listCourses = function (filter, options) {
    return Course.list(filter, _.merge(this.options, options));
};

Modulestore.prototype.getCourse = function (id, options) {
    return Course.get(id, _.merge(this.options, options));
};

Modulestore.prototype.getChapter = function (id, options) {
    return Chapter.get(id, _.merge(this.options, options));
};

Modulestore.prototype.getSequential = function (id, options) {
    return Sequential.get(id, _.merge(this.options, options));
};

Modulestore.prototype.getLocation = function (location, options) {
    return Base.getFromLocation(location, _.merge(this.options, options));
};

// ## //

module.exports = Modulestore;
