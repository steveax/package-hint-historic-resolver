import Ember from 'ember';
import sum from 'ember-cpm/macros/sum';
import cacheRequst from '../utils/cache-request';
import normalizeDependencies from '../utils/normalize-dependencies';
import mergeModules from '../utils/merge-modules';

const {
  on,
  observer,
  computed,
  inject: { service }
} = Ember;

export default Ember.Component.extend({
  tagName: '',

  apiSemaphore: service(),

  nestingLevel: sum('incomingNestingLevel', 1),

  numberOfAwaitingRequests: 0,

  getFirstDependencies: on('init', observer('module', 'firstVersion', 'stopCrawling', function() {
    this._getDependencies(
      'firstVersion',
      'firstDependencies',
      'firstPromise',
      'secondVersion',
      'secondPromise'
    );
  })),
  getSecondDependencies: on('init', observer('module', 'secondVersion', 'stopCrawling', function() {
    this._getDependencies(
      'secondVersion',
      'secondDependencies',
      'secondPromise',
      'firstVersion',
      'firstPromise'
    );
  })),
  _getDependencies(
    versionProp,
    dependencyProp,
    promiseProp,
    otherVersionProp,
    otherPromiseProp
  ) {
    let sem = this.get('apiSemaphore.sem');
    sem.take(() => {
      let module  = this.get('module');
      let version = this.get(versionProp);
      if (!module || !version || this.get('stopCrawling') || this.get(dependencyProp)) {
        return sem.leave();
      }

      this.incrementProperty('numberOfAwaitingRequests');

      let otherPromise = this.get(otherPromiseProp);
      if (version === this.get(otherVersionProp) && otherPromise) {
        sem.leave();
        return otherPromise.then(data => {
          if (!this.get('isDestroying') && !this.get('isDestroyed')) {
            this.set(dependencyProp, data);
            if (this.decrementProperty('numberOfAwaitingRequests') === 0) {
              this.sendAction('doneCrawling');
            }
          }
        });
      }

      let haveLeft;
      this.set(promiseProp, cacheRequst(`npm/${module}@${version}/dependencies`).then(data => {
        sem.leave();
        haveLeft = true;
        data = normalizeDependencies(data);
        if (!this.get('isDestroying') && !this.get('isDestroyed')) {
          this.set(dependencyProp, data);
          if (this.decrementProperty('numberOfAwaitingRequests') === 0) {
            this.sendAction('doneCrawling');
          }
        }
        return data;
      }).catch((jqXHR, textStatus, errorThrown) => {
        if (!haveLeft) {
          sem.leave();
        }
        if (!this.get('isDestroying') && !this.get('isDestroyed')) {
          this.set('error', errorThrown);
        }
      }));
    });
  },

  dependencies: computed('firstDependencies', 'secondDependencies', function() {
    return mergeModules(
      this.get('firstDependencies'),
      this.get('secondDependencies')
    );
  })
});