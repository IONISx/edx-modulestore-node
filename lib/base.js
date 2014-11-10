'use strict';

var _ = require('lodash');
var util = require('util');
var Q = require('kew');

var factory = require('./factory');
var models = require('./models');

// ## //

/*
** Constructor
*/

var Base = function () {
};


/*
** Utilities
*/

var parseModulestoreIdentifier = function (string) {
    var r = /^i4x:\/\/([^\/]+)\/([^\/]+)\/([^\/]+)\/(.+)$/;

    var fields = r.exec(string);
    if (fields.length === 5) {
        return {
            tag: 'i4x',
            org: fields[1],
            course: fields[2],
            category: fields[3],
            name: fields[4],
            revision: null
        };
    }
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
        else {
            prototype[name] = prop[name];
        }
    }

    var Class = function () {
        if (this.initialize) {
            this.initialize.apply(this, arguments);
        }

        // Define properties, based on `this.attributes`.
        for (prop in this.attributes) {
            Object.defineProperty(this, prop, this.attributes[prop]);
        }
    };

    Class.prototype = prototype;
    Class.prototype.constructor = Class;

    /* jshint -W059 */
    Class.extend = arguments.callee;
    /* jshint +W059 */

    return Class;
};


Base.prototype = {
    parent: null,
    attributes: {},


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
    ** Public methods
    */

    save: function () {
        var self = this;
        var deferred = Q.defer();

        this._model.save(function (err) {
            if (err) {
                deferred.reject(err);
            }
            else {
                deferred.resolve(self);
            }
        });

        return deferred;
    },

    listChildren: function () {
        var self = this;
        var deferred = Q.defer();

        var children = this
            ._get('definition.children')
            .map(function (c) {
                return parseModulestoreIdentifier(c);
            });

        models.Module.find({
            '_id': {
                '$in': children
            }
        }, function (err, modules) {
            if (err) {
                deferred.reject(err);
            }
            else {
                var objects = modules
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

                deferred.resolve(objects);
            }
        });

        return deferred;
    },

    toJSON: function () {
        return _.pick(
            _.pick(this, Object.keys(this.attributes)),
            function (v) {
                return !!v;
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
