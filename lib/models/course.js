const mongoose     = require('mongoose');

const ModuleSchema = require('./module');

// ## //

const TabSchema = new mongoose.Schema({
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

const CourseSchema = ModuleSchema.extend({
    definition: {
        data: {
            grading_policy: {
                GRADER: [mongoose.Schema.Types.Mixed]
            }
        }
    },
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
        advanced_modules: [String],
        showanswer: String
    }
});

// ## //

module.exports = CourseSchema;
