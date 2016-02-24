'use strict';

var _ = require('lodash');
var util = require('util');
var Promise = require('bluebird');

var Location = require('./location');
var factory = require('./factory');
var models = require('./models');

// ## //

var _assignAttributes = function (prop, super_) {
    return _.assignWith(
        prop.attributes,
        super_.attributes,
        function (a, b) {
            return _.isUndefined(a) ? b : a;
        }
    );
};

/*
** Constructor
*/

var Base = function () {
};

/*
** Static methods
*/

Base.extend = function (prop) {
    var _super = this.prototype;
    var prototype = new this();

    for (var name in prop) {
        if (_.isFunction(prop[name]) && _.isFunction(_super[name])) {
            // Expose _super method to overriden functions
            /* jshint -W083 */
            prototype[name] = (function (name, fn) {
                return function () {
                    var tmp = this._super;
                    this._super = _super[name];

                    var ret = fn.apply(this, arguments);
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


    var Class = function () {
        // Define properties, based on `this.attributes`.
        for (prop in this.attributes) {
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
    var loc = Location.parse(location);
    if (loc) {
        return models.Module
            .findOneAsync({
                '_id': loc.toJSON()
            })
            .then(function (model) {
                if (model) {
                    model = model.upcast();

                    var C = factory.getClass(loc.category);
                    if (C && C.load) {
                        model = C.load(model, null, options);
                    }
                }

                return Promise.resolve(model);
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
        return this._model.saveAsync();
    },

    listChildren: function () {
        var self = this;

        var children = this
            ._get('definition.children')
            .map(function (c) {
                return Location.parse(c).toJSON();
            });

        return models.Module
            .findAsync({
                '_id': {
                    '$in': children
                }
            })
            .then(function (modules) {
                return modules
                    .map(function (m) {
                        m = m.upcast();

                        var C = factory.getClass(m.get('_id.category'));

                        if (C && C.load) {
                            return C.load(m, self);
                        }

                        return null;
                    })
                    .filter(function (m) {
                        return !!m;
                    });
            });
    },

    toJSON: function () {
        return _.pickBy(
            _.pick(this, Object.keys(this.attributes)),
            function (v) {
                return v !== undefined;
            }
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
