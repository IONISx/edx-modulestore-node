var _ = require('lodash');
var utils = require('./utils');
var Module = require('./models/module');
var Organization = require('./organization');


/*
** Constructor
*/

var Course = function (modulestore, model) {
    if (!modulestore) {
        throw new Error('Course: modulestore is required');
    }

    this._modulestore = modulestore;

    this._model = model || new Module();
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

    this.organization = new Organization(
        this._modulestore,
        this.get('metadata.display_organization') || this.get('_id.org')
    );
};


/*
** Public attributes
*/

Course.prototype.__defineGetter__('id', function () {
    return this.get('_id.name');
});

Course.prototype.__defineGetter__('fullId', function () {
    var _id = this.get('_id');

    return 'i4x://' + [
        _id.org,
        _id.course,
        _id.category,
        _id.name
    ].join('/');
});

Course.prototype.__defineGetter__('name', function () {
    return this.get('metadata.display_name');
});

Course.prototype.__defineGetter__('state', function () {
    var now = new Date();

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

Course.prototype.get = function (key) {
    return this._model.get(key);
};

Course.prototype.inspect = function () {
    return this._model.inspect();
};

Course.prototype.toString = function () {
    return this.fullId;
}


/*
** Exports
*/

module.exports = Course;
