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


function attachModel(connection) {
    if (!connection) {
        throw new Error('models/module: no connection specified');
    }

    return connection.model('Module', moduleSchema);
};

/*
** Exports
*/

module.exports = attachModel;
