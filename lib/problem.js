'use strict';

const Base   = require('./base');
const models = require('./models');

// ## //

/*
** Constructor
*/

const Problem = Base.extend({
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
    const problem = new Problem(model);
    problem.parent = parent;
    return problem;
};

Problem.get = function (id, options) {
    return models.Problem
        .findOne({
            '_id.name': id
        })
        .exec()
        .then(model => {
            if (model) {
                return Problem.load(model, null, options);
            }
            return null;
        });
};

// ## //

module.exports = Problem;
