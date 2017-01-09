'use strict';

const events     = require('events');

const Promise    = require('bluebird');
const mongoose   = require('mongoose');
const _          = require('lodash');

const models     = require('./models');
const Base       = require('./base');
const Course     = require('./course');
const Chapter    = require('./chapter');
const Sequential = require('./sequential');

// ## //

mongoose.Promise = Promise;

class Modulestore extends events.EventEmitter {
    constructor(options) {
        super();

        this.connection = null;
        this.options = _.merge({
            lmsUrl: null
        }, options);

        this.mongoose = mongoose;
    }

    connect(options) {
        const connection = mongoose.createConnection();

        return connection
            .open(options)
            .then(() => {
                this.attachConnection(connection);

                return connection;
            });
    }

    attachConnection(connection) {
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
    }

    detachConnection() {
        if (!this.connection) {
            throw new Error('modulestore: no connection attached');
        }

        models.cleanup();

        this.removeAllListeners(this.connection);
        delete this.connection;

        return this;
    }

    disconnect() {
        if (this.connection) {
            return this.connection.close();
        }

        return Promise.resolve();
    }

    listCourses(filter, options) {
        return Course.list(filter, _.merge(this.options, options));
    }

    getCourse(id, options) {
        return Course.get(id, _.merge(this.options, options));
    }

    getChapter(id, options) {
        return Chapter.get(id, _.merge(this.options, options));
    }

    getSequential(id, options) {
        return Sequential.get(id, _.merge(this.options, options));
    }

    getLocation(location, options) {
        return Base.getFromLocation(location, _.merge(this.options, options));
    }
};

// ## //

module.exports = new Modulestore();
module.exports.Modulestore = Modulestore;
