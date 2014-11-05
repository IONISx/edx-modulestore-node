var _ = require('lodash');
var util = require('util')
var Q = require('kew');

// ## //

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
            prototype[name] = (function (name, fn) {
                return function () {
                    var tmp = this._super;
                    this._super = _super[name];

                    var ret = fn.apply(this, arguments);
                    this._super = tmp;

                    return ret;
                };
            })(name, prop[name])
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
    }

    Class.prototype = prototype;
    Class.prototype.constructor = Class;
    Class.extend = arguments.callee;

    return Class;
};


Base.prototype = {
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
