'use strict';

const ModuleSchema = require('./module');

// ## //

const SequentialSchema = ModuleSchema.extend({
    metadata: {
        display_name: String,
        graded: Boolean,
        format: String
    }
});

// ## //

module.exports = SequentialSchema;
