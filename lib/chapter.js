'use strict';

var Base = require('./base');
var utils = require('./utils');
var models = require('./models');

// ## //

/*
** Constructor
*/

var Chapter = Base.extend({
    initialize: function (model) {
        this._model = model || new models.Chapter();
    },

    /*
    ** Attributes
    */

    attributes: {
        startDate: {
            get: function () {
                return this._get('metadata.start');
            },
            set: function (value) {
                this._set('metadata.start', utils.safeUnMoment(value));
            }
        }
    }
});

Chapter.load = function (model, parent) {
    var chapter = new Chapter(model);
    chapter.parent = parent;
    return chapter;
};

Chapter.get = function (id, options) {
    return models.Chapter
        .findOneAsync({
            '_id.name': id
        })
        .then(function (model) {
            if (model) {
                return Chapter.load(model, null, options);
            }
            return null;
        });
};


// ## //

module.exports = Chapter;
