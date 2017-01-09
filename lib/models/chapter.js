'use strict';

const ModuleSchema = require('./module');

// ## //

const ChapterSchema = ModuleSchema.extend({
    metadata: {
        display_name: String,
        start: Date
    }
});

// ## //

module.exports = ChapterSchema;
