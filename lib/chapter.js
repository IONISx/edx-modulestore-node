'use strict';

const Base   = require('./base');
const utils  = require('./utils');
const models = require('./models');

// ## //

/*
** Constructor
*/

const Chapter = Base.extend({
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
    const chapter = new Chapter(model);
    chapter.parent = parent;
    return chapter;
};

Chapter.get = function (id, options) {
    return models.Chapter
        .findOne({
            '_id.name': id
        })
        .exec()
        .then(model => {
            if (model) {
                return Chapter.load(model, null, options);
            }
            return null;
        });
};


// ## //

module.exports = Chapter;
