'use strict';

const ModuleSchema = require('./module');

// ## //

const ProblemSchema = ModuleSchema.extend({
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
