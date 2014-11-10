'use strict';

var getClass = function (type) {
    return {
        'course': function () { return require('./course'); },
        'about': function () { return require('./about'); },
        'chapter': function () { return require('./chapter'); },
        'sequential': function () { return require('./sequential'); }
    }[type]();
};

// ## //

exports.getClass = getClass;
