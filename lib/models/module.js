var mongoose = require('mongoose');

var moduleSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.Mixed,
    children: [String],
    display_name: {
        type: String
    }
}, {
    id: false,
    _id: false,
    collection: 'modulestore'
});


/*
** Exports
*/

module.exports = mongoose.model('Module', moduleSchema);
