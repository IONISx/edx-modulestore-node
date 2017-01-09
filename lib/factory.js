'use strict';

// ## //

const _map = {
    'course': './course',
    'about': './about',
    'chapter': './chapter',
    'sequential': './sequential'
};

const getClass = function (type) {
    if (type in _map) {
        return require(_map[type]);
    }

    return require('./module');
};

// ## //

exports.getClass = getClass;
