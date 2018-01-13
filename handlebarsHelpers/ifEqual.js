let hbs = require('hbs');

hbs.registerHelper('ifEqual', function(v1, v2, options) {
    if(v1 === v2) {
        return options.fn(this);
    }
    return options.inverse(this);
});