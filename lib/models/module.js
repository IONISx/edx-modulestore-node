var _ = require('lodash');
var mongoose = require('mongoose');

// ## //

var schemaOptions = {
    id: false,
    _id: false,
    collection: 'modulestore',
    discriminatorKey: '_id.category',
    toObject: {
        retainKeyOrder: true
    }
};

var extend = function (schema, options) {
    return new mongoose.Schema(schema, _.extend({}, schemaOptions, options));
};

var ModuleSchema = new mongoose.Schema({
    _id: {
        // The order of these fields is VERY important, do NOT change it

        revision: {
            type: String,
            default: null
        },
        name: {
            type: String,
            default: null,
        },
        category: {
            type: String,
        },
        course: {
            type: String,
            default: null,
        },
        org: {
            type: String,
            default: null,
        },
        tag: {
            type: String,
            default: 'i4x'
        }
    },
    edit_info: {
        edited_by: mongoose.Schema.Types.Long,
        edited_on: {
            type: Date,
            default: Date.now
        },
        subtree_edited_by: mongoose.Schema.Types.Long,
        subtree_edited_on: {
            type: Date,
            default: Date.now
        }
    },
    definition: {
        children: [String]
    }
}, schemaOptions);


ModuleSchema.methods.upcast = function () {
    var Class = this.constructor.discriminators[this._id.category];

    // Taken from Model.hydrate
    var doc = new Class(this);
    doc.$__reset();
    doc.isNew = false
    return doc;
};


ModuleSchema.extend = extend;

// ## //

module.exports = ModuleSchema;
module.exports.Schema = ModuleSchema;
