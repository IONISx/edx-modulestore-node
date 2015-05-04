'use strict';

var events = require('events');
var util = require('util');

var Promise = require('bluebird');
var mongoose = require('mongoose');
var _ = require('lodash');

var models = require('./models');
var Base = require('./base');
var Course = require('./course');
var Chapter = require('./chapter');
var Sequential = require('./sequential');

// ## //

Promise.promisifyAll(mongoose);

var Modulestore = function (options) {
    this.connection = null;
    this.options = _.merge({
        lmsUrl: null
    }, options);
};

util.inherits(Modulestore, events.EventEmitter);

Modulestore.prototype.connect = function (options) {
    var self = this;
    var connection = mongoose.createConnection();

    return connection
        .openAsync(options)
        .then(function () {
            self.attachConnection(connection);

            return connection;
        });
};

Modulestore.prototype.attachConnection = function (connection) {
    if (this.connection) {
        throw new Error('modulestore: detach current connection first');
    }

    models.setup(connection);

    this.connection = connection;
    this.connection.on('close', _.bind(function () {
        this.emit('disconnected', this);
        this.detachConnection();
    }, this));

    this.connection.on('error', _.bind(function () {
        this.detachConnection();
    }, this));
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
    if (this.connection) {
        return this.connection.closeAsync();
    }
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

module.exports = new Modulestore();
module.exports.Modulestore = Modulestore;
