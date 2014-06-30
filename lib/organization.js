var _ = require('lodash');


/*
** Constructor
*/

var Organization = function (modulestore, name) {
    if (!modulestore) {
        throw new Error('organization: modulestore is required');
    }

    if (!name) {
        throw new Error('organization: name cannot be null');
    }

    this._modulestore = modulestore;

    this.name = name;
}


/*
** Public attributes
*/



/*
** Public methods
*/

Organization.prototype.findCourses = function (filter) {
    return this._modulestore.findCourses(this);
};

Organization.prototype.inspect = function () {
    return this.name;
}

Organization.prototype.toString = function () {
    return this.name;
}



/*
** Exports
*/

module.exports = Organization;
