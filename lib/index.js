var EventEmitter = require('events').EventEmitter;
var proto = require('./modulestore')
var _ = require('lodash');


/*
** Public functions
*/

function createModuleStore(options) {
    var modulestore = {};

    options = options || {};

    _.merge(modulestore, proto);
    _.merge(modulestore, EventEmitter.prototype);

    modulestore.initialize(options);
    return modulestore;
}


/*
** Exports
*/

module.exports = createModuleStore;
