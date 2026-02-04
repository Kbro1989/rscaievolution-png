module.exports = function (name) {
    return {
        info: console.log,
        error: console.error,
        warn: console.warn,
        debug: console.log,
        add: () => { }
    };
};
