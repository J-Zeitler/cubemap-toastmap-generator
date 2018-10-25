'use strict';

var gulp        = require('gulp');
var gutil       = require('gulp-util');
var browserify  = require('browserify');
var source      = require('vinyl-source-stream');
var buffer      = require('vinyl-buffer');
var watchify    = require('watchify');
var sourcemaps  = require('gulp-sourcemaps');
var brfs        = require('brfs');
var uglify      = require('gulp-uglify');
var rename      = require('gulp-rename');

var libraryPath = './src/index.js';
var targetName = 'proj.js';

var bundler = watchify(browserify({
  cache: {},
  packageCache: {},
  standalone: 'PROJ',
  debug: true
}));
bundler.add(libraryPath);
bundler.transform('brfs');

gulp.task('watch', function () {
  bundle(bundler, './app/js', targetName);

  bundler.on('update', function () {
    bundle(bundler, './app/js', targetName);
  });
  bundler.on('log', gutil.log);
});

gulp.task('build', build);

function bundle(bundler, dest, name) {
  console.log('writing to ' + [dest, name].join('/'))
  return bundler.bundle()
    .pipe(source(name))

    // sourcemaps
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(sourcemaps.write('./'))

    // outputs
    .pipe(gulp.dest(dest));
}

function build() {
  bundle(bundler, './build', targetName);

  bundler.close();

  gulp.src('build/' + targetName)
    .pipe(buffer())
    .pipe(rename('proj.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('./build'));
}
