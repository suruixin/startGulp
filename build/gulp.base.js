const gulp = require('gulp')

function html() {
  return gulp.task('html', function () {
    gulp.src('*.html')
      .pipe(gulp.dest('dist'));
    console.log('\x1b[32m html upload \x1b[0m')
    console.log(gulp.src('*.html'))
  });
}

module.exports = html
