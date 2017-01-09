'use strict';

const moment = require('moment');

const safeMoment = function (input) {
    if (!input) {
        return null;
    }

    const m = moment(input);

    if (m.isValid()) {
        return m;
    }

    return null;
};

const safeUnMoment = function (input) {
    if (!input) {
        return null;
    }

    const m = moment(input);

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
