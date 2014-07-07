var Q = require('q');
var _ = require('lodash');
var util = require('util')
var utils = require('./utils');
var Module = require('./models/module');
var Organization = require('./organization');


/*
** Constructor
*/

var Course = function (modulestore, model, organization) {
    if (!modulestore) {
        throw new Error('course: modulestore is required');
    }

    if (!model) {
        throw new Error('course: model cannot be null');
    }

    this.organization = organization;

    this._modulestore = modulestore;
    this._model = model;

    this._computeFields();
}


/*
** Private methods
*/

Course.prototype._computeFields = function () {
    this.enrollmentStartDate = utils.safeMoment(this.get('metadata.enrollment_start'));
    this.enrollmentEndDate = utils.safeMoment(this.get('metadata.enrollment_end'));

    this.startDate = utils.safeMoment(this.get('metadata.start'));
    this.endDate = utils.safeMoment(this.get('metadata.end'));

    if (!this.organization) {
        this.organization = new Organization(
            this._modulestore,
            this.get('metadata.display_organization') || this.get('_id.org')
        );
    }
};


/*
** Public attributes
*/

Course.prototype.__defineGetter__('id', function () {
    return this.get('_id.course');
});

Course.prototype.__defineGetter__('longId', function () {
    var _id =  this.get('_id');

    return [
        _id.org,
        _id.course,
        _id.name
    ].join('/');
});

Course.prototype.__defineGetter__('fullId', function () {
    var _id = this.get('_id');

    return _id.tag + '://' + [
        _id.org,
        _id.course,
        _id.category,
        _id.name
    ].join('/');
});

Course.prototype.__defineGetter__('name', function () {
    return this.get('metadata.display_name');
});

Course.prototype.__defineGetter__('description', function () {
    var item = _.find(this._about, function (item) {
        return item._id.name === 'short_description';
    });

    return item ? item.get('definition.data.data') : null;
});

Course.prototype.__defineGetter__('aboutPage', function () {
    var _id = this.get('_id');

    var array = [
        '/courses',
        _id.org,
        _id.course,
        _id.name,
        'about'
    ];

    if (this._modulestore.lmsBase) {
        array.unshift(this._modulestore.lmsBase);
    }

    return array.join('/');
});

Course.prototype.__defineGetter__('image', function () {
    var image = this.get('metadata.course_image');

    if (image) {
        var _id = this.get('_id');

        var array = [
            '/c4x',
            _id.org,
            _id.course,
            'asset',
            image
        ];

        if (this._modulestore.lmsBase) {
            array.unshift(this._modulestore.lmsBase);
        }

        return array.join('/');
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

    return 'open';
});


/*
** Public methods
*/

Course.prototype.fetchAboutData = function () {
    var self = this;
    var deferred = Q.defer();

    var _id = this.get('_id');

    Module(this._modulestore.connection).find({
        '_id.tag': _id.tag,
        '_id.org': _id.org,
        '_id.course': _id.course,
        '_id.category': 'about'
    }, function (err, values) {
        if (err) {
            deferred.reject(new Error(err));
        }
        else {
            self._about = values;
            deferred.resolve();
        }
    })

    return deferred.promise;
};

Course.prototype.get = function (key) {
    return this._model.get(key);
};

Course.prototype.inspect = function () {
    return util.inspect({
        id: this.id,
        fullId: this.fullId,
        state: this.state,
        name: this.name,
        description: this.description,
        organization: this.organization,
        image: this.image,
        startDate: utils.safeUnMoment(this.startDate),
        endDate: utils.safeUnMoment(this.endDate),
        enrollmentStartDate: utils.safeUnMoment(this.enrollmentStartDate),
        enrollmentEndDate: utils.safeUnMoment(this.enrollmentEndDate)
    }, {
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
