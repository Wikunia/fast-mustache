var gulp = require('gulp');
var replace = require('gulp-replace');
var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
 

gulp.task('default', function(){
    gulp.start('copy-minify'); 
    gulp.start('diff','mustacheExt'); 
});

gulp.task('copy-minify', function () {
    gulp.src('js/**/*.js')
        .pipe(gulp.dest('example/js')); // copy all
        
    // minfiy special
    gulp.src(['js/mustache.js'])
        .pipe(rename(function (path) {
            path.basename += ".min";
         }))
        .pipe(uglify())
        .pipe(gulp.dest('example/js'));
});


gulp.task('diff', function () {
    gulp.src('js/diff.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(replace(/\/\/\/+\r?\n\/\/\/+ START OF LOGGING SYSTEM \/\/\/+\r?\n\/\/\/+([\S\s]*?)\/\/\/+\r?\n\/\/\/+ END OF LOGGING SYSTEM \/\/\/+\r?\n\/\/\/+/,''))
        .pipe(replace(/^\s*Diff\.log\(.*?\);\s*$\r?\n/gm,''))
        .pipe(replace(/else\s+{\s+}/g,''))
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(gulp.dest('example/js'))
        .pipe(rename(function (path) {
            path.basename += ".min";
         }))
        .pipe(uglify())
        .pipe(gulp.dest('example/js'));
});

gulp.task('mustacheExt', function () {
    gulp.src('js/mustacheExt.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(replace(/^\s*console\.(log|time|timeEnd)\(.*?\);\s*$\r?\n/gm,''))
        .pipe(replace(/else\s+{\s+}/g,''))
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(gulp.dest('example/js'))
        .pipe(rename(function (path) {
            path.basename += ".min";
         }))
        .pipe(uglify())
        .pipe(gulp.dest('example/js'));
});


