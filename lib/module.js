'use strict';

const Base = require('./base');

// ## //

/*
** Constructor
*/

const Module = Base.extend({
    initialize: function (model) {
        this._model = model;

        if (!model) {
            throw new Error('module: a model is required for now');
        }
    }
});

Module.load = function (model, parent) {
    const module = new Module(model);
    module.parent = parent;
    return module;
};

// ## //

module.exports = Module;
