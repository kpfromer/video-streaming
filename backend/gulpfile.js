const gulp = require('gulp');
const nodemon = require('gulp-nodemon');
const babel = require('gulp-babel');
const rimraf = require('rimraf');

gulp.task('clean', done => rimraf('dist', done));

gulp.task('compile', ['clean'], () => {
  return gulp.src('src/**/*.js')
    .pipe(babel({ presets: ['@babel/env'] }))
    .pipe(gulp.dest('dist'));
})

gulp.task('watch', ['compile'], () => {
  return nodemon({
    script: './dist/app.js',
    watch: './src',
    tasks: ['compile']
  });
})

gulp.task('default', ['watch']);