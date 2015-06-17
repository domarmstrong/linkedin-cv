var libs = [
  //'jquery',
  'classnames',
  'react',
  //'react-router',
  'superagent',
  'superagent-promise',
];

const cwd = process.cwd();

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
  bundle: {
    app: {
      bundleName: 'app.js',
      watchable: true,
      browserifyOpts: {
        // absolute path required to analyze with disc
        entries: [cwd + '/src/client/bootstrap.js'],
        fullPaths: true,
      },
      external: libs,
      require: [],
      dest: './build',
    },
    vendor: {
      bundleName: 'vendor.js',
      watchable: false,
      browserifyOpts: {
        entries: [cwd + '/vendor.js'],
        fullPaths: true,
        insertGlobals: false,
        bare: true,
      },
      external: [],
      require: libs,
      dest: './build',
    },
  },
  test: {
    src: ['./test/**/*.js'],
    require: [],
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
