var Q = require('q');
var Module = require('./models/module');
var util = require('util')

/*
** Constructor
*/

var About = function (model) {
    if (!model) {
        throw new Error('about: model is required');
    }

    this._model = model;
}


/*
** Static methods
*/

About.fetch = function (modulestore, course, name) {
    if (!modulestore) {
        throw new Error('about: modulestore is required');
    }

    var deferred = Q.defer();

    Module(modulestore.connection).findOne({
        '_id.org': course.get('_id.org'),
        '_id.course': course.number,
        '_id.category': 'about',
        '_id.name': name
    }, function (err, model) {
        if (err) {
            deferred.reject(new Error(err));
        }
        else if (!model) {
            deferred.reject(new Error('about: model not found'));
        }
        else {
            deferred.resolve(new About(model));
        }
    });

    return deferred.promise;
}


/*
** Public attributes
*/

About.prototype.__defineGetter__('name', function () {
    return this._model.get('_id.name');
});

About.prototype.__defineGetter__('value', function () {
    return this._model.get('definition.data.data');
});


/*
** Public methods
*/

About.prototype.toJSON = function () {
    return {
        name: this.name,
        value: this.value
    };
};

About.prototype.inspect = function () {
    return util.inspect(this.toJSON(), {
        colors: true
    });
};


/*
** Exports
*/

module.exports = About;
