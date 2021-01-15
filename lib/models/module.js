'use strict';

const _        = require('lodash');
const mongoose = require('mongoose');

// ## //

const schemaOptions = {
    id: false,
    _id: false,
    collection: 'modulestore',
    discriminatorKey: '_id.category',
    retainKeyOrder: true,
    usePushEach: true
};

const extend = function (schema, options) {
    return new mongoose.Schema(schema, _.extend({}, schemaOptions, options));
};

const ModuleSchema = new mongoose.Schema({
    _id: {
        // The order of these fields is VERY important, do NOT change it

        tag: {
            type: String,
            default: 'i4x'
        },
        org: {
            type: String,
            default: null,
        },
        course: {
            type: String,
            default: null,
        },
        category: {
            type: String,
        },
        name: {
            type: String,
            default: null,
        },
        revision: {
            type: String,
            default: null
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
    if (this._id.category in this.constructor.discriminators) {
        const Class = this.constructor.discriminators[this._id.category];

        // Taken from Model.hydrate
        const doc = new Class(this);
        doc.$__reset();
        doc.isNew = false;
        return doc;
    }

    // Cannot upcast, returning actual model
    return this;
};


ModuleSchema.extend = extend;

// ## //

module.exports = ModuleSchema;
