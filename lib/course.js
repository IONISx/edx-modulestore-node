var _ = require('lodash');
var Module = require('./models/module');


/*
** Constructor
*/

var Course = function (modulestore, model) {
    if (!modulestore) {
        throw new Error('Course: modulestore is required');
    }

    this._model = model || new Module();
}


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
