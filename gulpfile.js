const gulp   = require('gulp');
const eslint = require('gulp-eslint');

// ## //

gulp.task('eslint', function () {
    return gulp
        .src([
            'gulpfile.js',
            'index.js',
            'lib/**/*.js',
            'bin/**/*'
        ])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

// ## //

gulp.task('default', [
    'test'
]);

gulp.task('test', [
    'eslint'
]);

gulp.task('test:ci', [
    'eslint'
]);
