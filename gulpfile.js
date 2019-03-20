const gulp = require('gulp');
const connect = require('gulp-connect'); // 启动服务
const del = require('del'); // 删除
const vinylPaths = require('vinyl-paths'); // 计算管道
const less = require('gulp-less');
const babel = require("gulp-babel"); // babel
const uglify = require('gulp-uglify'); // 压缩js
const rev = require('gulp-rev'); // 文件改名
const revCollector = require('gulp-rev-collector'); // 文件改名后做匹配
const browserify = require('gulp-browserify');
const htmlmin = require('gulp-htmlmin'); // 压缩html
const htmlreplace = require('gulp-html-replace'); // html中引入文件
const path = require('path');
const config = require('./config/index');

console.log(config)
gulp.task('server', function () {
  connect.server({
    port: config.port || 3006,
    host: config.host || 'localhost',
    livereload: true,
    root: './'
  })
});

gulp.task('ces', ['replace'])

gulp.task('html', function () {
  gulp.src(['dist/*.json', '*.html'])
    .pipe(htmlreplace({
      'js': './dist/js/a.js'
    }))
    .pipe(connect.reload())
    .pipe(revCollector({
      replaceReved: true,
      // dirReplacements: {
      //   'js': 'dist/js'
      // }
    }))
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest('dist'));
  console.log('\x1b[32m html upload \x1b[0m')
});

gulp.task('less', function () {
  gulp.src('*.less')
    .pipe(less({
      paths: [path.join(__dirname, 'less', 'includes')]
    }))
    .pipe(connect.reload());
  console.log('less upload')
});

gulp.task('js', function () {
  return gulp.src('src/**/*.js')
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(connect.reload())
    .pipe(browserify({
      insertGlobals : true
    }))
    .pipe(uglify({
      // output: {
      //   comments: /^!/
      // }
    }).on('error', function (e) {
      console.log(e);
    }))
    .pipe(gulp.dest('dist'))
    .pipe(vinylPaths(del))
    .pipe(rev())
    .pipe(gulp.dest('dist'))
    .pipe( rev.manifest() )
    .pipe(gulp.dest('dist'));
});

gulp.task('js:dev', function () {
  return gulp.src('dist/**/*.js')
    .pipe(connect.reload())
});

gulp.task('clear', function (cb) {
  del([
    'dist/**/*'
  ], cb);
});

gulp.task('watch', function () {
  gulp.watch(['./index.html'], ['html']);
  gulp.watch(['./src/**/**.less'], ['less']);
  gulp.watch(['./src/**/**.js'], ['js']);
});

gulp.task('default', ['server', 'watch']);

gulp.task('build', ['clear', 'js', 'html'])
