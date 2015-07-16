'use strict';

var Promise = require('bluebird');
var _ = require('lodash');

var models = require('./models');
var utils = require('./utils');

var Base = require('./base');
var About = require('./about');
var Problem = require('./problem');

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
    _about: {},

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
        var courseId = _parseCourseId(this.id);

        return models.About
            .findOneAsync({
                '_id.org': courseId.org,
                '_id.course': courseId.course,
                '_id.name': name
            });
    },

    _fetchAboutFields: function () {
        var self = this;
        var courseId = _parseCourseId(this.id);

        return Promise
            .reduce(this.options.aboutFields, function (result, field) {
                return self
                    ._fetchAboutModel(field)
                    .then(function (field) {
                        if (field) {
                            var about = new About(courseId, { model: field });
                            result[about.name] = about;
                        }
                        return result;
                    });
            }, {})
            .then(function (result) {
                self._about = result;
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
        var fields = [];
        for (var about in this._about) {
            fields[about] = this._about[about];
        }

        return Promise.map(fields, function (field) {
            return field.saveAsync();
        });
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
                this._set('metadata.display_organization', value);
            }
        },

        // Course description
        description: {
            get: function () {
                return this._getAboutField('short_description');
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

        // Course administration link (Studio)
        studioLink: {
            get: function () {
                if (!this.id || !this.options.studioUrl) {
                    return null;
                }

                return [
                    this.options.studioUrl,
                    'course',
                    this.id
                ].join('/');
            }
        },

        // Course about page link (LMS)
        aboutPage: {
            get: function () {
                if (!this.id || !this.options.lmsUrl) {
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

                if (!image || !this.options.lmsUrl) {
                    return null;
                }

                return [
                    this.options.lmsUrl,
                    'c4x',
                    this._get('_id.org'),
                    this._get('_id.course'),
                    'asset',
                    image
                ].join('/');
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

        xblocks: {
            get: function () {
                return this._get('metadata.advanced_modules');
            },
            set: function (value) {
                this._set('metadata.advanced_modules', value);
            }
        },

        wikiEnabled: {
            get: function () {
                return this._get('metadata.tabs').some(function (tab) {
                    return tab.type === 'wiki';
                });
            },
            set: function (value) {
                var tabs = this._get('metadata.tabs');
                var enabled = tabs.some(function (tab) {
                    return tab.type === 'wiki';
                });

                if (value && !enabled) {
                    tabs.push({
                        type: 'wiki',
                        name: 'Wiki'
                    });
                }
                else if (!value) {
                    this._set('metadata.tabs', tabs.filter(function (tab) {
                        return tab.type !== 'wiki';
                    }));
                }
            }
        },

        forumEnabled: {
            get: function () {
                return this._get('metadata.tabs').some(function (tab) {
                    return tab.type === 'discussion';
                });
            },
            set: function (value) {
                var tabs = this._get('metadata.tabs');
                var enabled = tabs.some(function (tab) {
                    return tab.type === 'discussion';
                });

                if (value && !enabled) {
                    tabs.push({
                        type: 'discussion',
                        name: 'Forum'
                    });
                }
                else if (!value) {
                    this._set('metadata.tabs', tabs.filter(function (tab) {
                        return tab.type !== 'discussion';
                    }));
                }
            }
        },

        showAnswer: {
            get: function () {
                return this._get('metadata.showanswer');
            },
            set: function (value) {
                this._set('metadata.showanswer', value);
            }
        }
    },

    /*
    ** Public methods
    */

    save: function () {
        var self = this;

        return this._super()
            .then(function () {
                return self._saveAboutFields();
            })
            .return(this);
    },

    listProblems: function () {
        var _id =  this._get('_id');

        return models.Problem
            .findAsync({
                '_id.org': _id.org,
                '_id.course': _id.course
            })
            .then(function (problems) {
                return problems.map(Problem.load);
            });
    }
});


/*
** Static methods
*/

Course.load = function (model, parent, options) {
    var course = new Course(model, options);
    course.parent = parent;

    return course
        ._fetchAboutFields()
        .return(course);
};

Course.list = function (filter, options) {
    return models.Course
        .findAsync(filter || {})
        .then(function (models) {
            return Promise.map(models, function (model) {
                return Course.load(model, null, options);
            });
        });
};

Course.get = function (id, options) {
    var courseId = _parseCourseId(id);

    if (!courseId) {
        return Promise.reject(new Error('course: invalid course id'));
    }
    else {
        return models.Course
            .findOneAsync({
                '_id.org': courseId.org,
                '_id.course': courseId.course,
                '_id.name': courseId.name
            })
            .then(function (model) {
                if (model) {
                    return Course.load(model, null, options);
                }
                return null;
            });
    }
};

// ## //

module.exports = Course;
