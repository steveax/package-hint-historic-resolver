/* jshint node: true */

module.exports = function(environment) {
  var api = 'api/v1';

  var contentSecurityPolicy = {
    'default-src': "'none'",
    'script-src': "'self'",
    'font-src': "'self'",
    'connect-src': "'self'",
    'img-src': "'self'",
    'style-src': "'self'",
    'media-src': "'self'"
  };
  contentSecurityPolicy['script-src'] +=
    ' https://www.google-analytics.com';
  contentSecurityPolicy['connect-src'] +=
    ' https://api.github.com' +
    ' https://raw.githubusercontent.com';
  contentSecurityPolicy['img-src'] +=
    ' https://www.google-analytics.com';

  var ENV = {
    modulePrefix: 'package-hint-historic-resolver',
    environment: environment,
    baseURL: '/',
    locationType: 'auto',
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
      }
    },
    contentSecurityPolicy: contentSecurityPolicy,
    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
      api: api
    },
    metricsAdapters: [
      {
        name: 'GoogleAnalytics',
        environments: ['development', 'production'],
        config: {
          id: 'UA-69333483-1'
        }
      }
    ]
  };

  var host;

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;

    host = 'http://localhost:3000';

    // ENV['ember-cli-mirage'] = {
    //   enabled: false
    // }
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.baseURL = '/';
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
  }

  if (environment === 'production') {
    host = process.env.HOST;
  }

  contentSecurityPolicy['connect-src'] +=
    ' ' + host;

  ENV.APP.host = host;
  ENV.APP.serverApiEndpoint = host + '/' + api;

  return ENV;
};
