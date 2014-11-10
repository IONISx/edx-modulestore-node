var Base = require('./base');

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
        name: {
            get: function () {
                return this._get('metadata.display_name');
            },
            set: function (value) {
                this._set('metadata.display_name', value);
            }
        },

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
}


// ## //

module.exports = Chapter;
