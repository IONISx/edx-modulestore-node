var util = require('util')
var Q = require('kew');
var _ = require('lodash');

var models = require('./models');
var utils = require('./utils');

var Base = require('./base');
var About = require('./about');

// ## //

/*
** Utility
*/

var _parseCourseId = function (id) {
    var elements = id.split('/');

    if (elements.length !== 3) {
        return null;
    }

    return {
        org: elements[0],
        course: elements[1],
        name: elements[2]
    };
};


var Course = Base.extend({
    initialize: function (modelOrId, options) {
        if (!modelOrId) {
            throw new Error('course: specify either model or course id');
        }

        if (_.isString(modelOrId)) {
            this._model = new models.Course();
            this.id = modelOrId;
        }
        else {
            this._model = modelOrId;
        }

        this.options = _.extend({
            aboutFields: [
                'short_description'
            ]
        }, options);
    },


    /*
    ** Private methods
    */

    _fetchAboutModel: function (name) {
        var self = this;
        var deferred = Q.defer();

        var courseId = _parseCourseId(this.id);
        models.About.findOne({
            '_id.org': courseId.org,
            '_id.course': courseId.course,
            '_id.name': name
        }, function (err, model) {
            if (err) {
                deferred.reject(err);
            }
            else if (!model) {
                deferred.resolve(null);
            }
            else {
                deferred.resolve(model);
            }
        });

        return deferred;
    },

    _fetchAboutFields: function () {
        var self = this;

        var promises = _.map(this.options.aboutFields, function (field) {
            return self._fetchAboutModel(field);
        });

        var courseId = _parseCourseId(this.id);

        return Q.all(promises).then(function (fields) {
            self._about = _.reduce(fields, function (result, field) {
                if (field) {
                    var about = new About(courseId, { model: field });
                    result[about.name] = about;
                }
                return result;
            }, {});
        });
    },

    _getAboutField: function (field) {
        var about = this._about[field];
        if (about) {
            return about.value;
        }
    },

    _setAboutField: function (field, value) {
        if (!this._about[field]) {
            this._about[field] = new About(_parseCourseId(this.id), {
                name: field
            });
        }
        this._about[field].value = value;
    },

    _saveAboutFields: function () {
        var self = this;

        var promises = _.map(this._about, function (field) {
            field.save();
        });

        return Q.all(promises);
    },


    /*
    ** Public attributes
    */

    attributes: {

        // Course ID
        id: {
            get: function () {
                var _id =  this._get('_id');

                if (!_id.org || !_id.course || !_id.name) {
                    return null;
                }

                return [
                    _id.org,
                    _id.course,
                    _id.name
                ].join('/');
            },

            set: function (value) {
                if (!this._model.isNew) {
                    throw new Error('course: can’t change id on an existing course');
                }

                var courseId = _parseCourseId(value);
                this._set('_id.org', courseId.org);
                this._set('_id.course', courseId.course);
                this._set('_id.name', courseId.name);
            }
        },

        // Course name
        name: {
            get: function () {
                return this._get('metadata.display_name');
            },
            set: function (value) {
                this._set('metadata.display_name', value);
            }
        },

        // Course number
        number: {
            get: function () {
                return this._get('metadata.display_coursenumber');
            },
            set: function (value) {
                this._set('metadata.display_coursenumber', value);
            }
        },

        // Course organization
        organization: {
            get: function () {
                return this._get('metadata.display_organization');
            },
            set: function (value) {
                this._set('metadata.display_organization', value)
            }
        },

        // Course description
        description: {
            get: function () {
                return this._getAboutField('short_description')
            },
            set: function (value) {
                this._setAboutField('short_description', value);
            }
        },

        // Course start date
        startDate: {
            get: function () {
                return this._get('metadata.start');
            },
            set: function (value) {
                this._set('metadata.start', utils.safeUnMoment(value));
            }
        },

        // Course end date
        endDate: {
            get: function () {
                return this._get('metadata.end');
            },
            set: function (value) {
                this._set('metadata.end', utils.safeUnMoment(value));
            }
        },

        // Course enrollment start date
        enrollmentStartDate: {
            get: function () {
                return this._get('metadata.enrollment_start');
            },
            set: function (value) {
                this._set('metadata.enrollment_start', utils.safeUnMoment(value));
            }
        },

        // Course enrollment end date
        enrollmentEndDate: {
            get: function () {
                return this._get('metadata.enrollment_end');
            },
            set: function (value) {
                this._set('metadata.enrollment_end', utils.safeUnMoment(value));
            }
        },

        // Course overview (HTML field)
        overview: {
            get: function () {
                return this._getAboutField('overview');
            },
            set: function (value) {
                return this._setAboutField('overview', value);
            }
        },

        // Course about page link (LMS)
        aboutPage: {
            get: function () {
                if (!this.id) {
                    return null;
                }

                return [
                    this.options.lmsUrl,
                    'courses',
                    this.id,
                    'about'
                ].join('/');
            }
        },

        // Course image (LMS)
        image: {
            get: function () {
                var image = this._get('metadata.course_image');

                if (!image) {
                    return null;
                }

                return [
                    this.options.lmsUrl,
                    'c4x',
                    this._get('_id.org'),
                    this._get('_id.course'),
                    'asset',
                    image
                ].join('/')
            }
        },

        // Course state (based on dates)
        state: {
            get: function () {
                var now = new Date();

                if (this.enrollmentStartDate && utils.safeMoment(this.enrollmentStartDate).isAfter(now)) {
                    return 'hidden';
                }

                if (this.startDate && utils.safeMoment(this.startDate).isAfter(now)) {
                    return 'upcoming';
                }

                if (this.endDate && utils.safeMoment(this.endDate).isBefore(now)) {
                    return 'finished';
                }

                if (this.enrollmentEndDate && utils.safeMoment(this.enrollmentEndDate).isBefore(now)) {
                    return 'finishing';
                }

                return 'open';
            }
        },
    },

    /*
    ** Public methods
    */

    save: function () {
        return this
            ._super()
            .then(function (course) {
                return course._saveAboutFields();
            });
    }
});


/*
** Static methods
*/

Course.load = function (model, parent, options) {
    var deferred = Q.defer();

    var course = new Course(model, options);
    course.parent = parent;

    course._fetchAboutFields().done(function () {
        deferred.resolve(course);
    });

    return deferred;
};

Course.list = function (filter, options) {
    var deferred = Q.defer();

    models.Course.find(filter || {}, function (err, models) {
        if (err) {
            deferred.reject(new Error(err));
        }
        else {
            Q.allSettled(_.map(models, function (model) {
                return Course.load(model, null, options)
            })).done(function (courses) {
                deferred.resolve(courses);
            });
        }
    });

    return deferred.promise;
}

Course.get = function (id, options) {
    var deferred = Q.defer();
    var courseId = _parseCourseId(id);

    if (!courseId) {
        deferred.reject(new Error('course: invalid course id'));
    }
    else {
        models.Course.findOne({
            '_id.org': courseId.org,
            '_id.course': courseId.course,
            '_id.name': courseId.name
        }, function (err, model) {
            if (err) {
                deferred.reject(err);
            }
            else if (!model) {
                deferred.resolve();
            }
            else {
                Course.load(model, null, options).done(function (course) {
                    console.log(course);
                    deferred.resolve(course);
                });
            }
        });
    }

    return deferred.promise;
}

// ## //

module.exports = Course;
