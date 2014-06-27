var EventEmitter = require('events').EventEmitter;
var proto = require('./modulestore')
var _ = require('lodash');


/*
** Public functions
*/

function createModuleStore() {
    var modulestore = {};

    _.merge(modulestore, proto);
    _.merge(modulestore, EventEmitter.prototype);

    modulestore.initialize();
    return modulestore;
}


/*
** Exports
*/

module.exports = createModuleStore;
