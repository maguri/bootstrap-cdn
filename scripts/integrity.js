#!/usr/bin/env node

'use strict';

var fs   = require('fs');
var path = require('path');
var yaml = require('js-yaml');

var sri  = require(path.join(__dirname, 'sri'));

var basedir    = path.join(__dirname, '..');
var configFile = path.join(basedir, 'config', '_config.yml');
var config     = yaml.safeLoad(fs.readFileSync(configFile));

// create backup file
fs.createReadStream(configFile)
    .pipe(fs.createWriteStream(configFile + '.bak'));

function buildPath(d) {
    d = d.replace('/bootstrap/', '/twitter-bootstrap/')
         .replace('https://maxcdn.bootstrapcdn.com/', '');
    return path.join(basedir, 'public', d);
}

function exists(file) {
    var found = fs.existsSync(file);

    if (!found) {
        console.log('WARNING: %s not found', file);
    }
    return found;
}

// bootswatch
(function() {
    var bootswatch = buildPath(config.bootswatch.bootstrap);

    for (var i = 0; i < config.bootswatch.themes.length; i++) {
        var theme = config.bootswatch.themes[i];
        var file = bootswatch.replace('SWATCH_VERSION', config.bootswatch.version)
                             .replace('SWATCH_NAME', theme.name);

        if (exists(file)) { // always regenerate
            config.bootswatch.themes[i].sri = sri.digest(file);
        }
    }
})();

// bootlint
(function() {
    for (var i = 0; i < config.bootlint.length; i++) {
        var bootlint = config.bootlint[i];
        var file = buildPath(bootlint.javascript);

        if (exists(file)) { // always regenerate
            config.bootlint[i].javascriptSri = sri.digest(file);
        }
    }
})();

// bootstrap{4}
(function() {
    ['bootstrap', 'bootstrap4'].forEach(function (key) {
        for (var i = 0; i < config[key].length; i++) {
            var bootstrap = config[key][i];
            var javascript = buildPath(bootstrap.javascript);
            var stylesheet = buildPath(bootstrap.stylesheet);

            if (exists(javascript)) {
                config[key][i].javascriptSri = sri.digest(javascript);
            }

            if (exists(stylesheet)) {
                config[key][i].stylesheetSri = sri.digest(stylesheet);
            }
        }
    });
})();

// fontawesome
(function() {
    for (var i = 0; i < config.fontawesome.length; i++) {
        var stylesheet = buildPath(config.fontawesome[i].stylesheet);

        if (exists(stylesheet)) {
            config.fontawesome[i].stylesheetSri = sri.digest(stylesheet);
        }
    }
})();


fs.writeFileSync(configFile, yaml.dump(config, { lineWidth: 110 }));
