var Q = require('q');
var _ = require('lodash');
var util = require('util');

var Module = require('./models/module');

/*
** Constructor
*/

var Organization = function (modulestore, model) {
    if (!modulestore) {
        throw new Error('organization: modulestore is required');
    }

    if (!model) {
        throw new Error('organization: model cannot be null');
    }

    model.names = _.filter(model.names, function (name) {
        return !!name;
    });

    this._modulestore = modulestore;
    this._model = model;
}


/*
** Static methods
*/

Organization.find = function (modulestore, filter) {
    if (!modulestore) {
        throw new Error('organization: modulestore is required');
    }

    var deferred = Q.defer();

    Module(modulestore.connection).aggregate([
        { $match: _.merge(filter || {}, { '_id.category':'course' }) },
        { $project: { '_id': true, 'name': '$metadata.display_organization' } },
        { $group: { '_id': '$_id.org', names: { $addToSet: '$name' } } }
    ], function (err, models) {
        if (err) {
            deferred.reject(new Error(err));
        }
        else {
            deferred.resolve(_.map(models, function (model) {
                return new Organization(modulestore, model);
            }));
        }
    });

    return deferred.promise;
};

Organization.fromCourse = function (modulestore, course) {
    return new Organization(modulestore, {
        _id: course.get('_id.org'),
        names: [
            course.get('metadata.display_organization')
        ]
    });
}


/*
** Public attributes
*/

Organization.prototype.__defineGetter__('id', function () {
    return this._model._id;
});

Organization.prototype.__defineGetter__('name', function () {
    return this._model.names.length ? this._model.names[0] : null;
});


/*
** Public methods
*/

Organization.prototype.get = function (key) {
    return this._model[key];
};

Organization.prototype.findCourses = function (filter) {
    return this._modulestore.findCourses({
        '_id.org': this.id
    });
};

Organization.prototype.toJSON = function () {
    return {
        id: this.id,
        name: this.name
    };
}

Organization.prototype.inspect = function () {
    return util.inspect(this.toJSON(), {
        colors: true
    });
}

Organization.prototype.toString = function () {
    return this.name || this.id;
}


/*
** Exports
*/

module.exports = Organization;
