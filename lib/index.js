'use strict';

var Modulestore = require('./modulestore');

// ## //

var setup = function (options) {
    return new Modulestore(options);
};

// ## //

module.exports = setup;
