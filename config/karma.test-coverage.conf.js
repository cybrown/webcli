module.exports = function (config) {
  var baseConfig;
  require('./karma.test.conf')({
    set: function (c) {
      baseConfig = c;
    }
  });
  baseConfig.reporters.push('coverage');
  Object.keys(baseConfig.preprocessors).forEach(function (key) {
    baseConfig.preprocessors[key].unshift('coverage');
  });
  baseConfig.coverageReporter = {
    dir: 'coverage/',
    reporters: [
      { type: 'text-summary' },
      { type: 'json' },
      { type: 'html' }
    ]
  };
  config.set(baseConfig);
};
