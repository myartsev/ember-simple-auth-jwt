import Route from '@ember/routing/route';
import {
  inject
} from '@ember/service';
import $ from 'jquery';
import RSVP from 'rsvp';
import config from '../config/environment';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Route.extend(AuthenticatedRouteMixin, {
  session: inject(),

  model() {
    let self = this;
    return new RSVP.Promise(function(resolve) {
      self.get('session').authorize('authorizer:jwt', (headerName, headerValue) => {
        const headers = {};
        headers[headerName] = headerValue;
        resolve($.ajax(`${config.authServerBaseUrl}/api/secret-stuff`, {
          headers
        }));
      });
    });
  }
});
