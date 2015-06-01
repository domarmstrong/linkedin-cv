export default {
  less: {
    entry: `./src/less/main.less`,
    dest: './build',
  },
  run: {
    entry: './init.js',
    watch: [ './src', './test' ],
    extensions: [ '.js' ],
  },
  test: {
    src: ['./test/**/*.js'],
    require: ['__setup.js'],
    mochaOpts: {
      ui: 'bdd',
      reporter: 'spec',
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
