'use strict';

const ModuleSchema = require('./module');

// ## //

const AboutSchema = ModuleSchema.extend({
    definition: {
        data: {
            data: String
        }
    }
});

// ## //

module.exports = AboutSchema;
