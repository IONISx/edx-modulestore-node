'use strict';

var ModuleSchema = require('./module');

// ## //

var ChapterSchema = ModuleSchema.extend({
    metadata: {
        display_name: String,
        start: Date
    }
});

// ## //

module.exports = ChapterSchema;