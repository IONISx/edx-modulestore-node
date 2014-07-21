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

modulestore.initialize = function (options) {
    this.connection = null;

    this.lmsBase = options.lmsBase;
    this.studioBase = options.studioBase;
};


/*
** Public methods
*/

modulestore.connect = function (options) {
    var connection = mongoose.createConnection(options);
    return this.attachConnection(connection);
};

modulestore.attachConnection = function (connection) {
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

modulestore.findCourses = function (organization) {
    var self = this;
    var filter = {};
    var deferred = Q.defer();

    if (organization) {
        filter = {
            '$or': [
                { '_id.org': organization.name },
                { 'metadata.display_organization': organization.name }
            ]
        };
    }

    Module(this.connection).find(_.merge(filter, {
        '_id.category': 'course'
    }), function (err, courses) {
        if (err) {
            deferred.reject(new Error(err));
        }
        else {
            var courses = _.map(courses, function (model) {
                return new Course(self, model, organization);
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


modulestore.findCourse = function (id) {
    var self = this;
    var deferred = Q.defer();

    var elements = id.split('/');
    if (elements.length !== 3) {
        deferred.reject(new Error('Invalid course ID'));
    }
    else {
        Module(this.connection).findOne({
            '_id.org': elements[0],
            '_id.course': elements[1],
            '_id.name': elements[2]
        }, function (err, course) {
            if (err) {
                deferred.reject(new Error(err));
            }
            else {
                var c = new Course(self, course);

                c.fetchAboutData().then(function () {
                    deferred.resolve(c);
                });
            }
        });
    }
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
