// Initialize modules
// Importing specific gulp API functions lets us write them below as series() instead of gulp.series()
var gulp = require('gulp');
const { src, dest, watch, series, parallel } = require('gulp');
// Importing all the Gulp-related packages we want to use
// const sourcemaps = require('gulp-sourcemaps');
// const sass = require('gulp-sass');
// const concat = require('gulp-concat');
// //const uglify = require('gulp-uglify');
// const postcss = require('gulp-postcss');
// const autoprefixer = require('autoprefixer');
// const cssnano = require('cssnano');
// var replace = require('gulp-replace');
var browserSync  = require('browser-sync');


gulp.task('browser-sync', function() {

    browserSync.init({
        server: {
            baseDir: ".",
            index: "index.html"
        }
    });

    browserSync.watch('*.*').on('change', browserSync.reload);
});