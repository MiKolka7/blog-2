const gulp = require('gulp')
    , sass = require('gulp-sass')
    , csso = require('gulp-csso')
    , gutil = require('gulp-util')
    , clean  = require('gulp-clean')
    , rigger = require('gulp-rigger')
    , concat = require('gulp-concat')
    , notify = require('gulp-notify')
    , rename = require("gulp-rename")
    , uglify = require('gulp-uglify')
    , svgmin = require('gulp-svgmin')
    , connect = require('gulp-connect')
    , sourcemaps = require('gulp-sourcemaps')
    , minifyHTML = require('gulp-minify-html')
    , autoprefixer = require('gulp-autoprefixer')
    , browserSync = require('browser-sync').create()
    , imageminJpegtran = require('imagemin-jpegtran')
    , imageminPngquant = require('imagemin-pngquant')
    ;

const config = {
    src: {
        img: [
            './images/**/*.png', 
            './pic/**/*.png',
            './images/**/*.jpg', 
            './pic/**/*.jpg',
            './images/**/*.jpeg', 
            './pic/**/*.jpeg'
        ]   
    }
}

gulp.task('server', function() {
    browserSync.init({
        server: {
            baseDir: "./"
        }
    });

    gulp.watch(['./index.html', './pages/**/*.html']).on('change', browserSync.reload);
    gulp.watch('./js/**/*.js').on('change', browserSync.reload);

    gulp.watch(['./templates/**/*.html', './pages/**/*.html'], ['template']);
    gulp.watch('./sass/**/*', ['sass']);
});

gulp.task('sass', function () {
    gulp.src(['./sass/**/*.scss', './sass/**/*.sass'])
        .pipe(sourcemaps.init())
        .pipe(sass({
            outputStyle: 'expanded'
        }).on('error', gutil.log))
        .on('error', notify.onError())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./css/'))
        .pipe(browserSync.stream());
});

gulp.task('template', function () {
    gulp.src('./pages/**/*.tmpl.html')
        .pipe(rigger())
        .pipe(rename(function (path) {
            path.basename = path.basename.split('.')[0];
            path.extname = ".html"
        }))
        .pipe(gulp.dest('pages/'))
});


gulp.task('minify-image', function () {
    gulp.src(config.src.img)
        .pipe(imageminJpegtran({
            progressive: true
        })())
        .pipe(imageminPngquant({
            quality: '65-80', 
            speed: 4}
        )())
        .pipe(gulp.dest('./public/images/'));
});

gulp.task('minify-svg', function () {
    return gulp.src(config.src.img)
        .pipe(svgmin())
        .pipe(gulp.dest('./public/images/'));
});

gulp.task('minify-css', function () {
    gulp.src('./css/**/*.css')
        .pipe(autoprefixer({
            browsers: ['last 30 versions'],
            cascade: false
        }))
        .pipe(csso())
        .pipe(rename({ extname: '.min.css' }))
        .pipe(gulp.dest('./public/css/'));
});

gulp.task('minify-js', function () {
    gulp.src('./js/**/*.js')
        .pipe(uglify())
        .pipe(gulp.dest('./public/js/'));
});

gulp.task('minify-html', function () {
    var opts = {
        conditionals: true,
        spare: true
    };

    return gulp.src(['./pages/**/*.html', './index.html'])
        .pipe(minifyHTML(opts))
        .pipe(rename({ extname: '.min.html' }))
        .pipe(gulp.dest('./public/'));
});

gulp.task('clean', function() {
    return gulp.src('./public', { read: false }).pipe(clean());
});

gulp.task('default', ['server', 'sass', 'template']);
gulp.task('production', ['minify-css', 'minify-js', 'minify-image', 'minify-svg', 'minify-html']);
