import Ember from 'ember';
import config from './config/environment';
import EmberMetricsRouterMixin from 'ember-metrics-mixins/mixins/router';

const Router = Ember.Router.extend(EmberMetricsRouterMixin, {
  location: config.locationType
});

Router.map(function() {
});

export default Router;
