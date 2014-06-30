var moment = require('moment');

exports.safeMoment = function (input) {
    if (!input) {
        return null;
    }

    var m = moment(input);

    if (!m.isValid) {
        return null;
    }

    return m;
}

exports.safeUnMoment = function (input) {
    if (!input) {
        return null;
    }

    if (input.isValid) {
        return input.toDate();
    }

    return null;
}
