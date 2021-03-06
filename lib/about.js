'use strict';

const Base   = require('./base');
const models = require('./models');

// ## //

/*
** Constructor
*/

const About = Base.extend({
    initialize: function (courseId, options) {
        options = options || {};

        if (!courseId) {
            throw new Error('about: courseId is required');
        }

        if (!options.model && !options.name) {
            throw new Error('about: specify either model or field name');
        }

        this._model = options.model;
        if (!this._model) {
            this._model = new models.About({
                _id: {
                    org: courseId.org,
                    course: courseId.course,
                    name: options.name
                }
            });
        }

        delete options.model;
    },


    /*
    ** Attributes
    */

    attributes: {
        name: {
            get: function () {
                return this._get('_id.name');
            }
        },

        value: {
            get: function () {
                return this._get('definition.data.data');
            },
            set: function (val) {
                this._set('definition.data.data', val);
            }
        }
    }
});


// ## //

module.exports = About;
