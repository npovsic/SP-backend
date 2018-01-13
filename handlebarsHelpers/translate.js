let hbs = require('hbs');
let lang = require('../config/lang.json');

hbs.registerHelper('translate', function(language, translateString) {
    if (lang[language]) {
        return (lang[language][translateString]) ? lang[language][translateString] : translateString;
    }
    else {
        return (lang['en'][translateString]) ? lang['en'][translateString] : translateString;
    }
});