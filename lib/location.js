'use strict';

const LOCATION_REGEX = /^([^:]+):\/\/([^\/]+)\/([^\/]+)\/([^\/]+)\/(.+)$/;

class Location {
    constructor(tag, org, course, category, name, revision) {
        this.tag = tag;
        this.org = org;
        this.course = course;
        this.category = category;
        this.name = name;
        this.revision = revision || null;
    }

    toJSON() {
        return {
            tag: this.tag,
            org: this.org,
            course: this.course,
            category: this.category,
            name: this.name,
            revision: this.revision
        };
    }

    toString() {
        return this.tag + '://' + [
            this.org,
            this.course,
            this.category,
            this.name
        ].join('/');
    }

    static parse(location) {
        const fields = LOCATION_REGEX.exec(location);

        if (fields && fields.length === 6) {
            return new Location(
                fields[1],
                fields[2],
                fields[3],
                fields[4],
                fields[5]
            );
        }
    }

    static fromID(id) {
        return new Location(
            id.tag,
            id.org,
            id.course,
            id.category,
            id.name,
            id.revision
        );
    }
}

// ## //

module.exports = Location;
