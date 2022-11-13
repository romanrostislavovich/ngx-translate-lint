const gulp  = require('gulp');
const gulpCopy = require('gulp-copy');
const fs = require('fs');
function copyPackageJSON(cb) {
    const sourceFiles = './../package.json';
    const destination = './../dist/package.json';

    fs.copyFileSync(sourceFiles, destination);
    cb();
}

exports.default = copyPackageJSON
