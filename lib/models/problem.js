'use strict';

var ModuleSchema = require('./module');

// ## //

var ProblemSchema = ModuleSchema.extend({
    metadata: {
        markdown: String,
        'max_attempts': Number
    },
    definition: {
        data: {
            data: String
        }
    }
});

// ## //

module.exports = ProblemSchema;
