var Q = require('q');
var _ = require('lodash');
var util = require('util')
var utils = require('./utils');

var Module = require('./models/module');
var Organization = require('./organization');
var About = require('./about');


/*
** Constructor
*/

var Course = function (modulestore, model) {
    if (!model) {
        throw new Error('course: model cannot be null');
    }

    this._modulestore = modulestore;
    this._model = model;

    this._computeFields();
}

/*
** Static methods
*/

Course.find = function (modulestore, filter) {
    if (!modulestore) {
        throw new Error('course: modulestore is required');
    }

    var deferred = Q.defer();

    Module(modulestore.connection).find(_.merge(filter || {}, {
        '_id.category': 'course'
    }), function (err, models) {
        if (err) {
            deferred.reject(new Error(err));
        }
        else {
            var courses = _.map(models, function (model) {
                return new Course(modulestore, model);
            });

            Q.all(
                _.map(courses, function (course) {
                    return course._fetchAboutFields();
                }))
                .done(function () {
                    deferred.resolve(courses);
                });
        }
    });

    return deferred.promise;
}

Course.findById = function (modulestore, id) {
    if (!modulestore) {
        throw new Error('course: modulestore is required');
    }

    var deferred = Q.defer();

    var elements = id.split('/');
    if (elements.length !== 3) {
        deferred.reject(new Error('Invalid course ID'));
    }
    else {
        Module(modulestore.connection).findOne({
            '_id.org': elements[0],
            '_id.course': elements[1],
            '_id.name': elements[2]
        }, function (err, model) {
            if (err) {
                deferred.reject(new Error(err));
            }
            else {
                var course = new Course(modulestore, model);
                course._fetchAboutFields().done(function () {
                    deferred.resolve(course);
                });
            }
        });
    }

    return deferred.promise;
}


/*
** Private methods
*/

Course.prototype._computeFields = function () {
    this.enrollmentStartDate = utils.safeMoment(this.get('metadata.enrollment_start'));
    this.enrollmentEndDate = utils.safeMoment(this.get('metadata.enrollment_end'));

    this.startDate = utils.safeMoment(this.get('metadata.start'));
    this.endDate = utils.safeMoment(this.get('metadata.end'));

    this.organization = Organization.fromCourse(this._modulestore, this._model);
};

Course.prototype._fetchAboutFields = function (modulestore) {
    var self = this;

    var promises = _.map([
        'short_description'
    ], function (field) {
        return About.fetch(self._modulestore, self, field);
    });

    return Q.all(promises).then(function (fields) {
        self._about = _.reduce(fields, function (result, field) {
            result[field.name] = field;
            return result;
        }, {});
    });
};


/*
** Public attributes
*/

Course.prototype.__defineGetter__('id', function () {
    var _id =  this.get('_id');

    return [
        _id.org,
        _id.course,
        _id.name
    ].join('/');
});

Course.prototype.__defineGetter__('shortId', function () {
    return this.get('_id.course');
});

Course.prototype.__defineGetter__('name', function () {
    return this.get('metadata.display_name');
});

Course.prototype.__defineGetter__('description', function () {
    var about = this._about['short_description'];

    return about ? about.value : null;
});

Course.prototype.__defineGetter__('aboutPage', function () {
    var _id = this.get('_id');

    var path = [
        '/courses',
        _id.org,
        _id.course,
        _id.name,
        'about'
    ].join('/');

    if (this._modulestore.lmsBase) {
        path = this._modulestore.lmsBase + path;
    }

    return path;
});

Course.prototype.__defineGetter__('studioLink', function () {
    if (this._modulestore.studioBase) {
        var _id = this.get('_id');

        return this._modulestore.studioBase + [
            '/course',
            _id.org,
            _id.course,
            _id.name
        ].join('/');
    }

    return null;
});

Course.prototype.__defineGetter__('image', function () {
    var image = this.get('metadata.course_image');

    if (image) {
        var _id = this.get('_id');

        var path = [
            '/c4x',
            _id.org,
            _id.course,
            'asset',
            image
        ].join('/')

        if (this._modulestore.lmsBase) {
            path = this._modulestore.lmsBase + path;
        }

        return path;
    }

    return null;
});

Course.prototype.__defineGetter__('state', function () {
    var now = new Date();

    if (this.enrollmentStartDate && this.enrollmentStartDate.isAfter(now)) {
        return 'hidden';
    }

    if (this.startDate && this.startDate.isAfter(now)) {
        return 'upcoming';
    }

    if (this.endDate && this.endDate.isBefore(now)) {
        return 'finished';
    }

    if (this.enrollmentEndDate && this.enrollmentEndDate.isBefore(now)) {
        return 'finishing';
    }

    return 'open';
});


/*
** Public methods
*/

Course.prototype.get = function (key) {
    return this._model.get(key);
};

Course.prototype.toJSON = function () {
    return {
        id: this.id,
        shortId: this.shortId,
        state: this.state,
        name: this.name,
        description: this.description,
        organization: this.organization,
        aboutPage: this.aboutPage,
        studioLink: this.studioLink,
        image: this.image,
        startDate: utils.safeUnMoment(this.startDate),
        endDate: utils.safeUnMoment(this.endDate),
        enrollmentStartDate: utils.safeUnMoment(this.enrollmentStartDate),
        enrollmentEndDate: utils.safeUnMoment(this.enrollmentEndDate)
    };
};

Course.prototype.inspect = function () {
    return util.inspect(this.toJSON(), {
        colors: true
    });
};

Course.prototype.toString = function () {
    return this.fullId;
}


/*
** Exports
*/

module.exports = Course;
