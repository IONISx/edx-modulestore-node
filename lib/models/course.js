var mongoose = require('mongoose');

var ModuleSchema = require('./module');

// ## //

var TabSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: [
            'courseware',
            'course_info',
            'discussion',
            'progress',
            'static_tab',
            'textbooks',
            'pdf_textbooks',
            'wiki'
        ]
    },
    name: String
}, {
    _id: false
});

var CourseSchema = ModuleSchema.extend({
    metadata: {
        display_name: String,
        display_coursenumber: String,
        display_organization: String,
        course_image: String,
        start: {
            type: Date,
            default: '2030-01-01T00:00:00Z'
        },
        end: Date,
        enrollment_start: {
            type: Date,
            default: '2030-01-01T00:00:00Z'
        },
        enrollment_end: Date,
        tabs: {
            type: [TabSchema],
            default: [
                { type: 'courseware', name: 'Courseware' },
                { type: 'course_info', name: 'Course Info' },
            ]
        },
        advanced_modules: [String]
    }
});

// ## //

module.exports = CourseSchema;
