'use strict';

var ModuleSchema = require('./module');

// ## //

var SequentialSchema = ModuleSchema.extend({
    metadata: {
        display_name: String,
        graded: Boolean,
        format: String
    }
});

// ## //

module.exports = SequentialSchema;
