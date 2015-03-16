'use strict';

var Base = require('./base');
var models = require('./models');

// ## //

/*
** Constructor
*/

var Sequential = Base.extend({
    initialize: function (model) {
        this._model = model || new models.Sequential();
    },

    /*
    ** Attributes
    */

    attributes: {
        graded: {
            get: function () {
                return this._get('metadata.graded');
            },
            set: function (value) {
                // This can only disable grading.
                // To enable, set a gradingCategory.

                if (!value) {
                    this._set('metadata.graded', false);
                    this._set('metadata.format', null);
                }
            }

        },

        gradingCategory: {
            get: function () {
                if (this.graded) {
                    return this._get('metadata.format');
                }
            },
            set: function (value) {
                if (value) {
                    this._set('metadata.graded', true);
                    this._set('metadata.format', value);
                }
                else {
                    this._set('metadata.graded', false);
                    this._set('metadata.format', value);
                }
            }
        }

    }
});

Sequential.load = function (model, parent) {
    var sequential = new Sequential(model);
    sequential.parent = parent;
    return sequential;
};

Sequential.get = function (id, options) {
    return models.Sequential
        .findOneAsync({
            '_id.name': id
        })
        .then(function (model) {
            if (model) {
                return Sequential.load(model, null, options);
            }
            return null;
        });
};

// ## //

module.exports = Sequential;
