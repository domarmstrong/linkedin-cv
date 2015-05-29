const src = './src';
const dest = './build';

export default {
  less: {
    entry: `${ src }/less/main.less`,
    dest: dest,
  },
  run: {
    entry: './init.js',
    watch: [ src ],
    extensions: [ '.js' ],
  },
  test: {
    src: ['./test/**/*.js'],
    require: ['__setup.js'],
    mochaOpts: {
      reporter: 'spec'
    }
  },
  coverage: {
    cover: ['./src/**/*.js'],
    ignore: ['./src/gulp/**/*'],
    coverageVariable: 'COVERAGE_ID',
    mapDir: './build/maps',
    reportDir: './build/coverage',
    reports: ['html', 'text', 'text-summary'],
  }
};