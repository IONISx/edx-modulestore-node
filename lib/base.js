'use strict';

const _        = require('lodash');
const util     = require('util');
const Promise  = require('bluebird');

const Location = require('./location');
const factory  = require('./factory');
const models   = require('./models');

// ## //

const _assignAttributes = function (prop, super_) {
    return _.assignWith(
        prop.attributes,
        super_.attributes,
        (a, b) => _.isUndefined(a) ? b : a
    );
};

/*
** Constructor
*/

const Base = function () {
};

/*
** Static methods
*/

Base.extend = function (prop) {
    const _super = this.prototype;
    const prototype = new this();

    for (const name in prop) {
        if (_.isFunction(prop[name]) && _.isFunction(_super[name])) {
            // Expose _super method to overriden functions
            /* jshint -W083 */
            prototype[name] = (function (name, fn) {
                return function () {
                    const tmp = this._super;
                    this._super = _super[name];

                    const ret = fn.apply(this, arguments);
                    this._super = tmp;

                    return ret;
                };
            })(name, prop[name]);
            /* jshint +W083 */
        }
        else if (name === 'attributes') {
            prototype[name] = _assignAttributes(prop, _super);
        }
        else {
            prototype[name] = prop[name];
        }
    }


    const Class = function () {
        // Define properties, based on `this.attributes`.
        for (const prop in this.attributes) {
            Object.defineProperty(this, prop, this.attributes[prop]);
        }

        if (this.initialize) {
            this.initialize.apply(this, arguments);
        }
    };

    Class.prototype = prototype;
    Class.prototype.constructor = Class;

    Class.extend = Base.extend;

    return Class;
};

Base.getFromLocation = function (location, options) {
    const loc = Location.parse(location);

    if (loc) {
        return models.Module
            .findOne({
                '_id': loc.toJSON()
            })
            .exec()
            .then(model => {
                if (model) {
                    model = model.upcast();

                    const C = factory.getClass(loc.category);
                    if (C && C.load) {
                        model = C.load(model, null, options);
                    }
                }

                return model;
            });
    }

    return Promise.reject(new Error('Invalid location'));
};


Base.prototype = {
    parent: null,

    /*
    ** Private methods
    */

    _get: function (field) {
        return this._model.get(field);
    },

    _set: function (field, value) {
        return this._model.set(field, value);
    },


    /*
    ** Public attributes
    */

    attributes: {
        id: {
            get: function () {
                return this._get('_id.name');
            }
        },

        location: {
            get: function () {
                return Location
                    .fromID(this._get('_id'))
                    .toString();
            }
        },

        name: {
            get: function () {
                return this._get('metadata.display_name');
            },
            set: function (value) {
                this._set('metadata.display_name', value);
            }
        }
    },


    /*
    ** Public methods
    */

    save: function () {
        return this._model.save();
    },

    listChildren: function () {
        const children = this
            ._get('definition.children')
            .map(c => Location.parse(c).toJSON());

        return models.Module
            .find({
                '_id': {
                    '$in': children
                }
            })
            .exec()
            .then(modules => modules
                .map(module => {
                    module = module.upcast();

                    const C = factory.getClass(module.get('_id.category'));

                    if (C && C.load) {
                        return C.load(module, this);
                    }

                    return null;
                })
                .filter(module => !!module)
            );
    },

    toJSON: function () {
        return _.pickBy(
            _.pick(this, Object.keys(this.attributes)),
            v => v !== undefined
        );
    },

    inspect: function () {
        return util.inspect(this.toJSON(), {
            colors: true
        });
    },

    toString: function () {
        return this.value;
    }
};

// ## //

module.exports = Base;
