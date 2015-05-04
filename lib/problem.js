'use strict';

var Base = require('./base');
var models = require('./models');

// ## //

/*
** Constructor
*/

var Problem = Base.extend({
    initialize: function (model) {
        this._model = model || new models.Problem();
    },

    /*
    ** Attributes
    */

    attributes: {
        xml: {
            get: function () {
                return this._get('definition.data.data');
            },
            set: function (value) {
                return this._set('definition.data.data', value);
            }
        },

        input: {
            get: function () {
                return this._get('metadata.markdown');
            },
            set: function (value) {
                return this._set('metadata.markdown', value);
            }
        },

        attempts: {
            get: function () {
                return this._get('metadata.max_attempts');
            },
            set: function (value) {
                return this._set('metadata.max_attempts', value);
            }

        }
    }
});

Problem.load = function (model, parent) {
    var problem = new Problem(model);
    problem.parent = parent;
    return problem;
};

Problem.get = function (id, options) {
    return models.Problem
        .findOneAsync({
            '_id.name': id
        })
        .then(function (model) {
            if (model) {
                return Problem.load(model, null, options);
            }
            return null;
        });
};

// ## //

module.exports = Problem;
