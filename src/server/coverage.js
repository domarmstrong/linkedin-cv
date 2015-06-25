/**
 * Generate code coverage using istanbul/babel/mocha
 *
 * See gulp coverage > src/gulp/tasks/coverage
 *
 * config options:
 *
 * coverage: {
 *  cover: {Array} run coverage for these files. glob of files for gulp.src eg. "src/*.js"
 *  ignore: {Array} ignore these files / globs
 *  coverageVariable: {String} constant that istanbul will define a global variable with the output
 *  mapDir: {String} location to generate map files
 *  htmlReport: { The html report will always be generated
 *    dest: {String} location to generate report
 *  }
 *  reports: {Array} Other reports to generate eg. ['text', 'text-summary']
 * }
 */

import gulp from 'gulp';
import config from '../gulp/config';
import mocha from 'gulp-mocha';
import path from 'path';
import { transform as babel } from 'babel';
import istanbul from 'istanbul';
import istanbulSourceMap from 'istanbul-coverage-source-map';
import tap from 'gulp-tap';
import promisePipe from 'promisepipe';
import test from './test';
import debug from 'debug';
import fs from 'fs';

const d = debug('linkedIn-cv:coverage');

// Holds transformed and instrumented code against absolute file paths
// eg. { '/home/foo/bar/file.js': 'file code..' }
let instrumentedCode = {};
// Map source files to their map files
// eg. { '/home/foo/bar/file.js': './maps/file.js.map' }
let sourceMaps = {};

/**
 * Generate coverage reports
 * @returns {Promise}
 */
export default function createCoverage () {
  // Prefix ignore globs to ignore them with gulp.src
  let ignore = config.coverage.ignore.map(glob => '!' + glob);
  let sources = config.coverage.cover.concat(ignore);

  // Reset these module level vars
  instrumentedCode = {};
  sourceMaps = {};

  // Inject babel helper globals
  require('babel-core/external-helpers');

  return setUpRequireHook()
    .then(instrumentSources(sources))
    .then(forceRequireSources(sources))
    .then(test.runForCoverage.bind(test))
    .then(createCoverageReport)
    .then(addCustomCSS);
}

/**
 * Use istanbuls require hook to globally override `require` and
 * return any code that has been transformed and instrumented
 * @returns {Promise}
 */
function setUpRequireHook () {
  istanbul.hook.hookRequire(
    // Should the require call be transformed?
    file => file in instrumentedCode,
    // Return the transformed code
    (code, file) => instrumentedCode[file],
    // Options
    {}
  );
  // Return promise to allow chain, because it reads better
  return Promise.resolve();
}

/**
 * Convert files with Babel to allow istanbul to understand them then instrument with istanbul
 * write source maps to the source map dir so the coverage can be translated to the originals later
 * @param sources glob/array for gulp.src
 * @returns {Function,Promise}
 */
function instrumentSources (sources) {
  let instrumenter = new istanbul.Instrumenter({ coverageVariable: config.coverage.coverageVariable });
  let { mapDir } = config.coverage;

  return function () {
    return promisePipe(
      gulp.src(sources)
        .pipe(tap(f => {
          //d('INSTRUMENT:', f.path);
          // Get the files relative path
          let relative = path.relative(process.cwd(), f.path);
          // Add original file path > map file path from cwd
          sourceMaps[f.path] = path.join(mapDir, relative + '.map');
          // Transform files with babel so istanbul can understand them
          // and create source maps to translate coverage back later
          let transformed = babel(f.contents.toString(), {
            sourceMaps: true,
            sourceFileName: relative,
            sourceMapName: path.basename(relative) + '.map',
            sourceRoot: './',
            stage: 0,
            ast: false,
            externalHelpers: true,
          });
          // Instrument the transformed code with istanbul
          instrumentedCode[f.path] = instrumenter.instrumentSync(transformed.code, f.path);
          // Modify the file object to write the source map file to the mapDir
          f.path += '.map';
          f.contents = new Buffer(JSON.stringify(transformed.map, null, 2));
        }))
        .pipe(gulp.dest(path.join(mapDir, 'src')))
    );
  }
}

/**
 * Clear requires cache and require all source files to ensure they are analyzed by istanbul
 * @param sources source file globs for gulp.src
 * @returns {Function,[Promise]}
 */
function forceRequireSources (sources) {
  return function () {
    return promisePipe(
      gulp.src(sources, {read: false})
        // Clear requires cache to make sure transformed files are returned
        .pipe(tap(f => delete require.cache[path.resolve(f.path)]))
        // Make sure all source files are required or they may not get code coverage
        //.pipe(tap(f => d('REQUIRE:', f.path)))
        .pipe(tap(f => require(f.path)))
    );
  }
}

/**
 * Collect the coverage data and create the reports
 * @returns {Promise}
 */
function createCoverageReport () {
  d('REPORT', config.coverage);
  let collector = new istanbul.Collector();
  let reporter = new istanbul.Reporter(null, config.coverage.reportDir);

  return new Promise(resolve => {
    // Get the coverage data from the global var that istanbul creates
    let coverageData = global[config.coverage.coverageVariable];
    if (! coverageData) {
        throw new Error('Cannot find coverage data for coverageVariable: ' + config.coverage.coverageVariable);
    }
    // Use sourcemaps to correct the output lines for coverage report
    let coverage = istanbulSourceMap(coverageData, { sourceMaps: sourceMaps });
    collector.add(JSON.parse(coverage));

    reporter.addAll(config.coverage.reports);
    reporter.write(collector, true, done => resolve());
  });
}

/**
 * Add some custom css fixes to the istanbul html report
 * @returns {Promise}
 */
function addCustomCSS () {
  return new Promise((resolve, reject) => {
    let cssPath = path.join(config.coverage.reportDir, 'base.css');
    let css = `
      .header { padding-left: 35px !important; }
    `;
    fs.appendFile(cssPath, css, err => err ? reject(err) : resolve());
  });
}
