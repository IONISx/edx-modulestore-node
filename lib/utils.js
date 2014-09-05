var moment = require('moment');

var safeMoment = function (input) {
    if (!input) {
        return null;
    }

    var m = moment(input);

    if (!m.isValid) {
        return null;
    }

    return m;
}

var safeUnMoment = function (input) {
    if (!input) {
        return null;
    }

    if (input.isValid) {
        return input.toDate();
    }

    return null;
}


/*
** Exports
*/

exports.safeMoment = safeMoment;
exports.safeUnMoment = safeUnMoment;
