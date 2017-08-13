import Ember from 'ember';
import RSVP from 'rsvp';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Ember.Route.extend(AuthenticatedRouteMixin, {
  session: Ember.inject.service(),

  model() {
    let self = this;
    return new RSVP.Promise(function(resolve) {
      self.get('session').authorize('authorizer:jwt', (headerName, headerValue) => {
        const headers = {};
        headers[headerName] = headerValue;
        resolve(Ember.$.ajax('/api/secret-stuff', {
          headers
        }));
      });
    });
  }
});
