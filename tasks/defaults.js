/*
 * Copyright 2014 Workiva, LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

module.exports = function(gulp, options, subtasks) {

    var _ = require('lodash'),
        changed = require('gulp-changed'),
        glob = require('glob'),
        open = require('open'),
        path = require('path');

    // Tasks that call runSequence
    gulp.desc('build', 'Run build tasks');
    gulp.task('build', options.taskTree['build']);

    gulp.desc('dist', 'Run dist tasks');
    gulp.task('dist', function(cb){
        // Redefine tsc task with sourcemaps disabled
        var tscOptions = options.ts;
        tscOptions.sourcemap = false;
        gulp.task('tsc', subtasks.tsc({options: tscOptions}));

        // Run dist tasks
        return gulp.start(options.taskTree['dist']);
    });

    gulp.desc('test:generate', 'Run test tasks')
    gulp.task('test:generate', options.taskTree['test:generate']);

    gulp.desc('test:jasmine', 'Run test tasks and execute with jasmine');
    gulp.task('test:jasmine', options.taskTree['test:jasmine']);

    gulp.desc('test', 'Run test tasks and execute with Karma');
    gulp.task('test', options.taskTree['test']);

    gulp.desc('default', 'Run default tasks');
    gulp.task('default', options.taskTree['default']);

    // Bundle tasks
    var bundleTasks = _.map(Object.keys(options.bundles), function(bundleName){
        var taskName = 'bundle:' + bundleName
        gulp.desc(taskName, 'Bundle using the "' + bundleName + '" configuration');
        return taskName;
    });
    gulp.desc('bundle', 'Run all bundle tasks');
    gulp.task('bundle', options.taskTree['bundle'], (bundleTasks && bundleTasks.length > 0) ? subtasks.runSequence(bundleTasks) : null);

    // Copy tasks
    gulp.desc('copy:html', "Copy HTML from src to build_src");
    gulp.task('copy:html', options.taskTree['copy:html'], subtasks.copy({
        glob: options.glob.html,
        cwd: options.path.src,
        changed: true,
        dest: options.path.build_src
    }));

    gulp.desc('copy:js', 'Copy JS from src to build_src');
    gulp.task('copy:js', options.taskTree['copy:js'], subtasks.copy({
        glob: options.glob.js,
        cwd: options.path.src,
        dest: options.path.build_src,
        changed: true
    }));

    gulp.desc('copy:jstest', 'Copy JS from test to build_test');
    gulp.task('copy:jstest', options.taskTree['copy:jstest'], subtasks.copy({
        glob: options.glob.js,
        cwd: options.path.test,
        dest: options.path.build_test,
        changed: true
    }));

    gulp.desc('tsc:test', 'Transpile TypeScript from test to build_test');
    gulp.task('tsc:test', options.taskTree['tsc:test'], subtasks.tsc({
        cwd: options.path.test,
        dest: options.path.build
    }));

    // Tasks that are just a collection of other tasks
    gulp.desc('cover', 'View code coverage statistics');
    gulp.task('cover', options.taskTree['cover'], function(done){
        var results = glob.sync('**/index.html', {cwd: options.path.coverage});
        open(path.resolve(options.path.coverage + results[0]));
        done();
    });

    gulp.desc('lint', 'Validate code');
    gulp.task('lint', options.taskTree['lint']);

    gulp.desc('minify', 'Minify JS and CSS code');
    gulp.task('minify', options.taskTree['minify']);

    gulp.task('_tslint', subtasks.tslint({emitError: false}));
    gulp.task('_jshint', subtasks.jshint({emitError: false}));

    gulp.desc('qa', 'QA - Run the default tasks and start serve afterwards.');
    gulp.task('qa', options.taskTree['qa'], function() {
        return gulp.start('serve');
    });

    gulp.desc('serve', 'Start a server and open the index.html page in browser');
    gulp.task('serve', ['connect'], function(done){
        open('http://localhost:' + options.port + '/');
        done();
    });

    gulp.desc('watch', 'Runs watch:build');
    gulp.task('watch', options.taskTree['watch:build']);

};
