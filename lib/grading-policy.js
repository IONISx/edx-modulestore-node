const fromModulestore = function (raw) {
    return {
        weight: raw.weight,
        name: raw.type,
        label: raw['short_label'],
        ignored: raw['drop_count'],
        amount: raw['min_count']
    };
};

const toModulestore = function (policy) {
    return {
        weight: policy.weight,
        type: policy.name,
        'short_label': policy.label,
        'min_count': policy.amount || 1,
        'drop_count': policy.ignored || 0
    };
};

// ## //

exports.fromModulestore = fromModulestore;
exports.toModulestore = toModulestore;
