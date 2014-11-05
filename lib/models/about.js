var mongoose = require('mongoose');

var ModuleSchema = require('./module');

// ## //

var AboutSchema = ModuleSchema.extend({
    definition: {
        data: {
            data: String
        }
    }
});

// ## //

module.exports = AboutSchema;
