'use strict';

var Q = require('kew');

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
    var deferred = Q.defer();

    models.Chapter.findOne({
        '_id.name': id
    }, function (err, model) {
        if (err) {
            deferred.reject(err);
        }
        else if (!model) {
            deferred.resolve();
        }
        else {
            deferred.resolve(Chapter.load(model, null, options));
        }
    });

    return deferred.promise;
};


// ## //

module.exports = Chapter;
