const gulp = require('gulp');
const connect = require('gulp-connect'); // 启动服务
const del = require('del'); // 删除
const vinylPaths = require('vinyl-paths'); // 计算管道
const less = require('gulp-less');
const babel = require("gulp-babel"); // babel
const uglify = require('gulp-uglify'); // 压缩js
const concat = require('gulp-concat'); // 合并js
const rev = require('gulp-rev'); // 文件改名
const revCollector = require('gulp-rev-collector'); // 文件改名后做匹配
const bro = require('gulp-bro');
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
    root: './dist'
  })
});
require("@babel/polyfill")
gulp.task('html', function () {
  gulp.src(['dist/*.json', '*.html'])
    .pipe(htmlreplace({
      'js': './js/main.js'
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
      "presets" : ["@babel/preset-env"]
    }))
    .pipe(connect.reload())
    .pipe(uglify({
      // output: {
      //   comments: /^!/
      // }
    }).on('error', function (e) {
      console.log(e);
    }))
    .pipe(bro())
    .pipe(concat('js/main.js'))
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
  gulp.watch(['./dist/index.html'], ['html']);
  gulp.watch(['./src/**/**.less'], ['less']);
  gulp.watch(['./src/**/**.js'], ['js']);
});

gulp.task('default', ['server', 'watch']);

gulp.task('build', ['clear', 'js', 'html'])
