'use strict';

var LOCATION_REGEX = /^([^:]+):\/\/([^\/]+)\/([^\/]+)\/([^\/]+)\/(.+)$/;

var Location = function (tag, org, course, category, name, revision) {
    this.tag = tag;
    this.org = org;
    this.course = course;
    this.category = category;
    this.name = name;
    this.revision = revision || null;
};

Location.parse = function (location) {
    var fields = LOCATION_REGEX.exec(location);

    if (fields && fields.length === 6) {
        return new Location(
            fields[1],
            fields[2],
            fields[3],
            fields[4],
            fields[5]
        );
    }
};

Location.fromID = function (id) {
    return new Location(
        id.tag,
        id.org,
        id.course,
        id.category,
        id.name,
        id.revision
    );
};

Location.prototype = {
    tag: null,
    org: null,
    course: null,
    category: null,
    name: null,
    revision: null,

    toJSON: function () {
        return {
            tag: this.tag,
            org: this.org,
            course: this.course,
            category: this.category,
            name: this.name,
            revision: this.revision
        };
    },

    toString: function () {
        return this.tag + '://' + [
            this.org,
            this.course,
            this.category,
            this.name
        ].join('/');
    }
};


// ## //

module.exports = Location;
