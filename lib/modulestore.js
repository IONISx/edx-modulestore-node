var Q = require('q');
var mongoose = require('mongoose');
var _ = require('lodash');
var Module = require('./models/module');
var Course = require('./course');
var Organization = require('./organization');


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

modulestore.findCourses = function (filter) {
    var self = this;
    var deferred = Q.defer();

    Module(this.connection).find(_.merge(filter || {}, {
        '_id.category': 'course'
    }), function (err, courses) {
        if (err) {
            deferred.reject(new Error(err));
        }
        else {
            var courses = _.map(courses, function (model) {
                return new Course(self, model);
            });

            var promises = _.map(courses, function (course) {
                return course.fetchAboutData();
            })

            Q.all(promises).then(function () {
                deferred.resolve(courses);
            });
        }
    });
    return deferred.promise;
};

modulestore.findOrganizations = function (filter) {
    var self = this;
    var deferred = Q.defer();

    Module(this.connection).mapReduce({
        query: _.merge(filter || {}, {
            '_id.category': 'course'
        }),
        map: function () {
            emit(this.metadata.display_organization || this._id.org, 1);
        },
        reduce: function (k, v) {
            return v.length;
        }
    }, function (err, organizations) {
        if (err) {
            deferred.reject(new Error(err));
        }
        else {
            deferred.resolve(_.map(organizations, function (organization) {
                var o = new Organization(self, organization._id);
                o.coursesCount = organization.value;
                return o;
            }));
        }
    });
    return deferred.promise;
};


/*
** Exports
*/

module.exports = modulestore;
