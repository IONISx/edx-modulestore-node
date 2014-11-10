'use strict';

var moment = require('moment');

var safeMoment = function (input) {
    if (!input) {
        return null;
    }

    var m = moment(input);

    if (m.isValid()) {
        return m;
    }

    return null;
};

var safeUnMoment = function (input) {
    if (!input) {
        return null;
    }

    var m = moment(input);

    if (m.isValid()) {
        return m.toDate();
    }

    return null;
};

/*
** Exports
*/

exports.safeMoment = safeMoment;
exports.safeUnMoment = safeUnMoment;
